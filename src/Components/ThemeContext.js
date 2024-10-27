// import React, { createContext, useContext, useState } from 'react';

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [darkMode, setDarkMode] = useState(false); // Default to light mode

//   const toggleDarkMode = () => {
//     setDarkMode((prevMode) => !prevMode); // Toggle dark mode
//   };

//   return (
//     <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   return useContext(ThemeContext);
// };
