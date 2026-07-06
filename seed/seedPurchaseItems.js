const prisma = require("../db");
const readCSV = require("./readCSV");

async function seedPurchaseItems() {
  const purchaseItems = await readCSV("./data/purchase_items.csv");

  for (const item of purchaseItems) {
    await prisma.purchaseItem.create({
      data: {
        purchase_id: Number(item.purchase_id),
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        purchase_price: Number(item.purchase_price),
        total: Number(item.total),
      },
    });
  }

  console.log("Purchase Items Imported Successfully");
}

seedPurchaseItems()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });