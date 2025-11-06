import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const DepartmentSchema = z.object({
  Department: z.string().min(1, "Department is required"),
});

type DepartmentFormData = z.infer<typeof DepartmentSchema>;

export default function EditDepartment() {
  const { id } = useParams();

  const location = useLocation();
  const incoming = location.state as { id?: number; Department?: string } | undefined;
  const currentValue = incoming?.Department ?? "";

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: { Department: currentValue },
  });

  const onSubmit = (data: DepartmentFormData) => {
    console.log(data);
    toast.success("Department updated successfully!");
    navigate("/hospital/Departments/all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Department #{id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Department">Department *</Label>
                <Input id="Department" {...register("Department")} />
                {errors.Department && (
                  <p className="text-sm text-destructive">{errors.Department.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Department</Button>
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
