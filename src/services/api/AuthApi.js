import AxiosInstance from "./AxiosInstance";
import { auth, provider, signInWithPopup } from "../../config/firebase";

export const signUp = async (username, email, password) => {
  try {
    const res = await AxiosInstance.post("/auth/sign-up", {
      username,
      email,
      password,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

// Đăng nhập
export const login = async (username, password) => {
  try {
    const res = await AxiosInstance.post("/auth/sign-in", {
      username,
      password,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

// Gửi mã OTP qua email
export const sendOTP = async (email) => {
  try {
    const res = await AxiosInstance.post("/auth/send-otp", { email });
    return res.data;
  } catch (error) {
    return error.response?.data || { EM: "Gửi OTP thất bại" };
  }
};

// Xác thực mã OTP
export const verifyOTP = async (email, otp) => {
  try {
    const res = await AxiosInstance.post("/auth/verify-otp", {
      email,
      otp,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { EM: "Xác thực OTP thất bại" };
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (email, newPassword) => {
  try {
    const res = await AxiosInstance.patch("/auth/reset-password", {
      email,
      newPassword,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const signUpWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const res = await AxiosInstance.post("/auth/signup-with-google", {
      email: user.email,
      user_name: user.email,
      uid: user.uid,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const res = await AxiosInstance.post("/auth/signin-with-google", {
      email: user.email,
      uid: user.uid,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("Không có refresh token, user chưa đăng nhập.");
  }

  try {
    const res = await AxiosInstance.post("/auth/refresh-token", {
      refreshToken,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};
