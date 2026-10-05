import axios from "axios";

const API = axios.create({
    baseURL: "https://online-food-ordering-api.onrender.com/api"
});

export default API;