import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import { AdminAuthProvider, useAdminAuth } from "./contexts/admin-auth.context";
import { ThemeProvider } from "./contexts/theme.context";
import AdminLogin from "./Components/pages/AdminLogin";
import VerifyEmailSuccess from "./Components/pages/VerifyEmailSuccess";
import AdminDashboard from "./Components/pages/AdminDashboard";
import AdminProtectedRoute from "./Components/AdminProtectedRoute";
import ThemeEditPage from "./Components/pages/ThemeEditPage";
import { AssignedDevelopersProvider } from "./contexts/assign-developer.context";
import { NotificationsProvider } from "./contexts/notification.context";
import { SocketProvider } from "./contexts/socket.context";
import { SupportDevelopersProvider } from "./contexts/supportdeveloper.context";
import { AwsUploadProvider } from "./contexts/aws-upload.context";
import { ThemesProvider } from "./contexts/themes.context";

const App = () => {
  const AuthedApp = () => {
    const { user, token } = useAdminAuth();
    const isAuthed = Boolean(user && token);
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
        {!isAuthed ? (
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/verify-email" element={<VerifyEmailSuccess />} />
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        ) : (
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route path="/admin/profile" element={<></>} />
              <Route path="/admin/client/:userId/analytics" element={<AdminProtectedRoute><></></AdminProtectedRoute>} />
              <Route path="/admin/client/:userId/stores" element={<AdminProtectedRoute><></></AdminProtectedRoute>} />
              <Route path="/admin/client/:userId" element={<AdminProtectedRoute><></></AdminProtectedRoute>} />
              <Route
                path="/admin/themes/edit/:themeId"
                element={
                  <AdminProtectedRoute>
                    <div style={{ marginLeft: 240, padding: 0 }}>
                      {/* Route handled by Navbar */}
                    </div>
                  </AdminProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </>
        )}
      </>
    );
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminAuthProvider>
          <ThemesProvider>
            <AwsUploadProvider>
              <NotificationsProvider>
                <SocketProvider>
                  <SupportDevelopersProvider>
                    <AssignedDevelopersProvider>
                      <AuthedApp />
                    </AssignedDevelopersProvider>
                  </SupportDevelopersProvider>
                </SocketProvider>
              </NotificationsProvider>
            </AwsUploadProvider>
          </ThemesProvider>
        </AdminAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
