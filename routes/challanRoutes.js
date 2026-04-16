const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

// Models
const Challan = require("../models/Challan");
const Item = require("../models/Item");
const Counter = require("../models/Counter");



// ================= DASHBOARD =================
router.get("/", async (req, res) => {
    try {
        const { search, counter, date } = req.query;

        let query = {};

        // 🔍 Challan Number search
        if (search) {
            query.challanNumber = { $regex: search, $options: "i" };
        }

        // 🔍 Counter Name search
        if (counter) {
            query.counterName = { $regex: counter, $options: "i" };
        }

        // 🔍 Date filter
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            query.date = { $gte: start, $lte: end };
        }

        const challans = await Challan.find(query).sort({ date: -1 });

        res.render("index", { challans });

    } catch (err) {
        console.error(err);
        res.send("Search error");
    }
});


// ================= CREATE FORM =================
router.get("/new", async (req, res) => {
    const items = await Item.find();
    const counters = await Counter.find();

    res.render("form", { items, counters });
});


// ================= CREATE =================
router.post("/create", async (req, res) => {
    try {
        const { counterId, remarks } = req.body;

        const counter = await Counter.findById(counterId);

        let items = [];
        let total = 0;

        const names = req.body.itemName;
        const qtys = req.body.quantity;
        const prices = req.body.price;

        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let qty = parseInt(qtys[i]) || 0;
            let price = parseFloat(prices[i]) || 0;

            if (!name || name === "Select Item") continue;

            items.push({ name, quantity: qty, price });
            total += qty * price;
        }

        await Challan.create({
            challanNumber: "CH" + Date.now(),

            // ✅ FIX HERE
            counterName: counter?.name || "N/A",
            counterAddress: counter?.address || "N/A",
            counterPhone: counter?.phone || "N/A",

            items,
            totalAmount: total,
            remarks
        });

        res.redirect("/");

    } catch (err) {
        console.error(err);
        res.send("Error creating challan");
    }
});


// ================= ADD ITEM =================
router.get("/add-item", (req, res) => {
    res.render("addItem");
});

router.post("/add-item", async (req, res) => {
    try {
        const { name, price } = req.body;

        const exists = await Item.findOne({ name: name.trim() });

        if (exists) {
            return res.send("⚠️ Item already exists");
        }

        await Item.create({ name, price });

        res.redirect("/items");

    } catch (err) {
        console.error(err);
        res.send("Error adding item");
    }
});


// ================= ADD COUNTER =================
router.get("/add-counter", (req, res) => {
    res.render("addCounter");
});

router.post("/add-counter", async (req, res) => {
    try {
        const { name, address, phone } = req.body;

        const exists = await Counter.findOne({ name: name.trim() });

        if (exists) {
            return res.send("⚠️ Counter already exists");
        }

        await Counter.create({ name, address, phone });

        res.redirect("/counters");

    } catch (err) {
        console.error(err);
        res.send("Error adding counter");
    }
});


