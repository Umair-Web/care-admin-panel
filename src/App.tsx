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
import Doctors from "./pages/hospital/Doctors";
import EditDoctor from "./pages/hospital/EditDoctor";
import AddDoctor from "./pages/hospital/AddDoctor";
import Patient from "./pages/hospital/Patient";
import AddPatient from "./pages/hospital/AddPatient";
import Specializations from "./pages/hospital/Specializations";
import EditSpecialization from "./pages/hospital/EditSpecialization";
import Departments from "./pages/hospital/Departments";
import AddDepartment from "./pages/hospital/AddDepartment";
import EditDepartment from "./pages/hospital/EditDepartment";
import AllVideos from "./pages/videos/AllVideos";
import AddVideo from "./pages/videos/AddVideo";
import EditVideo from "./pages/videos/EditVideo";
import EditPatient from "./pages/hospital/EditPatient";
import AllDevices from "./pages/devices/AllDevices";
import AddCategory from "./pages/category/AddCategory";
import AllCategories from "./pages/category/AllCategories";
import EditCategories from "./pages/category/EditCategories";
import AddSpecialization from "./pages/hospital/AddSpecialization";
import AddSubscription from "./pages/category/AddCategory";

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
                  <Doctors />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/doctors/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditDoctor />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/doctors/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddDoctor />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* =========== Patients =========== */}
          <Route
            path="/hospital/patients/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Patient />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

           <Route
            path="/hospital/patients/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddPatient />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital/patients/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditPatient />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================Specializations================= */}
          <Route
            path="/hospital/specializations/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                 <Specializations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/specializations/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditSpecialization />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital/specializations/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddSpecialization />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

 {/* ==================Departments================= */}
          <Route
            path="/hospital/departments/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Departments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital/departments/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EditDepartment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital/departments/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddDepartment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Other Routes */}
          {/* ===========Devices========== */}
          <Route
            path="/devices/list"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AllDevices />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
              
        
          {/* =======All categories======= */}
          <Route
            path="/categories/all"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AllCategories />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/add"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddCategory />
                </DashboardLayout>
              </ProtectedRoute>
            }
            
          />

          <Route
            path="/categories/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                 <EditCategories />
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
