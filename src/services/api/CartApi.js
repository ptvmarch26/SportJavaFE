import AxiosInstance from "./AxiosInstance";

export const getCart = async () => {
  try {
    const res = await AxiosInstance.get("/cart");
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const addToCart = async (
  productId,
  colorName,
  variantName,
  quantity
) => {
  try {
    const res = await AxiosInstance.post("/cart", {
      productId,
      colorName,
      variantName,
      quantity,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const removeFromCart = async (productId, colorName, variantName) => {
  try {
    const res = await AxiosInstance.delete(`/cart/item`, {
      data: { productId, colorName, variantName },
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const clearCart = async () => {
  try {
    const res = await AxiosInstance.delete("/cart");
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const decreaseQuantity = async (productId, colorName, variantName) => {
  try {
    const res = await AxiosInstance.patch("/cart/decrease-quantity", {
      productId,
      colorName,
      variantName,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};
