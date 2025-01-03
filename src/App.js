import "./App.css";
import AppFooter from "./Components/AppFooter";
import AppHeader from "./Components/AppHeader";
import PageContent from "./Components/PageContent";
import SideMenu from "./Components/SideMenu";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import TripType from './Pages/TripType/tripType';
import TripTypePricing from "./Pages/TripTypePricing/TripTypePricing";
import Area from "./Pages/Area/area";
import Transaction from "./Pages/Transaction/transaction";
import Wallet from "./Pages/Wallet/wallet";
import Login from "./Pages/Login/login";
import { useAuth } from './Components/AuthContext'; 
import Dashboard from "./Pages/Dashbaord/";
import Management from "./Pages/Management";
import TripSystems from "./Pages/Trip Systems";
import AllStaff from "./Pages/allStaff/allStaff";
import Location from "./Pages/Location/location";
function App() {
  const { isAuthenticated, role } = useAuth(); // Get role from AuthContext

  // Define protected routes based on user roles
  const protectedRoutes = [
    { path: "/trip-type", component: TripType, roles: ['admin'] }, // Đổi đường dẫn thành chữ thường
    { path: "/trip-type-pricing", component: TripTypePricing, roles: ['admin'] }, // Đổi đường dẫn thành chữ thường
    { path: "/area", component: Area, roles: ['admin'] },
    { path: "/location", component: Location, roles: ['admin'] },
    { path: "/transaction", component: Transaction, roles: ['admin'] },
    { path: "/wallet", component: Wallet, roles: ['admin', 'staff'] },
    { path: "/dashboard", component: Dashboard, roles: ['admin'] },
    { path: "/Management", component: Management, roles: ['admin'] },
    { path: "/TripSystems", component: TripSystems, roles: ['admin', 'staff'] },
    { path: "/all-staff", component: AllStaff, roles: ['admin'] },


    
  ];

  const renderProtectedRoute = (Component, allowedRoles) => {
    // if (!isAuthenticated) { // Bỏ comment để kiểm tra xác thực
    //   return <Navigate to="/" />;
    // }
    if (allowedRoles.includes(role)) {
      return <Component />;
    }
    
    // Redirect logic based on role
    if (role === 'staff') {
      // If staff tries to access an admin route
      return <Navigate to="/orders" />;
    } else if (role === 'admin') {
      // If admin tries to access a staff route
      return <Navigate to="/dashboard" />;
    }
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <AppHeader />}
        <div className="SideMenuAndPageContent">
          {isAuthenticated && <SideMenu />}
          <PageContent />
          <Routes>
            {protectedRoutes.map(({ path, component: Component, roles }) => (
              <Route
                key={path}
                path={path}
                element={renderProtectedRoute(Component, roles)} // Use the render function
              />
            ))}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          </Routes>
        </div>
        {isAuthenticated && <AppFooter />}
      </div>
    </Router>
  );
}

export default App;
