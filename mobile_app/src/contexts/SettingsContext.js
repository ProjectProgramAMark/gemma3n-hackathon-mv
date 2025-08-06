import React, { createContext, useState, useContext } from "react";

const SettingsContext = createContext();

export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // TODO: add more settings here
  //console.log("Settings Provider");
  return (
    <SettingsContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </SettingsContext.Provider>
  );
};
