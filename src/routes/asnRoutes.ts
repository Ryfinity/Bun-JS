const express = require("express");
const {
    processVdrdata,
    processPOAlloc,
    processPOSum,
    processPOAllocAff,
    processPOSet
} = require("../controllers/AsnController");

const router = express.Router();

router.get("/vdr-data", processVdrdata);
router.get("/po-alloc", processPOAlloc);
router.get("/po-sum", processPOSum);
router.get("/po-alloc-aff", processPOAllocAff);
router.get("/po-set", processPOSet);

module.exports = router;