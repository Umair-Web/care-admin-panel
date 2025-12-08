import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

const patientSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  hospital_id: z.string().min(1, "Hospital is required"),
  doctor_id: z.string().min(1, "Doctor is required"),
  profile_image: z.any().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface Patient {
  id: number;
  user_id: number;
  date_of_birth: string;
  gender?: string;
  address?: string;
  hospital_id?: number;
  doctor_id?: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  hospital?: {
    id: number;
    name: string;
  };
  doctor?: {
    id: number;
    fullname: string;
  };
}

interface Hospital {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  fullname: string;
  hospital_id: number;
}

export default function EditPatient() {
  const { id } = useParams();
  const location = useLocation();
  const patient = location.state?.patient as Patient | undefined;
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
    setValue,
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      date_of_birth: "",
      gender: "",
      address: "",
      hospital_id: "",
      doctor_id: "",
    },
  });

  const selectedHospitalId = watch("hospital_id");
  const selectedDoctorId = watch("doctor_id");

  // Debug current form values
  useEffect(() => {
    console.log("Current form values - Hospital:", selectedHospitalId, "Doctor:", selectedDoctorId);
  }, [selectedHospitalId, selectedDoctorId]);

  // Format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  // Get image URL with proper Laravel storage handling
  const getImageUrl = (profileImage?: string): string => {
    if (!profileImage) return "";
    
    // If already starts with https or httpss, return as is
    if (profileImage.startsWith('https')) {
      return profileImage;
    }
    
    // If starts with /storage, prepend base URL only
    if (profileImage.startsWith('/storage')) {
      return `https://${BASE_URL}${profileImage}`;
    }
    
    // If starts with assets/, it's in public directory (no /storage/ prefix needed)
    if (profileImage.startsWith('assets/')) {
      return `https://${BASE_URL}/${profileImage}`;
    }
    
    // For other formats (profile_images/, etc.), add /storage/ prefix
    return `https://${BASE_URL}/storage/${profileImage}`;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    return "PT";
  };

  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
  }, []);

  // Set hospital and doctor after data is loaded
  useEffect(() => {
    if (patient && hospitals.length > 0 && allDoctors.length > 0) {
      console.log("Resetting form with patient data:");
      console.log("Patient hospital_id:", patient.hospital_id);
      console.log("Patient doctor_id:", patient.doctor_id);
      
      const formData = {
        first_name: patient.user?.first_name || "",
        last_name: patient.user?.last_name || "",
        email: patient.user?.email || "",
        date_of_birth: formatDateForInput(patient.date_of_birth),
        gender: patient.gender || "",
        address: patient.address || "",
        hospital_id: patient.hospital_id ? patient.hospital_id.toString() : "",
        doctor_id: patient.doctor_id ? patient.doctor_id.toString() : "",
      };
      
      console.log("Form data to reset with:", formData);
      reset(formData);
      
      // Set profile image preview
      if (patient.user?.profile_image) {
        setProfileImagePreview(getImageUrl(patient.user.profile_image));
      }
    }
  }, [patient, hospitals, allDoctors, reset]);

  // Filter doctors when hospital changes
  useEffect(() => {
    if (selectedHospitalId && allDoctors.length > 0) {
      console.log("Filtering doctors for hospital:", selectedHospitalId);
      const filteredDoctors = allDoctors.filter(
        doctor => doctor.hospital_id === parseInt(selectedHospitalId)
      );
      console.log("Filtered doctors:", filteredDoctors.map(d => ({ id: d.id, name: d.fullname })));
      setDoctors(filteredDoctors);
      
      // Clear doctor selection if current doctor doesn't belong to selected hospital
      if (selectedDoctorId) {
        const isDoctorInHospital = filteredDoctors.some(d => d.id.toString() === selectedDoctorId);
        if (!isDoctorInHospital) {
          setValue("doctor_id", "");
        }
      }
    } else {
      setDoctors([]);
      if (selectedDoctorId) {
        setValue("doctor_id", "");
      }
    }
  }, [selectedHospitalId, allDoctors, selectedDoctorId, setValue]);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await axios.get(`https://${BASE_URL}/hospitals`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === 'success' && response.data.data) {
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

      if (response.data.status === 'success' && response.data.data) {
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
    if (!patient?.id) {
      toast.error("Patient ID not found");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      if (data.password) {
        formData.append("password", data.password);
      }
      formData.append("date_of_birth", data.date_of_birth);
      formData.append("gender", data.gender);
      formData.append("address", data.address);
      formData.append("hospital_id", data.hospital_id);
      formData.append("doctor_id", data.doctor_id);
      formData.append("created_by", '1');
      formData.append("_method", "PUT");

      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      console.log("Updating patient:", patient.id);

      const response = await axios.post(`https://${BASE_URL}/patient/${patient.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Patient update response:", response.data);

      if (response.data.status === 'success') {
        toast.success("Patient updated successfully!");
        navigate("/hospital/patients/all");
      } else {
        toast.error("Failed to update patient");
      }
    } catch (error: any) {
      console.error("Error updating patient:", error);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(`Validation Error: ${errorMessages.join(", ")}`);
      } else {
        toast.error(error.response?.data?.message || "Failed to update patient");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Patient #{id}</h1>
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
                <AvatarFallback>
                  {patient?.user?.first_name && patient?.user?.last_name 
                    ? getInitials(patient.user.first_name, patient.user.last_name)
                    : "PT"
                  }
                </AvatarFallback>
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
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" {...register("last_name")} />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (Leave empty to keep current)</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue>{field.value ? field.value[0].toUpperCase() + field.value.slice(1) : 'Select gender'}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea 
                  id="address" 
                  {...register("address")} 
                  placeholder="Enter full address"
                  rows={3}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital_id">Hospital *</Label>
                <Controller
                  control={control}
                  name="hospital_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue>
                          {field.value && hospitals.length > 0
                            ? hospitals.find(h => h.id.toString() === field.value)?.name || "Select hospital"
                            : loadingHospitals 
                              ? "Loading hospitals..." 
                              : "Select hospital"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id.toString()}>
                            {hospital.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.hospital_id && <p className="text-sm text-destructive">{errors.hospital_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_id">Assign Doctor *</Label>
                <Controller
                  control={control}
                  name="doctor_id"
                  render={({ field }) => {
                    const currentDoctor = allDoctors.find(d => d.id.toString() === field.value);
                    return (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedHospitalId}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {field.value && currentDoctor
                              ? currentDoctor.fullname
                              : !selectedHospitalId 
                                ? "Select hospital first" 
                                : loadingDoctors 
                                  ? "Loading doctors..." 
                                  : doctors.length === 0
                                    ? "No doctors available for this hospital"
                                    : "Select doctor"
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.fullname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.doctor_id && <p className="text-sm text-destructive">{errors.doctor_id.message}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Patient"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/hospital/patients")}
                disabled={isLoading}
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
