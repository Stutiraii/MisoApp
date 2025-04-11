import React, { createContext, useState, useContext, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const ColorModeContext = createContext();

export const useColorMode = () => useContext(ColorModeContext);

const ColorModeProvider = ({ children }) => {
  // Retrieve the theme mode from localStorage, or fallback to 'system' if not present
  const savedMode = localStorage.getItem("themeMode");
  const [mode, setMode] = useState(savedMode || "system");

  useEffect(() => {
    // If the mode is 'system', determine the theme from the user's OS preference
    if (mode === "system") {
      const systemMode = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setMode(systemMode);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") {
      localStorage.setItem("themeMode", mode); // Save theme mode to localStorage
    }
  }, [mode]);

  // Create a theme using Material-UI's createTheme
  const theme = createTheme({
    palette: {
      mode:
        mode === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : mode,
    },
  });

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export { ColorModeProvider, ColorModeContext };
export default ColorModeContext;
