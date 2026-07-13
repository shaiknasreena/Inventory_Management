const { Worker } = require("worker_threads");
const path = require("path");
const prisma = require("../../db");

// Prevent duplicate report requests
let isGeneratingReport = false;
let isDownloadingCSV = false;
// =========================
// Get All Purchases
// =========================
exports.getPurchases = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    let where = {};

    if (fromDate && toDate) {
      where.purchase_date = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        items: true,
      },
    });

    res.status(200).json({
      success: true,
      data: purchases,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// =========================
// Get Purchase By Id
// =========================
exports.getPurchaseById = async (req, res) => {

  try {

    const purchase = await prisma.purchase.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        items: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      data: purchase,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

// =========================
// Purchase Report (Worker Thread)
// =========================
exports.getPurchaseReport = async (req, res) => {

  console.log("Before Report Lock:", isGeneratingReport);

  // Prevent duplicate requests
  if (isGeneratingReport) {
    console.log("Duplicate request blocked.");

    return res.status(429).json({
      success: false,
      message: "Report generation is already in progress. Please wait.",
    });
  }

  // Lock
  isGeneratingReport = true;
  console.log("Report generation started...");

  try {

    const { fromDate, toDate } = req.query;

    // Validate dates
    if (!fromDate || !toDate) {
      isGeneratingReport = false;

      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required.",
      });
    }

    const worker = new Worker(
      path.join(__dirname, "../workers/purchaseReportWorker.js"),
      {
        workerData: {
          fromDate,
          toDate,
        },
      }
    );

    // Success
    worker.on("message", (result) => {

      console.log("Report generated successfully.");

      isGeneratingReport = false;

      res.status(200).json(result);

    });

    // Error
    worker.on("error", (err) => {

      console.error("Worker Error:", err);

      isGeneratingReport = false;

      res.status(500).json({
        success: false,
        message: err.message,
      });

    });

    // Exit
    worker.on("exit", (code) => {

      console.log(`Worker exited with code ${code}`);

      isGeneratingReport = false;

    });

  } catch (err) {

    console.error(err);

    isGeneratingReport = false;

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};
// =========================
// Create Purchase
// =========================
exports.createPurchase = async (req, res) => {

  try {

    const {
      supplier_id,
      purchase_date,
      invoice_number,
      items,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Purchase items are required.",
      });
    }

    // Check Supplier
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: Number(supplier_id),
      },
    });

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    // Check Products
    for (const item of items) {

      const product = await prisma.product.findUnique({
        where: {
          id: Number(item.product_id),
        },
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product_id} not found.`,
        });
      }

    }

    // Calculate Total Amount
    let totalAmount = 0;

    for (const item of items) {
      totalAmount += item.quantity * item.purchase_price;
    }

    // Transaction
    const purchase = await prisma.$transaction(async (tx) => {

      // Purchase Header
      const purchaseHeader = await tx.purchase.create({
        data: {
          supplier_id: Number(supplier_id),
          purchase_date: new Date(purchase_date),
          invoice_number,
          total_amount: totalAmount,
        },
      });

      // Purchase Items
      for (const item of items) {

        await tx.purchaseItem.create({
          data: {
            purchase_id: purchaseHeader.id,
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            purchase_price: Number(item.purchase_price),
            total: Number(item.quantity) * Number(item.purchase_price),
          },
        });

        // Update Product Stock
        await tx.product.update({
          where: {
            id: Number(item.product_id),
          },
          data: {
            stock: {
              increment: Number(item.quantity),
            },
          },
        });

      }

      return purchaseHeader;

    });

    res.status(201).json({
      success: true,
      message: "Purchase Added Successfully",
      data: purchase,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

// =========================
// Update Purchase
// =========================
exports.updatePurchase = async (req, res) => {

  try {

    const {
      supplier_id,
      purchase_date,
      invoice_number,
      items,
    } = req.body;

    let total_amount = 0;

    items.forEach((item) => {
      total_amount += item.quantity * item.purchase_price;
    });

    const purchase = await prisma.purchase.update({

      where: {
        id: Number(req.params.id),
      },

      data: {

        purchase_date: new Date(purchase_date),
        invoice_number,
        total_amount,

        supplier: {
          connect: {
            id: supplier_id,
          },
        },

        items: {

          deleteMany: {},

          create: items.map((item) => ({

            quantity: item.quantity,
            purchase_price: item.purchase_price,
            total: item.quantity * item.purchase_price,

            product: {
              connect: {
                id: item.product_id,
              },
            },

          })),

        },

      },

      include: {
        items: true,
      },

    });

    res.status(200).json({
      success: true,
      message: "Purchase Updated Successfully",
      data: purchase,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

// =========================
// Delete Purchase
// =========================
exports.deletePurchase = async (req, res) => {

  try {

    await prisma.purchase.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Purchase Deleted Successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};

const { Parser } = require("json2csv");

exports.downloadPurchaseCSV = async (req, res) => {

    console.log("Before CSV Lock:", isDownloadingCSV);

    if (isDownloadingCSV) {
        console.log("Duplicate CSV download blocked.");

        return res.status(429).json({
            success: false,
            message: "CSV download is already in progress. Please wait."
        });
    }

    isDownloadingCSV = true;

    console.log("CSV generation started...");

    try {

        const { fromDate, toDate } = req.query;

        // Simulate delay (only for testing)
        await new Promise(resolve => setTimeout(resolve, 10000));

        let where = {};

        if (fromDate && toDate) {
            where.purchase_date = {
                gte: new Date(fromDate),
                lte: new Date(toDate),
            };
        }

        const purchases = await prisma.purchase.findMany({
            where,
        });

        console.log("Purchase data fetched successfully.");

        const { Parser } = require("json2csv");

        const fields = [
            "id",
            "supplier_id",
            "purchase_date",
            "invoice_number",
            "total_amount",
        ];

        const parser = new Parser({ fields });

        const csv = parser.parse(purchases);

        console.log("CSV generated successfully.");

        isDownloadingCSV = false;

        res.header("Content-Type", "text/csv");
        res.attachment("purchase-report.csv");
        res.send(csv);

    } catch (err) {

        isDownloadingCSV = false;

        console.error("CSV Error:", err);

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }

};
