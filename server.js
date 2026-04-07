const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();


// 🔧 Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


// 🔐 Session Config
app.use(session({
    secret: "superSecretKey", // change in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false // true only when using HTTPS
    }
}));


// 👤 Global User Middleware
app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    res.locals.username = req.session.username;
    next();
});


// 🌐 MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/challanDB")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error(err));


// 🔒 Auth Middleware
function isAuth(req, res, next) {
    if (req.session.userId) return next();
    return res.redirect("/login");
}


// 📦 Routes
const authRoutes = require("./routes/authRoutes");
const challanRoutes = require("./routes/challanRoutes");

// Public
app.use("/", authRoutes);

// Protected
app.use("/", isAuth, challanRoutes);


// 🚀 Start Server
const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://192.168.0.12:${PORT}`);
});