// ================= EXPORT =================
router.get("/export", async (req, res) => {
    const challans = await Challan.find();

    let csv = "ChallanNo,Counter,Total,Date\n";

    challans.forEach(c => {
        csv += `${c.challanNumber},${c.counterName},${c.totalAmount},${c.date}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("challans.csv");
    res.send(csv);
});


// ================= VIEW =================
router.get("/challan/:id", async (req, res) => {
    try {
        const challan = await Challan.findById(req.params.id);

        // ✅ COMPANY DETAILS (EDIT THIS)
        const company = {
            name: "NEMESYS INFOTECH PVT. LTD.",
            address: "110, Kabi Nabin Sen Road, Dumdum, Kolkata- 700028",
            phone: "8017589027",
            email: "info@nemesysinfotech.com",
            logo: "/logo.jpg"
        };

        res.render("challan", { challan, company });

    } catch (err) {
        console.error(err);
        res.send("Error loading challan");
    }
});


// ================= DELETE =================
router.get("/delete/:id", async (req, res) => {
    await Challan.findByIdAndDelete(req.params.id);
    res.redirect("/");
});



router.get("/edit/:id", async (req, res) => {
    try {
        const challan = await Challan.findById(req.params.id);

        // ✅ MUST FETCH THESE
        const counters = await Counter.find();
        const items = await Item.find();

        // ✅ MUST PASS THESE
        res.render("editChallan", {
            challan,
            counters,
            items
        });

    } catch (err) {
        console.error(err);
        res.send("Error loading edit page");
    }
});

router.post("/update/:id", async (req, res) => {
    try {
        const { counterName, remarks } = req.body;

        let items = [];
        let total = 0;

        const names = req.body.itemName;
        const qtys = req.body.quantity;
        const prices = req.body.price;

        for (let i = 0; i < names.length; i++) {
            let name = names[i];
            let qty = parseInt(qtys[i]) || 0;
            let price = parseFloat(prices[i]) || 0;

            if (!name || name === "Select Item") continue;

            items.push({ name, quantity: qty, price });
            total += qty * price;
        }

        await Challan.findByIdAndUpdate(req.params.id, {
            counterName,
            items,
            totalAmount: total,
            remarks
        });

        res.redirect("/");

    } catch (err) {
        console.error(err);
        res.send("Update error");
    }
});

// 📋 View Counters
router.get("/counters", async (req, res) => {
    try {
        const search = req.query.search || "";

        const query = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ]
        };

        const counters = await Counter.find(query).sort({ createdAt: -1 });

        res.render("counters", { counters, search });

    } catch (err) {
        console.error(err);
        res.send("Error loading counters");
    }
});


// 📋 View Items
router.get("/items", async (req, res) => {
    try {
        const search = req.query.search || "";

        let query = {};

        if (search) {
            // If search is a number → match price
            if (!isNaN(search)) {
                query = {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { price: Number(search) } // ✅ correct way
                    ]
                };
            } else {
                // If text → search only name
                query = {
                    name: { $regex: search, $options: "i" }
                };
            }
        }

        const items = await Item.find(query).sort({ createdAt: -1 });

        res.render("items", { items, search });

    } catch (err) {
        console.error(err);
        res.send("Error loading items");
    }
});

// Edit Counter Page
router.get("/counter/edit/:id", async (req, res) => {
    const counter = await Counter.findById(req.params.id);
    res.render("editCounter", { counter });
});

// Update Counter
router.post("/counter/update/:id", async (req, res) => {
    const { name, address, phone } = req.body;

    await Counter.findByIdAndUpdate(req.params.id, {
        name,
        address,
        phone
    });

    res.redirect("/counters");
});

router.get("/counter/delete/:id", async (req, res) => {
    await Counter.findByIdAndDelete(req.params.id);
    res.redirect("/counters");
});

// Edit Item Page
router.get("/item/edit/:id", async (req, res) => {
    const item = await Item.findById(req.params.id);
    res.render("editItem", { item });
});

// Update Item
router.post("/item/update/:id", async (req, res) => {
    const { name, price } = req.body;

    await Item.findByIdAndUpdate(req.params.id, {
        name,
        price
    });

    res.redirect("/items");
});

router.get("/item/delete/:id", async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.redirect("/items");
});

// 📄 View All Challans Page
router.get("/challans", async (req, res) => {
    try {
        const { search, counter, date } = req.query;

        let query = {};

        if (search) {
            query.challanNumber = { $regex: search, $options: "i" };
        }

        if (counter) {
            query.counterName = { $regex: counter, $options: "i" };
        }

        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        const challans = await Challan.find(query).sort({ date: -1 });

        res.render("challans", { challans, search, counter, date });

    } catch (err) {
        console.error(err);
        res.send("Error loading challans");
    }
});




module.exports = router;