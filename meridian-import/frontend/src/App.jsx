import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/authentication";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeetComponent from "./pages/VideoMeet.jsx";
import HomePage from "./pages/HomePage.jsx";
import History from "./pages/history";
import Profile from "./pages/profile";
import { CustomCursor } from "./pages/CustomCursor.jsx";
function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <CustomCursor />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/:url" element={<VideoMeetComponent />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
