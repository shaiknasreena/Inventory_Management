const { parentPort, workerData } = require("worker_threads");
const prisma = require("../../db");

async function generateReport() {

  // Delay for testing duplicate requests
  await new Promise((resolve) => setTimeout(resolve, 10000));

  try {

    console.log("Worker Started...");

    const { fromDate, toDate } = workerData;

    if (!fromDate || !toDate) {
      return parentPort.postMessage({
        success: false,
        message: "fromDate and toDate are required.",
      });
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        purchase_date: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      },
      include: {
        items: true,
      },
    });

    console.log("Purchase data fetched successfully.");

    let totalAmount = 0;

    const formattedPurchases = purchases.map((purchase) => {

      totalAmount += Number(purchase.total_amount);

      return {
        ...purchase,
        total_amount: Number(purchase.total_amount),
        items: purchase.items.map((item) => ({
          ...item,
          purchase_price: Number(item.purchase_price),
          total: Number(item.total),
        })),
      };

    });

    console.log("Sending report to main thread...");

    parentPort.postMessage({
      success: true,
      totalPurchases: formattedPurchases.length,
      totalAmount,
      purchases: formattedPurchases,
    });

  } catch (err) {

    console.error("Worker Error:", err);

    parentPort.postMessage({
      success: false,
      message: err.message,
    });

  } finally {

    console.log("Worker Finished.");

    await prisma.$disconnect();

  }

}

generateReport();