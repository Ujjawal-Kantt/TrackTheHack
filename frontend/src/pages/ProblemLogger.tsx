import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Problem, useProblemStore } from "../store/problemStore";
import { useToast } from "../hooks/useToast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  formatTime,
  getDifficultyColor,
  formatRelativeTime,
} from "../lib/utils";
import {
  Clock,
  Edit2,
  Trash2,
  BookMarked,
  Link as LinkIcon,
  ArrowUpRight,
  Info,
  X,
} from "lucide-react";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;

const INITIAL_TAGS = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Depth-First Search",
  "Breadth-First Search",
  "Backtracking",
  "Binary Search",
  "Graph",
  "SQL",
  "Joins",
  "Indexing",
  "Tree",
  "Two Pointers",
];

const ProblemLogger = () => {
  const { toast } = useToast();

  // Form state
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Medium"
  );
  const [timeTaken, setTimeTaken] = useState(30);
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [strugglelevel, setStruggleLevel] = useState(3);
  const [usedHelp, setUsedHelp] = useState(false);
  const [needsRevisit, setNeedsRevisit] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>(INITIAL_TAGS);
  const [newTag, setNewTag] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);

  // Edit state
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  // Fetch problems from the API
  const fetchProblemsFromAPI = async () => {
    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        throw new Error("User is not authenticated. Please log in again.");
      }

      const response = await fetch(
        "https://track-the-hack-tau.vercel.app/api/problems/get-problems",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch problems");
      }

      // Ensure all problems have a `tags` property and assign points based on difficulty
      const processedData = data.map((problem: Problem) => ({
        ...problem,
        tags: problem.tags || [], // Default to an empty array if `tags` is undefined
        points:
          problem.difficulty === "Easy"
            ? 1
            : problem.difficulty === "Medium"
            ? 3
            : problem.difficulty === "Hard"
            ? 5
            : 0,
      }));
      setProblems(processedData);
    } catch (error: any) {
      console.error("Error fetching problems:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch problems",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchProblemsFromAPI();
  }, []);

  // Extract unique tags from problems for filter options
  useEffect(() => {
    if (problems.length > 0) {
      const uniqueTags = new Set<string>();

      // Add initial tags
      INITIAL_TAGS.forEach((tag) => uniqueTags.add(tag));

      // Add tags from problems
      problems.forEach((problem) => {
        problem.tags.forEach((tag) => uniqueTags.add(tag));
      });

      setAvailableTags(Array.from(uniqueTags).sort());
    }
  }, [problems]);

  // Reset form
  const resetForm = () => {
    setName("");
    setDifficulty("Medium");
    setTimeTaken(30);
    setNotes("");
    setLink("");
    setTags([]);
    setStruggleLevel(3);
    setUsedHelp(false);
    setNeedsRevisit(false);
    setEditingProblemId(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast({
        title: "Error",
        description: "Problem name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        throw new Error("User is not authenticated. Please log in again.");
      }

      const problemData = {
        name,
        difficulty,
        time_taken_minutes: timeTaken,
        reference_link: link || null,
        struggle_level: strugglelevel,
        used_hint: usedHelp,
        added_to_retry: needsRevisit,
        notes: notes || null,
        solved_at: new Date().toISOString(),
        tags,
      };

      const response = await fetch(
        "https://track-the-hack-tau.vercel.app/api/problems/log",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(problemData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log the problem");
      }
      if (needsRevisit) {
        const respone = await fetch(
          "https://track-the-hack-tau.vercel.app/api/retryList",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ problem_id: data.problemId }),
          }
        );
        if (respone.ok) {
          toast({
            title: "Problem Logged and Added to Retry List",
            description: `Problem "${problemData.name}" has been logged and added to your retry list!`,
          });
        }
        if (!respone.ok) {
          toast({
            title: "Error",
            description: "Failed to add problem to retry list",
            variant: "destructive",
          });
        }
      }
      if (!needsRevisit) {
        toast({
          title: "Problem Logged",
          description: `Problem "${problemData.name}" has been logged successfully!`,
        });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error logging problem:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to log the problem",
        variant: "destructive",
      });
    }
  };
  // Open edit modal
  const handleEdit = (problem: Problem) => {
    setEditingProblemId(problem.id);
    setName(problem.name);
    setDifficulty(problem.difficulty);
    setTimeTaken(problem.timeTaken);
    setNotes(problem.notes);
    setLink(problem.reference_link || "");
    setTags(problem.tags);
    setStruggleLevel(problem.struggleLevel);
    setUsedHelp(problem.usedHelp);
    setNeedsRevisit(problem.needsRevisit);
    setIsModalOpen(true);
  };

  // Handle delete problem
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      try {
        await deleteProblem(id);
        toast({
          title: "Problem Deleted",
          description: "Problem has been deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting problem:", error);
        toast({
          title: "Error",
          description: "Failed to delete problem",
          variant: "destructive",
        });
      }
    }
  };

  // Handle toggle revisit
  const handleToggleRevisit = async (id: string, currentValue: boolean) => {
    try {
      await toggleRevisit(id, !currentValue);
      toast({
        title: !currentValue
          ? "Added to Retry List"
          : "Removed from Retry List",
        description: !currentValue
          ? "This problem has been added to your retry list"
          : "This problem has been removed from your retry list",
      });
    } catch (error) {
      console.error("Error toggling revisit:", error);
      toast({
        title: "Error",
        description: "Failed to update problem",
        variant: "destructive",
      });
    }
  };

  // Add new tag
  const handleAddTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags((prev) => [...prev, newTag].sort());
      setNewTag("");
    }
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    if (tagsFilter.includes(tag)) {
      setTagsFilter(tagsFilter.filter((t) => t !== tag));
    } else {
      setTagsFilter([...tagsFilter, tag]);
    }
  };
  // Filter problems based on search and filters
  const filteredProblems = problems.filter((problem) => {
    // Search term filter
    const matchesSearch =
      searchTerm === "" ||
      problem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.notes.toLowerCase().includes(searchTerm.toLowerCase());

    // Difficulty filter
    const matchesDifficulty =
      difficultyFilter === "All" || problem.difficulty === difficultyFilter;

    // Tags filter
    const matchesTags =
      tagsFilter.length === 0 ||
      tagsFilter.some((tag) => problem.tags.includes(tag));

    return matchesSearch && matchesDifficulty && matchesTags;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold font-mono text-white">
              Problem Logger
            </h2>
            <p className="text-gray-400 mt-1">
              Track and log your solved problems
            </p>
          </div>

          <Button
            variant="neon"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            id="log-problem-modal"
          >
            Log New Problem
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 glassmorphism rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <Input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-400/50 border-gray-700"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full h-9 rounded-md border border-gray-700 bg-dark-400/50 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="All">All Difficulties</option>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                className="w-full h-9 rounded-md border border-gray-700 bg-dark-400/50 px-3 py-1 text-sm text-left focus:outline-none focus:ring-1 focus:ring-primary"
                onClick={() =>
                  document
                    .getElementById("tag-filter-dropdown")
                    ?.classList.toggle("hidden")
                }
              >
                {tagsFilter.length === 0
                  ? "Filter by tags..."
                  : `${tagsFilter.length} tag${
                      tagsFilter.length > 1 ? "s" : ""
                    } selected`}
              </button>

              <div
                id="tag-filter-dropdown"
                className="hidden absolute z-10 mt-1 w-full rounded-md bg-dark-300 shadow-lg border border-gray-700 p-2 max-h-60 overflow-y-auto custom-scrollbar"
              >
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTagFilter(tag)}
                      className={`px-2 py-1 rounded-md text-xs ${
                        tagsFilter.includes(tag)
                          ? "bg-primary text-white"
                          : "bg-dark-400 text-gray-300 hover:bg-dark-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(difficultyFilter !== "All" || tagsFilter.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-sm text-gray-400">Active filters:</span>

              {difficultyFilter !== "All" && (
                <span className="bg-dark-300 text-gray-300 px-2 py-1 rounded-md text-xs flex items-center">
                  {difficultyFilter}
                  <button
                    type="button"
                    onClick={() => setDifficultyFilter("All")}
                    className="ml-1 text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}

              {tagsFilter.map((tag) => (
                <span
                  key={tag}
                  className="bg-dark-300 text-gray-300 px-2 py-1 rounded-md text-xs flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => toggleTagFilter(tag)}
                    className="ml-1 text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={() => {
                  setDifficultyFilter("All");
                  setTagsFilter([]);
                }}
                className="text-xs text-primary hover:text-primary/80"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Problems List */}
        {problems.length === 0 ? (
          <div className="text-center py-12">
            <Info size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No problems logged yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start tracking your progress by logging your first problem.
            </p>
            <Button
              variant="neon"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Log Your First Problem
            </Button>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-12">
            <Info size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No matching problems found
            </h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("All");
                setTagsFilter([]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredProblems.map((problems) => (
              <motion.div
                key={problems.id}
                variants={itemVariants}
                className="glassmorphism rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-lg text-white">
                        {problems.name}
                      </h3>
                      <span
                        className={`text-xs ${getDifficultyColor(
                          problems.difficulty
                        )} px-2 py-0.5 rounded ${getDifficultyColor(
                          problems.difficulty
                        )
                          .replace("text", "bg")
                          .replace("400", "900/40")}`}
                      >
                        {problems.difficulty}
                      </span>
                      {problems.needsRevisit && (
                        <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-md">
                          Revisit
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-2">
                      {/* Tags */}
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {(problems.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-dark-300 text-gray-300 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Problem Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {formatTime(problems.timeTaken)}
                        </span>
                        <span>
                          {/* {formatRelativeTime(problems.solvedAt.toDate())} */}
                        </span>
                        <div className="flex items-center gap-2">
                          {problems.reference_link && (
                            <a
                              href={problems.reference_link}
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

                      {/* Notes (if any) */}
                      {problems.notes && (
                        <p className="text-sm text-gray-300 mt-2 border-l-2 border-gray-700 pl-3">
                          {problems.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center mt-4 md:mt-0 gap-2">
                    <span className="bg-primary/20 text-white px-3 py-1 rounded-md font-mono">
                      +{problems.points} pts
                    </span>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        // onClick={() =>
                        //   handleToggleRevisit(problems.id!, problems.needsRevisit)
                        // }
                        className={`h-8 w-8 ${
                          problems.needsRevisit
                            ? "text-neon-cyan"
                            : "text-gray-400"
                        }`}
                        title={
                          problems.needsRevisit
                            ? "Remove from retry list"
                            : "Add to retry list"
                        }
                      >
                        <BookMarked size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        // onClick={() => handleEdit(problem)}
                        className="h-8 w-8 text-gray-400"
                        title="Edit problem"
                      >
                        <Edit2 size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        // onClick={() => handleDelete(problem.id!)}
                        className="h-8 w-8 text-gray-400"
                        title="Delete problem"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Problem Logger Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-dark-100 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-800 glassmorphism"
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-6 text-white font-mono">
              {editingProblemId ? "Edit Problem" : "Log New Problem"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Problem Name */}
              <div>
                <label
                  htmlFor="problem-name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Problem Name *
                </label>
                <Input
                  id="problem-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="LeetCode #217: Contains Duplicate"
                  className="bg-dark-400/50 border-gray-700"
                  required
                />
              </div>

              {/* Difficulty and Time Taken */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="difficulty"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value as "Easy" | "Medium" | "Hard"
                      )
                    }
                    className="w-full rounded-md border border-gray-700 bg-dark-400/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="time-taken"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Time Taken (minutes)
                  </label>
                  <Input
                    id="time-taken"
                    type="number"
                    min="1"
                    value={timeTaken}
                    onChange={(e) => setTimeTaken(parseInt(e.target.value))}
                    className="bg-dark-400/50 border-gray-700"
                  />
                </div>
              </div>

              {/* Reference Link */}
              <div>
                <label
                  htmlFor="link"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Reference Link (optional)
                </label>
                <Input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://leetcode.com/problems/contains-duplicate/"
                  className="bg-dark-400/50 border-gray-700"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      // onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 rounded-md text-xs ${
                        tags.includes(tag)
                          ? "bg-primary text-white"
                          : "bg-dark-400 text-gray-300 hover:bg-dark-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag..."
                    className="bg-dark-400/50 border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    // onClick={handleAddTag}
                    disabled={!newTag}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Struggle Level and Used Help */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="struggle-level"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Struggle Level (1-5)
                  </label>
                  <div className="flex items-center">
                    <input
                      id="struggle-level"
                      type="range"
                      min="1"
                      max="5"
                      value={strugglelevel}
                      onChange={(e) =>
                        setStruggleLevel(parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-dark-400 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <span className="ml-2 text-white">{strugglelevel}</span>
                  </div>
                </div>

                <div className="flex flex-col pt-6">
                  <div className="flex items-center mb-2">
                    <input
                      id="used-help"
                      type="checkbox"
                      checked={usedHelp}
                      onChange={(e) => setUsedHelp(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <label
                      htmlFor="used-help"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Used hints/solutions
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="needs-revisit"
                      type="checkbox"
                      checked={needsRevisit}
                      onChange={(e) => setNeedsRevisit(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <label
                      htmlFor="needs-revisit"
                      className="ml-2 text-sm text-gray-300"
                    >
                      Add to retry list
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes, approach, and thoughts about the problem..."
                  className="w-full rounded-md border border-gray-700 bg-dark-400/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="glow">
                  {editingProblemId ? "Update Problem" : "Log Problem"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ProblemLogger;
