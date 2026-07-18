import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Homepage from "./components/Homepage.jsx";
import AdminPage from "./components/AdminPage";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import ChatbotWidget from "./components/ChatbotWidget.jsx";

export default function App() {
  const [view, setView] = useState("home");
  const [theme, setTheme] = useState("light");

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

  const page = useMemo(() => {
    switch (view) {
      case "login":
        return <LoginPage navigate={setView} />;
      case "register":
        return <RegisterPage navigate={setView} />;
      case "adminPage":
        return <AdminPage navigate={setView} />;
      default:
        return (
          <div className="min-h-screen bg-ink-50 text-ink-900 transition-colors duration-300 dark:bg-ink-950 dark:text-ink-50">
            <Navbar
              navigate={setView}
              theme={theme}
              toggleTheme={toggleTheme}
            />
            <main>
              <Homepage />
            </main>
            <Footer />
          </div>
        );
    }
  }, [view, theme]);

  return (
    <>
      {page}
      <ChatbotWidget />
    </>
  );
}
