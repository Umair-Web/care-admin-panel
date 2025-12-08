import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

interface Specialization {
  id: number;
  name: string;
}

interface Hospital {
  id: number;
  name: string;
}

const doctorSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  experience: z.string().min(1, "Experience is required"),
  specialization_id: z.string().min(1, "Specialization is required"),
  hospital_id: z.string().min(1, "Hospital is required"),
  joining_date: z.string().min(1, "Joining date is required"),
  profile_image: z.any().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

export default function AddDoctor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(true);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
  });

  useEffect(() => {
    fetchSpecializations();
    fetchHospitals();
  }, []);

  const fetchSpecializations = async () => {
    try {
      setSpecializationsLoading(true);
      const response = await axios.get(`https://${BASE_URL}/specializations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Specializations response:", response.data);
      if (response.data.status === 'success' && response.data.data) {
        setSpecializations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Failed to load specializations");
    } finally {
      setSpecializationsLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      setHospitalsLoading(true);
      const response = await axios.get(`https://${BASE_URL}/hospitals`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Hospitals response:", response.data);
      if (response.data.status === 'success' && response.data.data) {
        setHospitals(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast.error("Failed to load hospitals");
    } finally {
      setHospitalsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: DoctorFormData) => {
    try {
      setLoading(true);
      console.log("Creating doctor:", data);

      const formData = new FormData();
      formData.append("fullname", data.fullname);
      formData.append("gender", data.gender);
      formData.append("email", data.email);
      formData.append("phone_number", data.phone_number);
      formData.append("experience", data.experience);
      formData.append("specialization_id", data.specialization_id);
      formData.append("hospital_id", data.hospital_id);
      formData.append("joining_date", data.joining_date);
      formData.append("created_by", "1"); // Doctor role ID
      
      // Add current user as creator (you may need to get this from your auth context)
      const currentUser = authStorage.getUser();
      if (currentUser?.id) {
        formData.append("created_by", currentUser.id.toString());
      }

      const imageFile = data.profile_image?.[0];
      if (imageFile) {
        formData.append("profile_image", imageFile);
      }

      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(`https://${BASE_URL}/doctor`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        },
        timeout: 600000, // 10 minutes for large files
      });

      console.log("Doctor created:", response.data);

      if (response.data.status === 'success') {
        toast.success("Doctor created successfully!");
        reset();
        setPreview("");
        navigate("/hospital/doctors/all");
      } else {
        toast.error("Failed to create doctor");
      }
    } catch (error: any) {
      console.error("Error creating doctor:", error);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach(key => {
          toast.error(`${key}: ${validationErrors[key][0]}`);
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to create doctor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Doctor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Image */}
            <div className="flex items-center gap-4 mb-6">
             <Avatar className="h-24 w-24">
                <AvatarImage src={preview} />
                <AvatarFallback>DI</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profile_image">Profile Image</Label>
                <Input 
                  id="profile_image" 
                  type="file" 
                  accept="image/*" 
                  {...register("profile_image")}
                  onChange={(e) => {
                    register("profile_image").onChange?.(e);
                    handleImageChange(e);
                  }}
                />
                {errors.profile_image && (
                  <p className="text-sm text-destructive">
                    {typeof errors.profile_image.message === "string"
                      ? errors.profile_image.message
                      : "Profile image error"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name *</Label>
                <Input id="fullname" {...register("fullname")} />
                {errors.fullname && (
                  <p className="text-sm text-destructive">{errors.fullname.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input id="phone_number" {...register("phone_number")} />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">{errors.phone_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years) *</Label>
                <Input id="experience" type="number" min="0" {...register("experience")} />
                {errors.experience && (
                  <p className="text-sm text-destructive">{errors.experience.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date *</Label>
                <Input id="joining_date" type="date" {...register("joining_date")} />
                {errors.joining_date && (
                  <p className="text-sm text-destructive">{errors.joining_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization_id">Specialization *</Label>
                <Controller
                  name="specialization_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          specializationsLoading 
                            ? "Loading specializations..." 
                            : specializations.length === 0 
                            ? "No specializations available" 
                            : "Select specialization"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {!specializationsLoading && specializations.length > 0 && (
                          specializations.map((specialization) => (
                            <SelectItem key={specialization.id} value={specialization.id.toString()}>
                              {specialization.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.specialization_id && (
                  <p className="text-sm text-destructive">{errors.specialization_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital_id">Hospital *</Label>
                <Controller
                  name="hospital_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          hospitalsLoading 
                            ? "Loading hospitals..." 
                            : hospitals.length === 0 
                            ? "No hospitals available" 
                            : "Select hospital"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {!hospitalsLoading && hospitals.length > 0 && (
                          hospitals.map((hospital) => (
                            <SelectItem key={hospital.id} value={hospital.id.toString()}>
                              {hospital.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.hospital_id && (
                  <p className="text-sm text-destructive">{errors.hospital_id.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Doctor"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/doctors")}
                disabled={loading}
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
