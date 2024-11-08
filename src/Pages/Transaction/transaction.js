import { Space, Table, Typography, message, Button, Modal } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

const Transaction = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [open, setOpen] = useState(false); // Quản lý trạng thái mở/đóng modal
  const [selectedUser, setSelectedUser] = useState(null); // Lưu thông tin user đang được chọn
  const navigate = useNavigate();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('User/User List');
        console.log(response.data.$values);
        
        setDataSource(response.data.$values.map(user => ({
          id: user.id, // Chuyển Id về dạng số
          name: user.name,
          email: user.email,
        })));
      } catch (error) {
        message.error("Error fetching users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch transactions based on userId
  const handleViewTransactions = async (userId, userName) => {
    setLoading(true);
    try {
      const response = await axios.get(`TransactionHistory/user/${userId}?page=1&pageSize=1000`);
      if (Array.isArray(response.data.transactions.$values)) {
        setTransactions(response.data.transactions.$values);
        setSelectedUser(userName); // Đặt tên user để hiển thị trong modal
        setOpen(true); // Mở modal khi có dữ liệu giao dịch
        message.success("Transactions fetched successfully.");
      } else {
        message.error("Unexpected data format.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Error fetching transactions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>User Management with Transactions</Typography.Title>
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
          {
            title: "User ID",
            dataIndex: "id",
          },
          {
            title: "Name",
            dataIndex: "name",
          },
          {
            title: "Email",
            dataIndex: "email",
          },
          {
            title: "Action",
            render: (text, user) => (
              <Button onClick={() => handleViewTransactions(user.id, user.name)}>
                View Transactions
              </Button>
            ),
          },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 1000 }}
        rowKey={(user) => user.id}
      />

      {/* Modal hiển thị giao dịch */}
      <Modal
        title={`Transactions for ${selectedUser}`} // Hiển thị tên user trong tiêu đề modal
        visible={open}
        onCancel={() => setOpen(false)} // Đóng modal
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            Close
          </Button>
        ]}
        width={800} // Điều chỉnh kích thước modal nếu cần
      >
        {/* Bảng hiển thị giao dịch trong modal */}
        <Table
          columns={[
            {
              title: "Transaction ID",
              dataIndex: "id", // Hiển thị ID giao dịch
            },
            {
              title: "Amount",
              dataIndex: "amount", // Hiển thị số tiền
              render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'Unknown'}</span>,
            },
            {
              title: "Transaction Type",
              dataIndex: "transactionType", // Hiển thị loại giao dịch
            },
            {
              title: "Status",
              dataIndex: "status", // Hiển thị trạng thái giao dịch
              render: (status) => (status === 1 ? 'Completed' : 'Pending'), // Hiển thị trạng thái theo số
            },
            {
              title: "Created At",
              dataIndex: "createdAt", // Hiển thị ngày tạo
              render: (createdAt) => new Date(createdAt).toLocaleString(), // Chuyển đổi định dạng ngày tháng
            },
            {
              title: "Reference ID",
              dataIndex: "referenceId", // Hiển thị ID tham chiếu (VD: Trip_7)
            },
          ]}
          dataSource={transactions}
          pagination={false}
          rowKey={(record) => record.id} // Sử dụng khóa riêng cho mỗi giao dịch
        />
      </Modal>
    </Space>
  );
};

export default Transaction;
