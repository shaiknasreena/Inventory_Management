const prisma = require("../db");
const readCSV = require("./readCSV");

async function seedPurchases() {
  const purchases = await readCSV("./data/purchases.csv");

  for (const purchase of purchases) {
    await prisma.purchase.create({
      data: {
        supplier_id: Number(purchase.supplier_id),
        purchase_date: new Date(purchase.purchase_date),
        total_amount: Number(purchase.total_amount),
        invoice_number: purchase.invoice_number,
      },
    });
  }

  console.log("Purchases Imported Successfully");
}

seedPurchases()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });