const { z } = require("zod");

const createUserSchema = z.object({

  name: z.string().min(3),

  email: z.string().email(),

  role: z.enum([
    "ADMIN",
    "FACULTY",
    "STUDENT"
  ]),

  department: z.string().min(2),

  rollNo: z.string().optional(),

  employeeId: z.string().optional()

});

module.exports = {
  createUserSchema
};