const express = require("express");

const {
    addIncome,
    getIncomes,
    deleteIncome,
    downloadIncomeExcel,
} = require("../controllers/incomeController");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getIncomes);
router.delete("/:id", protect, deleteIncome);
router.get("/download", protect, downloadIncomeExcel);

module.exports = router;
