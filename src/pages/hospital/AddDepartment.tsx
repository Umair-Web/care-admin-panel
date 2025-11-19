import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
  name: z.string().refine((s) => s.trim().length > 0, {
    message: "Department name is required",
  }),
});

type DepartmentFormData = z.infer<typeof DepartmentSchema>;

export default function AddDepartment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentSchema),
  });

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      setLoading(true);
      console.log("Creating department:", data);

      const response = await axios.post(
        `http://${BASE_URL}/department`,
        { name: data.name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Department created:", response.data);

      if (response.data.status === 'success') {
        toast.success("Department created successfully!");
        navigate("/hospital/Departments/all");
      } else {
        toast.error("Failed to create department");
      }
    } catch (error: any) {
      console.error("Error creating department:", error);
      const errorMessage = 
        error.response?.data?.message ||
        "Failed to create department";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Department</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                {loading ? "Creating..." : "Create Department"}
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
