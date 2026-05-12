import { Route, Routes } from "react-router-dom";
import LoginPage from './pages/auth/LoginPage/LoginPage'
import SignupPage from './pages/auth/SignupPage/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage/ResetPasswordPage'
import HomePage from "./pages/HomePage/HomePage";
import GuestRoute from "./components/routes/GuestRoute";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout/MainLayout";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";


function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage/>} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<div>Search page</div>} />
          <Route path="/explore" element={<div>Explore page</div>} />
          <Route path="/messages" element={<div>Messages page</div>} />
          <Route path="/notifications" element={<div>Notifications page</div>} />
          <Route path="/create" element={<div>Create page</div>} />
          <Route path="/profile" element={<div>Profile page</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
export default AppRoutes;
