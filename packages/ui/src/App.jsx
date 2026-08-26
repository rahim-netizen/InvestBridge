import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PageLayout from "./components/PageLayout.jsx";
import Homepage from "./components/Homepage.jsx";
import AdminPage from "./components/AdminPage";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import VerifyEmailPending from "./components/VerifyEmailPending.jsx";
import ProfileDashboard from "./components/ProfileDashboard.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import OpportunitiesPage from "./components/OpportunitiesPage.jsx";
import DealsPage from "./components/DealsPage.jsx";
import PaymentPage from "./components/PaymentPage.jsx";
import ConnectPage from "./components/ConnectPage.jsx";
import ChatbotWidget from "./components/ChatbotWidget.jsx";
import InfoPage, { infoPages } from "./components/InfoPage.jsx";
import { getCurrentUser } from "./api/auth";

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("investbridgeSessionUser") || "null");
  } catch {
    return null;
  }
}

function AdminRoute({ children }) {
  const user = getStoredUser();
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = getStoredUser()?.role === "admin";

  useEffect(() => {
    // Automatically verify active cookie session with Laravel server
    getCurrentUser();
  }, []);

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

  // Admins are confined to the admin dashboard — every other route (including
  // the marketing homepage and investor/founder features) bounces back there.
  if (isAdmin && location.pathname !== "/admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
              <Homepage navigate={navigate} />
            </PageLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
              <LoginPage navigate={navigate} />
            </PageLayout>
          }
        />
        <Route
          path="/register"
          element={
            <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
              <RegisterPage navigate={navigate} />
            </PageLayout>
          }
        />
        <Route
          path="/verify-email-pending"
          element={
            <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
              <VerifyEmailPending navigate={navigate} />
            </PageLayout>
          }
        />
         <Route
           path="/profile"
           element={
             <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
               <ProfileDashboard navigate={navigate} />
             </PageLayout>
           }
         />
         <Route
           path="/dashboard"
           element={
             <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
               <UserDashboard navigate={navigate} />
             </PageLayout>
           }
         />
        <Route
          path="/opportunities"
          element={
            <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
              <OpportunitiesPage navigate={navigate} />
            </PageLayout>
          }
        />
        <Route
          path="/deals"
          element={
            <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
              <DealsPage navigate={navigate} />
            </PageLayout>
          }
        />
        <Route
          path="/payment/:id"
          element={
            <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
              <PaymentPage navigate={navigate} />
            </PageLayout>
          }
        />
        <Route
          path="/connect"
          element={
            <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
              <ConnectPage navigate={navigate} />
            </PageLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage navigate={navigate} theme={theme} toggleTheme={toggleTheme} />
            </AdminRoute>
          }
        />
        {Object.entries(infoPages).map(([path, content]) => (
          <Route
            key={path}
            path={path}
            element={
              <PageLayout navigate={navigate} theme={theme} toggleTheme={toggleTheme}>
                <InfoPage navigate={navigate} content={content} />
              </PageLayout>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAdmin && <ChatbotWidget />}
    </>
  );
}
