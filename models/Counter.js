const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,   // 🔥 prevents duplicate
        trim: true
    },
    address: String,
    phone: String
}, { timestamps: true });

module.exports = mongoose.model("Counter", counterSchema);