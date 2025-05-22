const express = require("express");
const {
    getVdrData,
    processPOAlloc,
    processPOSum,
    processPOAllocAff
} = require("../controllers/asnController");

// router instance
const router = express.Router();

// routes list
router.get("/vdr-data", getVdrData);
router.get("/po-alloc", processPOAlloc);
router.get("/po-sum", processPOSum);
router.get("/po-alloc-aff", processPOAllocAff);


module.exports = router;