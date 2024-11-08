import {
  DollarCircleOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Card, Space, Statistic, Table, Typography, Row, Col, message } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import TripStatistics from '../../Pages/Statistic/index'; // Import TripStatistics

function Dashboard() {
  const [revenue, setRevenue] = useState(0);
  const [deposits, setDeposits] = useState(0);
  const [topDepositors, setTopDepositors] = useState([]);

  const fetchRevenueData = async () => {
    try {
      const [revenueRes, depositsRes, topDepositorsRes] = await Promise.all([
        axios.get("/Finance/total-revenue"),
        axios.get("/Finance/total-deposits"),
        axios.get(`/Finance/top-depositors?topCount=5`)
      ]);
      
      setRevenue(revenueRes.data);
      setDeposits(depositsRes.data);
      setTopDepositors(topDepositorsRes.data.$values);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      message.error("Error fetching financial data. Please try again.");
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  return (
    <Space size={20} direction="vertical" style={{ width: "100%" }}>
      {/* <Typography.Title level={4}>Dashboard</Typography.Title> */}

      {/* Move Trip Statistics to the top */}
      <Row gutter={[16, 16]} justify="center">
        <Col span={24}>
          <TripStatistics />  {/* TripStatistics Component */}
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <DashboardCard
            icon={
              <ShoppingOutlined
                style={{
                  color: "blue",
                  backgroundColor: "rgba(0,0,255,0.25)",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Deposits"}
            value={deposits}
          />
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <DashboardCard
            icon={
              <DollarCircleOutlined
                style={{
                  color: "red",
                  backgroundColor: "rgba(255,0,0,0.25)",
                  borderRadius: 20,
                  fontSize: 24,
                  padding: 8,
                }}
              />
            }
            title={"Revenue"}
            value={revenue}
          />
        </Col>
      </Row>

      {/* Di chuyển TopDepositors xuống dưới cùng và rộng ngang hết */}
      <Row>
        <Col xs={24}>
          <TopDepositors data={topDepositors} />
        </Col>
      </Row>
    </Space>
  );
}

function DashboardCard({ title, value, icon }) {
  return (
    <Card>
      <Space direction="horizontal">
        {icon}
        <Statistic title={title} value={value} />
      </Space>
    </Card>
  );
}

function TopDepositors({ data }) {
  const validData = Array.isArray(data) ? data : [];
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const fetchUserNames = async () => {
      const names = {};
      for (const depositor of validData) {
        try {
          const response = await axios.get(`/Profile/${depositor.userId}`);
          names[depositor.userId] = response.data.name;
        } catch (error) {
          console.error(`Error fetching name for user ${depositor.userId}:`, error);
        }
      }
      setUserNames(names);
    };

    fetchUserNames();
  }, [validData]);

  return (
    <>
      <Typography.Text style={{ fontSize: '24px', color: 'red', fontWeight: '500' }}>Top 5 Depositors</Typography.Text>
      <Table
        columns={[
          { title: "User ID", dataIndex: "userId" },
          { title: "Name", dataIndex: "userId",
            render: (userId) => <span>{userNames[userId] || 'Unknown'}</span>,
          },
          { title: "Total Deposits", dataIndex: "totalDeposit",
            render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'Unknown'}</span>,
          },
        ]}
        dataSource={validData}
        pagination={false}
      />
    </>
  );
}

export default Dashboard;
