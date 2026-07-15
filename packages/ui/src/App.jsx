import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Homepage from './components/Homepage.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>
        <Homepage />
      </main>
      <Footer />
    </div>
  );
}

