import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Code } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex justify-center items-center w-20 h-20 bg-primary/20 rounded-full mb-6"
        >
          <Code size={40} className="text-neon-cyan" />
        </motion.div>
        
        <h1 className="text-6xl font-bold mb-4 text-white font-mono">404</h1>
        <h2 className="text-2xl font-medium mb-6 text-gray-300">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link to="/">
          <Button variant="glow" size="lg">
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;