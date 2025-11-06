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

const SpecializationSchema = z.object({
  // require at least one non-space character
  specialization: z.string().refine((s) => s.trim().length > 0, {
    message: "Specialization is required",
  }),
});

type SpecializationFormData = z.infer<typeof SpecializationSchema>;

export default function AddSpecialization() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SpecializationFormData>({
    resolver: zodResolver(SpecializationSchema),
  });

  const onSubmit = (data: SpecializationFormData) => {
    console.log(data);
    toast.success("Specialization created successfully!");
    // navigate to the specializations list (consistent with other pages)
    navigate("/hospital/specializations/all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Specialization</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Specialization Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Input id="specialization" {...register("specialization")} />
                {errors.specialization && (
                  <p className="text-sm text-destructive">{errors.specialization.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Create Specialization</Button>
              <Button
                type="button"   
                variant="outline"
                onClick={() => navigate("/hospital/specializations/all")}
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
