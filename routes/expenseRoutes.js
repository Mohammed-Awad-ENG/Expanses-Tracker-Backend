const express = require("express");

const {
    addExpense,
    getExpenses,
    deleteExpense,
    downloadExpenseExcel,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);
router.get("/download", protect, downloadExpenseExcel);

module.exports = router;
