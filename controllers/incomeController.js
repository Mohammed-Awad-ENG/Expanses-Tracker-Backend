const User = require("../models/User");
const XLSX = require("xlsx");
const Income = require("../models/Income");

exports.addIncome = (req, res) => {
    try {
        const userId = req.user.id;
        const { icon, amount, date, sources } = req.body;
        if (!userId || !amount || !date || !sources) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const income = new Income({
            userId,
            icon,
            amount,
            date: new Date(date),
            sources,
        });
        income
            .save()
            .then((savedIncome) => {
                res.status(201).json(savedIncome);
            })
            .catch((err) => {
                res.status(400).json({ error: err.message });
            });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getIncomes = (req, res) => {
    const userId = req.user.id;
    try {
        Income.find({ userId })
            .sort({ date: -1 })
            .then((incomes) => {
                res.status(200).json(incomes);
            })
            .catch((err) => {
                res.status(400).json({ error: err.message });
            });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.deleteIncome = (req, res) => {
    try {
        Income.findByIdAndDelete(req.params.id)
            .then((deletedIncome) => {
                if (!deletedIncome) {
                    return res.status(404).json({ error: "Income not found" });
                }
                res.status(200).json({
                    message: "Income deleted successfully",
                });
            })
            .catch((err) => {
                res.status(400).json({ error: err.message });
            });
    } catch (error) {
        res.status(500).json({ error: "Server error", error });
    }
};
exports.downloadIncomeExcel = async (req, res) => {
    try {
        const userId = req.user.id;
        const income = await Income.find({ userId }).sort({ date: -1 });

        const data = income.map((item) => ({
            Sources: item.sources,
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Incomes");

        const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="incomes.xlsx"');
        res.send(buf);

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
