import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Homepage from "./components/Homepage.jsx";
import AdminPage from "./components/AdminPage";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import ProfileDashboard from "./components/ProfileDashboard.jsx";
import ChatbotWidget from "./components/ChatbotWidget.jsx";

function HomePage({ navigate, theme, toggleTheme }) {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 transition-colors duration-300 dark:bg-ink-950 dark:text-ink-50">
      <Navbar navigate={navigate} theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Homepage />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              navigate={navigate}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          }
        />
        <Route path="/login" element={<LoginPage navigate={navigate} />} />
        <Route
          path="/register"
          element={<RegisterPage navigate={navigate} />}
        />
        <Route
          path="/profile"
          element={<ProfileDashboard navigate={navigate} />}
        />
        <Route path="/admin" element={<AdminPage navigate={navigate} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatbotWidget />
    </>
  );
}
