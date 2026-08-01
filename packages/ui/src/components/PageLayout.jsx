import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function PageLayout({ children, navigate, theme, toggleTheme }) {
  return (
    <>
      <Navbar navigate={navigate} theme={theme} toggleTheme={toggleTheme} />
      <main>{children}</main>
      <Footer />
    </>
  );
}