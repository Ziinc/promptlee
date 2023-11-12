import { useMemo } from "react";
import { isSystemDarkMode } from "./../../utils";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { darkTheme, lightTheme } from "./../../theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
export function Popup() {
  const muiTheme = useMemo(
    () => (isSystemDarkMode() ? darkTheme : lightTheme),
    []
  );

  return (
    <main>
      <CssBaseline />
      <ThemeProvider theme={muiTheme}>
        <Paper
          elevation={0}
          sx={{
            minWidth: "100%",
            borderRadius: 0,
            minHeight: "100%",
          }}
        >
          <Button
            href="https://promptlee.tznc.net"
            title="Go to the Promptlee app"
          >
            App
          </Button>
        </Paper>
      </ThemeProvider>
    </main>
  );
}
export default Popup;
