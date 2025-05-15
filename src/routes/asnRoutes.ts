const express = require("express");
const {
    getVdrData,
    processPOAlloc

} = require("../controllers/asnController");

// router instance
const router = express.Router();

// routes list
router.get("/vdr-data", getVdrData);
router.get("/po-alloc", processPOAlloc);


module.exports = router;