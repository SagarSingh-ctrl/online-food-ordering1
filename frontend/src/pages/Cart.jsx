import { useEffect, useState } from "react";

function Cart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");

        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error("CART LOAD ERROR:", error);
                setCart([]);
            }
        }
    }, []);

    const updateCart = (updatedCart) => {
        setCart(updatedCart);
        localStorage.setItem(
            "cart",
            JSON.stringify(updatedCart)
        );
    };

    // =========================
    // INCREASE QUANTITY
    // =========================

    const increaseQuantity = (id) => {
        const updatedCart = cart.map((item) =>
            item._id === id
                ? {
                      ...item,
                      quantity: item.quantity + 1
                  }
                : item
        );

        updateCart(updatedCart);
    };

    // =========================
    // DECREASE QUANTITY
    // =========================

    const decreaseQuantity = (id) => {
        const updatedCart = cart
            .map((item) =>
                item._id === id
                    ? {
                          ...item,
                          quantity: item.quantity - 1
                      }
                    : item
            )
            .filter((item) => item.quantity > 0);

        updateCart(updatedCart);
    };

    // =========================
    // REMOVE ITEM
    // =========================

    const removeItem = (id) => {
        const confirmRemove = window.confirm(
            "Remove this item from cart?"
        );

        if (!confirmRemove) {
            return;
        }

        const updatedCart = cart.filter(
            (item) => item._id !== id
        );

        updateCart(updatedCart);
    };

    // =========================
    // CLEAR CART
    // =========================

    const clearCart = () => {
        const confirmClear = window.confirm(
            "Are you sure you want to clear your cart?"
        );

        if (!confirmClear) {
            return;
        }

        updateCart([]);
    };

    // =========================
    // TOTAL ITEMS
    // =========================

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // =========================
    // SUBTOTAL
    // =========================

    const subtotal = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    // =========================
    // DELIVERY CHARGE
    // =========================

    const deliveryCharge = 0;

    // =========================
    // FINAL TOTAL
    // =========================

    const totalAmount = subtotal + deliveryCharge;

    return (
        <div className="cart-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="cart-header">

                <div>
                    <h1>🛒 My Cart</h1>

                    {cart.length > 0 && (
                        <p>
                            {totalItems} item
                            {totalItems !== 1 ? "s" : ""} in
                            your cart
                        </p>
                    )}
                </div>

                <div className="cart-header-actions">

                    <button
                        onClick={() => {
                            window.location.href = "/";
                        }}
                        className="back-btn"
                    >
                        ← Continue Shopping
                    </button>

                    {cart.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="clear-cart-btn"
                        >
                            🗑️ Clear Cart
                        </button>
                    )}

                </div>

            </div>


            {/* =========================
                EMPTY CART
            ========================= */}

            {cart.length === 0 ? (

                <div className="empty-cart">

                    <div className="empty-cart-icon">
                        🛒
                    </div>

                    <h2>Your Cart is Empty</h2>

                    <p>
                        Looks like you haven't added
                        anything to your cart yet.
                    </p>

                    <button
                        onClick={() => {
                            window.location.href = "/";
                        }}
                        className="shop-btn"
                    >
                        🍔 Browse Food
                    </button>

                </div>

            ) : (

                /* =========================
                   CART CONTENT
                ========================= */

                <div className="cart-container">

                    {/* =========================
                        CART ITEMS
                    ========================= */}

                    <div className="cart-items">

                        {cart.map((item) => (

                            <div
                                className="cart-item"
                                key={item._id}
                            >

                                {/* IMAGE */}

                                <div className="cart-image-wrapper">

                                    <img
                                        src={
                                            item.image?.startsWith(
                                                "http"
                                            )
                                                ? item.image
                                                : `http://localhost:5000${item.image}`
                                        }
                                        alt={item.name}
                                        className="cart-item-image"
                                    />

                                </div>


                                {/* INFO */}

                                <div className="cart-info">

                                    <h2>
                                        {item.name}
                                    </h2>

                                    <p>
                                        {item.description}
                                    </p>

                                    <h3>
                                        ₹{item.price}
                                    </h3>


                                    {/* QUANTITY */}

                                    <div className="quantity">

                                        <button
                                            onClick={() =>
                                                decreaseQuantity(
                                                    item._id
                                                )
                                            }
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>

                                        <span>
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() =>
                                                increaseQuantity(
                                                    item._id
                                                )
                                            }
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>

                                    </div>


                                    {/* REMOVE */}

                                    <button
                                        className="remove-btn"
                                        onClick={() =>
                                            removeItem(
                                                item._id
                                            )
                                        }
                                    >
                                        🗑️ Remove
                                    </button>

                                </div>


                                {/* ITEM TOTAL */}

                                <div className="item-total">

                                    <span>
                                        Item Total
                                    </span>

                                    <strong>
                                        ₹
                                        {item.price *
                                            item.quantity}
                                    </strong>

                                </div>

                            </div>

                        ))}

                    </div>


                    {/* =========================
                        ORDER SUMMARY
                    ========================= */}

                    <div className="cart-summary">

                        <h2>
                            Order Summary
                        </h2>


                        <div className="summary-row">

                            <span>
                                Total Items
                            </span>

                            <strong>
                                {totalItems}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ₹{subtotal}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Delivery
                            </span>

                            <strong className="free">
                                FREE
                            </strong>

                        </div>


                        <hr />


                        <div className="grand-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹{totalAmount}
                            </strong>

                        </div>


                        {/* CHECKOUT */}

                        <button
                            className="checkout-btn"
                            onClick={() => {
                                window.location.href =
                                    "/checkout";
                            }}
                        >
                            Proceed to Checkout →
                        </button>


                        <p className="secure-checkout">
                            🔒 Secure checkout
                        </p>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Cart;