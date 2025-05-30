import { IoIosStar, IoIosStarHalf } from "react-icons/io";
import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaCheckCircle, FaPlusCircle } from "react-icons/fa";
import { updateFavourite } from "../../services/api/FavouriteApi";
import { usePopup } from "../../context/PopupContext";
import { useAuth } from "../../context/AuthContext";
import { useProduct } from "../../context/ProductContext";

const ProductComponent = ({ item, favourites, onFavouriteChange, onClick }) => {
  const { showPopup } = usePopup();
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const { fetchProductDetails } = useProduct();

  useEffect(() => {
    const savedCompare = JSON.parse(localStorage.getItem("compareList")) || [];
    setIsCompared(savedCompare.includes(item.id));
  }, [item.id]);

  const toggleCompare = async (e) => {
    e.stopPropagation();
    let savedCompare = JSON.parse(localStorage.getItem("compareList")) || [];

    if (savedCompare.length > 0) {
      const compareItem = await fetchProductDetails(savedCompare[0]);
      if (
        compareItem.productCategory.categoryType !==
          item.productCategory.categoryType ||
        compareItem.productCategory.categoryGender !==
          item.productCategory.categoryGender
      ) {
        showPopup("Bạn chỉ có thể so sánh 2 sản phẩm cùng loại", false);
        return;
      }
    }

    if (savedCompare.includes(item.id)) {
      savedCompare = savedCompare.filter((id) => id !== item.id);
      setIsCompared(false);
    } else {
      if (savedCompare.length >= 2) {
        showPopup("Chỉ được so sánh tối đa 2 sản phẩm", false);
        return;
      }
      savedCompare.push(item.id);
      setIsCompared(true);
    }

    localStorage.setItem("compareList", JSON.stringify(savedCompare));
    window.dispatchEvent(new CustomEvent("compareListUpdated"));
  };

  useEffect(() => {
    const handleCompareListUpdate = () => {
      const savedCompare =
        JSON.parse(localStorage.getItem("compareList")) || [];
      setIsCompared(savedCompare.includes(item.id));
    };

    window.addEventListener("compareListUpdated", handleCompareListUpdate);
    return () =>
      window.removeEventListener("compareListUpdated", handleCompareListUpdate);
  }, [item.id]);

  const toggleFavorite = async (e) => {
    if (!token) {
      showPopup(
        "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích",
        false
      );
      return;
    }
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    await updateFavourite(item.id);
    onFavouriteChange?.();
  };

  useEffect(() => {
    if (favourites && item?.id) {
      setIsFavorite(favourites.includes(item.id));
    }
  }, [favourites, item.id]);

  return (
    <div className="relative group text-black overflow-hidden shadow-sm hover:shadow-xl transition-transform duration-300 transform cursor-pointer">
      <div
        onClick={onClick}
        className="relative w-full h-[300px] sm:h-[350px] overflow-hidden"
      >
        <img
          src={item.productImg}
          alt={item.productTitle}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h4 className="text-base font-semibold line-clamp-2 min-h-[38.4px] md:min-h-[48px] mb-3">
          {item.productTitle}
        </h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-bold text-[#ba2b20]">
            {item.productPrice?.toLocaleString()}đ
          </span>
          {item.productPercentDiscount > 0 && (
            <span className="text-sm line-through text-gray-400">
              {(
                item?.productPrice /
                (1 - item?.productPercentDiscount / 100)
              )?.toLocaleString()}
              đ
            </span>
          )}
        </div>

        {/* Hiển thị sao + yêu thích*/}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
              const fullStars = Math.floor(item?.productRate);
              const isHalfStar =
                item?.productRate % 1 !== 0 && index === fullStars;

              return isHalfStar ? (
                <IoIosStarHalf
                  key={index}
                  className="text-yellow-400 text-xl"
                />
              ) : (
                <IoIosStar
                  key={index}
                  className={`text-xl ${
                    index < fullStars ? "text-yellow-400" : "text-gray-400"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {item?.productPercentDiscount > 0 && (
          <div className="absolute top-5 left-0 text-sm text-white font-semibold opacity-100 transition-all duration-300 bg-[#158857] p-1">
            <span>-{item?.productPercentDiscount}%</span>
          </div>
        )}

        {
          <div
            className="absolute top-[20px] right-0 flex flex-col items-center gap-2 px-4
         opacity-100 translate-y-0
         md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-y-0
         transition-all duration-300"
          >
            <button
              className="p-2 hover:scale-105 rounded-full bg-gray-200 transition cursor-pointer shadow-md hover:shadow-lg"
              onClick={toggleFavorite}
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-xl" />
              )}
            </button>
            <button
              className="p-2 hover:scale-105 rounded-full bg-gray-200 transition cursor-pointer shadow-md hover:shadow-lg"
              onClick={toggleCompare}
            >
              {isCompared ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : (
                <FaPlusCircle className="text-gray-600 text-xl" />
              )}
            </button>
          </div>
        }
      </div>
    </div>
  );
};

export default ProductComponent;
