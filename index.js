const express = require("express");
const path = require("path");
const app = express();
const moment = require("moment");
const mongoose = require("mongoose");
const passport = require("passport");
const userModel = require("./models/staffuser");
const studentUserModel = require("./models/users");
const inventoryModel = require("./models/inventory");
const reservationModel = require("./models/reservations");
const orderModel = require("./models/orders");
const localStrategy = require("passport-local");
const session = require("session");
const expressSession = require("express-session");
passport.use(new localStrategy(userModel.authenticate()));
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const multer = require("multer");
const sharp = require("sharp");
require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    secret: "bcubwufe",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/add-item", upload.single("image"), async (req, res) => {
  try {
    const inventory = await inventoryModel.findOne({});
    const imageBuffer = req.file.buffer;
    const compressedImageBuffer = await sharp(imageBuffer)
      .resize(800)
      .jpeg({ quality: 30 })
      .toBuffer();

    const imageBase64 = compressedImageBuffer.toString("base64");
    const imageUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

    if (!inventory) {
      const newInventory = new inventoryModel({
        foodItems: [
          {
            name: req.body.name,
            foodID: 0,
            quantity: req.body.quantity,
            price: req.body.price,
            image: imageUrl,
          },
        ],
      });
      await newInventory.save();
      return res.redirect("/home");
    }

    inventory.foodItems.push({
      name: req.body.name,
      foodID: inventory.foodItems.length,
      quantity: req.body.quantity,
      price: req.body.price,
      image: imageUrl,
    });

    await inventory.save();
    res.redirect("/home");
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/image/:filename", async (req, res) => {
  try {
    const inventory = await inventoryModel.findOne({});
    const foodItem = inventory.foodItems.find((item) =>
      item.image.includes(req.params.filename)
    );
    if (!foodItem) {
      return res.status(404).json({ err: "No file exists" });
    }

    const base64Data = foodItem.image.split(",")[1];
    const imgBuffer = Buffer.from(base64Data, "base64");
    res.writeHead(200, {
      "Content-Type": "image/jpeg",
      "Content-Length": imgBuffer.length,
    });
    res.end(imgBuffer);
  } catch (err) {
    console.error("Error retrieving image:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/delete-item/:foodId", isLoggedIn, async (req, res) => {
  const inventory = await inventoryModel.findOne({});
  inventory.foodItems.pull({ _id: req.params.foodId });
  await inventory.save();
  res.redirect("/home");
});

app.post("/register", (req, res) => {
  let userData = new userModel({
    username: req.body.username,
    secret: req.body.secret,
  });

  userModel
    .register(userData, req.body.password)
    .then(function (registeredUser) {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/home");
      });
    });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
  }),
  function (req, res) {}
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/api/food", isLoggedIn, async (req, res) => {
  const inventory = await inventoryModel.findOne({});
  const foodData = inventory.foodItems;
  res.json(foodData);
});

app.get("/api/reservations", isLoggedIn, async (req, res) => {
  const reservations = await reservationModel.find({});
  res.json(reservations);
});

app.get("/home", isLoggedIn, async (req, res) => {
  const inventory = await inventoryModel.findOne({});
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  const orders = await orderModel
    .find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
    .sort({ date: -1 });

  let revenue = 0;
  orders.forEach((order) => {
    revenue += order.price * order.quantity;
  });
  revenue = revenue.toLocaleString("en-IN");
  const orderCount = orders.length.toLocaleString("en-IN");
  const reservations = await reservationModel.find({});
  res.render("home", {
    inventory: inventory != null ? inventory.foodItems : null,
    reservations: reservations,
    orderCount: orderCount,
    revenue: revenue,
  });
});

app.get("/profile", isLoggedIn, async (req, res) => {
  const currentUser = await userModel.findOne({
    username: req.session.passport.user,
  });
  const startOfMonth = moment().startOf("month").toDate();
  const endOfMonth = moment().endOf("month").toDate();
  const orders = await orderModel
    .find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    })
    .sort({ date: -1 });
  let revenue = 0;
  orders.forEach((order) => {
    revenue += order.price * order.quantity;
  });
  revenue = revenue.toLocaleString("en-IN");
  let orderCount = orders.length.toLocaleString("en-IN");
  res.render("profile", {
    user: currentUser,
    orders: orders,
    formatDate: formatDate,
    revenue: revenue,
    orderCount: orderCount,
  });
});

app.get("/serve-order/:orderId", isLoggedIn, async (req, res) => {
  const reservation = await reservationModel.findOne({
    _id: req.params.orderId,
  });
  await reservation.populate("user");
  const order = new orderModel({
    user: reservation.user._id,
    foodID: reservation.foodID,
    name: reservation.name,
    quantity: reservation.quantity,
    price: reservation.price,
    image: reservation.image,
  });
  await order.save();
  const user = await studentUserModel.findOne({
    username: reservation.user.username,
  });
  user.orders.push(order);
  await user.save();
  await reservationModel.deleteOne({ _id: reservation._id });
  res.redirect("/home");
});

app.get("/cancel-order/:orderId", isLoggedIn, async (req, res) => {
  const reservation = await reservationModel.findOne({
    _id: req.params.orderId,
  });
  await reservation.populate("user");
  const user = await studentUserModel.findOne({
    username: reservation.user.username,
  });
  user.reservations.pull(reservation);
  await user.save();
  await reservationModel.deleteOne({ _id: reservation._id });
  res.redirect("/home");
});

app.post("/stock-update/:foodId", isLoggedIn, async (req, res) => {
  const inventory = await inventoryModel.findOne({});
  const foodItem = inventory.foodItems.find(
    (item) => item._id == req.params.foodId
  );
  foodItem.quantity = req.body.quantity;
  await inventory.save();
  res.redirect("/home");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});