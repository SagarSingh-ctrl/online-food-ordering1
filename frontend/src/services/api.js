import axios from "axios";

const API = axios.create({
    baseURL: "https://online-food-ordering1-backend.onrender.com/api"
});

export default API;