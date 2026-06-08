import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/App.css";

// React 앱을 index.html의 root 영역에 연결한다.
createRoot(document.getElementById("root")).render(<App />);
