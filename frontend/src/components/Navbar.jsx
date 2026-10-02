import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user") || "null")
    );

    const [cartCount, setCartCount] = useState(0);

    const updateCartCount = () => {
        const cart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        const count = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        setCartCount(count);
    };

    useEffect(() => {
        updateCartCount();

        const handleStorage = () => {
            setUser(
                JSON.parse(
                    localStorage.getItem("user") || "null"
                )
            );

            updateCartCount();
        };

        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        navigate("/login");
    };

    return (
        <nav className="navbar">

            <Link
                to="/"
                className="navbar-logo"
            >
                🍕 FoodApp
            </Link>

            <div className="navbar-links">

                <Link to="/">
                    🏠 Home
                </Link>

                <Link to="/cart">
                    🛒 Cart

                    {cartCount > 0 && (
                        <span className="cart-badge">
                            {cartCount}
                        </span>
                    )}
                </Link>

                {user && (
                    <Link to="/my-orders">
                        📦 My Orders
                    </Link>
                )}

                {user?.role === "admin" && (
                    <Link to="/admin">
                        ⚙️ Admin
                    </Link>
                )}

                {user ? (
                    <>
                        <span className="navbar-user">
                            👤 {user.name}
                        </span>

                        <button
                            className="logout-btn"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                )}

            </div>
        </nav>
    );
}

export default Navbar;