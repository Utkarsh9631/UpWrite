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

// --- THIS IS THE FIX ---
// Tell LocalStrategy to use 'email' as the username field
const strategyOptions = { usernameField: 'email' };
passport.use(new LocalStrategy(strategyOptions, UserModel.authenticate()));
// --- END FIX ---

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
  UserModel.register(
    new UserModel({
      email: req.body.email,
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        
        // --- THIS IS THE FIX ---
        // This handles the "User Already Exists" error gracefully
        if (err.name === "UserExistsError") {
          return res.status(400).json({ error: "A user with that email already exists." });
        }
        // --- END FIX ---

        // Send a generic 500 for any other errors
        return res.status(500).json({ error: err.message });
      }

      // We just created the user, so we know they are valid.
      // Just sign a token for them directly.
      try {
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.json({ success: true, token: token });
      } catch (tokenError) {
        console.error("JWT Signing Error:", tokenError);
        res.status(500).json({ error: "Failed to sign token." });
      }
    }
  );
});

// User Login
app.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      // Handle server errors
      return res.status(500).json({ success: false, message: err.message });
    }
    if (!user) {
      // 'info.message' comes from passport (e.g., "Incorrect username or password.")
      // We send 401 (Unauthorized) for failed logins
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