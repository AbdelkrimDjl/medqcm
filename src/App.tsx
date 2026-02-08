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
      </Routes>
      <Analytics />
    </AppSnackbarProvider>
  );
}

export default App;