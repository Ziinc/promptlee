import { ConfigProvider, theme as antdTheme } from "antd";
import "antd/dist/reset.css";
import React, { useContext, useEffect, useMemo, useState } from "react";
import theme from "./assets/theme.json";
import { CreateChatCompletionResponse } from "openai";
import { isSystemDarkMode } from "./utils";
import ReactGA from "react-ga4";
import TrackedRoute from "./components/TrackedRoute";
import { Flow, getLifetimePromptRunCount, listFlows } from "./api/flows";
import FlowEditor from "./pages/FlowEditor";
import { Session, User } from "@supabase/gotrue-js";
import AuthWall from "./components/AuthWall";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/material/styles";

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  created: string;
  updated: string;
  nodes: {
    id: string;
    prompt_id: string;
    rf_meta: {
      position: {
        x: number;
        y: number;
      };
    };
  }[];
  edges: {
    id: string;
    from_node_id: string | null; // null for start
    to_node_id: string | null; // null for end
    to_input: string; // input key, without @
  }[];
}

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

export interface WorkflowRunHistoryItem {
  id: string;
  workflow_id: string;
  inputs: {
    parameters: Record<string, string>;
  };
  status: "started" | "running" | "complete" | "error";
  outputs: {
    nodeResponses: {
      [node_id: string]: CreateChatCompletionResponse;
    };
    nodeErrors: {
      [node_id: string]: string[];
    };
    workflowError: string | null;
  };
  started_at: string;
  stopped_at: string | null;
}

export interface AppState {
  prompts: Prompt[];
  workflows: Workflow[];
  runHistory: RunHistoryItem[];
  workflowRuns: WorkflowRunHistoryItem[];
  apiKey: string;
  currentFlow: Flow | null;
  flows: Flow[] | null;
  user: User | null;
  session: Session | null;
  lifetimePromptRuns: number;
  isExceedingPromptRuns: boolean;
  isExceedingFlows: boolean;
}
export interface AppContextValue extends AppState {
  setAppState: React.Dispatch<AppState | ((prev: AppState) => AppState)>;
  mergeAppState: (tomerge: Partial<AppState>) => void;
  toggleDarkMode: (checked: boolean) => void;
  darkMode: boolean;
}

export const DEFAULT_STATE = {
  prompts: [],
  workflows: [],
  runHistory: [],
  workflowRuns: [],
  apiKey: "",
  currentFlow: null,
  flows: null,
  user: null,
  session: null,
  lifetimePromptRuns: 0,
  isExceedingFlows: false,
  isExceedingPromptRuns: false,
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
  useEffect(() => {
    setup();
  }, []);

  const setup = async () => {
    ReactGA.initialize("G-SKTR3XPW5M");

    const { data: flows } = await listFlows();
    const { data: lifetimeRuns } = await getLifetimePromptRunCount();
    mergeAppState({
      flows,
      lifetimePromptRuns: lifetimeRuns?.count || 0,
    });

    // determine if system dark mode
    if (isSystemDarkMode() && !document.body.classList.contains("dark")) {
      document.body.classList.add("dark");
      mergeAppState({}); // trigger rerender
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

  const muiThemem = useMemo(() => {
    if (darkMode) {
      return createTheme({
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
    }
    return createTheme({
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
  }, [darkMode]);

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
      {/* https://mui.com/material-ui/guides/interoperability/#tailwind-css */}
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiThemem}>
          <AppContext.Provider
            value={{
              ...appState,
              setAppState,
              mergeAppState,
              darkMode,
              toggleDarkMode,
              isExceedingFlows: (appState.flows || []).length >= 5,
              isExceedingPromptRuns: appState.lifetimePromptRuns >= 100,
            }}
          >
            <AuthWall />
            <AuthedApp />
          </AppContext.Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    </ConfigProvider>
  );
};

export const AuthedApp = () => {
  return (
    <main className="bg-slate-100 dark:bg-slate-900 text-black dark:text-gray-100">
      <TrackedRoute path="/flows/:id" component={FlowEditor} />
      <TrackedRoute path="/" component={FlowEditor} />
    </main>
  );
};

export default App;
