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

const SpecializationSchema = z.object({
  name: z.string().min(1, "Specialization name is required"),
});

type SpecializationFormData = z.infer<typeof SpecializationSchema>;

interface Specialization {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export default function EditSpecialization() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [specialization, setSpecialization] = useState<Specialization | null>(location.state || null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!location.state);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SpecializationFormData>({
    resolver: zodResolver(SpecializationSchema),
  });

  // Fetch specialization data if not passed via location.state
  useEffect(() => {
    if (!specialization && id) {
      fetchSpecializationData();
    }
  }, []);

  // Set form data when specialization is loaded
  useEffect(() => {
    if (specialization) {
      reset({ name: specialization.name });
      setInitialLoading(false);
    }
  }, [specialization, reset]);

  const fetchSpecializationData = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`http://${BASE_URL}/specializations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === 'success') {
        const foundSpecialization = response.data.data.find(
          (spec: Specialization) => spec.id === parseInt(id!)
        );
        
        if (foundSpecialization) {
          setSpecialization(foundSpecialization);
        } else {
          toast.error("Specialization not found");
          navigate("/hospital/Specializations/all");
        }
      }
    } catch (error) {
      console.error("Error fetching specialization:", error);
      toast.error("Failed to load specialization data");
      navigate("/hospital/Specializations/all");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: SpecializationFormData) => {
    try {
      setLoading(true);
      console.log("Updating specialization:", data);

      const response = await axios.put(
        `http://${BASE_URL}/specialization/${id}`,
        { name: data.name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Specialization updated:", response.data);

      if (response.data.status === 'success') {
        toast.success("Specialization updated successfully!");
        navigate("/hospital/Specializations/all");
      } else {
        toast.error("Failed to update specialization");
      }
    } catch (error: any) {
      console.error("Error updating specialization:", error);
      const errorMessage = 
        error.response?.data?.message ||
        "Failed to update specialization";
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
          <p className="mt-2 text-muted-foreground">Loading specialization data...</p>
        </div>
      </div>
    );
  }

  if (!specialization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Specialization not found</p>
          <Button onClick={() => navigate("/hospital/Specializations/all")} className="mt-4">
            Back to Specializations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Specialization: {specialization.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Specialization Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
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
                {loading ? "Updating..." : "Update Specialization"}
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
