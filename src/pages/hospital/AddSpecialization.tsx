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

const SpecializationSchema = z.object({
  name: z.string().refine((s) => s.trim().length > 0, {
    message: "Specialization name is required",
  }),
});

type SpecializationFormData = z.infer<typeof SpecializationSchema>;

export default function AddSpecialization() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SpecializationFormData>({
    resolver: zodResolver(SpecializationSchema),
  });

  const onSubmit = async (data: SpecializationFormData) => {
    try {
      setLoading(true);
      console.log("Creating specialization:", data);

      const response = await axios.post(
        `http://${BASE_URL}/specialization`,
        { name: data.name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Specialization created:", response.data);

      if (response.data.status === 'success') {
        toast.success("Specialization created successfully!");
        navigate("/hospital/Specializations/all");
      } else {
        toast.error("Failed to create specialization");
      }
    } catch (error: any) {
      console.error("Error creating specialization:", error);
      const errorMessage = 
        error.response?.data?.message ||
        "Failed to create specialization";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
                <Label htmlFor="name">Specialization Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Specialization"}
              </Button>
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
