import { Space, Typography, message, Row, Col } from "antd";
import { useEffect, useState } from "react";
import axios from "../../config/axios";
import BarChart from "../../Components/BarChart/BarChart";

function TripStatistics() {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchTripStatistics = async () => {
      setLoading(true);
      try {
        const tripResponse = await axios.get('Trip/TripStatistics');
        const tripData = tripResponse.data;

        setChartData({
          labels: tripData.tripsPerMonth.$values.map(item => `${item.year}-${item.month}`),
          datasets: [
            {
              label: 'Trips Per Month',
              data: tripData.tripsPerMonth.$values.map(item => item.count),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Inactive Trips Per Month',
              data: tripData.inactiveTripsPerMonth.$values.map(item => item.count),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
            {
              label: 'Total Participants',
              data: tripData.participantsStatistics.$values.map(item => item.totalParticipants),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            }
          ]
        });
      } catch (error) {
        console.error("There was an error fetching the trips!", error);
        message.error("Error fetching trip statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripStatistics();
  }, []);

  return (
    <Space size={20} direction="vertical" style={{ width: "100%" }}>
      <Typography.Title level={4}>Trip Statistics</Typography.Title>
      
      {/* Render the BarChart and PieChart in a row */}
      {chartData && (
        <Row gutter={16} justify="center">
          <Col xs={24} sm={16} md={16} lg={16} xl={16}>
            <BarChart chartData={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </Col>
        </Row>
      )}
    </Space>
  );
}

export default TripStatistics;
