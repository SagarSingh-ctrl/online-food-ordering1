const dns = require("dns");

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config({
    path: __dirname + "/.env"
});

const authRoutes = require("./routers/authRoutes");
const foodRoutes = require("./routers/foodrouter");
const orderRoutes = require("./routers/orderRoutes");

const app = express();

app.use(cors());

app.use(express.json());

// IMAGE FILES
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
    res.send("Food Ordering API is running");
});

// MONGODB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(
                `Server running on port ${PORT}`
            );
        });

    })
    .catch((error) => {

        console.log(
            "MongoDB connection error:",
            error.message
        );

    });