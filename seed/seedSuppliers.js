const prisma = require("../db");
const readCSV = require("./readCSV");

async function seedSuppliers() {
  const suppliers = await readCSV("./data/suppliers.csv");

  for (const supplier of suppliers) {
    await prisma.supplier.create({
      data: {
        supplier_name: supplier.supplier_name,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
      },
    });
  }

  console.log("Suppliers Imported Successfully");
}

seedSuppliers()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });