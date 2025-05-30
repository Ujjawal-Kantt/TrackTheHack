import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { Button } from "../components/ui/button";
import { getDifficultyColor, formatRelativeTime } from "../lib/utils";
import { Info, ArrowUpRight } from "lucide-react";

type RetryProblem = {
  id: string;
  user_id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time_taken_minutes: number;
  reference_link?: string;
  struggle_level: number;
  used_hint: boolean;
  added_to_retry: boolean;
  notes?: string;
  solved_at: string;
  tags?: string[];
};

const RetryList = () => {
  const { toast } = useToast();
  const [problemsToRevisit, setProblemsToRevisit] = useState<RetryProblem[]>(
    []
  );

  // Fetch retry list from backend
  useEffect(() => {
    const fetchRetryList = async () => {
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken)
          throw new Error("User is not authenticated. Please log in again.");

        const response = await fetch(
          "https://track-the-hack-tau.vercel.app/api/retryList",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch retry list");

        // Add fallback for tags if not present
        setProblemsToRevisit(
          data.map((p: RetryProblem) => ({
            ...p,
            tags: p.tags || [],
          }))
        );
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch retry list",
          variant: "destructive",
        });
      }
    };
    fetchRetryList();
  }, [toast]);

  // Group problems by tags, but also include untagged problems
  const groupProblems = () => {
    const groups: Record<string, RetryProblem[]> = {};
    const untagged: RetryProblem[] = [];
    problemsToRevisit.forEach((problem) => {
      if (problem.tags && problem.tags.length > 0) {
        problem.tags.forEach((tag) => {
          if (!groups[tag]) groups[tag] = [];
          if (!groups[tag].some((p) => p.id === problem.id)) {
            groups[tag].push(problem);
          }
        });
      } else {
        untagged.push(problem);
      }
    });
    return { groups, untagged };
  };

  const { groups, untagged } = groupProblems();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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
          <h2 className="text-2xl font-semibold text-white font-mono">
            Problems to Retry
          </h2>
          <p className="text-gray-400 mt-1">
            Review and practice these problems again
          </p>
        </div>
        <Link to="/problem-logger">
          <Button variant="neon">Log New Problem</Button>
        </Link>
      </div>

      {problemsToRevisit.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="glassmorphism rounded-lg p-8 text-center"
        >
          <Info size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            No problems to retry
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            When you find challenging problems that you want to revisit later,
            mark them for retry in the Problem Logger.
          </p>
          <Link to="/problem-logger">
            <Button variant="neon">Go to Problem Logger</Button>
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
                <h3 className="text-lg font-semibold text-white">
                  Retry Summary
                </h3>
                <p className="text-gray-400 mt-1">
                  You have {problemsToRevisit.length} problem
                  {problemsToRevisit.length !== 1 ? "s" : ""} to review
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-dark-300 text-white text-sm">
                  {
                    problemsToRevisit.filter((p) => p.difficulty === "Easy")
                      .length
                  }{" "}
                  Easy
                </span>
                <span className="px-3 py-1.5 rounded-full bg-dark-300 text-white text-sm">
                  {
                    problemsToRevisit.filter((p) => p.difficulty === "Medium")
                      .length
                  }{" "}
                  Medium
                </span>
                <span className="px-3 py-1.5 rounded-full bg-dark-300 text-white text-sm">
                  {
                    problemsToRevisit.filter((p) => p.difficulty === "Hard")
                      .length
                  }{" "}
                  Hard
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tag Groups */}
          {Object.entries(groups)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([tag, problems]) => (
              <motion.div
                key={tag}
                variants={itemVariants}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2"></span>
                  {tag}{" "}
                  <span className="text-gray-400 ml-2">
                    ({problems.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {problems.map((problem) => (
                    <div
                      key={problem.id}
                      className="glassmorphism rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium text-gray-200">
                            {problem.name}
                          </h4>
                          <div className="flex items-center mt-1 space-x-2">
                            <span
                              className={`text-xs ${getDifficultyColor(
                                problem.difficulty
                              )} px-2 py-0.5 rounded ${getDifficultyColor(
                                problem.difficulty
                              )
                                .replace("text", "bg")
                                .replace("400", "900/40")}`}
                            >
                              {problem.difficulty}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(new Date(problem.solved_at))}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(problem.tags || []).slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-dark-300 text-gray-300 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {problem.tags && problem.tags.length > 4 && (
                              <span className="text-xs text-gray-400">
                                +{problem.tags.length - 4} more
                              </span>
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
                          {problem.reference_link && (
                            <a
                              href={problem.reference_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-neon-cyan text-sm hover:underline"
                            >
                              <ArrowUpRight size={14} className="mr-1" />
                              Open Problem
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

          {/* Untagged Problems */}
          {untagged.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                Untagged{" "}
                <span className="text-gray-400 ml-2">({untagged.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {untagged.map((problem) => (
                  <div
                    key={problem.id}
                    className="glassmorphism rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-200">
                          {problem.name}
                        </h4>
                        <div className="flex items-center mt-1 space-x-2">
                          <span
                            className={`text-xs ${getDifficultyColor(
                              problem.difficulty
                            )} px-2 py-0.5 rounded ${getDifficultyColor(
                              problem.difficulty
                            )
                              .replace("text", "bg")
                              .replace("400", "900/40")}`}
                          >
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(new Date(problem.solved_at))}
                          </span>
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
                        {problem.reference_link && (
                          <a
                            href={problem.reference_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-neon-cyan text-sm hover:underline"
                          >
                            <ArrowUpRight size={14} className="mr-1" />
                            Open Problem
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RetryList;
