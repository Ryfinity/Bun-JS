const express = require("express");
const {
    getVdrData,

} = require("../controllers/asnController");

// router instance
const router = express.Router();

// routes list
router.get("/vdr-data", getVdrData);


module.exports = router;