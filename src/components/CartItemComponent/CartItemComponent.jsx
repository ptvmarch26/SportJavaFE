import { useEffect, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getFavourite, updateFavourite } from "../../services/api/FavouriteApi";

const CartItemComponent = ({ item, onRemove, onIncrease, onDecrease }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const increaseQuantity = () => {
    onIncrease?.(item?.productId, item.quantity + 1);
  };

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      onDecrease?.(item?.productId, item.quantity - 1);
    }
  };

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const favouritesData = await getFavourite();

      if (favouritesData && favouritesData.result) {
        setIsFavorite(favouritesData.result.includes(item.productId));
      }
    };

    fetchFavoriteStatus();
  }, [item.productId]);

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    await updateFavourite(item.productId);
  };
  const selectedColor = item?.product?.colors.find(
    (color) => color.colorName === item.colorName
  );

  const selectedVariant = selectedColor?.variants.find(
    (variant) => variant.variantSize === item.variantName
  );

  const imageToDisplay =
    selectedVariant?.imgs?.imgMain ||
    selectedColor?.imgs?.imgMain ||
    item?.product?.productImg;
  return (
    <>
      <div
        onClick={() => navigate(`/product/${item.productId}`)}
        className="flex gap-4 cursor-pointer"
      >
        <img
          src={imageToDisplay}
          alt={item?.product?.productTitle}
          className="w-28 h-28 object-cover"
        />
        <div className="flex-1 space-y-2">
          <h2 className="font-semibold line-clamp-2">
            {item?.product?.productTitle}
          </h2>
          <div className="flex items-center">
            {item.product?.productPercentDiscount > 0 ? (
              <div>
                <p className="text-md font-bold text-[#ba2b20] mr-4">
                  {selectedVariant.variantPrice?.toLocaleString()}₫
                </p>
                <p className="text-md font-weight text-[#9ca3af] line-through mr-4">
                  {(
                    selectedVariant.variantPrice /
                    (1 - item.product?.productPercentDiscount / 100)
                  ).toLocaleString()}
                  đ
                </p>
              </div>
            ) : (
              <p className="text-md font-bold text-[#ba2b20] mr-4">
                {(
                  selectedVariant?.variantPrice /
                  (1 - item.product?.productPercentDiscount / 100)
                ).toLocaleString()}
                đ
              </p>
            )}
          </div>
          <p className="text-md">
            {selectedColor?.colorName} - Size {selectedVariant?.variantSize}{" "}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <button
              className="p-2 hover:bg-gray-200 transition-all duration-300 hover:rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-xl" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-2 hover:bg-gray-200 transition-all duration-300 hover:rounded-full"
            >
              <IoTrashOutline className="text-xl text-red-500" />
            </button>
          </div>
          <div className="inline-flex items-center w-auto border border-[#a1a8af]">
            <button
              className="px-4 py-2 hover:bg-white hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                decreaseQuantity();
              }}
            >
              -
            </button>
            <input
              type="text"
              value={item.quantity}
              className="w-12 text-center text-black"
              readOnly
            />
            <button
              className="px-4 py-2 hover:bg-white hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                increaseQuantity();
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="border-t-2 border-[rgba(0, 0, 0, 0.1)] w-full my-6"></div>
    </>
  );
};

export default CartItemComponent;
