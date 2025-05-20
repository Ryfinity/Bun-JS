const express = require("express");
const {
    getVdrData,
    processPOAlloc,
    processPOSum
} = require("../controllers/asnController");

// router instance
const router = express.Router();

// routes list
router.get("/vdr-data", getVdrData);
router.get("/po-alloc", processPOAlloc);
router.get("/po-sum", processPOSum);


module.exports = router;