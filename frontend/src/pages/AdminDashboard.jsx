import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

function AdminDashboard() {

    const [foods, setFoods] = useState([]);
    const [foodSearch, setFoodSearch] = useState("");
    const [orders, setOrders] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [food, setFood] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: ""
    });

    const [imageFile, setImageFile] = useState(null);

    const token = localStorage.getItem("token");

    // =========================
    // FETCH DATA
    // =========================

    useEffect(() => {
        fetchFoods();
        fetchOrders();
    }, []);

    // =========================
    // FETCH FOODS
    // =========================

    const fetchFoods = async () => {
        try {
            const response = await API.get("/foods");

            setFoods(response.data);

        } catch (error) {
            console.error(
                "FETCH FOODS ERROR:",
                error.response?.data || error
            );
        }
    };

    // =========================
    // FETCH ORDERS
    // =========================

    const fetchOrders = async () => {

        try {

            const response = await API.get(
                "/orders/admin/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "ADMIN ORDERS RESPONSE:",
                response.data
            );

            setOrders(response.data);

        } catch (error) {

            console.error(
                "FETCH ORDERS ERROR:",
                error.response?.data || error
            );

        }
    };

    // =========================
    // ADD / UPDATE FOOD
    // =========================

    const addFood = async (e) => {

        e.preventDefault();

        const currentToken =
            localStorage.getItem("token");

        if (!currentToken) {

            alert("Please login as admin first");

            window.location.href = "/login";

            return;
        }

        // Image required only while adding
        if (!editingId && !food.image && !imageFile) {

            alert(
                "Please provide an Image URL or select an image file"
            );

            return;
        }

        try {

            const formData = new FormData();

            formData.append(
                "name",
                food.name
            );

            formData.append(
                "description",
                food.description
            );

            formData.append(
                "price",
                food.price
            );

            formData.append(
                "category",
                food.category
            );

            // Image URL
            if (food.image) {

                formData.append(
                    "imageUrl",
                    food.image
                );
            }

            // Computer image
            if (imageFile) {

                formData.append(
                    "image",
                    imageFile
                );
            }

            // =========================
            // UPDATE FOOD
            // =========================

            if (editingId) {

                await API.put(
                    `/foods/${editingId}`,
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${currentToken}`
                        }
                    }
                );

                alert(
                    "Food updated successfully! ✅"
                );

            }

            // =========================
            // ADD FOOD
            // =========================

            else {

                await API.post(
                    "/foods",
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${currentToken}`
                        }
                    }
                );

                alert(
                    "Food added successfully! 🎉"
                );
            }

            // Reset form

            resetFoodForm();

            // Refresh foods

            fetchFoods();

        } catch (error) {

            console.error(
                "FOOD ERROR:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Operation failed"
            );
        }
    };

    // =========================
    // RESET FOOD FORM
    // =========================

    const resetFoodForm = () => {

        setEditingId(null);

        setFood({
            name: "",
            description: "",
            price: "",
            category: "",
            image: ""
        });

        setImageFile(null);
    };

    // =========================
    // DELETE FOOD
    // =========================

    const deleteFood = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this food?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            await API.delete(
                `/foods/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(
                "Food deleted successfully! 🗑️"
            );

            fetchFoods();

        } catch (error) {

            console.error(
                "DELETE FOOD ERROR:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete food"
            );
        }
    };

    // =========================
    // EDIT FOOD
    // =========================

    const editFood = (item) => {

        setEditingId(item._id);

        setFood({
            name: item.name || "",
            description: item.description || "",
            price: item.price || "",
            category: item.category || "",
            image: item.image || ""
        });

        setImageFile(null);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =========================
    // UPDATE ORDER STATUS
    // =========================

    const updateStatus = async (
        id,
        status
    ) => {

        try {

            await API.put(
                `/orders/admin/${id}/status`,
                {
                    status
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(
                "Order status updated! ✅"
            );

            fetchOrders();

        } catch (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update status"
            );
        }
    };

    // =========================
    // SEARCH FOODS
    // =========================

    const filteredFoods =
        foods.filter((item) => {

            const name =
                item.name?.toLowerCase() || "";

            const category =
                item.category?.toLowerCase() || "";

            const search =
                foodSearch.toLowerCase();

            return (
                name.includes(search) ||
                category.includes(search)
            );
        });

    // =========================
    // STATISTICS
    // =========================

    const pendingOrders =
        orders.filter(
            (order) =>
                order.status === "Pending"
        ).length;

    const totalRevenue =
        orders
            .filter(
                (order) =>
                    order.status !== "Cancelled"
            )
            .reduce(
                (total, order) =>
                    total +
                    Number(
                        order.totalAmount || 0
                    ),
                0
            );

    // =========================
    // UI
    // =========================

    return (
        <>
            <Navbar />

            <div className="admin-page">

                {/* ================= HEADER ================= */}

                <div className="admin-header">

                    <div>

                        <h1>
                            👨‍💼 Admin Dashboard
                        </h1>

                        <p>
                            Manage food items and
                            customer orders
                        </p>

                    </div>

                    <button
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        ← Home
                    </button>

                </div>

                {/* ================= STATS ================= */}

                <div className="admin-stats">

                    {/* Total Foods */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            🍔
                        </div>

                        <div>

                            <h3>
                                Total Foods
                            </h3>

                            <p>
                                {foods.length}
                            </p>

                        </div>

                    </div>

                    {/* Total Orders */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            📦
                        </div>

                        <div>

                            <h3>
                                Total Orders
                            </h3>

                            <p>
                                {orders.length}
                            </p>

                        </div>

                    </div>

                    {/* Pending Orders */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            ⏳
                        </div>

                        <div>

                            <h3>
                                Pending Orders
                            </h3>

                            <p>
                                {pendingOrders}
                            </p>

                        </div>

                    </div>

                    {/* Revenue */}

                    <div className="stat-card">

                        <div className="stat-icon">
                            💰
                        </div>

                        <div>

                            <h3>
                                Total Revenue
                            </h3>

                            <p>
                                ₹{totalRevenue}
                            </p>

                        </div>

                    </div>

                </div>

                {/* ================= ADD FOOD ================= */}

                <section className="admin-section">

                    <h2>
                        {editingId
                            ? "✏️ Edit Food"
                            : "➕ Add New Food"}
                    </h2>

                    <form
                        className="food-form"
                        onSubmit={addFood}
                    >

                        {/* Food Name */}

                        <input
                            type="text"
                            placeholder="Food name"
                            value={food.name}
                            onChange={(e) =>
                                setFood({
                                    ...food,
                                    name:
                                        e.target.value
                                })
                            }
                            required
                        />

                        {/* Description */}

                        <input
                            type="text"
                            placeholder="Description"
                            value={food.description}
                            onChange={(e) =>
                                setFood({
                                    ...food,
                                    description:
                                        e.target.value
                                })
                            }
                            required
                        />

                        {/* Price */}

                        <input
                            type="number"
                            placeholder="Price"
                            value={food.price}
                            onChange={(e) =>
                                setFood({
                                    ...food,
                                    price:
                                        e.target.value
                                })
                            }
                            required
                        />

                        {/* Category */}

                        <input
                            type="text"
                            placeholder="Category"
                            value={food.category}
                            onChange={(e) =>
                                setFood({
                                    ...food,
                                    category:
                                        e.target.value
                                })
                            }
                            required
                        />

                        {/* Image URL */}

                        <input
                            type="text"
                            placeholder="Image URL"
                            value={food.image}
                            onChange={(e) =>
                                setFood({
                                    ...food,
                                    image:
                                        e.target.value
                                })
                            }
                        />

                        {/* Upload Image */}

                        <label>
                            Upload Image
                            from Computer
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {

                                setImageFile(
                                    e.target.files[0]
                                );

                            }}
                        />

                        {/* Image Preview */}

                        {imageFile && (

                            <div className="image-preview">

                                <p>
                                    Selected Image:
                                </p>

                                <img
                                    src={URL.createObjectURL(
                                        imageFile
                                    )}
                                    alt="Preview"
                                />

                            </div>
                        )}

                        {/* Submit */}

                        <button
                            type="submit"
                            className="admin-submit-btn"
                        >
                            {editingId
                                ? "✏️ Update Food"
                                : "➕ Add Food"}
                        </button>

                        {/* Cancel */}

                        {editingId && (

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={
                                    resetFoodForm
                                }
                            >
                                ❌ Cancel
                            </button>

                        )}

                    </form>

                </section>

                {/* ================= FOOD LIST ================= */}

                <section className="admin-section">

                    <h2>
                        🍕 Food Items
                    </h2>

                    {/* Search */}

                    <div className="food-search">

                        <input
                            type="text"
                            placeholder="🔍 Search food or category..."
                            value={foodSearch}
                            onChange={(e) =>
                                setFoodSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                    {/* No Food */}

                    {filteredFoods.length === 0 ? (

                        <div className="admin-empty">

                            <h3>
                                🍽️ No Food Found
                            </h3>

                            <p>
                                No food matches
                                your search.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-food-list">

                            {filteredFoods.map(
                                (item) => (

                                    <div
                                        className="admin-food-card"
                                        key={item._id}
                                    >

                                        {/* Image */}

                                        <img
                                            src={
                                                item.image?.startsWith(
                                                    "http"
                                                )
                                                    ? item.image
                                                    : `http://localhost:5000${item.image}`
                                            }
                                            alt={
                                                item.name
                                            }
                                        />

                                        {/* Details */}

                                        <div className="admin-food-card-content">

                                            <h3>
                                                {item.name}
                                            </h3>

                                            <p>
                                                {item.description}
                                            </p>

                                            <p>
                                                <strong>
                                                    Category:
                                                </strong>{" "}
                                                {
                                                    item.category
                                                }
                                            </p>

                                            <p className="admin-food-price">
                                                ₹
                                                {
                                                    item.price
                                                }
                                            </p>

                                            {/* Buttons */}

                                            <div className="admin-food-actions">

                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        editFood(
                                                            item
                                                        )
                                                    }
                                                >
                                                    ✏️ Edit
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        deleteFood(
                                                            item._id
                                                        )
                                                    }
                                                >
                                                    🗑️ Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

                {/* ================= ORDERS ================= */}

                <section className="admin-section">

                    <h2>
                        📦 All Orders
                    </h2>

                    {orders.length === 0 ? (

                        <div className="admin-empty">

                            <h3>
                                📦 No Orders Found
                            </h3>

                            <p>
                                Customers have
                                not placed any
                                orders yet.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-orders">

                            {orders.map(
                                (order) => (

                                    <div
                                        className="admin-order-card"
                                        key={order._id}
                                    >

                                        {/* Order Header */}

                                        <div className="admin-order-header">

                                            <div>

                                                <h3>
                                                    📦 Order #
                                                    {order._id.slice(
                                                        -6
                                                    )}
                                                </h3>

                                                <p>
                                                    Date:{" "}
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString()}
                                                </p>

                                            </div>

                                            <span className="admin-order-status">
                                                {
                                                    order.status
                                                }
                                            </span>

                                        </div>

                                        <hr />

                                        {/* Ordered Items */}

                                        <h4>
                                            🍔 Ordered Items
                                        </h4>

                                        <div className="admin-order-items">

                                            {order.items.map(
                                                (
                                                    item,
                                                    index
                                                ) => (

                                                    <div
                                                        className="admin-order-item"
                                                        key={
                                                            index
                                                        }
                                                    >

                                                        <div>

                                                            <strong>
                                                                {
                                                                    item.name
                                                                }
                                                            </strong>

                                                            <p>
                                                                ₹
                                                                {
                                                                    item.price
                                                                }{" "}
                                                                ×{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </p>

                                                        </div>

                                                        <strong>
                                                            ₹
                                                            {
                                                                item.price *
                                                                item.quantity
                                                            }
                                                        </strong>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                        <hr />

                                        {/* Customer Information */}

                                        <div className="admin-order-info">

                                            {order.user && (

                                                <>
                                                    <p>
                                                        👤{" "}
                                                        <strong>
                                                            Customer:
                                                        </strong>{" "}
                                                        {
                                                            order
                                                                .user
                                                                .name
                                                        }
                                                    </p>

                                                    <p>
                                                        📧{" "}
                                                        <strong>
                                                            Email:
                                                        </strong>{" "}
                                                        {
                                                            order
                                                                .user
                                                                .email
                                                        }
                                                    </p>
                                                </>

                                            )}

                                            <p>
                                                📍{" "}
                                                <strong>
                                                    Address:
                                                </strong>{" "}
                                                {
                                                    order.address
                                                }
                                            </p>

                                            <p>
                                                💰{" "}
                                                <strong>
                                                    Total:
                                                </strong>{" "}
                                                ₹
                                                {
                                                    order.totalAmount
                                                }
                                            </p>

                                        </div>

                                        {/* Status */}

                                        <div className="admin-status-control">

                                            <label>
                                                Update Status:
                                            </label>

                                            <select
                                                value={
                                                    order.status
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateStatus(
                                                        order._id,
                                                        e.target
                                                            .value
                                                    )
                                                }
                                            >

                                                <option value="Pending">
                                                    Pending
                                                </option>

                                                <option value="Confirmed">
                                                    Confirmed
                                                </option>

                                                <option value="Preparing">
                                                    Preparing
                                                </option>

                                                <option value="Out for Delivery">
                                                    Out for Delivery
                                                </option>

                                                <option value="Delivered">
                                                    Delivered
                                                </option>

                                                <option value="Cancelled">
                                                    Cancelled
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </div>
        </>
    );
}

export default AdminDashboard;