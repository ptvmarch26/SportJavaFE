import { Button } from "@material-tailwind/react";
import { IoTrashOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialogComponent from "../ConfirmDialogComponent/ConfirmDialogComponent";
import { useState } from "react";

const FavoriteItemComponent = ({ productDetails, onRemove }) => {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const navigate = useNavigate();

  const handleOpenDialog = () => setOpenConfirmDialog(!openConfirmDialog);

  const handleConfirmRemove = () => {
    onRemove(productDetails.id);
    setOpenConfirmDialog(false);
  };

  return (
    <div>
      <div className="flex gap-10 mt-10 sm:my-10">
        <Link to={`/product/${productDetails?.id}`}>
          <img
            src={productDetails?.productImg}
            alt={productDetails?.productTitle}
            className="max-w-[128px] w-[128px] h-[128px] sm:max-w-[256px] sm:w-52 sm:h-52 md:w-64 md:h-64 object-cover"
          />
        </Link>
        <div className="w-full">
          <div className="flex justify-between">
            <div>
              <h2 className="font-semibold line-clamp-2">
                {productDetails?.productTitle}
              </h2>
              <div className="flex productDetailss-center">
                {productDetails?.productPercentDiscount > 0 && (
                  <p className="text-md font-weight text-[#9ca3af] line-through mr-4">
                    {productDetails?.productPrice?.toLocaleString()}₫
                  </p>
                )}
                <p className="text-md font-bold text-[#ba2b20] mr-4">
                  {(
                    productDetails?.productPrice *
                    (1 - productDetails?.productPercentDiscount / 100)
                  )?.toLocaleString()}
                  ₫
                </p>
              </div>
            </div>
            <button
              className="p-2 hover:bg-gray-200 transition-all duration-300 hover:rounded-full"
              onClick={handleOpenDialog}
            >
              <IoTrashOutline className="text-2xl text-red-500" />
            </button>
          </div>
          <Button
            onClick={() => navigate(`/product/${productDetails.id}`)}
            className="w-full mt-4 p-3 bg-black hover:opacity-80 text-white rounded uppercase block"
          >
            Thêm vào giỏ
          </Button>
        </div>
        <ConfirmDialogComponent
          open={openConfirmDialog}
          onClose={handleOpenDialog}
          onConfirm={handleConfirmRemove}
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa "${productDetails?.productTitle}" khỏi danh sách yêu thích không?`}
        />
      </div>
    </div>
  );
};

export default FavoriteItemComponent;
