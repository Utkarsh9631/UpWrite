require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");

// --- Model Imports ---
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel"); // <-- ADD THIS

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

app.use(cors());
app.use(bodyParser.json());

// --- Passport.js Configuration ---
app.use(passport.initialize());
// Use the 'createStrategy' helper from passport-local-mongoose
passport.use(new LocalStrategy(UserModel.authenticate()));
// We are using JWT, so session support is not needed
// passport.serializeUser(UserModel.serializeUser());
// passport.deserializeUser(UserModel.deserializeUser());
// --- End Passport.js Configuration ---

// --- Existing Routes ---
app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find({});
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.post("/newOrder", async (req, res) => {
  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });

  newOrder.save();

  res.send("Order saved!");
});
// --- End Existing Routes ---

// --- NEW AUTHENTICATION ROUTES ---

// User Registration (Signup)
app.post("/register", (req, res) => {
  // 'register' is a static helper method from passport-local-mongoose
  UserModel.register(
    new UserModel({
      email: req.body.email,
      username: req.body.email, // We use email as the username
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
      }
      // Log the user in right after registration
      passport.authenticate("local", { session: false })(req, res, () => {
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.json({ success: true, token: token });
      });
    }
  );
});

// User Login
app.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // 'info' contains failure message from passport
      return res.status(401).json({ success: false, message: info.message });
    }

    // User is authenticated, create and sign a token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.json({
      success: true,
      token: token,
      user: { email: user.email },
    });
  })(req, res, next);
});

// --- END NEW AUTHENTICATION ROUTES ---

app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri);
  console.log("DB started!");
});