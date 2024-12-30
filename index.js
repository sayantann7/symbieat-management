const express = require('express');
const path = require('path');
const app = express();
const passport = require('passport');
// const userModel = require('./models/users');
// const inventoryModel = require('./models/inventory');
// const reservationModel = require('./models/reservations');
// const orderModel = require('./models/orders');
const localStrategy = require('passport-local');
const session = require('session');
const expressSession = require('express-session');
// passport.use(new localStrategy(userModel.authenticate()));
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
// passport.serializeUser(userModel.serializeUser());
// passport.deserializeUser(userModel.deserializeUser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// app.post("/register", (req, res) => {
//     let userData = new userModel({
//         fullName: req.body.fullName,
//         username: req.body.prn,
//         email: req.body.email,
//         secret: req.body.secret
//     });

//     userModel.register(userData, req.body.password)
//         .then(function (registeredUser) {
//             passport.authenticate("local")(req, res, () => {
//                 res.redirect('/home');
//             })
//         })
// });

// app.post('/login', passport.authenticate("local", {
//     successRedirect: '/home',
//     failureRedirect: '/',
//     failureFlash: true
// }), function (req, res) { });

// app.get('/', (req, res) => {
//     res.render("login");
// });

// app.get('/signup', (req, res) => {
//     res.render("signup");
// });

app.get('/home', (req, res) => {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});