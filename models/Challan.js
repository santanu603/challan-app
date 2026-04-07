const mongoose = require("mongoose");

const challanSchema = new mongoose.Schema({
    challanNumber: {
        type: String,
        required: true
    },

    counterName: {
        type: String,
        required: true
    },

    counterAddress: {
        type: String,
        required: true
    },

    counterPhone: {
        type: Number,
        required: true
    },

    items: [
        {
            name: String,
            quantity: Number,
            price: Number
        }
    ],

    totalAmount: {
        type: Number,
        default: 0
    },

    remarks: {
        type: String,
        default: ""
    },

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Challan", challanSchema);