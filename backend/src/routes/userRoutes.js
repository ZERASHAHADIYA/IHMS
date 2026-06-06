const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

const {
  createUser
} = require("../controllers/userController");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createUser
);

module.exports = router;