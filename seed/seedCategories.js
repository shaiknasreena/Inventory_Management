const prisma = require("../db");
const readCSV = require("./readCSV");

async function seedCategories() {
  try {
    const categories = await readCSV("./data/categories.csv");

    for (const category of categories) {
      await prisma.category.create({
        data: {
          category_name: category.category_name,
          description: category.description,
        },
      });
    }

    console.log("✅ Categories imported successfully.");
  } catch (error) {
    console.error("❌ Error importing categories:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();