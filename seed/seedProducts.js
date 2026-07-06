const prisma = require("../db");
const readCSV = require("./readCSV");

async function seedProducts() {
  const products = await readCSV("./data/products.csv");

  for (const product of products) {
    await prisma.product.create({
      data: {
        product_name: product.product_name,
        category_id: Number(product.category_id),
        supplier_id: Number(product.supplier_id),
        purchase_price: Number(product.purchase_price),
        selling_price: Number(product.selling_price),
        stock: Number(product.stock),
        min_stock: Number(product.min_stock),
      },
    });
  }

  console.log("Products Imported Successfully");
}

seedProducts()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });