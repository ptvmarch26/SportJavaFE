import { useEffect, useState } from "react";
import { Table, Input, Select, Button } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../../context/OrderContext";
import moment from "moment";
import { usePopup } from "../../context/PopupContext";
import { updateLoginHistory } from "../../services/api/LoginHistoryApi";

const { Option } = Select;

const statusLabel = {
  CHO_XAC_NHAN: "Chờ xác nhận",
  DANG_CHUAN_BI: "Đang chuẩn bị hàng",
  DANG_GIAO: "Đang giao",
  HOAN_THANH: "Hoàn thành",
  YEU_CAU_HOAN: "Yêu cầu hoàn",
  HOAN_HANG: "Hoàn hàng",
  HUY_HANG: "Hủy hàng",
};

const Orders = () => {
  const { orders, fetchOrders, handleUpdateOrderStatus } = useOrder();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const navigate = useNavigate();
  const [ordersState, setOrdersState] = useState(orders);
  const { showPopup } = usePopup();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setOrdersState(orders);
  }, [orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    const prevStatus = ordersState.find(
      (order) => order.id === orderId
    )?.orderStatus;
    const result = await handleUpdateOrderStatus(orderId, newStatus);
    if (result.EC === 0) {
      const updatedOrders = ordersState.map((order) => {
        if (order.id === orderId) {
          return { ...order, orderStatus: newStatus };
        }
        return order;
      });
      setOrdersState(updatedOrders);
      showPopup(result.EM);

      const loginHistoryId = localStorage.getItem("loginHistoryId");
      if (!loginHistoryId) {
        return;
      }
      await updateLoginHistory(loginHistoryId, {
        action: "CAP_NHAT_TRANG_THAI_DON_HANG",
        orderId,
        prevStatus,
        newStatus,
      });
    } else showPopup(result.EM, false, 4000);
  };

  const filteredOrders = ordersState.filter((order) => {
    const matchesStatus = filterStatus
      ? order.orderStatus === filterStatus
      : true;
    const matchesSearch = searchText
      ? order.id.toLowerCase().includes(searchText.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Sản phẩm",
      dataIndex: "products",
      key: "products",
      render: (products) => <span>{`${products.length} sản phẩm`}</span>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        return moment(date).format("YYYY-MM-DD HH:mm");
      },
    },
    {
      title: "Khách hàng",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Hình thức",
      dataIndex: "orderPaymentMethod",
      key: "orderPaymentMethod",
      render: (value) => value?.toUpperCase(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "orderTotalFinal",
      key: "orderTotalFinal",
      render: (value) => `${value?.toLocaleString()}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          className="min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(statusLabel).map(([code, label]) => (
            <Option key={code} value={code}>
              {label}
            </Option>
          ))}
        </Select>
      ),

      onCell: () => ({
        onClick: (e) => {
          // Chỉ ngăn chặn sự kiện click không lan truyền lên hàng
          e.stopPropagation();
        },
      }),
    },
  ];

  return (
    <div className="lg:ml-[300px] mt-[64px] px-2 py-4 lg:p-6 min-h-screen">
      <div className="space-y-3 mb-4">
        <div className="flex gap-4">
          <Input
            placeholder="Tìm kiếm theo mã đơn hàng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-none"
          />

          <Button
            type="primary"
            icon={<ExportOutlined />}
            className="rounded-none"
          >
            Xuất file
          </Button>
        </div>
        <div className="flex justify-between">
          <Select
            placeholder="Trạng thái đơn hàng"
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            className="w-[300px]"
          >
            {Object.entries(statusLabel).map(([code, label]) => (
              <Option key={code} value={code}>
                {label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="bg-white p-4 shadow-lg">
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          dataSource={filteredOrders}
          columns={columns}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => navigate(`/admin/order-details/${record.id}`),
          })}
          scroll={{ x: "max-content" }}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Orders;
