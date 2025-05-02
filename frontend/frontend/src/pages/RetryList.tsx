import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProblemStore } from '../store/problemStore';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import { getDifficultyColor, formatRelativeTime } from '../lib/utils';
import { BookMarked, Link as LinkIcon, Info, ArrowUpRight } from 'lucide-react';

const RetryList = () => {
  const { user } = useAuth();
  const { problems, fetchProblems, toggleRevisit } = useProblemStore();
  const { toast } = useToast();
  const [problemsToRevisit, setProblemsToRevisit] = useState<typeof problems>([]);
  
  useEffect(() => {
    if (user) {
      fetchProblems(user.uid);
    }
  }, [user, fetchProblems]);
  
  useEffect(() => {
    setProblemsToRevisit(problems.filter(p => p.needsRevisit));
  }, [problems]);
  
  const handleToggleRevisit = async (id: string) => {
    try {
      await toggleRevisit(id, false);
      toast({
        title: 'Removed from Retry List',
        description: 'This problem has been removed from your retry list',
      });
    } catch (error) {
      console.error('Error toggling revisit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update problem',
        variant: 'destructive',
      });
    }
  };
  
  // Group problems by tags
  const groupProblemsByTag = () => {
    const groups: Record<string, typeof problems> = {};
    
    problemsToRevisit.forEach(problem => {
      problem.tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = [];
        }
        
        // Only add the problem if it's not already in this tag's group
        if (!groups[tag].some(p => p.id === problem.id)) {
          groups[tag].push(problem);
        }
      });
    });
    
    // Sort tags by problem count
    return Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([tag, problems]) => ({ tag, problems }));
  };
  
  const tagGroups = groupProblemsByTag();
  
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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-white font-mono">Problems to Retry</h2>
          <p className="text-gray-400 mt-1">Review and practice these problems again</p>
        </div>
        
        <Link to="/problem-logger">
          <Button variant="neon">
            Log New Problem
          </Button>
        </Link>
      </div>
      
      {problemsToRevisit.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="glassmorphism rounded-lg p-8 text-center"
        >
          <Info size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No problems to retry</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            When you find challenging problems that you want to revisit later, mark them for retry in the Problem Logger.
          </p>
          <Link to="/problem-logger">
            <Button variant="neon">
              Go to Problem Logger
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Summary Card */}
          <motion.div
            variants={itemVariants}
            className="glassmorphism rounded-lg p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Retry Summary</h3>
                <p className="text-gray-400 mt-1">
                  You have {problemsToRevisit.length} problem{problemsToRevisit.length !== 1 ? 's' : ''} to review
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-dark-300 text-white text-sm">
                  {problemsToRevisit.filter(p => p.difficulty === 'Easy').length} Easy
                </span>
                <span className="px-3 py-1.5 rounded-full bg-dark-300 text-white text-sm">
                  {problemsToRevisit.filter(p => p.difficulty === 'Medium').length} Medium
                </span>
                <span className="px-3 py-1.5 rounded-full bg-dark-300 text-white text-sm">
                  {problemsToRevisit.filter(p => p.difficulty === 'Hard').length} Hard
                </span>
              </div>
            </div>
          </motion.div>
          
          {/* Tag Groups */}
          {tagGroups.map(({ tag, problems }) => (
            <motion.div
              key={tag}
              variants={itemVariants}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2"></span>
                {tag} <span className="text-gray-400 ml-2">({problems.length})</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {problems.map(problem => (
                  <div
                    key={problem.id}
                    className="glassmorphism rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-200">{problem.name}</h4>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`text-xs ${getDifficultyColor(problem.difficulty)} px-2 py-0.5 rounded ${getDifficultyColor(problem.difficulty).replace('text', 'bg').replace('400', '900/40')}`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(problem.solvedAt.toDate())}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {problem.tags
                            .filter(t => t !== tag) // Don't show current tag again
                            .slice(0, 3)
                            .map(tag => (
                              <span key={tag} className="text-xs bg-dark-300 text-gray-300 px-2 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          {problem.tags.length > 4 && (
                            <span className="text-xs text-gray-400">+{problem.tags.length - 4} more</span>
                          )}
                        </div>
                        
                        {problem.notes && (
                          <p className="text-sm text-gray-300 mt-2 border-l-2 border-gray-700 pl-3 line-clamp-2">
                            {problem.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        {problem.link && (
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-neon-cyan text-sm hover:underline"
                          >
                            <ArrowUpRight size={14} className="mr-1" />
                            Open Problem
                          </a>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRevisit(problem.id!)}
                        className="text-sm border-gray-700"
                      >
                        <BookMarked size={14} className="mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RetryList;