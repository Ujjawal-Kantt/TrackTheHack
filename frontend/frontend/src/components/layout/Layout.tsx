import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useSidebarStore from "../../hooks/sidebarStore";

const Layout = () => {
  const { isOpen, setIsOpen } = useSidebarStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true); // Ensure sidebar is open on large screens
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsOpen]);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black lg:hidden" // Backdrop only for mobile
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar open={isOpen} setOpen={setIsOpen} />

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <Topbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
