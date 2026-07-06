const prisma = require("../db");
const readCSV = require("./readCSV");

async function seedSales() {
  const sales = await readCSV("./data/sales.csv");

  for (const sale of sales) {
    await prisma.sale.create({
      data: {
        customer_name: sale.customer_name,
        sale_date: new Date(sale.sale_date),
        total_amount: Number(sale.total_amount),
        invoice_number: sale.invoice_number,
      },
    });
  }

  console.log("Sales Imported Successfully");
}

seedSales()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });