const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;
        const userObjectId = new Types.ObjectId(String(userId));
        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const totalExpense = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const last120DaysIncomeTransactions = await Income.find({
            userId: userObjectId,
            date: { $gte: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        const incomeLast120Days = last120DaysIncomeTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0,
        );

        const last120DaysExpenseTransactions = await Expense.find({
            userId: userObjectId,
            date: { $gte: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 });

        const expenseLast120Days = last120DaysExpenseTransactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0,
        );

        const lastTransactions = [
            ...(
                await Income.find({ userId: userObjectId })
                    .sort({ date: -1 })
                    .limit(5)
            ).map((t) => ({
                ...t.toObject(),
                type: "income",
            })),
            ...(
                await Expense.find({ userId: userObjectId })
                    .sort({ date: -1 })
                    .limit(5)
            )
                .map((t) => ({
                    ...t.toObject(),
                    type: "expense",
                }))
                .sort((a, b) => b.date - a.date),
        ];

        res.json({
            totalBalance:
                (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            last120DaysExpense: {
                total: expenseLast120Days,
                transactions: last120DaysExpenseTransactions,
            },
            last120DaysIncome: {
                total: incomeLast120Days,
                transactions: last120DaysIncomeTransactions,
            },
            recentTransactions: lastTransactions,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard data",
            error: error.message,
        });
    }
};
