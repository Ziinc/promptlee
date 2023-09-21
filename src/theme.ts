import { PaletteMode, ThemeOptions } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import merge from "lodash/merge";
const fontFamily = [
  "'Noto Sans'",
  "Roboto",
  "Helvetica",
  "Arial",
  "sans-serif",
].join(", ");

const common: ThemeOptions = {
  typography: {
    fontFamily,

    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,

    button: {
      textTransform: "none" as const,
    },
  },

  spacing: 2,
  components: {
    MuiButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiToggleButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFilledInput: {
      defaultProps: {
        margin: "dense",
        size: "small",
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiFormHelperText: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiInputBase: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiInputLabel: {
      defaultProps: {
        margin: "dense",
      },
    },
  },
};

const light = merge(
  {
    palette: {
      mode: "light" as PaletteMode,
      primary: {
        main: "#364FC7",
      },
      secondary: {
        main: "#6782a9",
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
        main: "#7685d9",
      },
      secondary: {
        main: "#bcc8da",
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
