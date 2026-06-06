const prisma = require("./config/prisma");
const bcrypt = require("bcryptjs");

async function createAdmin() {

  const hashedPassword =
    await bcrypt.hash("admin123", 10);

  const admin =
    await prisma.user.create({

      data: {

        name: "Admin",

        email: "admin@college.edu",

        password: hashedPassword,

        role: "ADMIN",

        department: "ADMIN",

        mustChangePassword: false

      }

    });

  console.log(admin);

}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());