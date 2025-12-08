import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

const patientSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  hospital_id: z.string().min(1, "Hospital is required"),
  doctor_id: z.string().min(1, "Doctor is required"),
  profile_image: z.any().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface Hospital {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  fullname: string;
  hospital_id: number;
}

export default function AddPatient() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const selectedHospitalId = watch("hospital_id");

  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
  }, []);

  // Filter doctors when hospital changes
  useEffect(() => {
    if (selectedHospitalId && allDoctors.length > 0) {
      const filteredDoctors = allDoctors.filter(
        (doctor) => doctor.hospital_id === parseInt(selectedHospitalId)
      );
      setDoctors(filteredDoctors);
    } else {
      setDoctors([]);
    }
  }, [selectedHospitalId, allDoctors]);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await axios.get(`https://${BASE_URL}/hospitals`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success" && response.data.data) {
        setHospitals(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast.error("Failed to load hospitals");
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await axios.get(`https://${BASE_URL}/doctors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success" && response.data.data) {
        setAllDoctors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("date_of_birth", data.date_of_birth);
      formData.append("gender", data.gender);
      formData.append("address", data.address);
      formData.append("hospital_id", data.hospital_id);
      formData.append("doctor_id", data.doctor_id);
      formData.append("created_by", '1');

      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      console.log("Submitting patient data:", Object.fromEntries(formData));

      const response = await axios.post(
        `https://${BASE_URL}/patient`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Patient creation response:", response.data);

      if (response.data.status === "success") {
        toast.success("Patient added successfully!");
        reset();
        setProfileImage(null);
        setProfileImagePreview("");
        navigate("/hospital/patients/all");
      } else {
        toast.error("Failed to add patient");
      }
    } catch (error: any) {
      console.error("Error adding patient:", error);

      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(`Validation Error: ${errorMessages.join(", ")}`);
      } else {
        toast.error(error.response?.data?.message || "Failed to add patient");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Patient</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImagePreview} />
                <AvatarFallback>PT</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profile_image">Profile Image</Label>
                <Input
                  id="profile_image"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" {...register("first_name")} />
                {errors.first_name && (
                  <p className="text-sm text-destructive">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" {...register("last_name")} />
                {errors.last_name && (
                  <p className="text-sm text-destructive">
                    {errors.last_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register("date_of_birth")}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-destructive">
                    {errors.date_of_birth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  <p className="text-sm text-destructive">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Enter full address"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital_id">Hospital *</Label>
                <Controller
                  name="hospital_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingHospitals
                              ? "Loading hospitals..."
                              : "Select hospital"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((hospital) => (
                          <SelectItem
                            key={hospital.id}
                            value={hospital.id.toString()}
                          >
                            {hospital.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.hospital_id && (
                  <p className="text-sm text-destructive">
                    {errors.hospital_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_id">Doctor *</Label>
                <Controller
                  name="doctor_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedHospitalId || doctors.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedHospitalId
                              ? "Select hospital first"
                              : loadingDoctors
                              ? "Loading doctors..."
                              : doctors.length === 0
                              ? "No doctors available"
                              : "Select doctor"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem
                            key={doctor.id}
                            value={doctor.id.toString()}
                          >
                            {doctor.fullname}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.doctor_id && (
                  <p className="text-sm text-destructive">
                    {errors.doctor_id.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Patient"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/patients")}
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
