import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProblemStore } from '../store/problemStore';
import { useStatsStore } from '../store/statsStore';
import { Button } from '../components/ui/button';
import { Siren as Fire, Award, Zap, BarChart3, Clock, BookMarked } from 'lucide-react';
import { formatTime, getDifficultyColor } from '../lib/utils';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const { problems, fetchProblems } = useProblemStore();
  const { stats, calculateStats } = useStatsStore();
  
  useEffect(() => {
    if (user) {
      fetchProblems(user.uid);
    }
  }, [user, fetchProblems]);
  
  useEffect(() => {
    if (problems.length > 0) {
      calculateStats(problems);
    }
  }, [problems, calculateStats]);
  
  // Difficulty distribution chart data
  const difficultyData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [
          stats.difficultyStats.easy, 
          stats.difficultyStats.medium, 
          stats.difficultyStats.hard
        ],
        backgroundColor: [
          'rgba(72, 199, 142, 0.7)',
          'rgba(255, 177, 66, 0.7)',
          'rgba(255, 86, 86, 0.7)',
        ],
        borderColor: [
          'rgba(72, 199, 142, 1)',
          'rgba(255, 177, 66, 1)',
          'rgba(255, 86, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Topic distribution chart data
  const topicData = {
    labels: stats.topicDistribution.map(t => t.topic),
    datasets: [
      {
        label: 'Problems Count',
        data: stats.topicDistribution.map(t => t.count),
        backgroundColor: [
          'rgba(92, 124, 250, 0.7)',
          'rgba(73, 190, 255, 0.7)',
          'rgba(148, 0, 211, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(92, 124, 250, 1)',
          'rgba(73, 190, 255, 1)',
          'rgba(148, 0, 211, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Recent activity chart data
  const recentActivityData = {
    labels: stats.dailyPoints.slice(-7).map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Points',
        data: stats.dailyPoints.slice(-7).map(d => d.points),
        backgroundColor: 'rgba(138, 43, 226, 0.6)',
        borderColor: 'rgba(138, 43, 226, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgb(229, 231, 235)',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          boxWidth: 15,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(229, 231, 235)',
        borderColor: 'rgba(71, 85, 105, 0.5)',
        borderWidth: 1,
        padding: 10,
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 'bold',
        },
      },
    },
  };
  
  const barOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgb(209, 213, 219)',
        },
      },
      y: {
        grid: {
          color: 'rgba(71, 85, 105, 0.2)',
        },
        ticks: {
          color: 'rgb(209, 213, 219)',
        },
      },
    },
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="rounded-lg glassmorphism p-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-50 font-mono">
          Welcome back, {user?.displayName || 'Coder'}!
        </h2>
        <p className="text-gray-400">
          Track your progress, improve your skills, and stay motivated.
        </p>
      </motion.div>
      
      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Problems Card */}
        <div className="rounded-lg glassmorphism p-5 flex items-center">
          <div className="rounded-full bg-violet-900/30 p-3 mr-4">
            <Zap size={24} className="text-neon-purple" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Problems</p>
            <h3 className="text-2xl font-bold text-gray-50">
              {stats.totalProblems}
            </h3>
          </div>
        </div>
        
        {/* Total Points Card */}
        <div className="rounded-lg glassmorphism p-5 flex items-center">
          <div className="rounded-full bg-blue-900/30 p-3 mr-4">
            <Award size={24} className="text-neon-blue" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Points</p>
            <h3 className="text-2xl font-bold text-gray-50">
              {stats.totalPoints}
            </h3>
          </div>
        </div>
        
        {/* Current Streak Card */}
        <div className="rounded-lg glassmorphism p-5 flex items-center">
          <div className="rounded-full bg-orange-900/30 p-3 mr-4">
            <Fire size={24} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Streak</p>
            <h3 className="text-2xl font-bold text-gray-50">
              {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
            </h3>
          </div>
        </div>
        
        {/* Weekly Problems Card */}
        <div className="rounded-lg glassmorphism p-5 flex items-center">
          <div className="rounded-full bg-cyan-900/30 p-3 mr-4">
            <BarChart3 size={24} className="text-neon-cyan" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Weekly Points</p>
            <h3 className="text-2xl font-bold text-gray-50">
              {stats.weeklyPoints}
            </h3>
          </div>
        </div>
      </motion.div>
      
      {/* Weekly Goal Progress */}
      <motion.div variants={itemVariants} className="rounded-lg glassmorphism p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-50">Weekly Goal Progress</h3>
          <p className="text-sm text-gray-400">{Math.round(stats.weeklyGoalProgress)}% complete</p>
        </div>
        
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(stats.weeklyGoalProgress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-600 to-neon-purple rounded-full"
          />
        </div>
        
        <div className="mt-3 text-sm text-gray-400 flex justify-between">
          <span>0 problems</span>
          <span>Target: {stats.weeklyGoal} problems</span>
        </div>
      </motion.div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <motion.div variants={itemVariants} className="rounded-lg glassmorphism p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-50">Difficulty Distribution</h3>
          <div className="h-64">
            {problems.length > 0 ? (
              <Pie data={difficultyData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data to display yet
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Topics Distribution */}
        <motion.div variants={itemVariants} className="rounded-lg glassmorphism p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-50">Topics Distribution</h3>
          <div className="h-64">
            {stats.topicDistribution.length > 0 ? (
              <Pie data={topicData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data to display yet
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="rounded-lg glassmorphism p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-50">Recent Activity</h3>
          <div className="h-64">
            {stats.dailyPoints.length > 0 ? (
              <Bar data={recentActivityData} options={barOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data to display yet
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Recent Problems & Retry List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Problems */}
        <motion.div variants={itemVariants} className="rounded-lg glassmorphism p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-50">Recent Problems</h3>
            <Link to="/problem-logger">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {problems.length > 0 ? (
              problems.slice(0, 5).map((problem) => (
                <div 
                  key={problem.id} 
                  className="p-3 bg-dark-300/30 rounded-md border border-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-200">{problem.name}</h4>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`text-xs ${getDifficultyColor(problem.difficulty)} px-2 py-0.5 rounded ${getDifficultyColor(problem.difficulty).replace('text', 'bg').replace('400', '900/40')}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatTime(problem.timeTaken)}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-neon-purple">+{problem.points}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p>No problems solved yet</p>
                <Link to="/problem-logger">
                  <Button variant="neon" size="sm" className="mt-3">
                    Log Your First Problem
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Problems to Retry */}
        <motion.div variants={itemVariants} className="rounded-lg glassmorphism p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-50">Problems to Retry</h3>
            <Link to="/retry-list">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {problems.filter(p => p.needsRevisit).length > 0 ? (
              problems
                .filter(p => p.needsRevisit)
                .slice(0, 5)
                .map((problem) => (
                  <div 
                    key={problem.id} 
                    className="p-3 bg-dark-300/30 rounded-md border border-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-200">{problem.name}</h4>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`text-xs ${getDifficultyColor(problem.difficulty)} px-2 py-0.5 rounded ${getDifficultyColor(problem.difficulty).replace('text', 'bg').replace('400', '900/40')}`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-gray-400">
                            {problem.tags.slice(0, 2).join(', ')}
                            {problem.tags.length > 2 ? '...' : ''}
                          </span>
                        </div>
                      </div>
                      <BookMarked size={18} className="text-neon-cyan" />
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p>No problems marked for retry</p>
                <Link to="/problem-logger">
                  <Button variant="neon" size="sm" className="mt-3">
                    Log Problems
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;