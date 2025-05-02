import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar = ({ toggleSidebar }: TopbarProps) => {
  const location = useLocation();
  const [title, setTitle] = useState('Dashboard');
  const [showActions, setShowActions] = useState(false);
  
  useEffect(() => {
    // Set title based on current route
    const path = location.pathname;
    if (path === '/') {
      setTitle('Dashboard');
      setShowActions(false);
    } else if (path === '/problem-logger') {
      setTitle('Problem Logger');
      setShowActions(true);
    } else if (path === '/calendar') {
      setTitle('Activity Calendar');
      setShowActions(false);
    } else if (path === '/retry-list') {
      setTitle('Problems to Retry');
      setShowActions(false);
    }
  }, [location]);
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-800 bg-dark-100/80 backdrop-blur-sm px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-400"
        onClick={toggleSidebar}
      >
        <Menu />
        <span className="sr-only">Toggle menu</span>
      </Button>
      
      <div className="flex flex-1 items-center justify-between">
        <motion.h1 
          key={title} 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="text-xl font-semibold text-gray-50 font-mono"
        >
          {title}
        </motion.h1>
        
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button
              variant="neon"
              size="sm"
              onClick={() => document.getElementById('log-problem-modal')?.click()}
            >
              Log New Problem
            </Button>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Topbar;