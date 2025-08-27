const express = require("express");
const {
    processVdrdata,
    processPOAlloc,
    processPOSum,
    processPOAllocAff,
    processPOSet,
    processPODetails,
    processRCRSum,
    processRCRDetl,
    processSCDRR,
    autoRegistration
} = require("../controllers/AsnController");

const router = express.Router();

router.get("/vdr-data", processVdrdata);
router.get("/po-alloc", processPOAlloc);
router.get("/po-sum", processPOSum);
router.get("/po-alloc-aff", processPOAllocAff);
router.get("/po-set", processPOSet);
router.get("/po-detl", processPODetails);
router.get("/rcr-sum", processRCRSum);
router.get("/rcr-detl", processRCRDetl);
router.get("/scrdr", processSCDRR);
router.get("/user/:id", autoRegistration);

module.exports = router;