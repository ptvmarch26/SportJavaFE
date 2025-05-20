import { useState, useEffect } from "react";
import { Table, Input, Select, Button, Modal, Form, InputNumber } from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useCategories } from "../../context/CategoriesContext";
import { useUser } from "../../context/UserContext";
import { usePopup } from "../../context/PopupContext";

const { Option } = Select;

const Categories = () => {
  const [formDad] = Form.useForm();
  const [formChild] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddDadCategoryModalVisible, setIsAddDadCategoryModalVisible] =
    useState(false);
  const [isAddChildCategoryModalVisible, setIsAddChildCategoryModalVisible] =
    useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isEditCategoryModalVisible, setIsEditCategoryModalVisible] =
    useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { fetchUser } = useUser();
  const { showPopup } = usePopup();

  const {
    categories,
    fetchCategories,
    removeCategory,
    addCategory,
    handleUpdateCategory,
  } = useCategories();

  const filteredCategory = categories.filter((category) => {
    const matchesSearch = searchText
      ? category.categoryType.toLowerCase().includes(searchText.toLowerCase())
      : true;
    return matchesSearch;
  });

  useEffect(() => {
    const fetchCategoriesData = async () => {
      const user = await fetchUser();
      if (user?.result?.role !== "ADMIN") {
        window.location.href = "/sign-in";
      } else {
        fetchCategories();
      }
    };
    fetchCategoriesData();
  }, []);

  const handleDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => removeCategory(id)));
      fetchCategories();
      setSelectedRowKeys([]);
      setIsModalVisible(false);
      showPopup("Xóa danh mục thành công");
    } catch {
      showPopup("Lỗi khi xóa danh mục", false);
    }
  };

  const handleAddDadCategory = async () => {
    try {
      await formDad.validateFields();
      const newCategory = formDad.getFieldsValue();

      const res = await addCategory(newCategory);
      if (res?.data?.EC === 0) {
        fetchCategories();
        formDad.resetFields();
        setIsAddDadCategoryModalVisible(false);
        showPopup("Thêm danh mục cha thành công");
      }
    } catch {
      // showPopup("Lỗi khi thêm danh mục cha", false);
      return;
    }
  };

  const handleAddChildCategory = async () => {
    try {
      await formChild.validateFields();
      const newCategory = formChild.getFieldsValue();

      const parentCategory = categories.find(
        (cat) => cat.id === newCategory.categoryParentId
      );
      newCategory.categoryGender = parentCategory?.categoryGender || null;
      const res = await addCategory(newCategory);
      console.log("res", res);
      if (res?.data?.EC === 0) {
        fetchCategories();
        formChild.resetFields();
        setIsAddChildCategoryModalVisible(false);
        showPopup("Thêm danh mục con thành công");
      }
    } catch {
      // showPopup("Lỗi khi thêm danh mục con", false);
      return;
    }
  };

  const handleEditCategory = (record) => {
    if (record) {
      setSelectedCategory(record); // Cập nhật giá trị discount được chọn
      formEdit.setFieldsValue(record); // Điền thông tin discount vào form
      setIsEditCategoryModalVisible(true); // Mở modal chỉnh sửa
    } else {
      // showPopup("Không có danh mục được chọn", false);
      return;
    }
  };

  const handleUpdate = async () => {
    try {
      await formEdit.validateFields();
      const updateData = formEdit.getFieldsValue();
      if (
        updateData.categoryLevel === 1 &&
        updateData.categoryParentId !== null
      ) {
        setIsEditCategoryModalVisible(false);
        showPopup("Danh mục cấp 1 không thể có danh mục cha", false);
        return;
      }

      if (
        updateData.categoryLevel >= 2 &&
        updateData.categoryParentId === null
      ) {
        showPopup("Danh mục cấp 2 phải có danh mục cha", false);
        return;
      }

      const res = await handleUpdateCategory(selectedCategory.id, updateData);
      if (res?.data?.EC === 0) {
        fetchCategories();
        formEdit.resetFields();
        setIsEditCategoryModalVisible(false);
        showPopup("Sửa danh mục thành công");
      }
    } catch {
      showPopup("Lỗi khi cập nhật danh mục", false);
    }
  };

  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Loại danh mục",
      dataIndex: "categoryType",
      key: "categoryType",
    },
    {
      title: "Giới tính",
      dataIndex: "categoryGender",
      key: "categoryGender",
      render: (gender) => {
        const genderMap = {
          Nam: "Nam",
          Nữ: "Nữ",
          Unisex: "Unisex",
        };
        return genderMap[gender];
      },
    },
    {
      title: "Chỉnh sửa",
      key: "edit",
      render: (_, record) => (
        <Button type="link" onClick={() => handleEditCategory(record)}>
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
            placeholder="Tìm kiếm theo loại danh mục"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<ExportOutlined />}>
            Xuất file
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddDadCategoryModalVisible(true)}
          >
            Thêm danh mục cha
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddChildCategoryModalVisible(true)}
          >
            Thêm danh mục con
          </Button>
        </div>
      </div>
      <div className="my-4">
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
      <div className="bg-white p-4 shadow-lg">
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          dataSource={filteredCategory}
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
        <p>Bạn có chắc muốn xóa các danh mục đã chọn?</p>
      </Modal>
      <Modal
        title="Thêm danh mục cha"
        open={isAddDadCategoryModalVisible}
        onOk={handleAddDadCategory}
        onCancel={() => setIsAddDadCategoryModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={formDad}
          layout="vertical"
          onFinish={handleAddDadCategory}
          initialValues={{
            categoryLevel: 1,
            categoryParentId: null,
          }}
        >
          <Form.Item
            label="Giới tính"
            name="categoryGender"
            rules={[{ required: true, message: "Giới tính là bắt buộc" }]}
          >
            <Select placeholder="Chọn giới tính" allowClear>
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Unisex">Unisex</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Level"
            name="categoryLevel"
            rules={[{ required: true, message: "Level là bắt buộc" }]}
          >
            <InputNumber min={1} defaultValue={1} />
          </Form.Item>
          <Form.Item
            label="Loại danh mục"
            name="categoryType"
            rules={[{ required: true, message: "Loại danh mục là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Thêm danh mục con"
        open={isAddChildCategoryModalVisible}
        onOk={handleAddChildCategory}
        onCancel={() => setIsAddChildCategoryModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={formChild}
          layout="vertical"
          onFinish={handleAddChildCategory}
          initialValues={{
            categoryLevel: 2,
          }}
        >
          <Form.Item
            label="Level"
            name="categoryLevel"
            rules={[{ required: true, message: "Level là bắt buộc" }]}
          >
            <InputNumber min={2} defaultValue={2} />
          </Form.Item>
          <Form.Item
            label="Thuộc danh mục"
            name="categoryParentId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục cha" }]}
          >
            <Select placeholder="Chọn danh mục" allowClear>
              {categories
                ?.filter((category) => category.categoryLevel === 1)
                .map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.categoryType} - {category.categoryGender}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Loại danh mục"
            name="categoryType"
            rules={[{ required: true, message: "Loại danh mục là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chỉnh sửa danh mục"
        open={isEditCategoryModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditCategoryModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={formEdit}
          layout="vertical"
          initialValues={selectedCategory}
          onFinish={handleUpdate}
        >
          <Form.Item
            label="Giới tính"
            name="categoryGender"
            rules={[{ required: true, message: "Giới tính là bắt buộc" }]}
          >
            <Select placeholder="Chọn giới tính" allowClear>
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Unisex">Unisex</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Level"
            name="categoryLevel"
            rules={[{ required: true, message: "Level là bắt buộc" }]}
          >
            <InputNumber min={1} defaultValue={1} />
          </Form.Item>
          <Form.Item label="Thuộc danh mục" name="categoryParentId">
            <Select placeholder="Chọn danh mục" allowClear>
              {categories?.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.categoryType} - {category.categoryGender}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Loại danh mục"
            name="categoryType"
            rules={[{ required: true, message: "Loại danh mục là bắt buộc" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
