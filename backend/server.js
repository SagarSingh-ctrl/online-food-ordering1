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

app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
    res.send("Food Ordering API is running");
});

console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(process.env.PORT || 5000, () => {
            console.log(
                `Server running on port ${process.env.PORT || 5000}`
            );
        });
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });