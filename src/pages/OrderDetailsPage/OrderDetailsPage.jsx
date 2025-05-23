import { useNavigate, useParams } from "react-router-dom";
import { useOrder } from "../../context/OrderContext";
import { useEffect } from "react";
import { usePopup } from "../../context/PopupContext";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { fetchOrderDetail, orderDetails, setOrderDetails } = useOrder();
  const { showPopup } = usePopup();
  const navigate = useNavigate();

  const ORDER_STATUS_LABELS = {
    CHO_XAC_NHAN: "Chờ xác nhận",
    DANG_CHUAN_BI_HANG: "Đang chuẩn bị hàng",
    DANG_GIAO: "Đang giao",
    HOAN_THANH: "Hoàn thành",
    YEU_CAU_HOAN: "Yêu cầu hoàn",
    HOAN_HANG: "Hoàn hàng",
    HUY_HANG: "Hủy hàng",
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchOrderDetail(id);

      if (res.EC === 2) {
        showPopup("Bạn không có quyền truy cập đơn hàng này", false, 2000);
        setTimeout(() => {
          navigate("/");
        }, 2000);
        return;
      }

      // Đã có quyền và dữ liệu hợp lệ, kiểm tra query param để show popup thành công
      const query = new URLSearchParams(window.location.search);
      const code = query.get("code");
      const status = query.get("status");
      const cancel = query.get("cancel") === "true";

      if (code === "00" && status === "PAID" && !cancel) {
        showPopup(
          "Thanh toán đơn hàng thành công, cảm ơn quý khách đã sử dụng dịch vụ tại WTM Sport",
          true,
          5000
        );
      } else if (code === "00" && status === "SUCCESS" && !cancel) {
        showPopup(
          "Đặt hàng thành công, cảm ơn quý khách đã sử dụng dịch vụ tại WTM Sport",
          true,
          5000
        );
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    setOrderDetails(null);
    const fetchData = async () => {
      const res = await fetchOrderDetail(id);
      if (res.EC === 2) {
        showPopup("Bạn không có quyền truy cập đơn hàng này", false, 2000);
        return;
      }
    };
    fetchData();
  }, [id]);

  // Hàm tìm giá variant và hình ảnh dựa vào màu sắc và kích thước
  const findProductDetails = (product) => {
    const colorOption = product?.product?.colors.find(
      (c) => c.colorName === product.colorName
    );

    let variantPrice = product.product?.productPrice;
    let productImage = product.product?.productImg;

    if (colorOption) {
      productImage = colorOption.imgs?.imgMain;

      // Tìm biến thể tương ứng
      const variantOption = colorOption.variants.find(
        (v) => v.variantSize === product.variantName
      );

      if (variantOption) {
        variantPrice = variantOption.variantPrice;
      }
    }

    return { variantPrice, productImage };
  };

  console.log("aa", orderDetails);

  return (
    <div className="xl:max-w-[1200px] container mx-auto py-10 px-2">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold uppercase mb-4">Chi tiết đơn hàng</h1>
        <p className="text-sm font-semibold">
          {ORDER_STATUS_LABELS[orderDetails?.orderStatus]}
        </p>
      </div>
      <div className="bg-[#f6f6f6] rounded-lg mb-4 p-5 space-y-2">
        <h3 className="text-lg uppercase font-semibold">Thông tin nhận hàng</h3>
        <p>
          <strong className="text-sm inline-block font-semibold min-w-[100px]">
            Người nhận:{" "}
          </strong>
          {orderDetails?.shippingAddress?.name}
        </p>
        <p>
          <strong className="text-sm inline-block font-semibold min-w-[100px]">
            Số điện thoại:{" "}
          </strong>
          {orderDetails?.shippingAddress?.phone}
        </p>{" "}
        <p>
          <strong className="text-sm inline-block font-semibold min-w-[100px]">
            Email:{" "}
          </strong>
          {orderDetails?.email}{" "}
          <span className="text-sm text-gray-500">
            (Vui lòng kiểm tra email của bạn để biết thêm chi tiết về đơn hàng)
          </span>
        </p>{" "}
        <p>
          <strong className="text-sm inline-block font-semibold min-w-[100px]">
            Địa chỉ:{" "}
          </strong>
          {orderDetails?.shippingAddress?.homeAddress},{" "}
          {orderDetails?.shippingAddress?.ward},{" "}
          {orderDetails?.shippingAddress?.district},{" "}
          {orderDetails?.shippingAddress?.province}
        </p>
      </div>
      <div className="bg-[#f6f6f6] rounded-lg mb-4 p-5 space-y-2">
        <h3 className="text-lg uppercase font-semibold">
          Phương thức thanh toán
        </h3>
        <p>
          <strong className="text-sm inline-block font-semibold min-w-[100px]">
            Thanh toán:{" "}
          </strong>
          {orderDetails?.orderPaymentMethod === "COD"
            ? "Thanh toán khi nhận hàng"
            : orderDetails?.orderPaymentMethod}
        </p>
        <p>
          <strong className="text-sm inline-block font-semibold min-w-[100px]">
            Trạng thái:{" "}
          </strong>
          {orderDetails?.orderStatus === "HOAN HANG"
            ? "Đã hoàn tiền"
            : orderDetails?.isPaid
            ? "Đã thanh toán"
            : "Chưa thanh toán"}
        </p>
        {orderDetails?.estimated_delivery_date && (
          <p>
            <strong className="text-sm inline-block font-semibold min-w-[100px]">
              Dự kiến giao:{" "}
            </strong>
            {new Date(orderDetails.estimated_delivery_date).toLocaleDateString(
              "vi-VN"
            )}
          </p>
        )}
        {orderDetails?.received_date && (
          <p>
            <strong className="text-sm inline-block font-semibold min-w-[100px]">
              Đã nhận hàng:{" "}
            </strong>
            {new Date(orderDetails.received_date).toLocaleDateString("vi-VN")}
          </p>
        )}
      </div>
      <div className="bg-[#f6f6f6] rounded-lg mb-4 p-5 space-y-2">
        <h3 className="text-lg uppercase font-semibold">Thông tin đơn hàng</h3>
        {orderDetails?.products.map((product, index) => {
          const { variantPrice, productImage } = findProductDetails(product);
          const discountedPrice =
            product.product?.productPercentDiscount > 0
              ? (variantPrice *
                  (100 - product.product?.productPercentDiscount)) /
                100
              : variantPrice;

          return (
            <div key={index} className="flex items-center gap-4 py-4 last:mb-0">
              <img
                src={productImage}
                alt={product.product?.productTitle}
                className="w-16 h-16 object-cover border border-gray-300 rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold line-clamp-1">
                  {product.product?.productTitle}
                </p>
                <p className="text-sm text-gray-500">
                  {product.colorName} - {product.variantName}
                </p>
                <p className="text-sm">x{product.quantity}</p>
              </div>
              <div className="flex space-x-2">
                {product.product?.productPercentDiscount > 0 && (
                  <p className="text-[#9ca3af] line-through">
                    {variantPrice?.toLocaleString()}đ
                  </p>
                )}
                <p className="font-medium text-[#ba2b20]">
                  {discountedPrice?.toLocaleString()}đ
                </p>
              </div>
            </div>
          );
        })}
        <div className="flex justify-end space-x-4">
          <p className="font-medium">Tổng tiền:</p>
          <p className="font-bold text-[#ba2b20]">
            {orderDetails?.orderTotalFinal?.toLocaleString()}đ
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
