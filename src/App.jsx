import { Routes, Route, Link, useLocation } from "react-router-dom";
import { MdHome, MdDirectionsRun, MdHistory, MdAddCircle } from "react-icons/md";
import Home from "./pages/Home";
import Programs from "./pages/Programs";
import History from "./pages/History";
import Workout from "./pages/Workout";
import WorkoutHistoryDetail from "./pages/WorkoutHistoryDetail";
import ProgramDetail from "./pages/ProgramDetail";
import EditProgram from "./pages/EditProgram";
import "./App.css";
import { NavBarVisibilityProvider, useNavBarVisibility } from "./NavBarVisibilityContext";

function AppContent() {
  const location = useLocation();
  const { navBarVisible } = useNavBarVisibility();
  const navItems = [
    { to: "/", label: "Home", icon: <MdHome size={32} /> },
    { to: "/programs", label: "Programs", icon: <MdDirectionsRun size={32} /> },
    { to: "/history", label: "History", icon: <MdHistory size={32} /> },
    { to: "/workout", label: "Workout", icon: <MdAddCircle size={32} /> },
  ];

  // Hide nav bar on Program Detail or Edit Program page
  const isProgramDetailOrEditPage = /^\/programs\/[^/]+(\/edit)?$/.test(location.pathname);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:programId" element={<ProgramDetail />} />
          <Route path="/programs/:programId/edit" element={<EditProgram />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:workoutId" element={<WorkoutHistoryDetail />} />
          <Route path="/workout" element={<Workout />} />
        </Routes>
      </main>

      {/* Hide nav bar on Program Detail or Edit Program page */}
      {navBarVisible && !isProgramDetailOrEditPage && (
        <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-lg px-8 py-4 flex space-x-12 z-50">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center text-gray-700 font-semibold transition-colors duration-150 ${location.pathname === item.to ? "text-black" : "text-gray-700"}`}
            >
              {item.icon}
              <span className="mt-1 text-base">{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <NavBarVisibilityProvider>
      <AppContent />
    </NavBarVisibilityProvider>
  );
}
