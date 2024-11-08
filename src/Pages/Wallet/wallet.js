import { Space, Table, Typography, message, Button, Modal } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [walletDetails, setWalletDetails] = useState(null); // Change to null for clarity
  const [open, setOpen] = useState(false); // Manage modal open/close state
  const [selectedUser, setSelectedUser] = useState(null); // Store selected user information
  const navigate = useNavigate();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('User/User List');
        console.log(response.data.$values);

        setDataSource(response.data.$values.map(user => ({
          id: user.id, // Convert Id to number format
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

  // Fetch wallet balance and transactions for a user
  const handleViewWallet = async (userId, userName) => {
    setLoading(true);
    try {
      const response = await axios.get(`Wallet/balance/${userId}`); // Fetch wallet details for selected user
      if (response.data) {
        const walletData = {
          userId: response.data.userId, // Expecting the format you provided
          balance: response.data.balance,
          currencyCode: response.data.currencyCode,
        };
        setWalletDetails(walletData); // Set wallet details for the selected user
        setSelectedUser(userName); // Set selected user's name for modal
        setOpen(true); // Open modal when data is fetched
        message.success("Wallet details fetched successfully.");
      } else {
        message.error("Unexpected data format.");
      }
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      message.error("Error fetching wallet details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>User Management with Wallets</Typography.Title>
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
              <Button onClick={() => handleViewWallet(user.id, user.name)}>
                View Wallet
              </Button>
            ),
          },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
        rowKey={(user) => user.id}
      />

      {/* Modal for displaying wallet details */}
      <Modal
        title={`Wallet details for ${selectedUser}`} // Show user's name in modal title
        open={open}
        onCancel={() => setOpen(false)} // Close modal
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            Close
          </Button>
        ]}
        width={800} // Adjust modal size if necessary
      >
        {/* Check if wallet details are available */}
        {walletDetails && (
          <Table
            columns={[
              {
                title: "User ID",
                dataIndex: "userId", // Display user ID
              },
              {
                title: "Balance",
                dataIndex: "balance", // Display wallet balance
                render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'Unknown'}</span>,
              },
              {
                title: "Currency Code",
                dataIndex: "currencyCode", // Display currency code
              },
            ]}
            dataSource={[walletDetails]} // Pass wallet details as an array
            pagination={false}
            rowKey="userId" // Use userId as the unique key
          />
        )}
      </Modal>
    </Space>
  );
};

export default Wallet;
