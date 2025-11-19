// API calls using axios to interact with the backend

import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000"  // FastAPI backend
  });

export default API;

export const getClients = () => API.get("/clients");
export const addClient = (client) => API.post("/clients", client);