import "./App.css";
import { Route, Routes } from "react-router-dom";
import Quiz from "./pages/Quiz";
import Home from "./pages/Home";
import { AppSnackbarProvider } from "./providers/SnackbarProvider";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <AppSnackbarProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/googled562d0d3c0a74a2e" element={<googled562d0d3c0a74a2e />} />
      </Routes>
      <Analytics />
    </AppSnackbarProvider>
  );
}

export default App;
