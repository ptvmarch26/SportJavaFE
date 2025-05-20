import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Divider,
} from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useDiscount } from "../../context/DiscountContext";
import { useProduct } from "../../context/ProductContext";
import { useCategories } from "../../context/CategoriesContext";
import moment from "moment";
import { useUser } from "../../context/UserContext";
import { usePopup } from "../../context/PopupContext";

const { Option } = Select;

const statusColors = {
  ACTIVE: "green",
  EXPIRED: "red",
  UPCOMING: "blue",
};

const statusText = {
  ACTIVE: "Hoạt động",
  UPCOMING: "Sắp tới",
  EXPIRED: "Hết hạn",
};

const calculateStatus = (start, end) => {
  const now = moment();
  if (moment(end).isBefore(now, "day")) return "EXPIRED";
  if (moment(start).isAfter(now, "day")) return "UPCOMING";
  return "ACTIVE";
};

const Discounts = () => {
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddDiscountModalVisible, setIsAddDiscountModalVisible] =
    useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isEditDiscountModalVisible, setIsEditDiscountModalVisible] =
    useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const { showPopup } = usePopup();

  const {
    discounts,
    fetchDiscounts,
    handleCreateDiscount,
    handleDeleteDiscount,
    handleUpdateDiscount,
  } = useDiscount();
  const { products, fetchProducts } = useProduct();
  const { categories, fetchCategories } = useCategories();
  const { fetchUser } = useUser();

  useEffect(() => {
    const fetchDiscountsData = async () => {
      const user = await fetchUser();
      if (user.result.role !== "ADMIN") {
        window.location.href = "/sign-in"; // Redirect to home page if not admin
      } else {
        fetchDiscounts();
      }
    };
    fetchDiscountsData();
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => handleDeleteDiscount(id)));
      fetchDiscounts();
      setSelectedRowKeys([]);
      setIsModalVisible(false);
      showPopup("Xóa mã giảm giá thành công");
    } catch {
      showPopup("Lỗi khi xóa mã giảm giá", false);
    }
  };

  const filteredDiscounts = discounts.filter((discount) => {
    const status = calculateStatus(
      discount.discountStartDay,
      discount.discountEndDay
    );

    const matchesStatus = filterStatus ? status === filterStatus : true;

    const matchesSearch = searchText
      ? discount.discountCode.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesStatus && matchesSearch;
  });

  const handleAddDiscount = async () => {
    try {
      await addForm.validateFields();
      const newDiscount = addForm.getFieldsValue();

      if (!newDiscount.discountStartDay || !newDiscount.discountEndDay) {
        return;
      }

      const res = await handleCreateDiscount(newDiscount);
      if (res?.EC === 0) {
        fetchDiscounts();
        addForm.resetFields();
        setIsAddDiscountModalVisible(false);
      }
    } catch {
      return;
    }
  };
  const handleEditDiscount = (record) => {
    if (record) {
      const formattedRecord = {
        ...record,
        discountStartDay: record.discountStartDay
          ? moment(record.discountStartDay)
          : null,
        discountEndDay: record.discountEndDay
          ? moment(record.discountEndDay)
          : null,
      };

      setSelectedDiscount(formattedRecord); // Cập nhật giá trị discount được chọn
      editForm.setFieldsValue(formattedRecord); // Điền thông tin discount vào form
      setIsEditDiscountModalVisible(true); // Mở modal chỉnh sửa
    } else {
      return;
    }
  };

  const handleUpdate = async () => {
    try {
      await editForm.validateFields();
      const updatedFields = editForm.getFieldsValue();
      const updatedDiscount = { ...selectedDiscount, ...updatedFields };

      const res = await handleUpdateDiscount(
        selectedDiscount.id,
        updatedDiscount
      );
      if (res?.EC === 0) {
        fetchDiscounts();
        editForm.resetFields();
        setIsEditDiscountModalVisible(false);
      }
    } catch {
      showPopup("Lỗi khi cập nhật mã giảm giá", false);
    }
  };

  const columns = [
    { title: "Mã giảm giá", dataIndex: "id", key: "id" },
    { title: "Code", dataIndex: "discountCode", key: "discountCode" },
    { title: "Loại", dataIndex: "discountType", key: "discountType" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Số lượng giảm giá",
      dataIndex: "discountAmount",
      key: "discountAmount",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "discountEndDay",
      key: "discountEndDay",
      render: (text) => {
        return text ? moment(text).format("YYYY-MM-DD") : "";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const status = calculateStatus(
          record.discountStartDay,
          record.discountEndDay
        );
        return <Tag color={statusColors[status]}>{statusText[status]}</Tag>;
      },
    },
    {
      title: "Chỉnh sửa",
      key: "edit",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleEditDiscount(record)} // Gọi handleEditDiscount với dòng được chọn
        >
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div className="lg:ml-[300px] mt-[64px] px-2 py-4 lg:p-6 min-h-screen">
      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap sm:flex-nowrap gap-4">
          <Input
            placeholder="Tìm kiếm theo code..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<ExportOutlined />}>
            Xuất file
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddDiscountModalVisible(true)}
          >
            Thêm mã
          </Button>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-4 justify-between">
          <Select
            placeholder="Trạng thái mã giảm giá"
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            className="w-[300px]"
          >
            <Option value="ACTIVE">Hoạt động</Option>
            <Option value="EXPIRED">Hết hạn</Option>
            <Option value="UPCOMING">Sắp tới</Option>
          </Select>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={() => setIsModalVisible(true)}
          >
            Xóa ({selectedRowKeys.length})
          </Button>
        </div>
      </div>
      <div className="bg-white p-4 shadow-lg">
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          dataSource={filteredDiscounts}
          columns={columns}
          pagination={{ pageSize: 8 }}
          rowKey="id"
          scroll={{ x: "max-content" }}
        />
      </div>
      <Modal
        title="Xác nhận xóa"
        open={isModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        width={500}
        styles={{ padding: "20px" }}
      >
        <p>Bạn có chắc muốn xóa các mã giảm giá đã chọn?</p>
      </Modal>

      <Modal
        title="Thêm mã giảm giá"
        open={isAddDiscountModalVisible}
        onOk={handleAddDiscount}
        onCancel={() => setIsAddDiscountModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddDiscount}>
          <Form.Item
            label="Tên mã giảm giá"
            name="discountTitle"
            rules={[{ required: true, message: "Tiêu đề là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mã giảm giá"
            name="discountCode"
            rules={[{ required: true, message: "Mã Code là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Loại giảm giá"
            name="discountType"
            rules={[{ required: true, message: "Loại giảm giá là bắt buộc" }]}
          >
            <Select>
              <Option value="SHIPPING">Vận chuyển</Option>
              <Option value="PRODUCT">Sản phẩm</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Phần trăm giảm giá (%)"
            name="discountNumber"
            rules={[
              { required: true, message: "Phần trăm giảm giá là bắt buộc" },
            ]}
          >
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item
            label="Số lượng mã giảm giá"
            name="discountAmount"
            rules={[
              { required: true, message: "Số lượng mã giảm giá là bắt buộc" },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="Ngày bắt đầu"
            name="discountStartDay"
            rules={[{ required: true, message: "Ngày bắt đầu là bắt buộc" }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            label="Ngày kết thúc"
            name="discountEndDay"
            dependencies={["discountStartDay"]}
            rules={[
              { required: true, message: "Ngày kết thúc là bắt buộc" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue("discountStartDay");

                  if (
                    !value ||
                    !start ||
                    moment(value).isSameOrAfter(moment(start), "day")
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu")
                  );
                },
              }),
            ]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                const start = addForm.getFieldValue("discountStartDay");
                return start && current.isBefore(start, "day");
              }}
            />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Giá trị đơn hàng tối thiểu" name="minOrderValue">
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="Danh mục áp dụng"
            name="applicableCategories"
            rules={[{ required: true, message: "Danh mục là bắt buộc" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn danh mục"
              dropdownRender={(menu) => (
                <>
                  <div
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const allCategoryIds = categories.map((c) => c.id);
                      addForm.setFieldsValue({
                        applicableCategories: allCategoryIds,
                      });
                    }}
                  >
                    Chọn tất cả
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      addForm.setFieldsValue({ applicableCategories: [] });
                    }}
                  >
                    Bỏ chọn tất cả
                  </div>
                  <Divider style={{ margin: "4px 0" }} />
                  {menu}
                </>
              )}
            >
              {categories?.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.categoryType} - {category.categoryGender}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Sản phẩm áp dụng"
            name="applicableProducts"
            rules={[{ required: true, message: "Sản phẩm là bắt buộc" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn danh mục"
              dropdownRender={(menu) => (
                <>
                  <div
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const allProducts = products.map((c) => c.id);
                      addForm.setFieldsValue({
                        applicableProducts: allProducts,
                      });
                    }}
                  >
                    Chọn tất cả
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      addForm.setFieldsValue({ applicableProducts: [] });
                    }}
                  >
                    Bỏ chọn tất cả
                  </div>
                  <Divider style={{ margin: "4px 0" }} />
                  {menu}
                </>
              )}
            >
              {products?.map((product) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.productTitle}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chỉnh sửa mã giảm giá"
        open={isEditDiscountModalVisible}
        onOk={handleUpdate} // Xử lý cập nhật khi nhấn OK
        onCancel={() => setIsEditDiscountModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={selectedDiscount} // Điền giá trị selectedDiscount vào form
          onFinish={handleUpdate} // Xử lý cập nhật thông tin
        >
          <Form.Item
            label="Tên mã giảm giá"
            name="discountTitle"
            rules={[{ required: true, message: "Tiêu đề là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mã giảm giá"
            name="discountCode"
            rules={[{ required: true, message: "Mã Code là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Loại giảm giá"
            name="discountType"
            rules={[{ required: true, message: "Loại giảm giá là bắt buộc" }]}
          >
            <Select>
              <Option value="SHIPPING">Vận chuyển</Option>
              <Option value="PRODUCT">Sản phẩm</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Phần trăm giảm giá (%)"
            name="discountNumber"
            rules={[
              { required: true, message: "Phần trăm giảm giá là bắt buộc" },
            ]}
          >
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item
            label="Số lượng mã giảm giá"
            name="discountAmount"
            rules={[
              { required: true, message: "Số lượng mã giảm giá là bắt buộc" },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="Ngày bắt đầu"
            name="discountStartDay"
            rules={[{ required: true, message: "Ngày bắt đầu là bắt buộc" }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            label="Ngày kết thúc"
            name="discountEndDay"
            dependencies={["discountStartDay"]}
            rules={[
              { required: true, message: "Ngày kết thúc là bắt buộc" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue("discountStartDay");

                  if (
                    !value ||
                    !start ||
                    moment(value).isSameOrAfter(moment(start), "day")
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu")
                  );
                },
              }),
            ]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={(current) => {
                const start = editForm.getFieldValue("discountStartDay");
                return start && current.isBefore(start, "day");
              }}
            />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Giá trị đơn hàng tối thiểu" name="minOrderValue">
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="Danh mục áp dụng"
            name="applicableCategories"
            rules={[{ required: true, message: "Danh mục là bắt buộc" }]}
          >
            <Select mode="multiple">
              {categories?.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.categoryType}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Sản phẩm áp dụng"
            name="applicableProducts"
            rules={[{ required: true, message: "Sản phẩm là bắt buộc" }]}
          >
            <Select mode="multiple">
              {products?.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.productTitle}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Discounts;
