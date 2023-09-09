import { PaletteMode } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import merge from "lodash/merge";
const common = {
  typography: {
    button: {
      textTransform: "none" as const,
    },
  },
};

const light = merge(
  {
    palette: {
      mode: "light" as PaletteMode,
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
  },
  common
);
const dark = merge(
  {
    palette: {
      mode: "dark" as PaletteMode,
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
  },
  common
);
export const darkTheme = createTheme(dark);
export const lightTheme = createTheme(light);
