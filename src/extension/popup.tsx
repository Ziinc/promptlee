import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <main>
      <div>
        popup! hello!
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
