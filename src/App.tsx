import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AllUsers from "./pages/users/AllUsers";
import AddUser from "./pages/users/AddUser";
import EditUser from "./pages/users/EditUser";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import HospitalList from "./pages/hospital/HospitalList";
import AddHospital from "./pages/hospital/AddHospital";
import EditHospital from "./pages/hospital/EditHospital";
import Managers from "./pages/hospital/Managers";
import AddManager from "./pages/hospital/AddManager";
import EditManager from "./pages/hospital/EditManager";
import AllVideos from "./pages/videos/AllVideos";
import AddVideo from "./pages/videos/AddVideo";
import EditVideo from "./pages/videos/EditVideo";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AllUsers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddUser />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditUser />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Hospital Routes */}
          <Route
            path="/hospital/list/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <HospitalList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/list/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddHospital />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/list/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditHospital />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/managers/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Managers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/managers/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddManager />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/managers/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditManager />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/doctors/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon title="Doctors" description="Manage doctors" />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/patients/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon title="Patients" description="Manage patients" />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/specializations/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon title="Specializations" description="Manage medical specializations" />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/departments/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon title="Departments" description="Manage hospital departments" />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Other Routes */}
          <Route
            path="/devices/list"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon title="Devices" description="Manage medical devices" />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon title="Categories" description="Manage video categories" />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ComingSoon title="Subscriptions" description="Manage subscription plans" />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AllVideos />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddVideo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditVideo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
