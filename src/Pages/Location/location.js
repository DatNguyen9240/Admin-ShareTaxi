import { Space, Table, Typography, Button, Modal, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

function LocationManagement() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('Location');
      const formattedLocations = response.data.$values.map(location => ({
        id: location.id,
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        areaId: location.areaId,
        status: location.status,
      }));
      setDataSource(formattedLocations);
    } catch (error) {
      message.error("Error loading locations.");
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (location) => {
    setSelectedLocation(location);
    form.setFieldsValue({
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      areaId: location.areaId,
      status: location.status,
    });
    setOpen(true);
  };

  const showAddModal = () => {
    form.resetFields();
    setOpenAdd(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedLocation) {
        await axios.put(`Location/${selectedLocation.id}`, {
          name: values.name,
          lat: values.lat,
          lon: values.lon,
          areaId: values.areaId,
          status: values.status,
        });
        message.success("Location updated successfully.");
        setOpen(false);
        setSelectedLocation(null);
      } else {
        await axios.post(`Location`, {
          name: values.name,
          lat: values.lat,
          lon: values.lon,
          areaId: values.areaId,
          status: values.status,
        });
        message.success("Location added successfully.");
        setOpenAdd(false);
      }
      fetchLocations();
      form.resetFields();
    } catch (error) {
      message.error("Error processing location information.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`Location/${id}`);
      message.success("Location deleted successfully.");
      fetchLocations(); // Refresh the list after deletion
    } catch (error) {
      message.error("Error deleting location.");
    }
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>Location Management</Typography.Title>
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
        columns={[
          { title: "ID", dataIndex: "id" },
          { title: "Name", dataIndex: "name" },
          { title: "Latitude", dataIndex: "lat" },
          { title: "Longitude", dataIndex: "lon" },
          { title: "Area", dataIndex: "areaId" },
          { title: "Status", dataIndex: "status" },
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
            render: (text, location) => (
              <Space>
                <Button onClick={() => showEditModal(location)}>Edit</Button>
              </Space>
            ),
          },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
        rowKey={(location) => location.id}
      />

      {/* Modal for Editing Location */}
      <Modal
        title="Edit Location Information"
        visible={open}
        onCancel={() => {
          setOpen(false);
          setSelectedLocation(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the location name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Latitude"
            name="lat"
            rules={[{ required: true, message: 'Please enter the latitude!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Longitude"
            name="lon"
            rules={[{ required: true, message: 'Please enter the longitude!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Area"
            name="areaId"
            rules={[{ required: true, message: 'Please enter the area!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please enter the status!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Information
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Adding Location */}
      <Modal
        title="Add New Location"
        visible={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the location name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Latitude"
            name="lat"
            rules={[{ required: true, message: 'Please enter the latitude!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Longitude"
            name="lon"
            rules={[{ required: true, message: 'Please enter the longitude!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Area"
            name="areaId"
            rules={[{ required: true, message: 'Please enter the area!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please enter the status!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Location
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default LocationManagement;
