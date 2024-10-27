import { Space, Table, Typography, Button, message, Modal, Form } from "antd";
import { useEffect, useState } from "react";
import axios from "../../config/axios";

function TripStatistics() {
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTripStatistics = async () => {
      setLoading(true);
      try {
        const tripResponse = await axios.get('Trip/TripStatistics');
        setTripData(tripResponse.data); // Save the fetched trip data
      } catch (error) {
        console.error("There was an error fetching the trips!", error);
        message.error("Error fetching trip statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripStatistics();
  }, []);

  const showEditModal = () => {
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
  };

  // Prepare the data for the tables
  const tripsPerMonthData = tripData?.tripsPerMonth?.$values || [];
  const participantsStatisticsData = tripData?.participantsStatistics?.$values || [];

  return (
    <Space size={20} direction="vertical" style={{ width: "100%" }}>
      <Typography.Title level={4}>Trip Statistics</Typography.Title>
      
      {tripData && (
        <>
          <Typography.Title level={5}>Most Created Trip</Typography.Title>
          <Typography.Paragraph>
            From: {tripData.mostCreatedTrip.from}<br />
            To: {tripData.mostCreatedTrip.to}<br />
            Count: {tripData.mostCreatedTrip.count}
          </Typography.Paragraph>
        
          <Typography.Title level={5}>Trips Per Month</Typography.Title>
          <Table
            loading={loading}
            rowKey={(record) => `${record.year}-${record.month}`}
            columns={[
              { title: "Year", dataIndex: "year" },
              { title: "Month", dataIndex: "month" },
              { title: "Count", dataIndex: "count" },
            ]}
            dataSource={tripsPerMonthData}
            pagination={false}
          />

          <Typography.Title level={5}>Inactive Trips Per Month</Typography.Title>
          <Typography.Paragraph>No inactive trips data available.</Typography.Paragraph>

          <Typography.Title level={5}>Participants Statistics</Typography.Title>
          <Table
            loading={loading}
            rowKey={(record) => `${record.year}-${record.month}-participants`}
            columns={[
              { title: "Year", dataIndex: "year" },
              { title: "Month", dataIndex: "month" },
              { title: "Total Participants", dataIndex: "totalParticipants" },
            ]}
            dataSource={participantsStatisticsData}
            pagination={false}
          />
        </>
      )}
      
      {/* You can add modal functionality for editing or viewing statistics if necessary */}
      <Modal
        title="Edit Trip Details"
        open={isModalOpen}
        onCancel={closeEditModal}
        footer={null}
      >
        {/* You can put details of the selected trip here */}
      </Modal>
    </Space>
  );
}

export default TripStatistics;
