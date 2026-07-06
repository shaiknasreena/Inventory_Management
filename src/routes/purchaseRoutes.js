const express = require("express");

const router = express.Router();

const purchaseController = require("../controllers/purchaseController");

router.get("/", purchaseController.getPurchases);
router.get("/report", purchaseController.getPurchaseReport);
router.get("/report/csv", purchaseController.downloadPurchaseCSV);
router.post("/", purchaseController.createPurchase);
router.put("/:id", purchaseController.updatePurchase);
router.delete("/:id", purchaseController.deletePurchase);
router.get("/:id", purchaseController.getPurchaseById);
module.exports = router;