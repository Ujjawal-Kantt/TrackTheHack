import { Navigate, Outlet } from "react-router-dom";
import { useToast } from "../hooks/useToast";

const PrivateRoute = () => {
  const { toast } = useToast();
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    toast({
      title: "Error",
      description: "Please login to access the application",
      variant: "destructive",
    });
  }
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
