const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

const {
  createUser,
  getProfile,
  updateProfile
} = require("../controllers/userController");

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createUser
);

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

module.exports = router;