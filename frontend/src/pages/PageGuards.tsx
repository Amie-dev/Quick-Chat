import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function PrivateRoute() {
  const { data: user, isLoading, isError } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !user) {
    return <Navigate to="/auth" />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { data: user, isLoading} = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  // if (isError || !user) {
  //   return <Navigate to="/auth" />;
  // }

  return !user ? <Outlet /> : <Navigate to="/chat" />;
}
// export function PrivateRoute() {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   return isAuthenticated ? <Outlet /> : <Navigate to="/auth" />;
// }

// export function GuestRoute() {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   return !isAuthenticated ? <Outlet /> : <Navigate to="/chat" />;
// }
