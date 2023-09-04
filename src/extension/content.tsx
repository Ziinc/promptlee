import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import browser from "webextension-polyfill";
import "./content.css";
import { ThemeProvider, css } from "@mui/material/styles";
import { isSystemDarkMode } from "../utils";
import { darkTheme, lightTheme } from "../theme";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import Widget from "./widget/Widget";

import Fade from "@mui/material/Fade";

function App() {
  const [result, setResult] = useState(null);
  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      setResult(request.runResult);
    });
  }, []);

  const theme = isSystemDarkMode() ? darkTheme : lightTheme;

  if (!result) return <div></div>;
  return (
    <div className="logo">
      <div>
        {/* <CssBaseline /> */}
        <ThemeProvider theme={theme}>
          {/* <Fade in={!!result}> */}
            {result && (
              <Widget result={result} onClose={() => setResult(null)} />
            )}
          {/* </Fade> */}
        </ThemeProvider>
      </div>
    </div>
  );
}

let appRoot = document.createElement("div");

appRoot.setAttribute("id", "appRoot");

const cssPaths = import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS;

const appContainer = document.createElement("div");
const shadowRoot = appContainer.attachShadow({
  mode: import.meta.env.MODE === "development" ? "open" : "closed",
});
cssPaths.forEach((cssPath: string) => {
  const styleEl = document.createElement("link");
  styleEl.setAttribute("rel", "stylesheet");
  styleEl.setAttribute("href", browser.runtime.getURL(cssPath));
  shadowRoot.appendChild(styleEl);
});

// attach material ui styles
const emotionRoot = document.createElement("div");
shadowRoot.appendChild(emotionRoot);
const cache = createCache({
  key: "css",
  container: emotionRoot,
});

appContainer.setAttribute(
  "style",
  "position:absolute; right:-10000px; top:auto; width:1px; height:1px; overflow:hidden;"
);
shadowRoot.appendChild(appRoot);
document.body.appendChild(appContainer);

ReactDOM.createRoot(appRoot).render(
  <React.StrictMode>
    <CacheProvider value={cache}>
      <App />
    </CacheProvider>
  </React.StrictMode>
);

console.log("adding content event listener");
