import {
  AppstoreOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../Components/AuthContext'; // Import the useAuth hook

function SideMenu() {
  const { role } = useAuth(); // Get the user's role from the AuthContext
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState("/");

  useEffect(() => {
    const pathName = location.pathname;
    setSelectedKeys(pathName);
  }, [location.pathname]);

  const navigate = useNavigate();

  // Define menu items
  const adminMenuItems = [
    {
      label: "Dashboard",
      icon: <AppstoreOutlined />,
      key: "/dashboard",
    },
    {
      label: "Inventory",
      key: "/inventory",
      icon: <ShopOutlined />,
    },
    {
      label: "All Staff",  // New Menu Item
      key: "/all-staff",   // Key for the route
      icon: <UserOutlined />,
    },
    {
      label: "Statistic",
      key: "/statistic",
      icon: <UserOutlined />,
    },
    {
      label: "Orders",
      key: "/orders",
      icon: <ShoppingCartOutlined />,
    },
    
  ];

  const staffMenuItems = [
    {
      label: "Orders",
      key: "/orders",
      icon: <ShoppingCartOutlined />,
    },

  ];

  // Choose menu items based on the user's role
  const menuItems = role === 'admin' ? adminMenuItems : staffMenuItems;

  return (
    <div className="SideMenu">
      <Menu
        className="SideMenuVertical"
        mode="vertical"
        onClick={(item) => {
          navigate(item.key);
        }}
        selectedKeys={[selectedKeys]}
        items={menuItems} // Use the appropriate menu items
      />
    </div>
  );
}

export default SideMenu;
