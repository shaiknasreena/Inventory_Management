const prisma = require("../db");
const readCSV = require("./readCSV");

async function seedUsers() {
  const users = await readCSV("./data/users.csv");

  for (const user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });
  }

  console.log("Users Imported");
}

seedUsers()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });