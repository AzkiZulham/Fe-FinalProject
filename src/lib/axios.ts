// src/lib/axios.ts
import Axios from "axios";

export const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Request error";
    return Promise.reject(new Error(msg));
  }
);
