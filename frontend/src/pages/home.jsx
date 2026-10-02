import { useEffect, useState } from "react";
import API from "../services/api";
import FoodCard from "../components/FoodCard";
import Navbar from "../components/Navbar";

function Home() {
    const [foods, setFoods] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        fetchFoods();
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/foods");

            setFoods(response.data);
        } catch (error) {
            console.error("FOODS ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load food items"
            );
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (food) => {
        const existingItem = cart.find(
            (item) => item._id === food._id
        );

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item._id === food._id
                        ? {
                              ...item,
                              quantity: item.quantity + 1
                          }
                        : item
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    ...food,
                    quantity: 1
                }
            ]);
        }
    };

    const filteredFoods = foods.filter((food) => {
        const matchesSearch =
            food.name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            food.category
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesCategory =
            category === "All" ||
            food.category.toLowerCase() ===
                category.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            <Navbar />

            <main className="container">

                {/* Search Box */}
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔎 Search food or category..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                {/* Category Filter */}
                <div className="category-filter">

                    <button
                        className={
                            category === "All"
                                ? "active"
                                : ""
                        }
                        onClick={() => setCategory("All")}
                    >
                        🍽️ All
                    </button>

                    <button
                        className={
                            category === "Burger"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setCategory("Burger")
                        }
                    >
                        🍔 Burger
                    </button>

                    <button
                        className={
                            category === "Pizza"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setCategory("Pizza")
                        }
                    >
                        🍕 Pizza
                    </button>

                    <button
                        className={
                            category === "Snacks"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setCategory("Snacks")
                        }
                    >
                        🍟 Snacks
                    </button>

                </div>

                <h1>Delicious Food 🍕</h1>

                {/* Loading */}
                {loading ? (
                    <div className="loading-message">
                        ⏳ Loading food items...
                    </div>

                ) : error ? (

                    /* Error */
                    <div className="error-message">
                        <h3>❌ {error}</h3>

                        <button onClick={fetchFoods}>
                            🔄 Try Again
                        </button>
                    </div>

                ) : filteredFoods.length === 0 ? (

                    /* No Food */
                    <div className="no-food-message">
                        <h3>🍽️ No food found</h3>
                        <p>
                            Try another search or category.
                        </p>
                    </div>

                ) : (

                    /* Food List */
                    <div className="food-grid">
                        {filteredFoods.map((food) => (
                            <FoodCard
                                key={food._id}
                                food={food}
                                addToCart={addToCart}
                            />
                        ))}
                    </div>

                )}

            </main>
        </div>
    );
}

export default Home;