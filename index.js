const express = require('express');
const path = require('path');
const app = express();
const moment = require('moment');
const passport = require('passport');
const userModel = require('./models/staffuser');
const studentUserModel = require('./models/users');
const inventoryModel = require('./models/inventory');
const reservationModel = require('./models/reservations');
const orderModel = require('./models/orders');
const localStrategy = require('passport-local');
const session = require('session');
const expressSession = require('express-session');
passport.use(new localStrategy(userModel.authenticate()));
const bodyParser = require('body-parser');
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(expressSession({
    secret: 'bcubwufe',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.post("/register", (req, res) => {
    let userData = new userModel({
        username: req.body.username,
        secret: req.body.secret
    });

    userModel.register(userData, req.body.password)
        .then(function (registeredUser) {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/home');
            })
        })
});

app.post('/login', passport.authenticate("local", {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
}), function (req, res) { });

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/api/food', isLoggedIn, async (req, res) => {
    const inventory = await inventoryModel.findOne({
        _id: '676e654bb320bb1b699551f8'
    });
    const foodData = inventory.foodItems;
    res.json(foodData);
});

app.get('/api/reservations', isLoggedIn, async (req, res) => {
    const reservations = await reservationModel.find({});;
    res.json(reservations);
});

app.get('/home', isLoggedIn, async (req, res) => {
    const inventory = await inventoryModel.findOne({
        _id: '676e654bb320bb1b699551f8'
    });
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    const orders = await orderModel.find({
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).sort({ date: -1 });

    let revenue = 0;
    orders.forEach(order => {
        revenue += order.price * order.quantity;
    });
    revenue = revenue.toLocaleString('en-IN');
    const orderCount = orders.length.toLocaleString('en-IN');
    const reservations = await reservationModel.find({});
    res.render("home", { inventory: inventory.foodItems, reservations: reservations, orderCount: orderCount, revenue: revenue });
});

app.get('/profile', isLoggedIn, async (req, res) => {
    const currentUser = await userModel.findOne({
        username: req.session.passport.user,
    });
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    const orders = await orderModel.find({
        date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    }).sort({ date: -1 });
    let revenue = 0;
    orders.forEach(order => {
        revenue += order.price*order.quantity;
    });
    revenue = revenue.toLocaleString('en-IN');
    let orderCount = orders.length.toLocaleString('en-IN');
    res.render('profile' ,{user: currentUser, orders: orders, formatDate: formatDate, revenue: revenue, orderCount: orderCount});
});

app.get('/serve-order/:orderId', isLoggedIn, async (req, res) => {
    const reservation = await reservationModel.findOne({
        _id: req.params.orderId 
    });
    await reservation.populate('user');
    const order = new orderModel({
        user: reservation.user._id,
        foodID: reservation.foodID,
        name: reservation.name,
        quantity: reservation.quantity,
        price: reservation.price
    });
    await order.save();
    const user = await studentUserModel.findOne({
        username: reservation.user.username
    });
    user.orders.push(order);
    await user.save();
    await reservationModel.deleteOne({ _id: reservation._id });
    res.redirect('/home');
});

app.get('/cancel-order/:orderId', isLoggedIn, async (req, res) => {
    const reservation = await reservationModel.findOne({
        _id: req.params.orderId 
    });
    await reservation.populate('user');
    const user = await studentUserModel.findOne({
        username: reservation.user.username
    });
    user.reservations.pull(reservation);
    await user.save();
    await reservationModel.deleteOne({ _id: reservation._id });
    res.redirect('/home');
});

app.post('/add-item',async (req,res) => {
    const inventory = await inventoryModel.findOne({
        _id: '676e654bb320bb1b699551f8'
    });
    inventory.foodItems.push({
        name: req.body.name,
        foodID: inventory.foodItems.length,
        quantity: req.body.quantity,
        price: req.body.price
    });
    await inventory.save();
    res.redirect('/home');
});

app.post('/stock-update/:foodId', isLoggedIn, async (req, res) => {
    const inventory = await inventoryModel.findOne({
        _id: '676e654bb320bb1b699551f8'
    });
    const foodItem = inventory.foodItems.find(item => item._id == req.params.foodId);
    foodItem.quantity = req.body.quantity;
    await inventory.save();
    res.redirect('/home');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});