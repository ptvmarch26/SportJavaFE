import { useEffect, useState } from "react";
import { Table, Input, Select, Button, Modal, Form, InputNumber } from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useProduct } from "../../context/ProductContext";
import { Upload, Switch, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useCategories } from "../../context/CategoriesContext";
import { useNavigate } from "react-router-dom";
import { Divider } from "antd";
import { useLoading } from "../../context/LoadingContext";
import { usePopup } from "../../context/PopupContext";

const { Option } = Select;

const Products = () => {
  const { products, fetchProducts, removeProduct, addProduct, editProduct } =
    useProduct();
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddProductModalVisible, setIsAddProductModalVisible] =
    useState(false);
  const [isEditProductModalVisible, setIsEditProductgModalVisible] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const { showPopup } = usePopup();
  const { categories, fetchCategories } = useCategories();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => removeProduct(id)));
      fetchProducts();
      setSelectedRowKeys([]);
      setIsModalVisible(false);
      showPopup("Xóa sản phẩm thành công");
    } catch {
      showPopup("Lỗi khi xóa sản phẩm", false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList || [];
  };

  const handleAddProduct = async () => {
    try {
      setLoading(true, "Đang thêm sản phẩm");
      await addForm.validateFields();
      const newProduct = addForm.getFieldsValue();

      const res = await addProduct(newProduct);
      if (res?.EC === 0) {
        setLoading(false);
        showPopup("Thêm sản phẩm thành công");
        fetchProducts();
        addForm.resetFields();
        setIsAddProductModalVisible(false);
      }
    } catch {
      return;
    }
  };

  const urlToFile = async (url, filename, mimeType = "image/png") => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType });
  };

  const handleEditProduct = async (record) => {
    setLoading(true, "Đang mở form sản phẩm");
    const productImages = await Promise.all(
      (Array.isArray(record.productImg)
        ? record.productImg
        : [record.productImg]
      )
        .filter(Boolean)
        .map(async (url, index) => ({
          uid: `${index}`,
          name: `product-image-${index}.png`,
          status: "done",
          originFileObj: await urlToFile(url, `product-image-${index}.png`),
        }))
    );

    const colorImages = await Promise.all(
      (record.colors || []).map(async (color, colorIndex) => {
        const imgMain = color.imgs?.imgMain
          ? [
              {
                uid: `main-${colorIndex}`,
                name: `main-color-${colorIndex}.png`,
                status: "done",
                url: color.imgs.imgMain,
                originFileObj: await urlToFile(
                  color.imgs.imgMain,
                  `main-color-${colorIndex}.png`
                ),
              },
            ]
          : [];

        const imgSubs = Array.isArray(color.imgs?.imgSubs)
          ? await Promise.all(
              color.imgs.imgSubs.map(async (url, idx) => ({
                uid: `sub-${colorIndex}-${idx}`,
                name: `sub-color-${colorIndex}-${idx}.png`,
                status: "done",
                originFileObj: await urlToFile(
                  url,
                  `sub-color-${colorIndex}-${idx}.png`
                ),
              }))
            )
          : [];
        setLoading(false);

        return {
          ...color,
          imgs: {
            imgMain: imgMain,
            imgSubs: imgSubs,
          },
        };
      })
    );

    const recordWithNormalizedImages = {
      ...record,
      productImg: productImages,
      productCategory: record.productCategory.id,
      colors: colorImages,
    };

    setSelectedProduct(recordWithNormalizedImages);
    editForm.setFieldsValue(recordWithNormalizedImages);
    setIsEditProductgModalVisible(true);
  };

  const handleUpdate = async () => {
    setLoading(true, "Đang cập nhật sản phẩm");
    try {
      await editForm.validateFields();
      const updatedFields = editForm.getFieldsValue();
      const res = await editProduct(selectedProduct.id, updatedFields);
      if (res?.EC === 0) {
        setLoading(false);
        showPopup("Cập nhật sản phẩm thành công");
        fetchProducts();
        editForm.resetFields();
        setIsEditProductgModalVisible(false);
      }
    } catch {
      showPopup("Lỗi khi cập nhật sản phẩm", false);
    }
  };

  const filteredProducts = products.filter((product) => {
    let productStatus;
    if (product?.productCountInStock === 0) {
      productStatus = "Hết hàng";
    } else if (product?.productCountInStock < 10) {
      productStatus = "Cần nhập";
    } else {
      productStatus = "Còn hàng";
    }

    const matchesStatus = filterStatus ? productStatus === filterStatus : true;

    const matchesSearch = searchText
      ? product.productTitle.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "productImg",
      key: "productImg",
      render: (productImg) => (
        <img
          src={productImg}
          alt="Ảnh sản phẩm"
          className="w-16 h-16 object-cover rounded"
        />
      ),
    },
    { title: "Tên sản phẩm", dataIndex: "productTitle", key: "productTitle" },
    { title: "Thương hiệu", dataIndex: "productBrand", key: "productBrand" },
    {
      title: "Số lượng tồn",
      dataIndex: "productCountInStock",
      key: "productCountInStock",
      render: (value) => `${value}`,
    },
    {
      title: "Đã bán",
      dataIndex: "productSelled",
      key: "productSelled",
      render: (value) => value ?? 0,
    },
    {
      title: "Giá gốc",
      dataIndex: "productPrice",
      key: "productPrice",
      render: (value) => `${value}đ`,
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "productPercentDiscount",
      key: "productPercentDiscount",
      render: (value) => `${value}%`,
    },
    {
      title: "Đánh giá",
      dataIndex: "productRate",
      key: "productRate",
      render: (value) => value ?? "Chưa có",
    },
    {
      title: "Chỉnh sửa",
      key: "edit",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleEditProduct(record)} // Gọi handleEditDiscount với dòng được chọn
        >
          Chỉnh sửa
        </Button>
      ),
    },
    {
      title: "Xem chi tiết",
      key: "view",
      render: (record) => (
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => navigate(`/admin/product-details/${record.id}`)}
        >
          Chi tiết
        </span>
      ),
    },
  ];

  return (
    <div className="lg:ml-[300px] mt-[64px] px-2 py-4 lg:p-6 min-h-screen">
      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap sm:flex-nowrap gap-4">
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm..."
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddProductModalVisible(true)}
            className="rounded-none"
          >
            Thêm sản phẩm
          </Button>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-4 justify-between">
          <Select
            placeholder="Trạng thái sản phẩm"
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            className="w-[300px]"
          >
            <Option value="Còn hàng">Còn hàng</Option>
            <Option value="Hết hàng">Hết hàng</Option>
            <Option value="Cần nhập">Cần nhập</Option>
          </Select>

          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={() => setIsModalVisible(true)}
            className="rounded-none"
          >
            Xóa ({selectedRowKeys.length})
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 shadow-lg">
        <Table
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          dataSource={filteredProducts}
          columns={columns}
          pagination={{ pageSize: 15 }}
          rowKey="id"
          className="rounded-none cursor-pointer"
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Modal Xóa */}
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
        <p>Bạn có chắc muốn xóa các sản phẩm đã chọn?</p>
      </Modal>

      {/* Modal Thêm Sản Phẩm */}
      <Modal
        title="Thêm sản phẩm mới"
        open={isAddProductModalVisible}
        onOk={addForm.submit}
        onCancel={() => setIsAddProductModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
        width={800}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddProduct}
          initialValues={{
            productPrice: 0,
            productPercentDiscount: 0,
            productRate: 0,
            productSelled: 0,
            productDisplay: true,
            productFamous: false,
            colors: [],
          }}
        >
          <Form.Item
            label="Tên sản phẩm"
            name="productTitle"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Thương hiệu"
            name="productBrand"
            rules={[{ required: true, message: "Vui lòng nhập thương hiệu" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Giá gốc" name="productPrice">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Đã bán" name="productSelled">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Giảm giá chung (%)" name="productPercentDiscount">
            <InputNumber min={0} max={100} className="w-full" />
          </Form.Item>

          <Form.Item label="Đánh giá" name="productRate">
            <InputNumber min={0} max={5} step={0.1} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="productCategory"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select>
              {categories?.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.categoryType} - {cat.categoryGender}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Mô tả sản phẩm"
            name="productDescription"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Ảnh sản phẩm"
            name="productImg"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Vui lòng tải ảnh sản phẩm" }]}
          >
            <Upload
              accept="image/*"
              beforeUpload={() => false}
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải ảnh sản phẩm lên</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="productDisplay"
            label="Hiển thị sản phẩm"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="productFamous"
            label="Sản phẩm nổi bật"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Phần quản lý màu sắc */}
          <Divider orientation="left">Màu sắc và kích thước</Divider>

          <Form.List name="colors">
            {(colorFields, { add: addColor, remove: removeColor }) => (
              <>
                {colorFields.map(
                  ({ key: colorKey, name: colorName, ...colorRestField }) => (
                    <Card
                      key={colorKey}
                      title={`Màu sắc ${colorKey + 1}`}
                      className="mb-4"
                      extra={
                        <Button danger onClick={() => removeColor(colorName)}>
                          Xóa màu
                        </Button>
                      }
                    >
                      <Form.Item
                        {...colorRestField}
                        name={[colorName, "colorName"]}
                        label="Tên màu"
                        rules={[
                          { required: true, message: "Vui lòng nhập tên màu" },
                        ]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        {...colorRestField}
                        name={[colorName, "imgs", "imgMain"]}
                        label="Ảnh chính của màu"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[
                          { required: true, message: "Vui lòng tải ảnh chính" },
                        ]}
                      >
                        <Upload
                          accept="image/*"
                          beforeUpload={() => false}
                          listType="picture"
                          maxCount={1}
                        >
                          <Button icon={<UploadOutlined />}>
                            Tải ảnh chính lên
                          </Button>
                        </Upload>
                      </Form.Item>

                      <Form.Item
                        {...colorRestField}
                        name={[colorName, "imgs", "imgSubs"]}
                        label="Ảnh phụ của màu"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng tải ít nhất một ảnh phụ",
                          },
                        ]}
                      >
                        <Upload
                          accept="image/*"
                          beforeUpload={() => false}
                          listType="picture"
                          multiple
                        >
                          <Button icon={<UploadOutlined />}>
                            Tải ảnh phụ lên
                          </Button>
                        </Upload>
                      </Form.Item>

                      {/* Nested Form.List for variants within each color */}
                      <Divider orientation="left">Các kích thước</Divider>
                      <Form.List name={[colorName, "variants"]}>
                        {(
                          variantFields,
                          { add: addVariant, remove: removeVariant }
                        ) => (
                          <>
                            {variantFields.map(
                              ({
                                key: variantKey,
                                name: variantName,
                                ...variantRestField
                              }) => (
                                <Card
                                  key={variantKey}
                                  type="inner"
                                  title={`Kích thước ${variantKey + 1}`}
                                  className="mb-2"
                                  extra={
                                    <Button
                                      danger
                                      size="small"
                                      onClick={() => removeVariant(variantName)}
                                    >
                                      Xóa
                                    </Button>
                                  }
                                >
                                  <Form.Item
                                    {...variantRestField}
                                    name={[variantName, "variantSize"]}
                                    label="Kích thước"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Vui lòng nhập kích thước",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Ví dụ: S, M, L, XL" />
                                  </Form.Item>

                                  <Form.Item
                                    {...variantRestField}
                                    name={[variantName, "variantPrice"]}
                                    label="Giá"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Vui lòng nhập giá",
                                      },
                                    ]}
                                  >
                                    <InputNumber min={0} className="w-full" />
                                  </Form.Item>

                                  <Form.Item
                                    {...variantRestField}
                                    name={[variantName, "variantCountInStock"]}
                                    label="Số lượng tồn"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Vui lòng nhập số lượng tồn",
                                      },
                                    ]}
                                  >
                                    <InputNumber min={0} className="w-full" />
                                  </Form.Item>
                                </Card>
                              )
                            )}

                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => addVariant()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Thêm kích thước
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  )
                )}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => addColor()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm màu sắc
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa  */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        open={isEditProductModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsEditProductgModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={selectedProduct}
        >
          <Form.Item
            label="Tên sản phẩm"
            name="productTitle"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Thương hiệu"
            name="productBrand"
            rules={[{ required: true, message: "Vui lòng nhập thương hiệu" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá gốc"
            name="productPrice"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Đã bán" name="productSelled">
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Giảm giá chung (%)" name="productPercentDiscount">
            <InputNumber min={0} max={100} className="w-full" />
          </Form.Item>

          <Form.Item label="Đánh giá" name="productRate">
            <InputNumber min={0} max={5} step={0.1} className="w-full" />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="productCategory"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select>
              {categories?.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.categoryType} - {cat.categoryGender}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Mô tả sản phẩm"
            name="productDescription"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Ảnh sản phẩm"
            name="productImg"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              accept="image/*"
              beforeUpload={() => false}
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải ảnh sản phẩm lên</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="productDisplay"
            label="Hiển thị sản phẩm"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="productFamous"
            label="Sản phẩm nổi bật"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Phần quản lý màu sắc */}
          <Divider orientation="left">Màu sắc và kích thước</Divider>

          <Form.List name="colors">
            {(colorFields, { add: addColor, remove: removeColor }) => (
              <>
                {colorFields.map(
                  ({ key: colorKey, name: colorName, ...colorRestField }) => (
                    <Card
                      key={colorKey}
                      title={`Màu sắc ${colorKey + 1}`}
                      className="mb-4"
                      extra={
                        <Button danger onClick={() => removeColor(colorName)}>
                          Xóa màu
                        </Button>
                      }
                    >
                      <Form.Item
                        {...colorRestField}
                        name={[colorName, "colorName"]}
                        label="Tên màu"
                        rules={[
                          { required: true, message: "Vui lòng nhập tên màu" },
                        ]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        {...colorRestField}
                        name={[colorName, "imgs", "imgMain"]}
                        label="Ảnh chính của màu"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload
                          accept="image/*"
                          beforeUpload={() => false}
                          listType="picture"
                          maxCount={1}
                        >
                          <Button icon={<UploadOutlined />}>
                            Tải ảnh chính lên
                          </Button>
                        </Upload>
                      </Form.Item>

                      <Form.Item
                        {...colorRestField}
                        name={[colorName, "imgs", "imgSubs"]}
                        label="Ảnh phụ của màu"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload
                          accept="image/*"
                          beforeUpload={() => false}
                          listType="picture"
                          multiple
                        >
                          <Button icon={<UploadOutlined />}>
                            Tải ảnh phụ lên
                          </Button>
                        </Upload>
                      </Form.Item>

                      {/* Nested Form.List for variants within each color */}
                      <Divider orientation="left">Các kích thước</Divider>
                      <Form.List name={[colorName, "variants"]}>
                        {(
                          variantFields,
                          { add: addVariant, remove: removeVariant }
                        ) => (
                          <>
                            {variantFields.map(
                              ({
                                key: variantKey,
                                name: variantName,
                                ...variantRestField
                              }) => (
                                <Card
                                  key={variantKey}
                                  type="inner"
                                  title={`Kích thước ${variantKey + 1}`}
                                  className="mb-2"
                                  extra={
                                    <Button
                                      danger
                                      size="small"
                                      onClick={() => removeVariant(variantName)}
                                    >
                                      Xóa
                                    </Button>
                                  }
                                >
                                  <Form.Item
                                    {...variantRestField}
                                    name={[variantName, "variantSize"]}
                                    label="Kích thước"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Vui lòng nhập kích thước",
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Ví dụ: S, M, L, XL" />
                                  </Form.Item>

                                  <Form.Item
                                    {...variantRestField}
                                    name={[variantName, "variantPrice"]}
                                    label="Giá"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Vui lòng nhập giá",
                                      },
                                    ]}
                                  >
                                    <InputNumber min={0} className="w-full" />
                                  </Form.Item>

                                  <Form.Item
                                    {...variantRestField}
                                    name={[variantName, "variantCountInStock"]}
                                    label="Số lượng tồn"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Vui lòng nhập số lượng tồn",
                                      },
                                    ]}
                                  >
                                    <InputNumber min={0} className="w-full" />
                                  </Form.Item>
                                </Card>
                              )
                            )}

                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => addVariant()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Thêm kích thước
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  )
                )}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => addColor()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm màu sắc
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
