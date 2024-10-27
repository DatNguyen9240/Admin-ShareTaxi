import {
  DollarCircleOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Space, Statistic, Table, Typography, Input, Button } from "antd";
import { useEffect, useState } from "react";
import { getCustomers, getInventory, getOrders, getRevenue } from "../../API";
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
  // const [orders, setOrders] = useState(0);
  // const [inventory, setInventory] = useState(0);
  // const [customers, setCustomers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [deposits, setDeposits] = useState(0);
  const [topCount, setTopCount] = useState('');
  const [topDepositors, setTopDepositors] = useState([]);
  const [showTopCount, setShowTopCount] = useState(false); // Thêm trạng thái để kiểm soát hiển thị

  const fetchRevenueData = async () => {
    try {
      const revenueRes = await axios.get("/Finance/total-revenue");
      setRevenue(revenueRes.data);
      const depositsRes = await axios.get("/Finance/total-deposits");
      setDeposits(depositsRes.data);
      const topDepositorsRes = await axios.get(`/Finance/top-depositors?topCount=${topCount}`);
      setTopDepositors(topDepositorsRes.data.$values); // Store top depositors data
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };

  const handleConfirm = () => {
    setShowTopCount(true); // Cập nhật trạng thái khi nhấn nút xác nhận
    fetchRevenueData(); // Gọi hàm lấy dữ liệu
  };

  useEffect(() => {
    fetchRevenueData();
  }, [topCount]);

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>Dashboard</Typography.Title>
      
      {/* Thêm ô input để nhập topCount */}
      <Space>
        <Typography.Text>Top Count:</Typography.Text>
        <Input
          type="number"
          value={topCount}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 1) { // Chỉ cho phép nhập từ 1 trở đi
              setTopCount(value);
            }
          }}
          style={{ width: 100 }}
        />
        {/* Thêm nút xác nhận */}
        <Button onClick={handleConfirm}>Xác nhận</Button>
      </Space>
      
      <Space direction="horizontal">
         {/* <DashboardCard
          icon={
            <ShoppingCartOutlined
              style={{
                color: "green",
                backgroundColor: "rgba(0,255,0,0.25)",
                borderRadius: 20,
                fontSize: 24,
                padding: 8,
              }}
            />
          }
          title={"Top Depositors"}
          value={topDepositors}
        />  */}
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
        {/* <DashboardCard
          icon={
            <UserOutlined
              style={{
                color: "purple",
                backgroundColor: "rgba(0,255,255,0.25)",
                borderRadius: 20,
                fontSize: 24,
                padding: 8,
              }}
            />
          }
          title={"Customer"}
          value={customers}
        /> */}
        
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
        {/* <RecentOrders /> */}
        {/* <DashboardChart /> */}
      </Space>
      <TopDepositors data={topDepositors} />
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
// function RecentOrders() {
//   const [dataSource, setDataSource] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     getOrders().then((res) => {
//       setDataSource(res.products.splice(0, 3));
//       setLoading(false);
//     });
//   }, []);

//   return (
//     <>
//       <Typography.Text>Recent Orders</Typography.Text>
//       <Table
//         columns={[
//           {
//             title: "Title",
//             dataIndex: "title",
//           },
//           {
//             title: "Quantity",
//             dataIndex: "quantity",
//           },
//           {
//             title: "Price",
//             dataIndex: "discountedPrice",
//           },
//         ]}
//         loading={loading}
//         dataSource={dataSource.map((item, index) => ({
//           ...item,
//           key: item.id || index, // Use a unique identifier or index as key
//         }))}
//         pagination={false}
//       />
//     </>
//   );
// }

function TopDepositors({ data }) {
  // Log the data received to verify its structure
  console.log("Top Depositors Data:", data);

  // Ensure data is an array before passing it to the Table
  const validData = Array.isArray(data) ? data : [];

  return (
    <>
      <Typography.Text>Top Depositors</Typography.Text>
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

function DashboardChart() {
  const [reveneuData, setReveneuData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    getRevenue().then((res) => {
      const labels = res.carts.map((cart) => {
        return `User-${cart.userId}`;
      });
      const data = res.carts.map((cart) => {
        return cart.discountedTotal;
      });

      const dataSource = {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: data,
            backgroundColor: "rgba(255, 0, 0, 1)",
          },
        ],
      };

      setReveneuData(dataSource);
    });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Order Revenue",
      },
    },
  };

  return (
    <Card style={{ width: 500, height: 250 }}>
      <Bar options={options} data={reveneuData} />
    </Card>
  );
}
export default Dashboard;
