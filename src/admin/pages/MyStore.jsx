import { useEffect, useRef, useState } from "react";
import { Input, Button, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { getDetailStore, updateStore } from "../../services/api/StoreApi";
import { usePopup } from "../../context/PopupContext";

const MyStore = () => {
  const storeId = import.meta.env.VITE_STORE_ID;
  const [storeInfo, setStoreInfo] = useState({
    address: "",
    phone: "",
    email: "",
    banners: [],
  });
  const { showPopup } = usePopup();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchStore = async () => {
      const res = await getDetailStore(storeId);
      console.log("res", res);
      if (res.EC === 0 && res.EM) {
        const { storeAddress, storeEmail, storePhone, storeBanner } =
          res.result;
        setStoreInfo({
          address: storeAddress || "",
          email: storeEmail || "",
          phone: storePhone || "",
          banners: storeBanner || [],
        });
      }
    };
    fetchStore();
  }, []);

  const handleBannerSelect = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers)
      .then((images) => {
        setStoreInfo((prev) => ({
          ...prev,
          banners: [...prev.banners, ...images],
        }));
      })
      .catch(() => message.error("Lỗi khi tải ảnh."));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const removeBanner = (index) => {
    setStoreInfo((prev) => ({
      ...prev,
      banners: prev.banners.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("storeAddress", storeInfo.address);
      formData.append("storeEmail", storeInfo.email);
      formData.append("storePhone", storeInfo.phone);

      // Xử lý các banner base64
      const existingBanners = storeInfo.banners.filter(
        (banner) => !banner.startsWith("data:")
      );
      formData.append("existingBanners", JSON.stringify(existingBanners));

      // Process new banners (base64)
      const base64Banners = storeInfo.banners.filter((banner) =>
        banner.startsWith("data:")
      );
      for (let i = 0; i < base64Banners.length; i++) {
        const base64Response = await fetch(base64Banners[i]);
        const blob = await base64Response.blob();
        const file = new File([blob], `banner-${i}.jpg`, {
          type: "image/jpeg",
        });
        formData.append("files", file);
      }

      const res = await updateStore(formData, storeId);

      if (res.EC === 0 && res.EM) {
        showPopup("Cập nhật thông tin cửa hàng thành công");
        setIsEditing(false);

        // Tải lại dữ liệu từ server
        const updatedStoreRes = await getDetailStore(storeId);
        if (updatedStoreRes.EC === 0 && updatedStoreRes.EM) {
          const { storeAddress, storeEmail, storePhone, storeBanner } =
            updatedStoreRes.result;
          setStoreInfo({
            address: storeAddress || "",
            email: storeEmail || "",
            phone: storePhone || "",
            banners: storeBanner || [],
          });
        }
      } else {
        showPopup(res.EM, false);
      }
    } catch {
      showPopup("Có lỗi xảy ra khi lưu thông tin", false);
    }
  };

  return (
    <div className="lg:ml-[300px] mt-[64px] px-2 py-4 lg:p-6 min-h-screen bg-gray-50">
      <div className="bg-white shadow-xl p-6 rounded-xl space-y-4">
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold">Banner</h3>
            {isEditing && (
              <div className="flex gap-4 items-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleBannerSelect}
                  className="hidden"
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={triggerFileInput}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Thêm ảnh
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
            {storeInfo.banners.length === 0 ? (
              <h3 className="text-sm text-gray-500">
                Không có banner cho trang web
              </h3>
            ) : (
              storeInfo.banners.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-40 object-cover rounded-md shadow-md"
                  />
                  {isEditing && (
                    <Button
                      type="text"
                      icon={<DeleteOutlined className="text-red-500" />}
                      className="absolute top-2 right-2 bg-white hover:bg-gray-100 p-2 rounded-full shadow-md"
                      onClick={() => removeBanner(index)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {["address", "phone", "email"].map((field) => (
          <div key={field} className="space-y-3">
            <h3 className="text-base font-semibold">
              {" "}
              {field === "address"
                ? "Địa chỉ"
                : field === "phone"
                ? "Số điện thoại"
                : "Email"}
            </h3>
            <Input
              name={field}
              value={storeInfo[field]}
              onChange={handleChange}
              disabled={!isEditing}
              type={field === "email" ? "email" : "text"}
            />
          </div>
        ))}

        <div className="pt-4 space-x-2">
          {isEditing ? (
            <>
              <Button type="primary" onClick={handleSave}>
                Lưu thay đổi
              </Button>
              <Button onClick={() => setIsEditing(false)}>Hủy</Button>
            </>
          ) : (
            <Button type="primary" onClick={() => setIsEditing(true)}>
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyStore;
