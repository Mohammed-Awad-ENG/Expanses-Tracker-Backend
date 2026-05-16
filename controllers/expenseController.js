const Expense = require("../models/Expense");
const XLSX = require("xlsx");

exports.addExpense = (req, res) => {
    try {
        const userId = req.user.id;
        const { icon, amount, date, category } = req.body || {};
        if (!userId || !amount || !date || !category) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const expense = new Expense({
            userId,
            icon,
            amount,
            date: new Date(date),
            category,
        });
        expense
            .save()
            .then((savedExpense) => {
                res.status(201).json(savedExpense);
            })
            .catch((err) => {
                res.status(400).json({ error: err.message });
            });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getExpenses = (req, res) => {
    const userId = req.user.id;
    try {
        Expense.find({ userId })
            .sort({ date: -1 })
            .then((expenses) => {
                res.status(200).json(expenses);
            })
            .catch((err) => {
                res.status(400).json({ error: err.message });
            });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteExpense = (req, res) => {
    try {
        Expense.findByIdAndDelete(req.params.id)
            .then((deletedExpense) => {
                if (!deletedExpense) {
                    return res.status(404).json({ error: "Expense not found" });
                }
                res.status(200).json({
                    message: "Expense deleted successfully",
                });
            })
            .catch((err) => {
                res.status(400).json({ error: err.message });
            });
    } catch (error) {
        res.status(500).json({ error: "Server error", error });
    }
};

exports.downloadExpenseExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        const allExpenses = await Expense.find({ userId }).sort({ date: -1 });

        const data = allExpenses.map((item) => ({
            category: item.category,
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Expenses");
        XLSX.writeFile(wb, "expenses.xlsx");
        res.download("expenses.xlsx");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
