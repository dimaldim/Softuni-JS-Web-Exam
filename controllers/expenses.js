const {expensesModel, userModel} = require('../models/index');
const {handleError} = require('../utils/index');

function getCreate(req, res, next) {
    const user = req.user;

    res.render('expenses/add', {user});
}

function getReport(req, res, next) {
    const user = req.user;
    const expenseId = req.params.id;

    expensesModel.findById(expenseId).populate('expensesAuthor')
        .then((expense) => {
            res.render('expenses/report', {user, expenses: expense});
        })
        .catch(err => {
            next(err);
        })
}

async function deleteExpense(req, res, next) {
    const user = req.user;
    const expenseId = req.params.id;

    try {
        await userModel.updateOne({_id: user._id}, {$pull: {expenses: expenseId}});
        await expensesModel.findByIdAndDelete(expenseId);

        res.redirect('/expenses/home');
    } catch (e) {
        next(e);
    }
}

async function addExpenses(req, res, next) {
    const user = req.user;
    const {merchant, total, category, description} = req.body;
    let {report} = req.body;
    report = report === "on";

    if (merchant.length < 4) {
        handleError(res, 'merchant', 'Merchant should be at least 4 characters long!');
        res.render('expenses/add', {merchant, total, category, description, report});
        return;
    }

    if (total < 0) {
        handleError(res, 'total', 'Total should be positive number!');
        res.render('expenses/add', {merchant, total, category, description, report});
        return;
    }

    if (description < 10 || description > 50) {
        handleError(res, 'description', 'Description should be minimum 10 characters long and 50 characters max!');
        res.render('expenses/add', {merchant, total, category, description, report});
        return;
    }

    if (typeof category === "undefined") {
        handleError(res, 'category', 'Please select category!');
        res.render('expenses/add', {merchant, total, category, description, report});
        return;
    }
    const newExpense = {
        merchant,
        total,
        category,
        description,
        report,
        user: user._id
    };

    try {
        const expense = await expensesModel.create(newExpense);
        await userModel.updateOne({_id: user._id}, {$push: {expenses: expense._id}});

        res.redirect('/expenses/home');
    } catch (e) {
        res.render('expenses/add', {
            merchant,
            total,
            category,
            description,
            report
        });
    }

}

function getAllExpenses(req, res, next) {
    const user = req.user;
    const query = {user: user._id};
    console.log(query);
    expensesModel.find(query)
        .then(expenses => {
            res.render('expenses/home', {user, expenses})
        })
        .catch(err => {
            next(err);
        })
}

module.exports = {
    getAllExpenses,
    getCreate,
    addExpenses,
    getReport,
    deleteExpense
}