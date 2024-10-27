import { Button, Form, Input, Typography, message } from "antd";
import { useState } from "react";
import axios from "../../config/axios";
import { useAuth } from '../../Components/AuthContext'; // Import the useAuth hook
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Get the login function from context
  const navigate = useNavigate(); // Hook for navigation

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // Actual login API request
      const response = await axios.post("http://sharetaxi.somee.com/api/", {
        email: values.email,
        password: values.password,
      });

      const { userId, role } = response.data;
      
      // Check if the user is active
      if (userId !== null) {
        message.success("Login successful!");

        // Store the token and update context
        localStorage.setItem("userId", userId);
        localStorage.setItem("role", role);

        login(userId,role); // Call the login function from context

        // Redirect based on user role
        if (role === "admin") {
          navigate("/dashboard"); // Redirect admin to the dashboard
        } else if (role === "staff") {
          navigate("/orders"); // Redirect staff to orders page
        } else {
          message.error("Access denied. Unknown role.");
        }
      } else {
        message.error("Access denied. Account is not active.");
      }
    } catch (error) {
      console.error("Login failed", error);
      message.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        width: "100%",
        margin: "50px auto",
        padding: "40px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        backgroundColor: "#fff",
        height: "40%",
      }}
    >
      <Typography.Title level={3} style={{ textAlign: "center" }}>
        Login
      </Typography.Title>
      <Form layout="vertical" onFinish={handleLogin}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input type="email" placeholder="Enter your email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;
