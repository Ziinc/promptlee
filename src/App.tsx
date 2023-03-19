import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import localforage from "localforage";
import React, { useContext, useEffect, useState } from "react";
import theme from "./assets/theme.json";
import { Route } from "wouter";
import Editor from "./pages/Editor";
import Home from "./pages/Home";

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  messages: string[];
  created: string;
  updated: string;
}

export interface AppState {
  prompts: Prompt[];
  apiKey: string;
}
export interface AppContextValue extends AppState {
  setAppState: React.Dispatch<AppState | ((prev: AppState) => AppState)>;
}

export const DEFAULT_STATE = {
  prompts: [],
  apiKey: "",
};
export const AppContext = React.createContext({
  ...DEFAULT_STATE,
  setAppState: () => null,
} as AppContextValue);

export const useAppState = () => useContext(AppContext);
const App = () => {
  const [appState, setAppState] = useState<AppState>(DEFAULT_STATE);

  // do setup
  useEffect(() => {
    setup();
  }, []);

  const setup = async () => {
    console.log("setup ran, loading local state");
    const prompts = (await localforage.getItem("prompts")) || [];
    console.log("prompts", prompts);

    let cached = {} as any;
    for (var key in DEFAULT_STATE) {
      console.log("loading from cache", key, await localforage.getItem(key));
      const cachedValue = await localforage.getItem(key);
      if (cachedValue) {
        cached[key] = cachedValue;
      }
    }
    setAppState((prev) => ({ ...prev, ...cached }));
  };

  useEffect(() => {
    syncState(appState);
  }, [JSON.stringify(appState)]);

  console.log("appState", appState);

  const syncState = async (newState: AppState) => {
    if (newState == DEFAULT_STATE) return;
    console.log("triggering syncing...");
    for (let key in DEFAULT_STATE) {
      console.log(key);
      const val = await localforage.getItem(key);
      console.log(val, (appState as any)[key]);
      if (val !== (appState as any)[key]) {
        await localforage.setItem(key, (appState as any)[key]);
      }
    }
    console.log("prompts cache", await localforage.getItem("prompts"));
    console.log("prompts state", appState.prompts);
  };

  return (
    <ConfigProvider theme={theme}>
      <AppContext.Provider value={{ ...appState, setAppState }}>
        <main>
          <Route path="/prompts/:id/edit" component={Editor} />
          <Route path="/" component={Home} />
        </main>
      </AppContext.Provider>
    </ConfigProvider>
  );
};

export default App;
