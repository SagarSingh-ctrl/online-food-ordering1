import axios from "axios";

const API = axios.create({
    baseURL: "https://online-food-ordering1-backend11.onrender.com/api"
});

export default API;