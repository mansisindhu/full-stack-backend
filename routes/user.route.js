const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const checkAccess = require("../middleware/checkAccess");
const blacklist = require("../blacklist");

// Get all users -> Only admin
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashpassword, role });
    const savedUser = await newUser.save();
    res.status(201).json({ message: "Registered successfully", savedUser });
  } catch (err) {
    res.status(400).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ err: "User not found!" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ err: "Password is wrong!" });
    }

    const accessToken = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "20s" }
    );

    const refreshToken = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "1D" }
    );

    res.json({ accessToken, refreshToken, message: "Logged in successfully!", userId: user._id });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/logout", (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  blacklist.push(token)
  res.send("Logged out successfully")
})

router.post("/token", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(404).send("Not a valid token!")
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(404).send("Not a valid token!")
    } else {
      const accessToken = jwt.sign(
        {
          _id: decoded._id,
          role: decoded.role,
        },
        process.env.SECRET_KEY,
        { expiresIn: "20s" }
      );
      res.json({ accessToken })
    }
  })
})



module.exports = router;
