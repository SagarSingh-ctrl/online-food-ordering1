const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// CREATE ORDER
router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            items,
            totalAmount,
            address
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Order must contain at least one item"
            });
        }

        if (!totalAmount || !address) {
            return res.status(400).json({
                message: "Total amount and address are required"
            });
        }

        const order = await Order.create({
            user: req.user.id,
            items,
            totalAmount,
            address
        });

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to place order",
            error: error.message
        });
    }
});


// GET MY ORDERS
router.get("/my-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.id
        })
            .populate("items.food", "name price image")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });
    }
});

router.put("/:id/cancel", authMiddleware, async (req, res) => {
    try {
        console.log("CANCEL ORDER ID:", req.params.id);
        console.log("LOGGED USER:", req.user);

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Check order owner
        if (String(order.user) !== String(req.user.id)) {
            return res.status(403).json({
                message: "You can cancel only your own order"
            });
        }

        // Only Pending order can be cancelled
        if (order.status !== "Pending") {
            return res.status(400).json({
                message: "Only Pending orders can be cancelled"
            });
        }

        order.status = "Cancelled";

        await order.save();

        console.log("ORDER CANCELLED:", order._id);

        res.status(200).json({
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.log("CANCEL ORDER ERROR:", error);

        res.status(500).json({
            message: "Failed to cancel order",
            error: error.message
        });
    }
});

// GET SINGLE ORDER
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("items.food", "name price image");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch order",
            error: error.message
        });
    }
});

// ADMIN - GET ALL ORDERS
router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const orders = await Order.find()
                .populate("user", "name email")
                .populate("items.food", "name price image")
                .sort({ createdAt: -1 });

            res.status(200).json(orders);

        } catch (error) {
            console.log("ADMIN ORDERS ERROR:", error);
            res.status(500).json({
                message: "Failed to fetch all orders",
                error: error.message
            });
        }
    }
);

// ADMIN - UPDATE ORDER STATUS
router.put(
    "/admin/:id/status",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { status } = req.body;

            const allowedStatuses = [
                "Pending",
                "Confirmed",
                "Preparing",
                "Out for Delivery",
                "Delivered",
                "Cancelled"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid order status"
                });
            }

            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            res.status(200).json({
                message: "Order status updated successfully",
                order
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to update order status",
                error: error.message
            });
        }
    }
);

router.put(
    "/admin/:id/status",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            console.log("STATUS BODY:", req.body);
            console.log("ORDER ID:", req.params.id);

            const { status } = req.body;

            const allowedStatuses = [
                "Pending",
                "Confirmed",
                "Preparing",
                "Out for Delivery",
                "Delivered",
                "Cancelled"
            ];

            if (!status) {
                return res.status(400).json({
                    message: "Status is required"
                });
            }

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid order status",
                    receivedStatus: status,
                    allowedStatuses
                });
            }

            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status: status },
                {
                    returnDocument: "after",
                    runValidators: true
                }
            );

            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            res.status(200).json({
                message: "Order status updated successfully",
                order
            });

        } catch (error) {
            console.log("STATUS ERROR:", error);

            res.status(500).json({
                message: "Failed to update order status",
                error: error.message
            });
        }
    }
);


module.exports = router;