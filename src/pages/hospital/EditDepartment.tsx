import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

const DepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
});

type DepartmentFormData = z.infer<typeof DepartmentSchema>;

interface Department {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export default function EditDepartment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState<Department | null>(location.state || null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!location.state);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentSchema),
  });

  // Fetch department data if not passed via location.state
  useEffect(() => {
    if (!department && id) {
      fetchDepartmentData();
    }
  }, []);

  // Set form data when department is loaded
  useEffect(() => {
    if (department) {
      reset({ name: department.name });
      setInitialLoading(false);
    }
  }, [department, reset]);

  const fetchDepartmentData = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`http://${BASE_URL}/departments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === 'success') {
        const foundDepartment = response.data.data.find(
          (dept: Department) => dept.id === parseInt(id!)
        );
        
        if (foundDepartment) {
          setDepartment(foundDepartment);
        } else {
          toast.error("Department not found");
          navigate("/hospital/Departments/all");
        }
      }
    } catch (error) {
      console.error("Error fetching department:", error);
      toast.error("Failed to load department data");
      navigate("/hospital/Departments/all");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      setLoading(true);
      console.log("Updating department:", data);

      const response = await axios.put(
        `http://${BASE_URL}/department/${id}`,
        { name: data.name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Department updated:", response.data);

      if (response.data.status === 'success') {
        toast.success("Department updated successfully!");
        navigate("/hospital/Departments/all");
      } else {
        toast.error("Failed to update department");
      }
    } catch (error: any) {
      console.error("Error updating department:", error);
      const errorMessage = 
        error.response?.data?.message ||
        "Failed to update department";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading department data...</p>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Department not found</p>
          <Button onClick={() => navigate("/hospital/Departments/all")} className="mt-4">
            Back to Departments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Department: {department.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Department"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/Departments/all")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
