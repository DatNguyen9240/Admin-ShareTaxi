import { Space, Table, Typography, message, Button, Modal, Form, Input, Select } from "antd";
import { useEffect, useState, useCallback } from "react";
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
  const [userInTripData, setUserInTripData] = useState([]);
  const [tripFullStatus, setTripFullStatus] = useState({});

  const fetchTripsAndDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const tripResponse = await axios.get('Trip/list');
      const tripData = tripResponse.data.$values;

      const tripWithDrivers = await Promise.all(
        tripData.map(async (trip) => {
          const carTripResponse = await axios.get(`CarTrip?${trip.id}`);
          const carTripData = carTripResponse.data.$values;
          const driverInfo = carTripData.find(item => item.tripId === trip.id);
          
          await fetchTripFullStatus(trip.id);

          return { ...trip, driverInfo: driverInfo || null };
        })
      );

      setDataSource(tripWithDrivers.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)));
    } catch (error) {
      console.error("There was an error fetching the trips!", error);
      message.error("Error fetching trips. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTripsAndDrivers();
  }, [fetchTripsAndDrivers]);

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
    Modal.confirm({
      title: 'Confirm Status Update',
      content: 'Are you sure you want to update the status of this trip?',
      onOk: async () => {
        try {
          
          const status = values.status;
          await axios.patch(`Trip/updateStatus/${tripId}`, {
            newStatus:  status
          });

          if (status === 0) {
            await axios.post(`Wallet/RefundCancelledTrip?tripId=${tripId}`);
            message.success("Refund processed successfully.");
          } else if (status === 3) {
            await axios.post(`Wallet/RefundTrip?tripId=${tripId}`);
            message.success("Refund processed successfully.");
          }

          message.success("Trip status updated successfully.");
          setOpen(false);
          form.resetFields();

          fetchTripsAndDrivers();
        } catch (error) {
          console.error('Error updating trip status:', error);
          message.error('Error updating trip status. Please try again.');
        }
      },
    });
  };

  const mapValueToStatus = (value) => {
    switch (value) {
      case 0:
        return 'Cancelled'; // Cancelled
      case 1:
        return 'Pending'; // Pending
      case 2:
        return 'Booked'; // Booked
      case 3:
        return 'Trip Completed'; // Trip Cancelled
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
      const tripData = tripResponse.data.$values;

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

      setDataSource(tripWithDrivers.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)));
    } catch (error) {
      console.error('Error adding trip:', error);
      message.error('Error adding trip. Please try again.');
    }
  };
  const userInTripDatas = async (value) => {
    try {
      const userInTripResponse = await axios.get(`Booking/usersInTrip/${value}`);
      const userInTripData = userInTripResponse.data.$values || [];
      
      return Promise.all(userInTripData.map(async (user) => {
        return (
          <div key={user.id}>
            <p><strong>User Id:</strong> {user.id} - <strong>User Name:</strong> {user.name}</p>
          </div>
        );
      }));
    } catch (error) {
      console.error('Error fetching users in trip:', error);
      message.error('Error fetching users in trip. Please try again.');
    }
  };
  const viewTripDetails = async (trip) => {
    console.log("Viewing details for trip:", trip);
    
    Modal.info({
      title: 'Trip Details',
      content: (
        <div>
          <p><strong>Pick Up Location:</strong> {trip.pickUpLocationName}</p>
          <p><strong>Drop Off Location:</strong> {trip.dropOffLocationName}</p>
          <p><strong>Base Price:</strong> ${trip.unitPrice.toLocaleString()}</p>
          <p><strong>Max Passengers:</strong> {trip.maxPerson}</p>
          <p><strong>Min Passengers:</strong> {trip.minPerson}</p>
          <p><strong>Departure Date:</strong> {formatISODate(trip.bookingDate)}</p>
          <p><strong>Departure Time:</strong> {trip.hourInDay}</p>
          <p><strong>Driver Name:</strong> {trip.driverInfo ? trip.driverInfo.driverName : "No driver assigned"}</p>
          <p><strong>Status:</strong> {mapValueToStatus(trip.status)}</p>
          <p><strong>Total Users:</strong> {userInTripData.length}</p>
          <p> {await userInTripDatas(trip.id)}</p>
        </div>
      ),
      onOk() {},
    });
  };

  const checkCurrentBookingsCount = async (tripId) => {
    try {

      const response = await axios.get(`Booking/checkTripFull/${tripId}`);
      return response.data.currentBookingsCount;
    } catch (error) {
      console.error('Error checking trip full status:', error);
      return "Error";
    }
  };

  const fetchTripFullStatus = async (tripId) => {
    const bookingsCount = await checkCurrentBookingsCount(tripId);
    setTripFullStatus(prev => ({ ...prev, [tripId]: bookingsCount }));
  };

  useEffect(() => {
    dataSource.forEach(trip => {
      fetchTripFullStatus(trip.id);
    });
  }, [dataSource]);

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>Trip Management</Typography.Title>

      <Table
        loading={loading}
        rowKey={(trip) => trip.id}
        columns={[
          { title: "Pick Up Location", dataIndex: "pickUpLocationName" },
          { title: "Drop Off Location", dataIndex: "dropOffLocationName" },
          { title: "Base Price", dataIndex: "unitPrice", render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || 'Unknown'}</span> },
          { title: "Max Passengers", dataIndex: "maxPerson" },
          { title: "Min Passengers", dataIndex: "minPerson" },
          { title: "Departure Date", dataIndex: "bookingDate", render: (value) => formatISODate(value) },
          { title: "Departure Time", dataIndex: "hourInDay" },
          {
            title: "Number on Trip",
            render: (text, trip) => (
              <span>{tripFullStatus[trip.id] || "Loading..."}</span>
            ),
          },
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
              <Space>
                <Button onClick={() => showEditModal(trip)} disabled={trip.status === 0 || trip.status === 3}>Edit Status</Button>
                <Button type="primary" onClick={() => showDriverModal(trip)}>
                  {trip.driverInfo ? "Edit Driver" : "Call Driver"}
                </Button>
                <Button onClick={() => viewTripDetails(trip)}>View Details</Button>
              </Space>
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
