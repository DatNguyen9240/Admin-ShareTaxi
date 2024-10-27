import { Space, Table, Typography, message, Button, Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedTripType, setSelectedTripType] = useState(null);
  const [form] = Form.useForm();
  const fetchTripTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('TripType');

      if (Array.isArray(response.data.$values)) {
        setDataSource(response.data.$values.filter(tripType => tripType.status === 1));
      } else {
        message.error("Unexpected data format. Please check the API.");
        setDataSource([]);
      }
    } catch (error) {
      console.error("There was an error fetching the trip types!", error);
      message.error("Error fetching trip types. Please try again.");
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripTypes();
  }, []);

  const showEditModal = (tripType) => {
    setSelectedTripType(tripType);
    form.setFieldsValue({
      name: tripType.name,
      description: tripType.description,
      fromAreaId: tripType.fromAreaId,
      toAreaId: tripType.toAreaId,
      basicPrice: tripType.basicePrice,
      status: tripType.status,
    });
    setOpenEdit(true);
  };

  const handleUpdateTripType = async (values) => {
    try {
      await axios.put(`TripType/${selectedTripType.id}`, {
        name: values.name,
        description: values.description,
        fromAreaId: values.fromAreaId,
        toAreaId: values.toAreaId,
        basicePrice: values.basicPrice,
        status: values.status,
      });
      message.success("Trip type updated successfully.");
      setOpenEdit(false);
      form.resetFields();
      fetchTripTypes(); // Call to fetch updated trip types
    } catch (error) {
      console.error('Error updating trip type:', error);
      message.error('Error updating trip type. Please try again.');
    }
  };

  const showAddModal = () => {
    form.resetFields(); // Reset input fields
    setOpenAdd(true); // Open modal to add trip type
  };

  const handleCreateTripType = async (values) => {
    try {
      console.log(values);
      
      await axios.post('TripType', {
        name: values.name,
        description: values.description,
        fromAreaId: values.fromAreaId,
        toAreaId: values.toAreaId,
        basicePrice: values.basicPrice,
        // status: values.status,
      });
      message.success("Trip type created successfully.");
      setOpenAdd(false);
      form.resetFields();
      fetchTripTypes(); // Fetch updated trip types after creation
    } catch (error) {
      console.error('Error creating trip type:', error);
      message.error('Error creating trip type. Please try again.');
    }
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>Trip Type Management</Typography.Title>
      <Space>
        <Button type="primary" onClick={() => navigate('/inventory')}>Go to Users</Button>
        <Button type="primary" onClick={() => navigate('/trip-type')}>Go to TripType</Button>
        <Button type="primary" onClick={() => navigate('/trip-type-pricing')}>Go to TripTypePricing</Button>
        <Button type="primary" onClick={() => navigate('/area')}>Go to Area</Button>
        <Button type="primary" onClick={() => navigate('/transaction')}>Go to Transaction</Button>
        <Button type="primary" onClick={() => navigate('/wallet')}>Go to Wallet</Button>
        <Button type="primary" onClick={showAddModal}>Add Trip Type</Button> {/* Button to open Add modal */}
      </Space>
      <Table
        loading={loading}
        rowKey="id"
        columns={[
          { title: "From Area ID", dataIndex: "fromAreaId" },
          { title: "To Area ID", dataIndex: "toAreaId" },
          { title: "Trip Name", dataIndex: "name" },
          { title: "Description", dataIndex: "description" },
          { title: "Base Price", dataIndex: "basicePrice", render: (value) => <span>${value}</span> },
          { title: "Status", dataIndex: "status", render: (value) => (value === 1 ? 'Active' : 'Inactive') },
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
              render: (text, tripType) => (
                <Button onClick={() => showEditModal(tripType)}>Edit</Button>
              ),
            },
          ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal for Editing Trip Type */}
      <Modal
        title="Edit Trip Type"
        open={openEdit}
        onCancel={() => {
          setOpenEdit(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdateTripType}
          layout="vertical"
        >
          <Form.Item
            label="Trip Name"
            name="name"
            rules={[{ required: true, message: 'Please input the trip name!' }]}
          >
            <Input placeholder="Enter trip name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input placeholder="Enter description" />
          </Form.Item>
          <Form.Item
            label="From Area"
            name="fromAreaId"
            rules={[{ required: true, message: 'Please input the from area!' }]}
          >
            <Input placeholder="Enter from area" />
          </Form.Item>
          <Form.Item
            label="To Area"
            name="toAreaId"
            rules={[{ required: true, message: 'Please input the to area!' }]}
          >
            <Input placeholder="Enter to area" />
          </Form.Item>
          <Form.Item
            label="Base Price"
            name="basicPrice"
            rules={[{ required: true, message: 'Please input the base price!' }]}
          >
            <Input placeholder="Enter base price" type="number" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select placeholder="Select status">
              <Option value={0}>Inactive</Option>
              <Option value={1}>Active</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Trip Type
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Adding Trip Type */}
      <Modal
        title="Add Trip Type"
        open={openAdd}
        onCancel={() => {
          setOpenAdd(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreateTripType}
          layout="vertical"
        >
          <Form.Item
            label="Trip Name"
            name="name"
            rules={[{ required: true, message: 'Please input the trip name!' }]}
          >
            <Input placeholder="Enter trip name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input placeholder="Enter description" />
          </Form.Item>
          <Form.Item
            label="From Area"
            name="fromAreaId"
            rules={[{ required: true, message: 'Please input the from area!' }]}
          >
            <Input placeholder="Enter from area" />
          </Form.Item>
          <Form.Item
            label="To Area"
            name="toAreaId"
            rules={[{ required: true, message: 'Please input the to area!' }]}
          >
            <Input placeholder="Enter to area" />
          </Form.Item>
          <Form.Item
            label="Base Price"
            name="basicPrice"
            rules={[{ required: true, message: 'Please input the base price!' }]}
          >
            <Input placeholder="Enter base price" type="number" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Trip Type
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default CreateTrip;
