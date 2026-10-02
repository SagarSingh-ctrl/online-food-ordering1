import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || !cleanEmail || !password || !confirmPassword) {
            alert("Please fill all details");
            return;
        }

        if (cleanName.length < 2) {
            alert("Name must be at least 2 characters");
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

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await API.post(
                "/auth/register",
                {
                    name: cleanName,
                    email: cleanEmail,
                    password
                }
            );

            alert(
                response.data.message ||
                "Registration successful! 🎉"
            );

            window.location.href = "/login";

        } catch (error) {
            console.error(
                "REGISTER ERROR:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <h1>🍔 FoodExpress</h1>

                <h2>Create Account</h2>

                <form onSubmit={handleRegister}>

                    <label>Name</label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        required
                    />

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
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="auth-submit-btn"
                    >
                        📝 Create Account
                    </button>

                </form>

                <p>
                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="auth-link"
                    >
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Register;