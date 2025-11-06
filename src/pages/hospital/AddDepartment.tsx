import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// select components removed (not used in this simplified form)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const DepartmentSchema = z.object({
  // require at least one non-space character
  Department: z.string().refine((s) => s.trim().length > 0, {
    message: "Department is required",
  }),
});

type DepartmentFormData = z.infer<typeof DepartmentSchema>;

export default function AddDepartment() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentSchema),
  });

  const onSubmit = (data: DepartmentFormData) => {
    console.log(data);
    toast.success("Department created successfully!");
    // navigate to the Departments list (consistent with other pages)
    navigate("/hospital/Departments/all");
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
                <Label htmlFor="Department">Department *</Label>
                <Input id="Department" {...register("Department")} />
                {errors.Department && (
                  <p className="text-sm text-destructive">{errors.Department.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Create Department</Button>
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
