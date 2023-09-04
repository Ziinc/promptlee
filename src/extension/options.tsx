import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";

// function App() {
//   return (
//     <main>
//       <div>
//         Options page
//       </div>
//     </main>
//   );
// }

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
