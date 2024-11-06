import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Space, Statistic, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [revenue, setRevenue] = useState(0);
  const [deposits, setDeposits] = useState(0);
  const [topDepositors, setTopDepositors] = useState([]);

  const fetchRevenueData = async () => {
    try {
      const revenueRes = await axios.get("/Finance/total-revenue");
      setRevenue(revenueRes.data);
      const depositsRes = await axios.get("/Finance/total-deposits");
      setDeposits(depositsRes.data);
      const topDepositorsRes = await axios.get(`/Finance/top-depositors?topCount=5`);
      setTopDepositors(topDepositorsRes.data.$values); // Lưu trữ dữ liệu của top depositors
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>Dashboard</Typography.Title>
      
      {/* Hiển thị Top Count cố định là 5 */}
     
      
      <Space direction="horizontal">
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
      </Space>
      
      <Space>
        <TopDepositors data={topDepositors} />
      </Space>
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
  console.log("Top Depositors Data:", data);
  const validData = Array.isArray(data) ? data : [];

  return (
    <>
      <Typography.Text style={{ fontSize: '24px',color: 'red', fontWeight: '500' }}>Top 5 Depositors</Typography.Text>
      <Table
        columns={[
          {
            title: "User ID",
            dataIndex: "userId",
          },
          {
            title: "Total Deposits",
            dataIndex: "totalDeposit",
          },
        ]}
        dataSource={validData}
        pagination={false}
      />
    </>
  );
}

export default Dashboard;
