import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function PrivateRoute() {
  const { data: user, isLoading, isError } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col gap-4 w-full items-center justify-center p-6">
        {" "}
        <div className="w-64 h-6 bg-gray-200 animate-pulse rounded"></div>{" "}
        <div className="w-48 h-6 bg-gray-200 animate-pulse rounded"></div>{" "}
        <div className="w-80 h-6 bg-gray-200 animate-pulse rounded"></div>{" "}
      </div>
    );
  }
  if (isError || !user) {
    return <Navigate to="/auth" />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { data: user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col gap-4 w-full items-center justify-center p-6">
        {" "}
        <div className="w-64 h-6 bg-gray-200 animate-pulse rounded"></div>{" "}
        <div className="w-48 h-6 bg-gray-200 animate-pulse rounded"></div>{" "}
        <div className="w-80 h-6 bg-gray-200 animate-pulse rounded"></div>{" "}
      </div>
    );
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
