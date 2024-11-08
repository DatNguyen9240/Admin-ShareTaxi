import { Space, Table, Typography, message, Button, Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const Area = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchAreaData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('Area');
        console.log("Fetched area data:", response.data.$values);

        if (Array.isArray(response.data.$values)) {
          setDataSource(response.data.$values);
        } else {
          message.error("Unexpected data format. Please check the API.");
          setDataSource([]);
        }
      } catch (error) {
        console.error("There was an error fetching the areas!", error);
        message.error("Error fetching areas. Please try again.");
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreaData();
  }, []);

  const showEditModal = (area) => {
    setSelectedAreaId(area.id);
    form.setFieldsValue({
      name: area.name,
      description: area.description,
      status: area.status === 1 ? "Active" : "Inactive",
    });
    setOpenEdit(true);
  };

  const handleUpdateArea = async (values) => {
    try {
      await axios.put(`Area/${selectedAreaId}`, {
        name: values.name,
        description: values.description,
        status: values.status === 'Active' ? 1 : 0, // Chuyển đổi status thành số nguyên
      });
      message.success("Area updated successfully.");
      setOpenEdit(false);
      form.resetFields();

      const response = await axios.get('Area');
      setDataSource(Array.isArray(response.data.$values) ? response.data.$values : []);
    } catch (error) {
      console.error('Error updating area:', error);
      message.error('Error updating area. Please try again.');
    }
  };

  const handleAddArea = async (values) => {
    try {
      await axios.post('Area', {
        name: values.name,
        description: values.description,
        status: values.status === 'Active' ? 1 : 0,
      });
      message.success("Area added successfully.");
      setOpenAddModal(false);
      form.resetFields();

      const response = await axios.get('Area');
      setDataSource(Array.isArray(response.data.$values) ? response.data.$values : []);
    } catch (error) {
      console.error('Error adding area:', error);
      message.error('Error adding area. Please try again.');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setOpenAddModal(true);
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>Area Management</Typography.Title>
      <Space>
        <Button type="primary" onClick={() => navigate('/Management')}>Go to Users</Button>
        <Button type="primary" onClick={() => navigate('/trip-type')}>Go to TripType</Button>
        <Button type="primary" onClick={() => navigate('/trip-type-pricing')}>Go to TripTypePricing</Button>
        <Button type="primary" onClick={() => navigate('/area')}>Go to Area</Button>
        <Button type="primary" onClick={() => navigate('/transaction')}>Go to Transaction</Button>
        <Button type="primary" onClick={() => navigate('/wallet')}>Go to Wallet</Button>
        <Button type="primary" onClick={() => navigate('/location')}>Go to Location</Button>
      </Space>
      <Table
        loading={loading}
        rowKey="id"
        columns={[
          {
            title: "Name",
            dataIndex: "name",
          },
          {
            title: "Description",
            dataIndex: "description",
          },
          {
            title: "Status",
            dataIndex: "status",
            render: (value) => (
              <span>{value === 1 ? 'Active' : 'Inactive'}</span>
            ),
          },
          {
            title: (
              <span>
                Action 
                <Button 
                  type="link" 
                  onClick={showAddModal} // Mở modal để thêm area
                  style={{ padding: 0, marginLeft: 8 }}
                >
                  +
                </Button>
              </span>
            ),
            render: (text, area) => (
              <Button onClick={() => showEditModal(area)}>Edit</Button>
            ),
          },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal for adding a new area */}
      <Modal
        title="Add Area"
        open={openAddModal}
        onCancel={() => setOpenAddModal(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddArea}
          layout="vertical"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the area name!' }]}
          >
            <Input placeholder="Enter area name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the area description!' }]}
          >
            <Input placeholder="Enter area description" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="Inactive">Inactive</Option>
              <Option value="Active">Active</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add Area</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for editing an area */}
      <Modal
        title="Edit Area"
        open={openEdit}
        onCancel={() => setOpenEdit(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdateArea}
          layout="vertical"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input the area name!' }]}
          >
            <Input placeholder="Enter area name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the area description!' }]}
          >
            <Input placeholder="Enter area description" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="Inactive">Inactive</Option>
              <Option value="Active">Active</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Update Area</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default Area;
