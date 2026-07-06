    const prisma = require("../../db");

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
    });

    res.status(200).json(purchases);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

    exports.createPurchase = async (req, res) => {
    try {
        const purchase = await prisma.purchase.create({
        data: req.body,
        });

        res.status(201).json(purchase);
    } catch (err) {
        res.status(500).json({
        message: err.message,
        });
    }
    };
    exports.updatePurchase = async (req, res) => {
  try {
    const purchase = await prisma.purchase.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });

    res.json(purchase);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
exports.deletePurchase = async (req, res) => {
  try {
    await prisma.purchase.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      message: "Purchase Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    res.status(200).json(purchase);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};