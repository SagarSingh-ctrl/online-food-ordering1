function FoodCard({ food, addToCart }) {
    console.log("HOME FOOD:", food);
    console.log("HOME IMAGE:", food.image);

    const imageUrl = food.image
        ? food.image.startsWith("http")
            ? food.image
            : `https://online-food-ordering1-backend.onrender.com${food.image}`
        : "";

    return (
        <div className="food-card">

            {/* Food Image */}
            <img
                src={imageUrl}
                alt={food.name}
                onError={(e) => {
                    console.log(
                        "Image not found:",
                        e.target.src
                    );
                }}
            />

            {/* Food Details */}
            <div className="food-info">

                <h2>
                    {food.name}
                </h2>

                <p>
                    {food.description}
                </p>

                <p className="category">
                    {food.category}
                </p>

                <h3>
                    ₹{food.price}
                </h3>

                <button
                    onClick={() => addToCart(food)}
                >
                    Add to Cart
                </button>

            </div>
        </div>
    );
}

export default FoodCard;