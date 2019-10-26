const {userModel, expensesModel} = require('../models/index');
const {jwt, handleError} = require('../utils/index');
const {authCookieName} = require('../appConfig');

function getLogin(req, res) {
    res.render('users/login');
}

function getProfileInfo(req, res, next) {
    const user = req.user;
    let totalExpenses = 0.00;
    const query = {user: user._id};
    expensesModel.find(query)
        .then(expenses => {

            if (expenses.length > 0) {
                expenses.forEach(expense => {
                    totalExpenses += +expense.total;
                });
            }
            res.render('users/profile', {user, totalExpenses})
        })
        .catch(err => {
            next(err);
        });

}

async function login(req, res, next) {
    const {username, password} = req.body;

    try {
        const user = await userModel.findOne({username});
        if (!user) {
            handleError(res, 'auth', 'Wrong username or password!');
            res.render('users/login', {username, password});
            return;
        }

        const isMatched = await user.matchPassword(password);

        if (!isMatched) {
            handleError(res, 'auth', 'Wrong username or password!');
            res.render('users/login', {username, password});
            return;
        }

        const token = jwt.createToken({id: user._id});
        res.cookie(authCookieName, token).redirect('/expenses/home');
    } catch (e) {
        handleError(res, 'auth', 'Wrong username or password!');
        res.render('users/login', {username, password});
    }
}

function getRegister(req, res) {
    res.render('users/register');
}

function register(req, res, next) {
    const {username, password, repeatPassword, amount} = req.body;

    if (username.length < 4) {
        handleError(res, 'username', 'Username should be at least 4 characters!');
        res.render('users/register', {username});
        return;
    }
    if (password.length < 8) {
        handleError(res, 'password', 'Password should be at least 8 characters!');
        res.render('users/register', {username});
        return;
    }

    if (password !== repeatPassword) {
        handleError(res, 'repeatPassword', 'Passwords should be same!');
        res.render('users/register', {username, password, repeatPassword});
        return;
    }

    if (amount < 0) {
        handleError(res, 'amount', 'Amount should be positive number!');
        res.render('users/register', {username, password, repeatPassword});
        return;
    }

    const newUser = {
        username,
        password,
        amount
    };

    return userModel.create(newUser)
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => {
            err.code === 11000 ? handleError(res, 'username', 'Username is already taken!') : handleError(res, err);

            res.render('users/register', {username, password, repeatPassword});
        });
}

function logout(req, res) {
    res.clearCookie(authCookieName).redirect('/');
}

async function refill(req, res, next) {
    const user = req.user;
    const {refill} = req.body;

    await userModel.updateOne({_id: user._id}, {$inc: {amount: refill}});

    res.redirect('/expenses/home');
}

module.exports = {
    getLogin,
    login,
    getRegister,
    register,
    logout,
    refill,
    getProfileInfo
}