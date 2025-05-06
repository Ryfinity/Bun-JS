const express = require("express");
const { readFile } = require("../controllers/fileReaderController");

// router instance
const router = express.Router();

// routes list
router.get("/read-file", readFile);

module.exports = router;