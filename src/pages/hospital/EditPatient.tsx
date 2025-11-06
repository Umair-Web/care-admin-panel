import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
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

const PatientSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional(),
    phone: z.string().min(1, "Phone number is required"),
    dob: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    address: z.string().min(1, "Address is required"),
    hospital: z.string().min(1, "Hospital is required"),
    assignedDoctor: z.string().min(1, "Assigned doctor is required"),
  })
  .refine((data) => {
    // only validate match if password provided (edit may not change password)
    if (!data.password && !data.confirmPassword) return true;
    return data.password === data.confirmPassword;
  }, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type PatientFormData = z.infer<typeof PatientSchema>;

export default function EditPatient() {
  const { id } = useParams();
  const location = useLocation();
  const patient = location.state as PatientFormData | undefined;

  // options
  const hospitalOptions = [
    { value: "central", label: "Central Hospital" },
    { value: "northside", label: "Northside Clinic" },
    { value: "westend", label: "Westend Medical" },
  ];

  const doctorOptions = [
    { value: "doctor1", label: "Doctor1 Valov" },
    { value: "doctor2", label: "Doctor2 Johnson" },
  ];

  const navigate = useNavigate();
  const [preview, setPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema),
    defaultValues: {
      firstName: patient?.firstName ?? "",
      lastName: patient?.lastName ?? "",
      email: patient?.email ?? "",
      phone: patient?.phone ?? "",
      dob: patient?.dob ?? "",
      gender: patient?.gender?.toLowerCase() ?? "",
      address: patient?.address ?? "",
      hospital:
        hospitalOptions.find((o) => o.label.toLowerCase() === (patient?.hospital ?? "").toLowerCase())?.value ??
        patient?.hospital?.toString().toLowerCase() ?? "central",
      assignedDoctor:
        doctorOptions.find((d) => d.label.toLowerCase() === (patient?.assignedDoctor ?? "").toLowerCase())?.value ??
        patient?.assignedDoctor?.toString().toLowerCase() ?? "doctor1",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: PatientFormData) => {
    console.log(data);
    toast.success("Patient updated successfully!");
    navigate("/hospital/Patients");
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
                <AvatarImage src={preview} />
                <AvatarFallback>PB</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="image">Profile Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input id="dob" type="date" {...register("dob")} />
                {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
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
                <Input id="address" {...register("address")} />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital *</Label>
                <Controller
                  control={control}
                  name="hospital"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue>{hospitalOptions.find((h) => h.value === field.value)?.label ?? 'Select hospital'}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {hospitalOptions.map((h) => (
                          <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.hospital && <p className="text-sm text-destructive">{errors.hospital.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedDoctor">Assign Doctor *</Label>
                <Controller
                  control={control}
                  name="assignedDoctor"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue>{doctorOptions.find((d) => d.value === field.value)?.label ?? 'Select doctor'}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {doctorOptions.map((d) => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.assignedDoctor && <p className="text-sm text-destructive">{errors.assignedDoctor.message}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" onClick={() => navigate("/hospital/patients/all")}>Update Patient</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/hospital/patients/all")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
