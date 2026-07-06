const prisma = require("../db");
const readCSV = require("./readCSV");

async function seedSaleItems() {
  const saleItems = await readCSV("./data/sale_items.csv");

  for (const item of saleItems) {
    await prisma.saleItem.create({
      data: {
        sale_id: Number(item.sale_id),
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        selling_price: Number(item.selling_price),
        total: Number(item.total),
      },
    });
  }

  console.log("Sale Items Imported Successfully");
}

seedSaleItems()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });