function FoodCard({ food, addToCart }) {
    return (
        <div className="food-card">

            <img
                src={
                    food.image?.startsWith("http")
                        ? food.image
                        : `http://localhost:5000${food.image}`
                }
                alt={food.name}
                className="food-image"
            />

            <div className="food-info">

                <h2>{food.name}</h2>

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