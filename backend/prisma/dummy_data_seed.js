const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@example.com",
      password: "$2a$10$XHZQUk7OtZvPT1qK.ar/yOk1EJRjwQMhfkQxZ4ULK.n7wGtehB8f6",
      role: Role.ADMIN,
      department: "Administration",
      employeeId: "ADM001",
      mustChangePassword: false,
    },
  });

  const facultyUsers = [];

  for (let i = 1; i <= 3; i++) {
    facultyUsers.push(
      await prisma.user.create({
        data: {
          name: `Faculty ${i}`,
          email: `faculty${i}@example.com`,
          password: "$2a$10$XHZQUk7OtZvPT1qK.ar/yOk1EJRjwQMhfkQxZ4ULK.n7wGtehB8f6",
          role: Role.FACULTY,
          department: "Computer Science",
          employeeId: `FAC${String(i).padStart(3, "0")}`,
          mustChangePassword: false,
        },
      })
    );
  }

  const studentUsers = [];

  for (let i = 1; i <= 10; i++) {
    studentUsers.push(
      await prisma.user.create({
        data: {
          name: `Student ${i}`,
          email: `student${i}@example.com`,
          password: "$2a$10$XHZQUk7OtZvPT1qK.ar/yOk1EJRjwQMhfkQxZ4ULK.n7wGtehB8f6",
          role: Role.STUDENT,
          department: "Computer Science",
          rollNo: `STU${String(i).padStart(4, "0")}`,
          mustChangePassword: false,
        },
      })
    );
  }

  const allUsers = [admin, ...facultyUsers, ...studentUsers];

  const announcements = await prisma.conversation.create({
    data: {
      name: "College Announcements",
      description: "Official announcements",
      isGroup: true,
      isAnnouncement: true,
      createdById: admin.id,
    },
  });

  const facultyGroup = await prisma.conversation.create({
    data: {
      name: "Faculty Discussion",
      isGroup: true,
      createdById: facultyUsers[0].id,
    },
  });

  const csGroup = await prisma.conversation.create({
    data: {
      name: "CS Students",
      isGroup: true,
      createdById: facultyUsers[1].id,
    },
  });

  const direct1Users = [admin.id, studentUsers[0].id].sort();

const direct1 = await prisma.conversation.create({
  data: {
    createdById: admin.id,
    uniqueKey: direct1Users.join("_"),
  },
});

const direct2Users = [facultyUsers[0].id, studentUsers[1].id].sort();

const direct2 = await prisma.conversation.create({
  data: {
    createdById: facultyUsers[0].id,
    uniqueKey: direct2Users.join("_"),
  },
});

  for (const user of allUsers) {
    await prisma.conversationParticipant.create({
      data: {
        conversationId: announcements.id,
        userId: user.id,
        isAdmin: user.id === admin.id,
      },
    });
  }

  for (const user of [admin, ...facultyUsers]) {
    await prisma.conversationParticipant.create({
      data: {
        conversationId: facultyGroup.id,
        userId: user.id,
        isAdmin: user.id === facultyUsers[0].id,
      },
    });
  }

  for (const user of studentUsers) {
    await prisma.conversationParticipant.create({
      data: {
        conversationId: csGroup.id,
        userId: user.id,
      },
    });
  }

  await prisma.conversationParticipant.createMany({
    data: [
      {
        conversationId: direct1.id,
        userId: admin.id,
      },
      {
        conversationId: direct1.id,
        userId: studentUsers[0].id,
      },
      {
        conversationId: direct2.id,
        userId: facultyUsers[0].id,
      },
      {
        conversationId: direct2.id,
        userId: studentUsers[1].id,
      },
    ],
  });

  const conversations = [
    announcements,
    facultyGroup,
    csGroup,
    direct1,
    direct2,
  ];

  for (const conversation of conversations) {
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: conversation.id,
      },
    });

    for (let i = 1; i <= 5; i++) {
      const participant =
        participants[Math.floor(Math.random() * participants.length)];

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: participant.userId,
          encryptedContent: `Sample message ${i} in conversation`,
        },
      });
    }
  }

  await prisma.auditLog.createMany({
    data: [
      {
        action: "USER_CREATED",
        performedBy: admin.id,
        targetUser: facultyUsers[0].id,
      },
      {
        action: "USER_CREATED",
        performedBy: admin.id,
        targetUser: studentUsers[0].id,
      },
      {
        action: "CONVERSATION_CREATED",
        performedBy: admin.id,
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
