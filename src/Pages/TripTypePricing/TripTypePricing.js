import { Space, Table, Typography, message, Button, Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const TripTypePricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedPricingId, setSelectedPricingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchPricingData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('TripTypePricing');
        if (Array.isArray(response.data.$values)) {
          setDataSource(response.data.$values.filter(pricing => pricing.status === 1));
        } else {
          message.error("Unexpected data format. Please check the API.");
          setDataSource([]);
        }
      } catch (error) {
        console.error("Error fetching trip type pricing:", error);
        message.error("Error fetching trip type pricing. Please try again.");
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  // Show the modal for editing trip type pricing
  const showEditModal = (pricing) => {
    setSelectedPricingId(pricing.id);
    form.setFieldsValue({
      name: pricing.name,
      tripType: pricing.tripType,
      minPerson: pricing.minPerson,
      maxPerson: pricing.maxPerson,
      pricePerPerson: pricing.pricePerPerson,
      status: pricing.status,
    });
    setOpen(true);
  };

  // Handle trip type pricing update
  const handleUpdatePricing = async (values) => {
    try {
      await axios.put(`TripTypePricing/${selectedPricingId}`, {
        name: values.name,
        tripType: values.tripType,
        minPerson: values.minPerson,
        maxPerson: values.maxPerson,
        pricePerPerson: values.pricePerPerson,
        status: values.status,
      });
      message.success("Trip type pricing updated successfully.");
      setOpen(false);
      form.resetFields();

      // Refresh data after update
      const response = await axios.get('TripTypePricing');
      setDataSource(Array.isArray(response.data.$values) ? response.data.$values : []);
    } catch (error) {
      console.error("Error updating trip type pricing:", error);
      message.error("Error updating trip type pricing. Please try again.");
    }
  };

  // Show modal to add new trip type pricing
  const showAddModal = () => {
    form.resetFields();
    setOpenAdd(true);
  };

  // Handle trip type pricing creation
  const handleCreatePricing = async (values) => {
    try {
      await axios.post('TripTypePricing', {
        name: values.name,
        tripType: values.tripType,
        minPerson: values.minPerson,
        maxPerson: values.maxPerson,
        pricePerPerson: values.pricePerPerson,
        // status: values.status,
      });
      message.success("Trip type pricing created successfully.");
      setOpenAdd(false);
      form.resetFields();

      // Refresh data after creation
      const response = await axios.get('TripTypePricing');
      setDataSource(Array.isArray(response.data.$values) ? response.data.$values : []);
    } catch (error) {
      console.error("Error creating trip type pricing:", error);
      message.error("Error creating trip type pricing. Please try again.");
    }
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>Trip Type Pricing Management</Typography.Title>
      <Space>
        <Button type="primary" onClick={() => navigate('/inventory')}>Go to Users</Button>
        <Button type="primary" onClick={() => navigate('/trip-type')}>Go to TripType</Button>
        <Button type="primary" onClick={() => navigate('/trip-type-pricing')}>Go to TripTypePricing</Button>
        <Button type="primary" onClick={() => navigate('/area')}>Go to Area</Button>
        <Button type="primary" onClick={() => navigate('/transaction')}>Go to Transaction</Button>
        <Button type="primary" onClick={() => navigate('/wallet')}>Go to Wallet</Button>
      </Space>
      <Table
        loading={loading}
        rowKey="id"
        columns={[
          {
            title: "Id",
            dataIndex: "id",
          },
          {
            title: "Trip Name",
            dataIndex: "name",
          },
          {
            title: "Trip Type",
            dataIndex: "tripType",
          },
          {
            title: "Min Persons",
            dataIndex: "minPerson",
          },
          {
            title: "Max Persons",
            dataIndex: "maxPerson",
          },
          {
            title: "Price Per Person",
            dataIndex: "pricePerPerson",
            render: (value) => <span>${value}</span>,
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
                  onClick={showAddModal}
                  style={{ padding: 0, marginLeft: 8 }}
                >
                  +
                </Button>
              </span>
            ),
            render: (text, tripTypePricing) => (
              <Button onClick={() => showEditModal(tripTypePricing)}>Edit</Button>
            ),
          },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
      />

      {/* Edit Modal */}
      <Modal
        title="Edit Trip Type Pricing"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdatePricing}
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
            label="Trip Type"
            name="tripType"
            rules={[{ required: true, message: 'Please input the trip type!' }]}
          >
            <Input placeholder="Enter trip type" />
          </Form.Item>
          <Form.Item
            label="Min Persons"
            name="minPerson"
            rules={[{ required: true, message: 'Please input the minimum persons!' }]}
          >
            <Input placeholder="Enter minimum persons" type="number" />
          </Form.Item>
          <Form.Item
            label="Max Persons"
            name="maxPerson"
            rules={[{ required: true, message: 'Please input the maximum persons!' }]}
          >
            <Input placeholder="Enter maximum persons" type="number" />
          </Form.Item>
          <Form.Item
            label="Price Per Person"
            name="pricePerPerson"
            rules={[{ required: true, message: 'Please input the price per person!' }]}
          >
            <Input placeholder="Enter price per person" type="number" />
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
              Update Trip Type Pricing
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Add Trip Type Pricing"
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleCreatePricing}
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
            label="Trip Type"
            name="tripType"
            rules={[{ required: true, message: 'Please input the trip type!' }]}
          >
            <Input placeholder="Enter trip type" />
          </Form.Item>
          <Form.Item
            label="Min Persons"
            name="minPerson"
            rules={[{ required: true, message: 'Please input the minimum persons!' }]}
          >
            <Input placeholder="Enter minimum persons" type="number" />
          </Form.Item>
          <Form.Item
            label="Max Persons"
            name="maxPerson"
            rules={[{ required: true, message: 'Please input the maximum persons!' }]}
          >
            <Input placeholder="Enter maximum persons" type="number" />
          </Form.Item>
          <Form.Item
            label="Price Per Person"
            name="pricePerPerson"
            rules={[{ required: true, message: 'Please input the price per person!' }]}
          >
            <Input placeholder="Enter price per person" type="number" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Trip Type Pricing
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default TripTypePricing;
