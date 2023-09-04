import React, { useContext, useMemo, useState } from "react";
import { isSystemDarkMode } from "./utils";
import AuthWall from "./interfaces/AuthWall";
import { ThemeProvider } from "@mui/material/styles";
import { Route } from "wouter";
import Home from "./Home";
import { darkTheme, lightTheme } from "./theme";

import CssBaseline from "@mui/material/CssBaseline";
import Paper from "@mui/material/Paper";
import { AppState, AppContextValue } from "./types";
export const DEFAULT_STATE = {
  darkMode: isSystemDarkMode(),
  user: null,
  session: null,
};
export const AppContext = React.createContext({
  ...DEFAULT_STATE,
  darkMode: false,
  setAppState: () => null,
  mergeAppState: () => null,
  putAppState: () => null,
  toggleDarkMode: () => null,
} as AppContextValue);

export const useAppState = () => useContext(AppContext);
const App = () => {
  const [appState, setAppState] = useState<AppState>(DEFAULT_STATE);

  const mergeAppState: AppContextValue["mergeAppState"] = (partial) => {
    setAppState((prev) => ({ ...prev, ...partial }));
  };

  const putAppState: AppContextValue["putAppState"] = (key, value) => {
    setAppState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDarkMode = (checked: boolean) =>
    mergeAppState({ darkMode: !!checked });

  const muiThemem = useMemo(
    () => (appState.darkMode ? darkTheme : lightTheme),
    [appState.darkMode]
  );

  return (
    <AppContext.Provider
      value={{
        ...appState,
        setAppState,
        mergeAppState,
        toggleDarkMode,
        putAppState,
      }}
    >
      <CssBaseline />
      <ThemeProvider theme={muiThemem}>
        <AuthWall />
        {appState.user && appState.session && <AuthedApp />}
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export const AuthedApp = () => {
  return (
    <main>
      <Paper
        elevation={0}
        sx={{
          minWidth: "100vw",
          borderRadius: 0,
          minHeight: "100vh",
        }}
      >
        <Route path="/" component={Home} />
      </Paper>
    </main>
  );
};

export default App;
