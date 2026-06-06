
const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

const {
  login,
  profile,
  adminPanel
} = require("../controllers/authController");

const {
  loginLimiter
} =
require("../middleware/rateLimiter");

router.post("/login", loginLimiter, login);

router.get(
  "/profile",
  authMiddleware,
  profile
);




router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminPanel
);

module.exports = router;