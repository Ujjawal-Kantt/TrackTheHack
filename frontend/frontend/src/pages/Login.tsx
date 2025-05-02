import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Code, Github } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      // await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast({
        title: "Welcome!",
        description: "You have successfully logged in with Google",
      });
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login Failed",
        description: "Error signing in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      await loginWithGithub();
      toast({
        title: "Welcome!",
        description: "You have successfully logged in with GitHub",
      });
      navigate("/");
    } catch (error) {
      console.error("GitHub login error:", error);
      toast({
        title: "Login Failed",
        description: "Error signing in with GitHub",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full p-8 rounded-xl glassmorphism"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex justify-center items-center w-16 h-16 bg-primary/20 rounded-full mb-4"
          >
            <Code size={32} className="text-neon-cyan" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 text-gray-50 font-mono tracking-tight">
            TrackTheHack
          </h1>
          <p className="text-gray-400">
            Track your coding progress, one problem at a time
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-dark-400/50 border-gray-700"
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-dark-400/50 border-gray-700"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            variant="glow"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="border-gray-700 hover:bg-dark-400"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
                  fill="#4285F4"
                />
                <path
                  d="M10.55 12.556 9.155 13.96l-3.938-3.94L9.154 6.08l1.396 1.403-2.54 2.537 2.54 2.536z"
                  fill="#34A853"
                />
                <path
                  d="M3.915 10.02v1.396h4.938l-1.857 1.857v2.637h-3.08A8.907 8.907 0 0 1 1.174 10.02h2.741z"
                  fill="#FBBC05"
                />
                <path
                  d="M10.02 14.53h-2.11v2.638h-3.08a8.955 8.955 0 0 0 6.117 3.71l1.857-1.858V14.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGithubLogin}
              disabled={loading}
              className="border-gray-700 hover:bg-dark-400"
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-neon-cyan hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
