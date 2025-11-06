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

const SpecializationSchema = z.object({
  specialization: z.string().min(1, "Specialization is required"),
});

type SpecializationFormData = z.infer<typeof SpecializationSchema>;

export default function EditSpecialization() {
  const { id } = useParams();

  const location = useLocation();
  const incoming = location.state as { id?: number; specialization?: string } | undefined;
  const currentValue = incoming?.specialization ?? "";

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SpecializationFormData>({
    resolver: zodResolver(SpecializationSchema),
    defaultValues: { specialization: currentValue },
  });

  const onSubmit = (data: SpecializationFormData) => {
    console.log(data);
    toast.success("Specialization updated successfully!");
    navigate("/hospital/Specializations/all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Specialization #{id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Specialization Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Input id="specialization" {...register("specialization")} />
                {errors.specialization && (
                  <p className="text-sm text-destructive">{errors.specialization.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Specialization</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/Specializations/all")}
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
