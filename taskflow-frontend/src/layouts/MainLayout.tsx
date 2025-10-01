import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  return (
    <div className="app-shell">
      {/* Top navbar */}
      <Navbar />

      {/* Sidebar + Main */}
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="app-footer fixed-footer">
        <span>TaskFlow © {new Date().getFullYear()}</span>
        <span className="divider">•</span>
        <span>
          Developed by{" "}
          <a
            href="https://amalesija.se"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            A. Malesija
          </a>
        </span>
      </footer>
    </div>
  );
}
