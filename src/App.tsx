import { ConfigProvider, theme as antdTheme } from "antd";
import "antd/dist/reset.css";
import localforage from "localforage";
import React, { useContext, useEffect, useState } from "react";
import theme from "./assets/theme.json";
import { Route } from "wouter";
import Editor from "./pages/Editor";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { CreateChatCompletionResponse } from "openai";

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
  darkMode?: boolean;
}
export interface AppContextValue extends AppState {
  setAppState: React.Dispatch<AppState | ((prev: AppState) => AppState)>;
  mergeAppState: (tomerge: Partial<AppState>) => void;
}

export const DEFAULT_STATE = {
  prompts: [],
  runHistory: [],
  apiKey: "",
  darkMode: undefined,
};
export const AppContext = React.createContext({
  ...DEFAULT_STATE,
  setAppState: () => null,
  mergeAppState: () => null,
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

  const mergeAppState: AppContextValue["mergeAppState"] = (partial) => {
    setAppState((prev) => ({ ...prev, ...partial }));
  };
  return (
    <ConfigProvider
      theme={{
        ...theme,
        algorithm:
          // manually set to true
          appState.darkMode === true
            ? [antdTheme.darkAlgorithm]
            : // manually set to false
            appState.darkMode === false
            ? [antdTheme.defaultAlgorithm]
            : // let the browser figure it out
              [antdTheme.defaultAlgorithm, antdTheme.darkAlgorithm],
      }}
    >
      <AppContext.Provider value={{ ...appState, setAppState, mergeAppState }}>
        <main className=" bg-slate-100 dark:bg-slate-900 text-black dark:text-gray-100">
          <Route path="/prompts/:id/edit" component={Editor} />
          <Route path="/" component={Home} />
          <Route path="/settings" component={Settings} />
        </main>
      </AppContext.Provider>
    </ConfigProvider>
  );
};

export default App;
