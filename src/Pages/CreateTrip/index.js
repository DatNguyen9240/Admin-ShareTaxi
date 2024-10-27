import { Space, Table, Typography, Button, message, Modal, Form, Input, DatePicker, TimePicker } from "antd";
import { useEffect, useState } from "react";
import axios from "../../config/axios";
import moment from "moment";

function CreateTrip() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchShowTrip = async () => {
      setLoading(true);
      try {
        const tripResponse = await axios.get('Trip/list');
        const tripData = tripResponse.data.$values.filter(trip => trip.status !== 0); // Exclude cancelled trips
        setDataSource(tripData);
      } catch (error) {
        console.error("There was an error fetching the trips!", error);
        message.error("Error fetching trips. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowTrip();
  }, []);

  const formatISODate = (value) => {
    return moment(value).format("YYYY-MM-DD");
  };

  const showEditModal = (trip) => {
    console.log("Edit trip:", trip);
  };

  const handleCreateTrip = async (values) => {
    try {
      const { pickUpLocation, dropOffLocation, maxPerson, minPerson, bookingDate, departureTime } = values;

      // Format the booking date and departure time correctly
      const createTripData = {
        pickUpLocationId: pickUpLocation,
        dropOffLocationId: dropOffLocation,
        maxPerson: maxPerson,
        minPerson: minPerson,
        bookingDate: bookingDate.format("YYYY-MM-DD"), // Format to a single date string
        hourInDay: moment(departureTime).format("HH:mm:ss") // Format to a single time string
      };

      console.log("createTripData:", createTripData); // Log the data to console

      const response = await axios.post('Trip/create', createTripData);
      message.success(response.data.message);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Error during trip creation process:', error);
      message.error("Đã xảy ra lỗi trong quá trình tạo chuyến đi.");
    }
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <Space size={20} direction="vertical" style={{ width: "100%" }}>
      <Typography.Title level={4}>Trips</Typography.Title>
      
      <Button type="primary" onClick={openCreateModal} style={{ marginBottom: 16 }}>
        Create Trip
      </Button>
      
      <Table
        loading={loading}
        rowKey={(trip) => trip.id}
        columns={[
          { title: "Pick Up Location", dataIndex: "pickUpLocationName" },
          { title: "Drop Off Location", dataIndex: "dropOffLocationName" },
          { title: "Base Price", dataIndex: "unitPrice", render: (value) => <span>${value}</span> },
          { title: "Max Passengers", dataIndex: "maxPerson" },
          { title: "Min Passengers", dataIndex: "minPerson" },
          { title: "Departure Date", dataIndex: "bookingDate", render: formatISODate },
          { title: "Departure Time", dataIndex: "hourInDay" },
          {
            title: "Driver Name",
            dataIndex: ["driverInfo", "driverName"],
            render: (driverName) => driverName || "No driver assigned",
          },
          {
            title: "Status",
            dataIndex: "status",
            render: (value) => {
              switch (value) {
                case 1: return <span>Pending</span>;
                case 2: return <span>Booked</span>;
                case 3: return <span>Trip Completed</span>;
                default: return <span>Unknown</span>;
              }
            },
          },
          {
            title: "Action",
            render: (_, trip) => (
              <Space>
                <Button onClick={() => showEditModal(trip)}>Edit Status</Button>
              </Space>
            ),
          },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal for creating a trip */}
      <Modal
        title="Create New Trip"
        open={isModalOpen}
        onCancel={closeCreateModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTrip}
        >
          <Form.Item
            label="Pick Up Location"
            name="pickUpLocation"
            rules={[{ required: true, message: 'Please select a pick-up location!' }]}
          >
            <Input placeholder="Enter pick-up location ID" />
          </Form.Item>

          <Form.Item
            label="Drop Off Location"
            name="dropOffLocation"
            rules={[{ required: true, message: 'Please select a drop-off location!' }]}
          >
            <Input placeholder="Enter drop-off location ID" />
          </Form.Item>

          <Form.Item
            label="Max Passengers"
            name="maxPerson"
            rules={[{ required: true, message: 'Please enter the maximum number of passengers!' }]}
          >
            <Input type="number" placeholder="Enter max passengers" />
          </Form.Item>

          <Form.Item
            label="Min Passengers"
            name="minPerson"
            rules={[{ required: true, message: 'Please enter the minimum number of passengers!' }]}
          >
            <Input type="number" placeholder="Enter min passengers" />
          </Form.Item>

          <Form.Item
            label="Booking Date"
            name="bookingDate"
            rules={[{ required: true, message: 'Please select a booking date!' }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Departure Time"
            name="departureTime"
            rules={[{ required: true, message: 'Please select a departure time!' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Trip
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default CreateTrip;
