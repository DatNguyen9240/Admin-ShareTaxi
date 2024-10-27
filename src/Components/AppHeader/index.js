import { Button, Drawer, List, Typography, Switch } from "antd";
import { useEffect, useState } from "react";
import { getComments } from "../../API";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from '../../Components/AuthContext'; // Import your Auth context

function AppHeader() {
  const [comments, setComments] = useState([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const navigate = useNavigate(); // Get the navigate function
  const { isAuthenticated, logout, role } = useAuth(); // Get authentication status, logout function, and role
  const [darkMode, setDarkMode] = useState(false); // State to manage dark mode

  useEffect(() => {
    getComments().then((res) => {
      setComments(res.comments);
    });
  }, []);

  const handleLogout = () => {
    logout(); // Call the logout function from Auth context
    navigate('/'); // Navigate to the home page after logout
  };

  const toggleDarkMode = (checked) => {
    setDarkMode(checked); // Update dark mode state
    document.body.style.backgroundColor = checked ? '#1c1c1c' : '#ffffff'; // Change background color based on mode
    document.body.style.color = checked ? '#ffffff' : '#000000'; // Change text color based on mode
  };

  // Set the title based on the user role
  const title = role === 'admin' ? "Admin Dashboard" : "Staff Dashboard";

  return (
    <div className="AppHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "0 16px" }}>
      <div style={{ flex: 1 }}></div>
      <Typography.Title level={3} style={{ margin: 0, flex: 1, textAlign: "left" }}>
        {title} {/* Dynamic title based on user role */}
      </Typography.Title>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* <Switch
          checked={darkMode}
          onChange={toggleDarkMode}
          checkedChildren="Dark"
          unCheckedChildren="Light"
        /> */}
        {isAuthenticated ? (
          <Button type="primary" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={() => {
              navigate('/login'); // Navigate to the login page
            }}
          >
            Login
          </Button>
        )}
      </div>
      <Drawer
        title="Comments"
        open={commentsOpen}
        onClose={() => {
          setCommentsOpen(false);
        }}
        maskClosable
      >
        <List
          dataSource={comments}
          renderItem={(item) => {
            return <List.Item>{item.body}</List.Item>;
          }}
        ></List>
      </Drawer>
    </div>
  );
}

export default AppHeader;
