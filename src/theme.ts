import { createTheme } from "@mui/material/styles";
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7c3aed",
    },
    secondary: {
      main: "#cbd5e1",
    },
    success: {
      main: "#89d247",
    },
    warning: {
      main: "#dc9a42",
    },
    error: {
      main: "#8a2628",
    },
    info: {
      main: "#6275d4",
    },
    background: {
      paper: "#0f172a",
      default: "#0f172a",
    },
  },
});
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f172a",
    },
    secondary: {
      main: "#64748b",
    },
    success: {
      main: "#89d247",
    },
    warning: {
      main: "#dc9a42",
    },
    error: {
      main: "#8a2628",
    },
    info: {
      main: "#6275d4",
    },
    background: {
      paper: "#f1f5f9",
    },
  },
});
