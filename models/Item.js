const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,   // 🔥 prevents duplicate
        trim: true
    },
    price: Number
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);