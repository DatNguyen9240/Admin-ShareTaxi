import axios from "axios";
// import { useEffect } from 'react';

const baseUrl = "https://admin-share-taxi.vercel.app/";
const api = axios.create({
  baseURL: baseUrl,
});

// handle before call API
const handleBefore = (config) => {
  // handle hành động trước khi call API

  // lấy ra cái token và đính kèm theo cái request
  const token = localStorage.getItem("token")?.replaceAll('"', "");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(handleBefore, null);

// function App() {
//   useEffect(() => {
//     api.get("/posts") // Thay fetch bằng axios
//       .then((response) => {
//         console.log(response.data); // Xử lý dữ liệu
//       })
//       .catch((error) => {
//         console.error("There was an error fetching the posts!", error);
//       });
//   }, []);

//   return <div>Check console for API response</div>;
// }

export default api;
