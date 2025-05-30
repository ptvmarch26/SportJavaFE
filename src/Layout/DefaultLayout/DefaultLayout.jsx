import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import HeaderLogo from "../Header/HeaderLogo";
import ScrollToTopComponent from "../../components/ScrollToTopComponent/ScrollToTopComponent";
import BottomMenuComponent from "../../components/BottomMenuComponent/BottomMenuComponent";
import AIChatButton from "../../components/AIChatButton/AIChatButton";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { FaBalanceScale } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useProduct } from "../../context/ProductContext";
import { IoIosStar } from "react-icons/io";
import { compareProductsAI } from "../../services/api/UserApi";

const DefaultLayout = ({ children }) => {
  const location = useLocation();
  const { token } = useAuth();
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const [compareProducts, setCompareProducts] = useState([]);
  const [comparisonText, setComparisonText] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchProductDetails } = useProduct();

  const authPages = {
    "/sign-in": "Đăng nhập",
    "/sign-up": "Đăng ký",
    "/forgot-password": "Quên mật khẩu",
  };

  // Update cái số so sánh
  const updateCompareCount = () => {
    const compareList = JSON.parse(localStorage.getItem("compareList")) || [];
    setCompareCount(compareList.length);
  };

  useEffect(() => {
    updateCompareCount();

    const handleStorageChange = (e) => {
      if (e.key === "compareList") {
        updateCompareCount();
      }
    };

    const handleCustomEvent = () => {
      updateCompareCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("compareListUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("compareListUpdated", handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    const fetchCompareItems = async () => {
      if (isCompareOpen) {
        setLoading(true);
        const compareList =
          JSON.parse(localStorage.getItem("compareList")) || [];

        if (compareList.length === 0) {
          setCompareProducts([]);
          setLoading(false);
          return;
        }

        try {
          const productPromises = compareList.map((id) =>
            fetchProductDetails(id)
          );
          const products = await Promise.all(productPromises);
          setCompareProducts(products.filter(Boolean));
        } catch {
          return;
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCompareItems();
  }, [isCompareOpen]);

  // Xóa sản phẩm so sánh
  const removeFromCompare = (productId) => {
    let compareList = JSON.parse(localStorage.getItem("compareList")) || [];
    compareList = compareList.filter((id) => id !== productId);
    localStorage.setItem("compareList", JSON.stringify(compareList));

    setCompareProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );
    setCompareCount(compareList.length);

    if (compareList.length === 0) {
      setIsCompareOpen(false);
    }

    window.dispatchEvent(new CustomEvent("compareListUpdated"));
  };

  const getAllImages = (product) => {
    if (!product) return [];

    let images = [];

    // Lấy ảnh từ biến thể
    product.colors?.forEach((color) => {
      images.push(color?.imgs?.imgMain);
    });

    // Lọc bỏ ảnh null hoặc undefined
    images = images.filter((img) => img);

    return images;
  };

  useEffect(() => {
    const fetchComparison = async () => {
      if (isCompareOpen && compareProducts.length === 2) {
        try {
          setComparisonText("");
          const res = await compareProductsAI(
            compareProducts[0].id,
            compareProducts[1].id
          );
          if (res?.EC === 0) setComparisonText(res.result);
          else setComparisonText("Không thể so sánh sản phẩm lúc này.");
        } catch {
          setComparisonText("Lỗi khi so sánh sản phẩm.");
        }
      }
    };

    fetchComparison();
  }, [compareProducts, isCompareOpen]);

  return (
    <div>
      {authPages[location.pathname] ? (
        <HeaderLogo title={authPages[location.pathname]} />
      ) : (
        <Header />
      )}

      <div className="mt-[100px]">{children}</div>

      {token && <BottomMenuComponent />}
      {!authPages[location.pathname] ? <AIChatButton /> : null}

      {!authPages[location.pathname] && compareCount > 0 && (
        <div className="fixed bottom-60 lg:bottom-[140px] right-10 z-50">
          <button
            onClick={() => setIsCompareOpen(true)}
            className="bg-primary hover:opacity-80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-[0_4px_8px_0_rgba(255,255,255,0.3)] transition-all"
          >
            <FaBalanceScale size={20} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-md">
              {compareCount}
            </span>
          </button>
        </div>
      )}

      {isCompareOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsCompareOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Đánh giá sản phẩm</h2>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <IoClose size={24} />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4">Đang tải thông tin sản phẩm...</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-6">
                  {compareProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="relative h-64">
                        <img
                          src={product.productImg}
                          alt={product.productTitle}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <IoClose size={20} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 min-h-[70px] sm:min-h-[56px]">
                          {product.productTitle}
                        </h3>
                        <div className="mb-2">
                          <span className="text-base font-bold text-[#ba2b20]">
                            {product.productPrice?.toLocaleString()}đ
                          </span>
                          {product.productPercentDiscount > 0 && (
                            <span className="ml-2 text-sm line-through text-gray-400">
                              {(
                                product.productPrice /
                                (1 - product.productPercentDiscount / 100)
                              )?.toLocaleString()}
                              đ
                            </span>
                          )}
                        </div>

                        <div className="border-t pt-2 mt-2">
                          <p className="font-semibold mb-1">Biến thể:</p>
                          <div className="flex flex-wrap gap-2">
                            {getAllImages(product).map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`Product Variant ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-2 mt-2">
                          <p className="font-semibold mb-1">Đánh giá:</p>
                          <div className="flex items-center gap-2">
                            <IoIosStar className="text-yellow-400 text-xl" />
                            <p className="text-base font-semibold">
                              {product.productRate}
                            </p>
                          </div>
                        </div>

                        <div className="border-t pt-2 mt-2">
                          <p className="font-semibold mb-1">Mô tả:</p>
                          <p className="text-sm line-clamp-4">
                            {product.productDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex mt-4 text-justify justify-center min-h-[100px]">
                  {compareProducts.length < 2 ? (
                    <p className="text-gray-500 italic">
                      Chọn thêm sản phẩm để hiển thị so sánh
                    </p>
                  ) : comparisonText ? (
                    <div dangerouslySetInnerHTML={{ __html: comparisonText }} />
                  ) : (
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
                      <span>Đang so sánh sản phẩm...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ScrollToTopComponent />
      <Footer />
    </div>
  );
};

export default DefaultLayout;
