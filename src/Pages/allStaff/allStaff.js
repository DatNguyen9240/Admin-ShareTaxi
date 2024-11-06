import {
  Space,
  Table,
  Typography,

  Form,

  message,

} from "antd";
import { useEffect, useState } from "react";
import axios from "../../config/axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";

function AllStaff() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, []);

  // Fetch existing staff data
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get("User/User List");
      if(response.data.$values){
        const staffData = response.data.$values.filter(item => item.role === "staff");
      setDataSource(staffData);
      }
    } catch (error) {
      message.error("Error fetching staff.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to add a new staff member
  const handleSubmit = async (values) => {
    try {
      // Convert DateOfBirth to the correct format before submission
      values.DateOfBirth = values.DateOfBirth.format("YYYY-MM-DD");
      await axios.post("/addStaff", values); // Adjusted to POST method
      message.success("Staff member added successfully.");
      setOpen(false);
      fetchStaff(); // Refresh staff list
      form.resetFields();
    } catch (error) {
      message.error("Error adding staff member.");
    }
  };

  return (
    <Space size={20} direction="vertical">
      <Typography.Title level={4}>All Staff</Typography.Title>

      {/* Button to open modal */}


      <Table
        loading={loading}
        columns={[
          { title: "ID", dataIndex: "id" },
          { title: "Name", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
          { title: "PhoneNumber", dataIndex: "phoneNumber" },
          { title: "DateOfBirth", dataIndex: "dateOfBirth", render: (date) => moment(date).format("DD/MM/YYYY") }, // Formatting for the table
          { title: "Role", dataIndex: "role" },
        ]}
        dataSource={dataSource}
        pagination={{ pageSize: 5 }}
        rowKey={(staff) => staff.Id}
      />

    </Space>
  );
}

export default AllStaff;
