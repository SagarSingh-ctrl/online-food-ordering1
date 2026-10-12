const express = require("express");
const Food = require("../models/Food");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { v2: cloudinary } = require("cloudinary");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===============================
// UPLOAD FOLDER
// ===============================

// const uploadDir = path.join(__dirname, "..", "uploads");

// // Folder nahi hai to automatically create hoga
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// ===============================
// MULTER STORAGE
// ===============================

const storage = multer.memoryStorage();

// ===============================
// MULTER UPLOAD
// ===============================

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
        }
    }
});

// ===============================
// GET ALL FOOD
// ===============================

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

// ===============================
// GET SINGLE FOOD
// ===============================

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

// ===============================
// ADD FOOD
// ===============================

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

            // Check required fields
            if (!name || !description || !price || !category) {

                return res.status(400).json({
                    message:
                        "Name, description, price and category are required"
                });

            }

            // Image required
            if (!req.file) {

                return res.status(400).json({
                    message: "Please upload an image"
                });

            }

            // Upload image to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {

                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "food-ordering"
                    },
                    (error, result) => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }

                    }
                );

                stream.end(req.file.buffer);
            });

            // Cloudinary URL save karo
            const food = await Food.create({

                name: name.trim(),

                description: description.trim(),

                price: Number(price),

                category: category.trim(),

                image: uploadResult.secure_url

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

// ===============================
// UPDATE FOOD
// ===============================

router.put(
    "/:id",
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

            const food = await Food.findById(req.params.id);

            if (!food) {

                return res.status(404).json({
                    message: "Food not found"
                });

            }

            // Update normal fields
            food.name = name;
            food.description = description;
            food.price = Number(price);
            food.category = category;

            // ===============================
            // NEW IMAGE UPLOADED
            // ===============================

            if (req.file) {

                // Upload new image to Cloudinary
                const uploadResult = await new Promise((resolve, reject) => {

                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: "food-ordering"
                        },
                        (error, result) => {

                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }

                        }
                    );

                    stream.end(req.file.buffer);

                });

                // Save Cloudinary URL
                food.image = uploadResult.secure_url;
            }

            await food.save();

            res.status(200).json({

                message: "Food updated successfully",

                food

            });

        } catch (error) {

            console.log("UPDATE FOOD ERROR:", error);

            res.status(500).json({

                message: "Failed to update food",

                error: error.message

            });

        }

    }
);

// ===============================
// DELETE FOOD
// ===============================

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,

    async (req, res) => {

        try {

            const food = await Food.findById(
                req.params.id
            );

            if (!food) {

                return res.status(404).json({
                    message: "Food not found"
                });

            }

            // Delete image from uploads
            if (
                food.image &&
                food.image.startsWith("/uploads/")
            ) {

                const imagePath = path.join(
                    uploadDir,
                    path.basename(food.image)
                );

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

            }

            await Food.findByIdAndDelete(
                req.params.id
            );

            res.status(200).json({

                message: "Food deleted successfully"

            });

        } catch (error) {

            console.log("DELETE FOOD ERROR:", error);

            res.status(500).json({

                message: "Failed to delete food",

                error: error.message

            });

        }

    }
);

module.exports = router;