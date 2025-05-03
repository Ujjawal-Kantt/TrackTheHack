import { motion } from "framer-motion";
import { Code, Cpu, Database } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-dark-gradient flex flex-col items-center justify-center z-50">
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-primary rounded-full"
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          <motion.div className="relative flex items-center justify-center space-x-2 mb-8">
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Code size={36} className="text-neon-cyan" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Cpu size={48} className="text-neon-purple" />
            </motion.div>

            <motion.div
              animate={{ rotateY: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Database size={36} className="text-neon-blue" />
            </motion.div>
          </motion.div>
        </div>

        <motion.h1
          className="text-4xl font-mono font-bold mb-4 neon-text-purple tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          TrackTheHack
        </motion.h1>

        <motion.div
          className="h-2 w-64 bg-dark-400 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-blue rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.7, duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.p
          className="mt-4 text-gray-300 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Loading your coding journey...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
