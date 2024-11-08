import { Space, Table, Typography, Button, Modal, Form, Input, Select, message } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

function UserManagement() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('User/User List');
      setDataSource(response.data.$values.map(user => ({
        ...user,
        CreatedAt: user.createdAt.split('T')[1].replace('Z', ''),
        DateOfBirth: dayjs(user.dateOfBirth).format('YYYY-MM-DD'), 
      })));
    } catch (error) {
      message.error("Error fetching users.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: dayjs(user.dateOfBirth).format('YYYY-MM-DD'), // Format for Input[type="date"]
      role: user.role,
      status: user.status,
      password: user.password,
    });
    setOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedUser) {
        await axios.put(`/User/UpdateUserAdmin/${selectedUser.id}`, {
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
          dateOfBirth: dayjs(values.dateOfBirth).format('YYYY-MM-DD'),
          role: values.role,
          status: values.status,
        });
        message.success("User information updated successfully.");
        setOpen(false);
        setSelectedUser(null);
        fetchUsers();
        form.resetFields();
      }
    } catch (error) {
      message.error("Error updating user information.");
    }
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>User Management</Typography.Title>
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
          { title: "Email", dataIndex: "email" },
          { title: "Phone Number", dataIndex: "phoneNumber" },
          { title: "Date of Birth", dataIndex: "DateOfBirth" },
          { title: "Password", dataIndex: "password" },
          { title: "Created At", dataIndex: "CreatedAt" },
          { title: "Role", dataIndex: "role" },
          {
            title: "Status",
            dataIndex: "status",
            render: (status) => (status === 1 ? "Active" : "Inactive"),
          },
          {
            title: "Action",
            render: (text, user) => (
              <Button onClick={() => handleEdit(user)}>Edit User Info</Button>
            ),
          },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
        rowKey={(user) => user.id}
      />

      <Modal
        title="Edit User Information"
        open={open}
        onCancel={() => {
          setOpen(false);
          setSelectedUser(null);
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
            rules={[{ required: true, message: 'Please input the user name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input the user email!' }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[{ required: true, message: 'Please input the user phone number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Date of Birth"
            name="dateOfBirth"
            rules={[{ required: true, message: 'Please select the date of birth!' }]}
          >
            <Input 
              type="date" 
              style={{ width: '100%' }} 
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input the user password!' }]}
          >
            <Input 
              type="password" 
              style={{ width: '100%' }} 
            />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="staff">Staff</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select a status!' }]}
          >
            <Select>
              <Select.Option value={1}>Active</Select.Option>
              <Select.Option value={0}>Inactive</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update User Info
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default UserManagement;
