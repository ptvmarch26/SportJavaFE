import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@material-tailwind/react";
import { useOrder } from "../../context/OrderContext";
import { useNavigate, useLocation } from "react-router-dom";
import AccountInfoComponent from "../../components/AccountInfoComponent/AccountInfoComponent";
import ConfirmDialogComponent from "../../components/ConfirmDialogComponent/ConfirmDialogComponent";
import { usePopup } from "../../context/PopupContext";

const OrderStatusPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openRequireRefundDialog, setOpenRequireRefundDialog] = useState(false);
  const [openCancelRequireRefundDialog, setOpenCancelRequireRefundDialog] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showPopup } = usePopup();
  const { orders, setOrders, fetchOrdersByUser, handleUpdateOrderStatus } =
    useOrder();

  useEffect(() => {
    fetchOrdersByUser();
  }, []);

  const ORDER_STATUS_LABELS = {
    CHO_XAC_NHAN: "Chờ xác nhận",
    DANG_CHUAN_BI_HANG: "Đang chuẩn bị hàng",
    DANG_GIAO: "Đang giao",
    HOAN_THANH: "Hoàn thành",
    YEU_CAU_HOAN: "Yêu cầu hoàn",
    HOAN_HANG: "Hoàn hàng",
    HUY_HANG: "Hủy hàng",
  };

  const tabs = useMemo(() => {
    return [
      { id: "all", label: "Tất cả" },
      ...Object.entries(ORDER_STATUS_LABELS).map(([key, value]) => ({
        id: key,
        label: value,
      })),
    ];
  }, []);

  const filteredOrders = useMemo(() => {
    const sorted = [...(orders || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return activeTab === "all"
      ? sorted
      : sorted.filter((order) => order.orderStatus === activeTab);
  }, [orders, activeTab]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tabs[tab - 1]?.id || "all");
    }
  }, [location]);

  const handleTabChange = (tabId, index) => {
    navigate(`/orders?tab=${index + 1}`);
    setActiveTab(tabId);
  };

  const confirmCancelOrder = async () => {
    if (selectedOrder) {
      const result = await handleUpdateOrderStatus(selectedOrder, "HUY_HANG");
      console.log("re", result);
      if (result.EC === 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrder
              ? { ...order, orderStatus: "HUY_HANG" }
              : order
          )
        );
        if (result.result.orderPaymentMethod === "PAYPAL" && result.result.isPaid)
          showPopup(result.EM);
        else showPopup("Hủy đơn hàng thành công");
      } else showPopup(result.EM, false);
    }
    setOpenCancelDialog(false);
    setSelectedOrder(null);
  };

  const confirmRequireRefund = async () => {
    if (selectedOrder) {
      const result = await handleUpdateOrderStatus(
        selectedOrder,
        "YEU_CAU_HOAN"
      );
      if (result.EC === 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrder
              ? { ...order, orderStatus: "YEU_CAU_HOAN" }
              : order
          )
        );
        showPopup(result.EM);
      } else showPopup(result.EM, false);
    }
    setOpenRequireRefundDialog(false);
    setSelectedOrder(null);
  };

  const confirmCancelRequireRefund = async () => {
    if (selectedOrder) {
      const result = await handleUpdateOrderStatus(selectedOrder, "HOAN_THANH");
      if (result.EC === 0) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === selectedOrder
              ? { ...order, orderStatus: "HOAN_THANH" }
              : order
          )
        );
        showPopup(result.EM);
      } else showPopup(result.EM, false);
    }
    setOpenCancelRequireRefundDialog(false);
    setSelectedOrder(null);
  };

  // Hàm tìm giá variant và hình ảnh dựa vào màu sắc và kích thước
  const findProductDetails = (product) => {
    const colorOption = product.product?.colors.find(
      (c) => c.colorName === product.colorName
    );

    let variantPrice = product.product?.productPrice;
    let productImage = product.product?.productImg;

    if (colorOption) {
      productImage = colorOption.imgs.imgMain;

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

  const handleProductClick = (order) => {
    navigate(`order-details/${order.id}`);
  };

  const handleFeedback = (order) => {
    navigate(`order-feedback/${order.id}`);
  };

  return (
    <div className="xl:max-w-[1200px] container mx-auto py-10 px-2">
      <div className="lg:flex justify-between gap-6">
        <div className="lg:block pb-10 lg:pb-0">
          <AccountInfoComponent />
        </div>
        <div className="min-h-[400px] w-full overflow-x-auto custom-scroll flex-1 p-6 bg-white text-black border border-gray-300 rounded-lg">
          <div className="border-b border-gray-300 relative overflow-x-auto">
            <div className="flex whitespace-nowrap">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 text-sm font-medium relative transition-colors duration-300 ${
                    activeTab === tab.id
                      ? "text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange(tab.id, index)}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="underline"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 h-0.5 bg-black"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders?.map((order) => (
            <div
              key={order._id}
              className="p-4 my-5 border border-gray-300 rounded-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm font-semibold text-end sm:text-start gap-1 sm:gap-4">
                <p className="uppercase">
                  {ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}
                </p>
                <p className="uppercase">
                  <span
                    className={order.isPaid ? "text-green-600" : "text-red-600"}
                  >
                    {order.orderStatus === "HOAN_HANG"
                      ? "Đã hoàn tiền"
                      : `${order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"} (${
                          order.orderPaymentMethod
                        })`}
                  </span>
                </p>
              </div>
              {order.products.map((product, index) => {
                const { variantPrice, productImage } =
                  findProductDetails(product);
                const discountedPrice =
                  product.product?.productPercentDiscount > 0
                    ? (variantPrice *
                        (100 - product.product?.productPercentDiscount)) /
                      100
                    : variantPrice;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-4 last:mb-0 cursor-pointer"
                    onClick={() => handleProductClick(order)}
                  >
                    <img
                      src={productImage}
                      alt={product.product?.productTitle}
                      className="w-16 h-16 object-cover border border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold line-clamp-2">
                        {product.product?.productTitle}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.colorName} - {product.variantName}
                      </p>
                      <p className="text-sm">x{product.quantity}</p>
                    </div>
                    <div className="flex space-x-2">
                      {discountedPrice &&
                        product.product?.productPercentDiscount > 0 && (
                          <p className="text-[#9ca3af] line-through">
                            {discountedPrice?.toLocaleString()}đ
                          </p>
                        )}
                      <p className="font-medium text-[#ba2b20]">
                        {variantPrice?.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-end space-x-4">
                <p className="font-medium">Thành tiền:</p>
                <p className="font-bold text-[#ba2b20]">
                  {order.orderTotalFinal?.toLocaleString()}đ
                </p>
              </div>

              <div className="mt-4 text-right space-x-2">
                {order.orderStatus === "HOAN_THANH" && (
                  <>
                    {!order.isRequireRefund && (
                      <Button
                        variant="filled"
                        color="blue"
                        className="w-[120px] h-[30px] sm:w-[150px] sm:h-[40px] rounded font-medium"
                        onClick={() => {
                          const receivedDate = new Date(order.receivedDate);
                          const now = new Date();
                          const diffInDays = Math.floor(
                            (now - receivedDate) / (1000 * 60 * 60 * 24)
                          );

                          if (diffInDays > 3) {
                            showPopup(
                              "Không thể hoàn đơn hàng đã quá 3 ngày kể từ ngày nhận hàng",
                              false
                            );
                          } else {
                            setSelectedOrder(order.id);
                            setOpenRequireRefundDialog(true);
                          }
                        }}
                      >
                        Yêu cầu hoàn
                      </Button>
                    )}
                    {!order.isFeedback && (
                      <Button
                        variant="filled"
                        color="black"
                        className="w-[100px] h-[30px] sm:w-[150px] sm:h-[40px] text-white !bg-black rounded font-medium"
                        onClick={() => handleFeedback(order)}
                      >
                        Đánh giá
                      </Button>
                    )}
                    <Button
                      variant="filled"
                      color="white"
                      className="w-[100px] h-[30px] sm:w-[150px] sm:h-[40px] text-black border rounded font-medium"
                      onClick={() => {
                        navigate("/checkout", {
                          state: { fromBuyAgain: order.products },
                        });
                      }}
                    >
                      Mua lại
                    </Button>
                  </>
                )}
                {order.orderStatus === "YEU_CAU_HOAN" && (
                  <Button
                    variant="filled"
                    color="black"
                    className="w-[100px] h-[30px] sm:w-[150px] sm:h-[40px] rounded font-medium border transition duration-200 bg-yellow-100 text-yellow-700 border-yellow-400 hover:brightness-110"
                    onClick={() => {
                      setSelectedOrder(order.id);
                      setOpenCancelRequireRefundDialog(true);
                    }}
                  >
                    Hủy yêu cầu
                  </Button>
                )}
                {order.orderStatus === "HUY_HANG" && (
                  <>
                    <Button
                      variant="filled"
                      color="black"
                      className="w-[100px] h-[30px] sm:w-[150px] sm:h-[40px] text-white !bg-black rounded font-medium"
                      onClick={() => {
                        navigate("/checkout", {
                          state: { fromBuyAgain: order.products },
                        });
                      }}
                    >
                      Mua lại
                    </Button>
                  </>
                )}
                {order.orderStatus === "HOAN_HANG" && (
                  <Button
                    variant="filled"
                    color="black"
                    className="w-[100px] h-[30px] sm:w-[150px] sm:h-[40px] text-white !bg-black rounded font-medium"
                    onClick={() => {
                      navigate("/checkout", {
                        state: { fromBuyAgain: order.products },
                      });
                    }}
                  >
                    Mua lại
                  </Button>
                )}
                {order.orderStatus === "CHO_XAC_NHAN" && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {!order.isPaid &&
                      order.orderPaymentMethod === "PAYPAL" &&
                      order.checkoutUrl && (
                        <Button
                          variant="filled"
                          color="blue"
                          className="w-[150px] h-[30px] sm:h-[40px] rounded font-medium"
                          onClick={() => {
                            if (!order.checkoutUrl)
                              showPopup(
                                "Lỗi khi thực hiện thanh toán lại",
                                false
                              );
                            else {
                              showPopup("Chuyển hướng tới trang thanh toán");
                              setTimeout(() => {
                                window.location.href = order.checkoutUrl;
                              }, 2000);
                            }
                          }}
                        >
                          Thanh toán lại
                        </Button>
                      )}
                    <Button
                      variant="filled"
                      color="black"
                      className="w-[100px] h-[30px] sm:w-[150px] sm:h-[40px] text-white !bg-black rounded font-medium"
                      onClick={() => {
                        setSelectedOrder(order.id);
                        setOpenCancelDialog(true);
                      }}
                    >
                      Hủy đơn
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmDialogComponent
        open={openCancelDialog}
        onClose={() => {
          setOpenCancelDialog(false);
          setSelectedOrder(null);
        }}
        onConfirm={confirmCancelOrder}
        title="Xác nhận hủy đơn"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không?"
      />
      <ConfirmDialogComponent
        open={openRequireRefundDialog}
        onClose={() => {
          setOpenRequireRefundDialog(false);
          setSelectedOrder(null);
        }}
        onConfirm={confirmRequireRefund}
        title={"Xác nhận yêu cầu hoàn hàng"}
        message={"Bạn có chắc chắn muốn yêu cầu hoàn đơn hàng này không?"}
      />
      <ConfirmDialogComponent
        open={openCancelRequireRefundDialog}
        onClose={() => {
          setOpenCancelRequireRefundDialog(false);
          setSelectedOrder(null);
        }}
        onConfirm={confirmCancelRequireRefund}
        title={"Xác nhận hủy yêu cầu hoàn hàng"}
        message={"Bạn có chắc chắn muốn hủy yêu cầu hoàn đơn hàng này không?"}
      />
    </div>
  );
};

export default OrderStatusPage;
