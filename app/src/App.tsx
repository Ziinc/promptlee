import { ConfigProvider, theme as antdTheme } from "antd";
import "antd/dist/reset.css";
import localforage from "localforage";
import React, { useContext, useEffect, useState } from "react";
import theme from "./assets/theme.json";
import { useLocation } from "wouter";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { CreateChatCompletionResponse } from "openai";
import { isSystemDarkMode } from "./utils";
import ReactGA from "react-ga4";
import TrackedRoute from "./components/TrackedRoute";
import Explore from "./pages/Explore";

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  messages: Message[];
  created: string;
  updated: string;
}
export interface Message {
  content: string;
  role: "user" | "system" | "assistant";
}

export interface RunHistoryItem {
  id: string;
  prompt_id: string;
  inputs: {
    messages: Prompt["messages"];
  };
  outputs: {
    apiResponse: CreateChatCompletionResponse;
  };
}
export interface AppState {
  prompts: Prompt[];
  runHistory: RunHistoryItem[];
  apiKey: string;
}
export interface AppContextValue extends AppState {
  setAppState: React.Dispatch<AppState | ((prev: AppState) => AppState)>;
  mergeAppState: (tomerge: Partial<AppState>) => void;
  toggleDarkMode: (checked: boolean) => void;
  darkMode: boolean;
}

export const DEFAULT_STATE = {
  prompts: [],
  runHistory: [],
  apiKey: "",
};
export const AppContext = React.createContext({
  ...DEFAULT_STATE,
  darkMode: false,
  setAppState: () => null,
  mergeAppState: () => null,
  toggleDarkMode: () => null,
} as AppContextValue);

export const useAppState = () => useContext(AppContext);
const App = () => {
  const [appState, setAppState] = useState<AppState>(DEFAULT_STATE);

  const [location, setLocation] = useLocation();

  // do setup
  useEffect(() => {
    setup();
  }, []);

  const setup = async () => {
    ReactGA.initialize("G-SKTR3XPW5M");

    // retrieve cached values and put them into local state
    let cached = {} as any;
    for (var key in DEFAULT_STATE) {
      const cachedValue = await localforage.getItem(key);
      if (cachedValue) {
        cached[key] = cachedValue;
      }
    }

    // determine if system dark mode
    if (isSystemDarkMode() && !document.body.classList.contains("dark")) {
      document.body.classList.add("dark");
      mergeAppState({}); // trigger rerender
    }

    setAppState((prev) => ({ ...prev, ...cached }));
  };

  useEffect(() => {
    syncState(appState);
  }, [JSON.stringify(appState)]);

  const syncState = async (newState: AppState) => {
    if (newState == DEFAULT_STATE) return;
    for (let key in DEFAULT_STATE) {
      const val = await localforage.getItem(key);
      if (val !== (appState as any)[key]) {
        await localforage.setItem(key, (appState as any)[key]);
      }
    }
  };

  const mergeAppState: AppContextValue["mergeAppState"] = (partial) => {
    setAppState((prev) => ({ ...prev, ...partial }));
  };

  const toggleDarkMode = (checked: boolean) => {
    if (checked) {
      document.body.classList.toggle("dark");
      mergeAppState({}); // trigger rerender
    } else {
      document.body.classList.remove("dark");
      mergeAppState({}); // trigger rerender
    }
  };

  const darkMode = Boolean(document.body.classList.contains("dark"));

  return (
    <ConfigProvider
      theme={{
        token: theme.token,
        algorithm:
          // manually set to true
          darkMode === true
            ? [antdTheme.darkAlgorithm]
            : // manually set to false
            darkMode === false
            ? [antdTheme.defaultAlgorithm]
            : // let the browser figure it out
              [antdTheme.defaultAlgorithm, antdTheme.darkAlgorithm],
      }}
    >
      <AppContext.Provider
        value={{
          ...appState,
          setAppState,
          mergeAppState,
          darkMode,
          toggleDarkMode,
        }}
      >
        <main className=" bg-slate-100 dark:bg-slate-900 text-black dark:text-gray-100">
          <TrackedRoute path="/prompts/:id/edit" component={Editor} />
          <TrackedRoute path="/explore" component={Explore} />
          <TrackedRoute path="/" component={Home} />
          <TrackedRoute path="/settings" component={Settings} />
        </main>
      </AppContext.Provider>
    </ConfigProvider>
  );
};

export default App;
