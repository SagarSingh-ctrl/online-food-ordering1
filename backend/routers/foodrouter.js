const express = require("express");
const Food = require("../models/Food");

const multer = require("multer");
const path = require("path");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// GET ALL FOOD
router.get("/", async (req, res) => {
    try {
        const foods = await Food.find();

        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch food",
            error: error.message
        });
    }
});


// GET SINGLE FOOD
router.get("/:id", async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        res.status(200).json(food);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch food",
            error: error.message
        });
    }
});


// ADD FOOD
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    async (req, res) => {
        try {
            const {
                name,
                description,
                price,
                category
            } = req.body;

            const imagePath = req.file
                ? `/uploads/${req.file.filename}`
                : req.body.imageUrl;

            if (!imagePath) {
                return res.status(400).json({
                    message: "Please upload an image or provide an image URL"
                });
            }

            if (!name || !description || !price || !category) {
                return res.status(400).json({
                    message:
                        "Name, description, price and category are required"
                });
            }

            
            const food = await Food.create({
                name,
                description,
                price: Number(price),
                category,
                image: `/uploads/${req.file.filename}`
            });

            res.status(201).json({
                message: "Food added successfully",
                food
            });

        } catch (error) {
            console.log("ADD FOOD ERROR:", error);

            res.status(500).json({
                message: "Failed to add food",
                error: error.message
            });
        }
    }
);


// DELETE FOOD
router.delete("/:id", async (req, res) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);

        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        res.status(200).json({
            message: "Food deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete food",
            error: error.message
        });
    }
});

// UPDATE FOOD
router.put("/:id", authMiddleware,
    adminMiddleware, async (req, res) => {
        try {
            const { name, description, price, category, image } = req.body;

            const food = await Food.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    description,
                    price,
                    category,
                    image
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!food) {
                return res.status(404).json({
                    message: "Food not found"
                });
            }

            res.status(200).json({
                message: "Food updated successfully",
                food
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to update food",
                error: error.message
            });
        }
    });

// DELETE FOOD
router.delete("/:id", authMiddleware,
    adminMiddleware, async (req, res) => {
        try {
            const food = await Food.findByIdAndDelete(req.params.id);

            if (!food) {
                return res.status(404).json({
                    message: "Food not found"
                });
            }

            res.status(200).json({
                message: "Food deleted successfully"
            });

        } catch (error) {
            res.status(500).json({
                message: "Failed to delete food",
                error: error.message
            });
        }
    });

module.exports = router;