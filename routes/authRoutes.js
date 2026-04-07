const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");


// 📝 Register Page
router.get("/register", (req, res) => {
    res.render("register");
});


// 📝 Register User
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send("⚠️ Username already exists");
        }

        const hash = await bcrypt.hash(password, 10);

        await User.create({
            username,
            password: hash
        });

        res.redirect("/login");

    } catch (err) {
        console.error(err);
        res.send("Error registering user");
    }
});


// 🔑 Login Page
router.get("/login", (req, res) => {
    res.render("login");
});


// 🔑 Login User
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.send("❌ User not found");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("❌ Incorrect password");

        // Save session
        req.session.userId = user._id;
        req.session.username = user.username;

        res.redirect("/");

    } catch (err) {
        console.error(err);
        res.send("Login error");
    }
});


// 🚪 Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});


module.exports = router;