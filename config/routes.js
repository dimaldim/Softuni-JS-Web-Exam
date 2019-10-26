const {homeController, userController, expensesController} = require('../controllers/index');
const {auth} = require('../utils/index');


module.exports = (app) => {
    //User
    app.get('/login', userController.getLogin);
    app.post('/login', userController.login);
    app.get('/register', userController.getRegister);
    app.post('/register', userController.register);
    app.get('/logout', auth(), userController.logout);
    app.post('/user/refill', auth(), userController.refill);
    app.get('/user/profile/:id', auth(), userController.getProfileInfo);

    //Expenses
    app.get('/expenses/home', auth(), expensesController.getAllExpenses);
    app.get('/expenses/add', auth(), expensesController.getCreate);
    app.post('/expenses/add', auth(), expensesController.addExpenses);
    app.get('/expenses/report/:id', auth(), expensesController.getReport);
    app.get('/expenses/delete/:id', auth(), expensesController.deleteExpense);

    app.get('/', auth(false), homeController.getHome);

    app.all('*', auth(false), (req, res) => res.render('errors/404', {user: req.user}));
};