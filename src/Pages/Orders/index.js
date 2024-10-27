import { Space, Table, Typography, message, Button, Modal, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import axios from '../../config/axios';

const { Option } = Select;

const CreateTrip = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDriverModal, setOpenDriverModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [form] = Form.useForm();
  const [driverForm] = Form.useForm();
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    const fetchTripsAndDrivers = async () => {
      setLoading(true);
      try {
        const tripResponse = await axios.get('Trip/list');
        const tripData = tripResponse.data.$values.filter(item => item.status !== 0);

        const tripWithDrivers = await Promise.all(
          tripData.map(async (trip) => {
            try {
              const carTripResponse = await axios.get(`CarTrip?${trip.id}`);
              const carTripData = carTripResponse.data.$values;
              const driverInfo = carTripData.find(item => item.tripId === trip.id);
              return { ...trip, driverInfo: driverInfo || null };
            } catch (error) {
              console.error(`Error fetching car trip for TripId ${trip.id}:`, error);
              return { ...trip, driverInfo: null };
            }
          })
        );

        setDataSource(tripWithDrivers);
      } catch (error) {
        console.error("There was an error fetching the trips!", error);
        message.error("Error fetching trips. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTripsAndDrivers();
  }, []);

  const formatISODate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const showEditModal = (trip) => {
    setSelectedTripId(trip.id);
    form.setFieldsValue({ status: mapStatusToValue(trip.status) });
    setOpen(true);
  };

  const mapStatusToValue = (status) => {
    switch (status) {
      case 'Cancelled': return 0;
      case 'Pending': return 1;
      case 'Booked': return 2;
      case 'Trip Cancelled': return 3;
      default: return null;
    }
  };

  const handleStatusUpdate = async (tripId, values) => {
    try {
      console.log(tripId);
      
      const status = mapValueToStatus(values.status);
      await axios.patch(`Trip/updateStatus/${tripId}`, {
        newStatus:  status
      });
      message.success("Trip status updated successfully.");
      setOpen(false);
      form.resetFields();

      const tripResponse = await axios.get('Trip/list');
        const tripData = tripResponse.data.$values.filter(item => item.status !== 0);

        const tripWithDrivers = await Promise.all(
          tripData.map(async (trip) => {
            try {
              const carTripResponse = await axios.get(`CarTrip?${trip.id}`);
              const carTripData = carTripResponse.data.$values;
              const driverInfo = carTripData.find(item => item.tripId === trip.id);
              return { ...trip, driverInfo: driverInfo || null };
            } catch (error) {
              console.error(`Error fetching car trip for TripId ${trip.id}:`, error);
              return { ...trip, driverInfo: null };
            }
          })
        );

        setDataSource(tripWithDrivers);
    } catch (error) {
      console.error('Error updating trip status:', error);
      message.error('Error updating trip status. Please try again.');
    }
  };

  const mapValueToStatus = (value) => {
    switch (value) {
      case 0:
        return '0'; // Cancelled
      case 1:
        return '1'; // Pending
      case 2:
        return '2'; // Booked
      case 3:
        return '3'; // Trip Cancelled
      default:
        return 'Unknown';
    }
  };

  const showDriverModal = (trip) => {
    setSelectedTripId(trip.id);
    if (trip.driverInfo) {
      driverForm.setFieldsValue({
        DriverName: trip.driverInfo.driverName,
        DriverPhone: trip.driverInfo.driverPhone,
        PlateNumber: trip.driverInfo.plateNumber,
        ArrivedTime: trip.driverInfo.arrivedTime.split(':').slice(0, 2).join(':'), // Chỉ lấy giờ và phút
        Status: trip.driverInfo.status === 1 ? "Active" : "Inactive",
      });
    } else {
      driverForm.resetFields();
    }
    setOpenDriverModal(true);
  };

  const handleDriverSubmit = async (values) => {
    try {
      const statusValue = values.Status === "Active" ? 1 : 0;
      console.log(values);

      if (dataSource.find(trip => trip.id === selectedTripId)?.driverInfo) {
        await handleDriverEdit(values, statusValue);
      } else {
        
        await axios.post(`CarTrip`, {
          tripId: selectedTripId,
          driverName: values.DriverName,
          driverPhone: values.DriverPhone,
          plateNumber: values.PlateNumber,
          arrivedTime: `${values.ArrivedTime}:00`,
          status: statusValue,
        });

        setDataSource(prevData => 
          prevData.map(trip => 
            trip.id === selectedTripId ? {
              ...trip,
              driverInfo: {
                driverName: values.DriverName,
                driverPhone: values.DriverPhone,
                plateNumber: values.PlateNumber,
                arrivedTime: `${values.ArrivedTime}:00`,
                status: statusValue,
              },
            } : trip
          )
        );
      }
      message.success("Driver details added/updated successfully.");
      setOpenDriverModal(false);
      driverForm.resetFields();
    } catch (error) {
      console.error('Error adding/updating driver details:', error);
      message.error('Error adding/updating driver details. Please try again.');
    }
  };

  const handleDriverEdit = async (values, statusValue) => {
    try {
      await axios.put(`CarTrip/${selectedTripId}`, {
        driverName: values.DriverName,
        driverPhone: values.DriverPhone,
        plateNumber: values.PlateNumber,
        arrivedTime: `${values.ArrivedTime}:00`,
        status: statusValue,
      });

      setDataSource(prevData => 
        prevData.map(trip => 
          trip.id === selectedTripId ? {
            ...trip,
            driverInfo: {
              ...trip.driverInfo,
              driverName: values.DriverName,
              driverPhone: values.DriverPhone,
              plateNumber: values.PlateNumber,
              arrivedTime: `${values.ArrivedTime}:00`,
              status: statusValue,
            },
          } : trip
        )
      );

      message.success("Driver details updated successfully.");
      setOpenDriverModal(false);
      driverForm.resetFields();
    } catch (error) {
      console.error('Error updating driver details:', error);
      message.error('Error updating driver details. Please try again.');
    }
  };
  const showAddModal = () => {
    form.resetFields();
    setOpenAdd(true);
  };

  const handleAddTrip = async (values) => {
    console.log(values);
    try {
      await axios.post('Trip/create', {
        pickUpLocationId: values.pickUpLocationId,
        dropOffLocationId: values.dropOffLocationId,
        maxPerson: values.maxPerson,
        minPerson: values.minPerson,
        bookingDate: values.bookingDate,
        hourInDay: `${values.hourInDay}:00`,
      });

      message.success("Trip added successfully.");
      setOpenAdd(false);
      form.resetFields();

      // Cập nhật lại danh sách chuyến đi sau khi thêm
      const tripResponse = await axios.get('Trip/list');
      const tripData = tripResponse.data.$values.filter(item => item.status !== 0);

      const tripWithDrivers = await Promise.all(
        tripData.map(async (trip) => {
          try {
            const carTripResponse = await axios.get(`CarTrip?${trip.id}`);
            const carTripData = carTripResponse.data.$values;
            const driverInfo = carTripData.find(item => item.tripId === trip.id);
            return { ...trip, driverInfo: driverInfo || null };
          } catch (error) {
            console.error(`Error fetching car trip for TripId ${trip.id}:`, error);
            return { ...trip, driverInfo: null };
          }
        })
      );

      setDataSource(tripWithDrivers);
    } catch (error) {
      console.error('Error adding trip:', error);
      message.error('Error adding trip. Please try again.');
    }
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>Trip Management</Typography.Title>

      <Table
        loading={loading}
        rowKey={(trip) => trip.id}
        columns={[
          { title: "Pick Up Location", dataIndex: "pickUpLocationName" },
          { title: "Drop Off Location", dataIndex: "dropOffLocationName" },
          { title: "Base Price", dataIndex: "unitPrice", render: (value) => <span>${value}</span> },
          { title: "Max Passengers", dataIndex: "maxPerson" },
          { title: "Min Passengers", dataIndex: "minPerson" },
          { title: "Departure Date", dataIndex: "bookingDate", render: (value) => formatISODate(value) },
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
                case 0: return <span>Cancelled</span>;
                case 1: return <span>Pending</span>;
                case 2: return <span>Booked</span>;
                case 3: return <span>Trip Completed</span>;
                default: return <span>Unknown</span>;
              }
            },
          },
          {
            title: (
              <>
                Action <Button onClick={showAddModal} type="link" style={{ padding: 0, marginLeft: 8 }}>+</Button>
              </>
            ),
            render: (text, trip) => (
              <>
                
                <Button onClick={() => showEditModal(trip)}>Edit Status</Button>
                <Button type="primary" onClick={() => showDriverModal(trip)}>
                  {trip.driverInfo ? "Edit Driver" : "Call Driver"}
                </Button>
              </>
            ),
          },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="Edit Trip Status"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={(values) => handleStatusUpdate(selectedTripId, values)}>
          <Form.Item name="status" label="Status">
            <Select>
              <Option value={0}>Cancelled</Option>
              <Option value={1}>Pending</Option>
              <Option value={2}>Booked</Option>
              <Option value={3}>Trip Completed</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Driver Details"
        open={openDriverModal}
        onCancel={() => setOpenDriverModal(false)}
        onOk={() => driverForm.submit()}
      >
        <Form form={driverForm} onFinish={handleDriverSubmit}>
          <Form.Item name="DriverName" label="Driver Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="DriverPhone" label="Driver Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="PlateNumber" label="Plate Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ArrivedTime" label="Arrived Time" rules={[{ required: true }]}>
            <Input placeholder="HH:MM format" />
          </Form.Item>
          <Form.Item name="Status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New Trip"
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAddTrip}>
          <Form.Item name="pickUpLocationId" label="Pick Up Location Id" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dropOffLocationId" label="Drop Off Location Id" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unitPrice" label="Base Price" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="maxPerson" label="Max Passengers" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="minPerson" label="Min Passengers" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="bookingDate" label="Departure Date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="hourInDay" label="Departure Time" rules={[{ required: true }]}>
            <Input placeholder="HH:MM format" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default CreateTrip;
