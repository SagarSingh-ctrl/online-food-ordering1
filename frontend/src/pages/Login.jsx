import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail || !password) {
            alert("Please enter email and password");
            return;
        }

        if (!cleanEmail.includes("@")) {
            alert("Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {
            const response = await API.post("/auth/login", {
                email: cleanEmail,
                password
            });

            console.log("LOGIN RESPONSE:", response.data);

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            alert("Login successful! 🎉");

            window.location.href = "/";
        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <h1>🍔 FoodExpress</h1>

                <h2>Login</h2>

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="auth-submit-btn"
                    >
                        🔐 Login
                    </button>

                </form>

                <p>
                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        className="auth-link"
                    >
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;