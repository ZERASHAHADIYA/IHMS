const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
  searchUsers
} = require("../controllers/searchController");

router.get(
  "/",
  authMiddleware,
  searchUsers
);

module.exports = router;