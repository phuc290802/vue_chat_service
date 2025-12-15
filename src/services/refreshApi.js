import axios from "axios";

const refreshApi = axios.create({
  baseURL: "https://localhost:7113/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

export default refreshApi;
