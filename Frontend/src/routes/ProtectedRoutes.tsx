import { useAuthContext } from "@/context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoutes() {
  const { user } = useAuthContext()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}
