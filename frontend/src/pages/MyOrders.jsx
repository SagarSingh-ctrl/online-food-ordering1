import { useEffect, useState } from "react";
import API from "../services/api";


// =========================
// ORDER STATUS TIMELINE
// =========================

function OrderStatusTimeline({ status }) {
    const statuses = [
        "Pending",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered"
    ];

    const currentIndex = statuses.indexOf(status);

    return (
        <div className="order-timeline">
            {statuses.map((item, index) => (
                <div
                    key={item}
                    className={`timeline-step ${
                        index <= currentIndex
                            ? "completed"
                            : ""
                    }`}
                >
                    <div className="timeline-circle">
                        {index <= currentIndex
                            ? "✓"
                            : index + 1}
                    </div>

                    <span>{item}</span>

                    {index < statuses.length - 1 && (
                        <div
                            className={`timeline-line ${
                                index < currentIndex
                                    ? "completed"
                                    : ""
                            }`}
                        ></div>
                    )}
                </div>
            ))}
        </div>
    );
}


// =========================
// STATUS CLASS
// =========================

function getStatusClass(status) {
    switch (status) {
        case "Pending":
            return "status-pending";

        case "Confirmed":
            return "status-confirmed";

        case "Preparing":
            return "status-preparing";

        case "Out for Delivery":
            return "status-delivery";

        case "Delivered":
            return "status-delivered";

        case "Cancelled":
            return "status-cancelled";

        default:
            return "";
    }
}


// =========================
// MY ORDERS
// =========================

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================
    // FETCH ORDERS
    // =========================

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login to view your orders.");
                setLoading(false);
                return;
            }

            const response = await API.get(
                "/orders/my-orders",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setOrders(response.data);

        } catch (error) {
            console.error(
                "FETCH ORDERS ERROR:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load orders"
            );

        } finally {
            setLoading(false);
        }
    };


    // =========================
    // LOAD ORDERS
    // =========================

    useEffect(() => {
        fetchOrders();
    }, []);


    // =========================
    // CANCEL ORDER
    // =========================

    const cancelOrder = async (orderId) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmCancel) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await API.put(
                `/orders/${orderId}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Order cancelled successfully!");


            // Refresh orders
            fetchOrders();

        } catch (error) {
            console.error(
                "CANCEL ORDER ERROR:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to cancel order"
            );
        }
    };


    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="my-orders-page">
                <div className="my-orders-container">

                    <h1>📦 My Orders</h1>

                    <div className="loading-message">
                        ⏳ Loading your orders...
                    </div>

                </div>
            </div>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div className="my-orders-page">
                <div className="my-orders-container">

                    <h1>📦 My Orders</h1>

                    <div className="error-message">

                        <h3>❌ {error}</h3>

                        <button onClick={fetchOrders}>
                            🔄 Try Again
                        </button>

                    </div>

                </div>
            </div>
        );
    }


    // =========================
    // NO ORDERS
    // =========================

    if (orders.length === 0) {
        return (
            <div className="my-orders-page">
                <div className="my-orders-container">

                    <h1>📦 My Orders</h1>

                    <div className="no-orders">

                        <div className="no-orders-icon">
                            🍽️
                        </div>

                        <h2>No Orders Yet</h2>

                        <p>
                            You haven't placed any orders yet.
                        </p>

                        <button
                            onClick={() => {
                                window.location.href = "/";
                            }}
                        >
                            🍔 Order Food
                        </button>

                    </div>

                </div>
            </div>
        );
    }


    // =========================
    // ORDERS PAGE
    // =========================

    return (
        <div className="my-orders-page">

            <div className="my-orders-container">

                {/* HEADER */}

                <div className="my-orders-header">

                    <div>
                        <h1>📦 My Orders</h1>

                        <p>
                            Track and manage your orders
                        </p>
                    </div>

                    <button
                        className="back-home-btn"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        ← Continue Shopping
                    </button>

                </div>


                {/* ORDER LIST */}

                <div className="orders-list">

                    {orders.map((order) => (

                        <div
                            className="order-card"
                            key={order._id}
                        >

                            {/* ORDER HEADER */}

                            <div className="order-card-header">

                                <div>
                                    <h2>
                                        Order #
                                        {order._id.slice(-6).toUpperCase()}
                                    </h2>

                                    <p>
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>


                                <span
                                    className={`order-status ${getStatusClass(
                                        order.status
                                    )}`}
                                >
                                    {order.status}
                                </span>

                            </div>


                            {/* STATUS TIMELINE */}

                            {order.status !== "Cancelled" && (
                                <OrderStatusTimeline
                                    status={order.status}
                                />
                            )}


                            {/* CANCELLED MESSAGE */}

                            {order.status === "Cancelled" && (
                                <div className="cancelled-order-message">
                                    ❌ This order has been cancelled.
                                </div>
                            )}


                            {/* ORDER ITEMS */}

                            <div className="order-items">

                                <h3>Order Items</h3>

                                {order.items.map(
                                    (item, index) => (

                                        <div
                                            className="order-item"
                                            key={
                                                item.food ||
                                                index
                                            }
                                        >

                                            <div className="order-item-info">

                                                <h4>
                                                    {item.name}
                                                </h4>

                                                <p>
                                                    ₹{item.price}
                                                    {" × "}
                                                    {item.quantity}
                                                </p>

                                            </div>


                                            <strong>
                                                ₹
                                                {item.price *
                                                    item.quantity}
                                            </strong>

                                        </div>
                                    )
                                )}

                            </div>


                            {/* DELIVERY ADDRESS */}

                            <div className="order-address">

                                <h3>
                                    🚚 Delivery Address
                                </h3>

                                <p>
                                    {order.address}
                                </p>

                            </div>


                            {/* ORDER FOOTER */}

                            <div className="order-footer">

                                <div className="order-total">

                                    <span>
                                        Total Amount
                                    </span>

                                    <strong>
                                        ₹{order.totalAmount}
                                    </strong>

                                </div>


                                {/* CANCEL BUTTON */}

                                {order.status ===
                                    "Pending" && (

                                    <button
                                        className="cancel-order-btn"
                                        onClick={() =>
                                            cancelOrder(
                                                order._id
                                            )
                                        }
                                    >
                                        ❌ Cancel Order
                                    </button>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}

export default MyOrders;