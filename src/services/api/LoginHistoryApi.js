import AxiosInstance from "./AxiosInstance";

export const getClientIP = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    return "Unknown";
  }
};

export const createLoginHistory = async (data) => {
  try {
    const res = await AxiosInstance.post("/login-history/create", data);
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const updateLoginHistory = async (id, data) => {
  try {
    const res = await AxiosInstance.patch(`/login-history/update/${id}`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const getLoginHistory = async () => {
  try {
    const res = await AxiosInstance.get("/login-history/get-all");
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const getLoginHistoryById = async (id) => {
  try {
    const res = await AxiosInstance.get(`/login-history/get-detail/${id}`);
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};
