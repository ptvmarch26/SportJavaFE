import AxiosInstance from "./AxiosInstance";

export const createProduct = async (productData) => {
  const formData = new FormData();

  // Thông tin cơ bản của sản phẩm
  formData.append("productTitle", productData.productTitle);
  formData.append("productBrand", productData.productBrand);
  formData.append("productPrice", productData.productPrice);
  formData.append("productSelled", productData.productSelled || 0);
  formData.append(
    "productPercentDiscount",
    productData.productPercentDiscount || 0
  );
  formData.append("productRate", productData.productRate || 0);
  formData.append("productDescription", productData.productDescription);
  formData.append("productCategory", productData.productCategory);
  formData.append("productDisplay", productData.productDisplay);
  formData.append("productFamous", productData.productFamous);

  // Ảnh chính của sản phẩm
  if (productData.productImg && productData.productImg[0]) {
    const imageFile =
      productData.productImg[0].originFileObj || productData.productImg[0];
    if (imageFile instanceof File) {
      formData.append("product_img", imageFile);
    }
  }

  // Xử lý danh sách màu sắc
  if (productData.colors && productData.colors.length > 0) {
    // Tạo một bản sao của dữ liệu màu để gửi dưới dạng JSON
    const colorsPayload = productData.colors.map((color) => {
      // Chuẩn bị dữ liệu màu sắc (không bao gồm file ảnh)
      return {
        colorName: color.colorName,
        variants: color.variants || [],
      };
    });

    // Thêm thông tin màu sắc dưới dạng JSON
    formData.append("colors", JSON.stringify(colorsPayload));

    // Xử lý riêng các file hình ảnh cho từng màu
    productData.colors.forEach((color, colorIndex) => {
      // Xử lý ảnh chính của màu
      if (color.imgs?.imgMain?.[0]) {
        const mainImageFile =
          color.imgs.imgMain[0].originFileObj || color.imgs.imgMain[0];
        if (mainImageFile instanceof File) {
          formData.append(`color_img_${colorIndex}_main`, mainImageFile);
        }
      }

      // Xử lý các ảnh phụ của màu
      if (color.imgs?.imgSubs?.length > 0) {
        color.imgs.imgSubs.forEach((subImg) => {
          const subImageFile = subImg.originFileObj || subImg;
          if (subImageFile instanceof File) {
            formData.append(`color_img_${colorIndex}_subs`, subImageFile);
          }
        });
      }
    });
  }

  try {
    const response = await AxiosInstance.post("/product/create", formData);
    return response.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

// Hàm cập nhật sản phẩm
export const updateProduct = async (productId, productData) => {
  const formData = new FormData();
  // Thông tin cơ bản của sản phẩm
  formData.append("productTitle", productData.productTitle);
  formData.append("productBrand", productData.productBrand);
  formData.append("productPrice", productData.productPrice);
  formData.append("productSelled", productData.productSelled || 0);
  formData.append(
    "productPercentDiscount",
    productData.productPercentDiscount || 0
  );
  formData.append("productRate", productData.productRate || 0);
  formData.append("productDescription", productData.productDescription);
  formData.append("productCategory", productData.productCategory);
  formData.append("productDisplay", productData.productDisplay);
  formData.append("productFamous", productData.productFamous);

  // Ảnh chính của sản phẩm
  if (productData.product_img && productData.product_img[0]) {
    const imageFile =
      productData.product_img[0].originFileObj || productData.product_img[0];
    if (imageFile instanceof File) {
      formData.append("product_img", imageFile);
    }
  }

  // Xử lý danh sách màu sắc
  if (productData.colors && productData.colors.length > 0) {
    // Tạo một bản sao của dữ liệu màu để gửi dưới dạng JSON
    const colorsPayload = productData.colors.map((color) => {
      // Chuẩn bị dữ liệu màu sắc
      return {
        colorName: color.colorName,
        variants: color.variants || [],
      };
    });

    // Thêm thông tin màu sắc dưới dạng JSON
    formData.append("colors", JSON.stringify(colorsPayload));

    // Xử lý riêng các file hình ảnh cho từng màu
    productData.colors.forEach((color, colorIndex) => {
      // Xử lý ảnh chính của màu
      if (color.imgs?.imgMain?.[0]) {
        const mainImageFile =
          color.imgs.imgMain[0].originFileObj || color.imgs.imgMain[0];
        if (mainImageFile instanceof File) {
          formData.append(`color_img_${colorIndex}_main`, mainImageFile);
        }
      }

      // Xử lý các ảnh phụ của màu
      if (color.imgs?.imgSubs?.length > 0) {
        color.imgs.imgSubs.forEach((subImg) => {
          const subImageFile = subImg.originFileObj || subImg;
          if (subImageFile instanceof File) {
            formData.append(`color_img_${colorIndex}_subs`, subImageFile);
          }
        });
      }
    });
  }
  console.log("==== FormData Contents ====", productId);
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}:`, pair[1]);
  }
  try {
    const response = await AxiosInstance.patch(
      `/product/update/${productId}`,
      formData
    );
    return response.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const getDetailsProduct = async (productId) => {
  try {
    const res = await AxiosInstance.get(`/product/get-details/${productId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const deleteProduct = async (productId) => {
  try {
    const res = await AxiosInstance.delete(`/product/delete/${productId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};

export const getAllProducts = async (filters) => {
  if (typeof filters === "string") {
    filters = JSON.parse(filters);
  }

  const params = {
    categoryGender: filters.category_gender,
    category: filters.category,
    categorySub: filters.category_sub,
    productColor: filters.product_color,
    productBrand: filters.product_brand,
    priceMin: filters.price_min,
    priceMax: filters.price_max,
  };
  console.log("params", params);

  try {
    const response = await AxiosInstance.get("/product/get-all", { params });
    return response.data;
  } catch (error) {
    return error.response?.data || "Lỗi kết nối đến server";
  }
};
