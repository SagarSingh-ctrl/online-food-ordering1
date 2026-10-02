import { useState } from "react";
import API from "../services/api";

function Checkout() {
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);

    const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
    );

    const totalAmount = cart.reduce(
        (total, item) =>
            total + Number(item.price) * item.quantity,
        0
    );

    const placeOrder = async (e) => {
        e.preventDefault();

        // Address validation
        if (address.trim().length < 10) {
            alert("Please enter a complete delivery address.");
            return;
        }

        // Phone validation
        const cleanPhone = phone.replace(/\D/g, "");

        if (cleanPhone.length !== 10) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        // Login check
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            window.location.href = "/login";
            return;
        }

        // Empty cart check
        if (cart.length === 0) {
            alert("Your cart is empty.");
            window.location.href = "/cart";
            return;
        }

        try {
            setPlacingOrder(true);

            const orderItems = cart.map((item) => ({
                food: item._id,
                name: item.name,
                price: Number(item.price),
                quantity: item.quantity
            }));

            const response = await API.post(
                "/orders",
                {
                    items: orderItems,
                    totalAmount,
                    address: `${address.trim()}, Phone: ${cleanPhone}`
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert(
                response.data.message ||
                "Order placed successfully! 🎉"
            );

            // Clear cart
            localStorage.removeItem("cart");

            // Go to My Orders
            window.location.href = "/my-orders";

        } catch (error) {
            console.error(
                "ORDER ERROR:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to place order. Please try again."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    // Empty cart
    if (cart.length === 0) {
        return (
            <div className="checkout-page">

                <div className="empty-cart">
                    <h2>🛒 Your Cart is Empty</h2>

                    <p>
                        Please add some food before checkout.
                    </p>

                    <button
                        className="shop-btn"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        Browse Food
                    </button>
                </div>

            </div>
        );
    }

    return (
        <div className="checkout-page">

            {/* Header */}
            <div className="checkout-header">

                <h1>🛍️ Checkout</h1>

                <button
                    onClick={() => {
                        window.location.href = "/cart";
                    }}
                >
                    ← Back to Cart
                </button>

            </div>

            <div className="checkout-container">

                {/* Delivery Form */}
                <div className="checkout-form">

                    <h2>Delivery Details</h2>

                    <form onSubmit={placeOrder}>

                        {/* Phone */}
                        <label>
                            Phone Number
                        </label>

                        <input
                            type="tel"
                            placeholder="Enter 10-digit phone number"
                            value={phone}
                            maxLength="10"
                            required
                            onChange={(e) => {
                                const value =
                                    e.target.value.replace(/\D/g, "");

                                setPhone(value);
                            }}
                        />

                        {/* Address */}
                        <label>
                            Delivery Address
                        </label>

                        <textarea
                            placeholder="Enter your complete delivery address"
                            value={address}
                            required
                            rows="5"
                            onChange={(e) =>
                                setAddress(e.target.value)
                            }
                        />

                        {/* Place Order */}
                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={placingOrder}
                        >
                            {placingOrder
                                ? "⏳ Placing Order..."
                                : "🛍️ Place Order"}
                        </button>

                    </form>

                </div>

                {/* Order Summary */}
                <div className="checkout-summary">

                    <h2>Order Summary</h2>

                    {cart.map((item) => (

                        <div
                            className="checkout-item"
                            key={item._id}
                        >

                            <div className="checkout-item-info">

                                <img
                                    src={
                                        item.image?.startsWith("http")
                                            ? item.image
                                            : `http://localhost:5000${item.image}`
                                    }
                                    alt={item.name}
                                />

                                <div>
                                    <strong>
                                        {item.name}
                                    </strong>

                                    <p>
                                        ₹{item.price} ×{" "}
                                        {item.quantity}
                                    </p>
                                </div>

                            </div>

                            <strong>
                                ₹{item.price * item.quantity}
                            </strong>

                        </div>

                    ))}

                    <hr />

                    <div className="checkout-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            ₹{totalAmount}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Checkout;