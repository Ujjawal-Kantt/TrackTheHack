import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/button";
import {
  Code,
  LayoutDashboard,
  Calendar,
  BookMarked,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const closeSidebar = () => {
    setOpen(false);
  };

  return (
    <>
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:sticky inset-y-0 left-0 z-30 w-64 bg-dark-100 shadow-xl border-r border-gray-800 glassmorphism
    transform transition-transform duration-300 ease-in-out
    ${open ? "translate-x-0" : "-translate-x-full"} 
    lg:translate-x-0 lg:relative lg:transform-none`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-4 py-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/20">
                <Code size={24} className="text-neon-cyan" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-50 font-mono tracking-tight">
                  TrackTheHack{" "}
                </h1>
                <p className="text-xs text-gray-400">Track your progress</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-4 space-y-2">
            <NavLink
              to="/"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-300"
                }`
              }
            >
              <LayoutDashboard size={18} className="mr-3" />
              Dashboard
            </NavLink>

            <NavLink
              to="/problem-logger"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-300"
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[18px] h-[18px] mr-3"
              >
                <path d="M12 5v9.5M8 9l4-4 4 4" />
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6" />
                <circle cx="18" cy="18" r="3" />
              </svg>
              Problem Logger
            </NavLink>

            <NavLink
              to="/calendar"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-300"
                }`
              }
            >
              <Calendar size={18} className="mr-3" />
              Activity Calendar
            </NavLink>

            <NavLink
              to="/retry-list"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-dark-300"
                }`
              }
            >
              <BookMarked size={18} className="mr-3" />
              Retry List
            </NavLink>
          </nav>

          {/* User and Logout */}
          <div className="mt-auto p-4">
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center px-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
                    <span className="font-medium text-sm text-white">
                      {user?.displayName
                        ? user.displayName[0].toUpperCase()
                        : "?"}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[180px]">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-gray-800 hover:bg-dark-300 text-gray-400 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile close button */}
      {open && (
        <div className="fixed top-4 right-4 z-40 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-full border-gray-800"
            onClick={closeSidebar}
          >
            <span className="sr-only">Close sidebar</span>
            <span aria-hidden="true" className="text-xl">
              ×
            </span>
          </Button>
        </div>
      )}
    </>
  );
};

export default Sidebar;
