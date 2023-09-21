import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'reactflow/dist/style.css';
// import './index.css'

// fonts
import '@fontsource/noto-sans/100.css';
import '@fontsource/noto-sans/300.css';
import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/600.css';
import '@fontsource/noto-sans/700.css';
import '@fontsource/noto-sans/900.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
