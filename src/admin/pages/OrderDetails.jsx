import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useOrder } from "../../context/OrderContext";
import { Table, Tag } from "antd";
import { getPaymentInfoByOrderCode } from "../../services/api/PaymentApi";

const statusColors = {
  "Chờ xác nhận": "orange",
  "Đang chuẩn bị hàng": "teal",
  "Đang giao": "blue",
  "Yêu cầu hoàn": "pink",
  "Hoàn thành": "green",
  "Hoàn hàng": "purple",
  "Hủy hàng": "red",
};

const statusLabel = {
  CHO_XAC_NHAN: "Chờ xác nhận",
  DANG_CHUAN_BI: "Đang chuẩn bị hàng",
  DANG_GIAO: "Đang giao",
  HOAN_THANH: "Hoàn thành",
  YEU_CAU_HOAN: "Yêu cầu hoàn",
  HOAN_HANG: "Hoàn hàng",
  HUY_HANG: "Hủy hàng",
};

const OrderDetails = () => {
  const { id } = useParams();
  const { orderDetails, fetchOrderDetail } = useOrder();
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const order = await fetchOrderDetail(id);
      if (order.orderPaymentMethod === "PAYPAL" && order.isPaid) {
        const res = await getPaymentInfoByOrderCode(order.orderCode);
        if (res.EC === 0 && res.result.transactions) {
          setPaymentInfo(res.result);
        }
      }
    };
    fetchData();
  }, [id]);

  if (!orderDetails) {
    return (
      <p className="lg:ml-[300px] mt-[64px] px-2 py-4 lg:p-6 min-h-screen text-gray-500">
        Đang tải dữ liệu đơn hàng...
      </p>
    );
  }

  const {
    createdAt,
    orderStatus,
    orderTotalPrice,
    orderTotalFinal,
    deliveryFee,
    orderPaymentMethod,
    orderTotalDiscount,
    orderNote,
    estimatedDeliveryDate,
    products,
    receivedDate,
    shippingAddress,
  } = orderDetails;

  console.log("ỏ", orderDetails);

  const formattedProducts = products.map((product) => {
    const colorData = product.product?.colors.find(
      (color) => color.colorName === product.colorName
    );

    const variantData = colorData?.variants.find(
      (variant) => variant.variantSize === product.variantName
    );

    return {
      product_id: product.productId,
      product_name: product.product?.productTitle,
      product_img: colorData?.imgs?.imgMain || product.product?.productImg,
      product_price: variantData?.variantPrice,
      quantity: product.quantity,
      variant: `${product.colorName} - ${product.variantName}`,
    };
  });

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
      align: "left",
      render: (id) => <span className="inline-block max-w-[100px]">{id}</span>,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      align: "left",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.product_img}
            alt={record.product_name}
            className="w-12 h-12 object-contain rounded"
          />
          <span className="line-clamp-2">{record.product_name}</span>
        </div>
      ),
    },
    {
      title: "Biến thể",
      dataIndex: "variant",
      key: "variant",
      align: "left",
    },
    {
      title: "Giá (đ)",
      dataIndex: "product_price",
      key: "product_price",
      align: "left",
      render: (price) => `${price?.toLocaleString()}`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "left",
    },
    {
      title: "Thành tiền (đ)",
      key: "total",
      align: "left",
      render: (_, record) =>
        `${(record.product_price * record.quantity)?.toLocaleString()}`,
    },
  ];

  console.log("paymentInfo", paymentInfo);

  return (
    <div className="lg:ml-[300px] mt-[64px] px-2 py-4 lg:p-6 min-h-screen bg-gray-100">
      <div className="bg-white flex flex-col sm:flex-row gap-5 justify-between sm:items-center p-6 shadow-lg rounded-lg mt-4">
        <p>
          <strong>Ngày mua hàng:</strong> {new Date(createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Thanh toán:</strong> {orderPaymentMethod?.toUpperCase()}
        </p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          <Tag className="py-1 px-2" color={statusColors[orderStatus]}>
            {statusLabel[orderStatus]}
          </Tag>
        </p>
      </div>
      <div className="bg-white p-6 shadow-lg rounded-lg mt-4 space-y-5">
        <h3 className="font-semibold">Thông tin đơn hàng</h3>
        <div className="space-y-3 px-3 py-5 border rounded">
          <p>
            <strong>Họ tên:</strong> {shippingAddress?.name}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {shippingAddress?.phone}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {shippingAddress?.homeAddress},{" "}
            {shippingAddress?.ward}, {shippingAddress?.district},{" "}
            {shippingAddress?.province}
          </p>
          <p>
            <strong>Ghi chú:</strong> {orderNote}
          </p>
          <p>
            <strong>Ngày giao dự kiến:</strong>{" "}
            {new Date(estimatedDeliveryDate)?.toLocaleString()}
          </p>
          {receivedDate && (
            <p>
              <strong>Đã nhận hàng:</strong>{" "}
              {new Date(receivedDate)?.toLocaleString()}
            </p>
          )}
        </div>
        {paymentInfo?.transactions.length > 0 && (
          <div>
            <h3 className="font-semibold">Thông tin thanh toán</h3>
            <div className="space-y-3 px-3 py-5 border rounded">
              <p>
                <strong>Tên:</strong>{" "}
                {paymentInfo.transactions[0]?.counterAccountName}
              </p>
              <p>
                <strong>Số tài khoản:</strong>{" "}
                {paymentInfo.transactions[0]?.counterAccountNumber}
              </p>
              <p>
                <strong>ID Ngân hàng:</strong>{" "}
                {paymentInfo.transactions[0]?.counterAccountBankId ??
                  "Không xác định"}
              </p>
              <p>
                <strong>Nội dung:</strong>{" "}
                {paymentInfo.transactions[0]?.description}
              </p>
              <p>
                <strong>Thời gian giao dịch:</strong>{" "}
                {new Date(
                  paymentInfo.transactions[0]?.transactionDateTime
                )?.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 shadow-lg rounded-lg mt-4 space-y-5 overflow-x-auto">
        <h3 className="font-semibold">Sản phẩm</h3>
        <Table
          dataSource={formattedProducts}
          rowKey="_id"
          columns={columns}
          pagination={false}
          bordered
          scroll={{ x: "max-content" }}
          className="rounded-lg [&_.ant-table-thead_tr_th]:bg-[#e9eff5] [&_.ant-table-thead_tr_th]:text-black [&_.ant-table-thead_tr_th]:font-bold"
        />
      </div>

      <div className="bg-white p-6 shadow-lg rounded-lg mt-4 space-y-5">
        <h3 className="font-semibold">Thanh toán</h3>
        <div className="space-y-3 px-3 py-5 border rounded">
          <div className="flex justify-between">
            <strong>Tổng tiền hàng:</strong>
            <span>{orderTotalPrice?.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between">
            <strong>Phí giao hàng:</strong>
            <span>{deliveryFee?.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between">
            <strong>Giảm giá:</strong>
            <span>{orderTotalDiscount} %</span>
          </div>
          <div className="flex justify-between text-[#1890ff] font-semibold">
            <strong>Tổng tiền phải thanh toán:</strong>
            <span>{orderTotalFinal?.toLocaleString()} đ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
