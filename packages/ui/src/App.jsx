import { useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Homepage from "./components/Homepage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";

export default function App() {
  const [view, setView] = useState("home");

  const page = useMemo(() => {
    switch (view) {
      case "login":
        return <LoginPage navigate={setView} />;
      case "register":
        return <RegisterPage navigate={setView} />;
      default:
        return (
          <div className="min-h-screen bg-ink-50">
            <Navbar navigate={setView} />
            <main>
              <Homepage />
            </main>
            <Footer />
          </div>
        );
    }
  }, [view]);

  return page;
}
