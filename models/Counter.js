const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone: String
});

module.exports = mongoose.model("Counter", counterSchema);