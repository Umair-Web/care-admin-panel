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

const DoctorSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().optional(),
    phone: z.string().min(1, "Phone number is required"),
    experience: z.string().optional(),
    joiningDate: z.string().min(1, "Joining date is required"),
    specialization: z.string().min(1, "Specialization is required"),
    hospital: z.string().min(1, "Hospital is required"),
  })
  .refine((data) => {
    // only validate match if password provided (edit may not change password)
    if (!data.password && !data.confirmPassword) return true;
    return data.password === data.confirmPassword;
  }, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type DoctorFormData = z.infer<typeof DoctorSchema>;

export default function EditDoctor() {
  const { id } = useParams();
  const location = useLocation();
  const doctor = location.state as DoctorFormData | undefined;
  console.log("Editing doctor:", doctor);
  // Options for selects (value keys + display labels)
  const specializationOptions = [
    { value: "cardiology", label: "Cardiology" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "neurology", label: "Neurology" },
    { value: "general", label: "General" },
  ];

  const hospitalOptions = [
    { value: "central", label: "Central Hospital" },
    { value: "northside", label: "Northside Clinic" },
    { value: "westend", label: "Westend Medical" },
  ];
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string>("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(DoctorSchema),
    // map incoming doctor label values (e.g. "Cardiology") to option value keys (e.g. "cardiology")
    defaultValues: {
      firstName: doctor?.firstName ?? "John",
      lastName: doctor?.lastName ?? "Smith",
      email: doctor?.email ?? "john.smith@hospital.com",
      phone: doctor?.phone ?? "+1-555-0201",
      experience: doctor?.experience ?? "5 years",
      joiningDate: doctor?.joiningDate ?? "2020-01-15",
      specialization:
        // prefer mapping incoming label to option value, fallback to doctor's value or 'general'
        specializationOptions.find(
          (o) => o.label.toLowerCase() === (doctor?.specialization ?? "").toLowerCase()
        )?.value ?? doctor?.specialization?.toString().toLowerCase() ?? "general",
      hospital:
        hospitalOptions.find(
          (o) => o.label.toLowerCase() === (doctor?.hospital ?? "").toLowerCase()
        )?.value ?? doctor?.hospital?.toString().toLowerCase() ?? "central",
    },
  });

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

  const onSubmit = (data: DoctorFormData) => {
    console.log(data);
    toast.success("Doctor updated successfully!");
    navigate("/hospital/Doctors/all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Doctor #{id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={preview} />
                <AvatarFallback>JS</AvatarFallback>
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
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
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
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input id="experience" {...register("experience")} />
                {errors.experience && (
                  <p className="text-sm text-destructive">{errors.experience.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date *</Label>
                <Input id="joiningDate" type="date" {...register("joiningDate")} />
                {errors.joiningDate && (
                  <p className="text-sm text-destructive">{errors.joiningDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Controller
                  control={control}
                  name="specialization"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue>
                              {specializationOptions.find((s) => s.value === field.value)?.label ??
                                "Select specialization"}
                            </SelectValue>
                          </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.specialization && (
                  <p className="text-sm text-destructive">{errors.specialization.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital *</Label>
                <Controller
                  control={control}
                  name="hospital"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue>
                          {hospitalOptions.find((h) => h.value === field.value)?.label ??
                            "Select hospital"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="central">Central Hospital</SelectItem>
                        <SelectItem value="northside">Northside Clinic</SelectItem>
                        <SelectItem value="westend">Westend Medical</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.hospital && (
                  <p className="text-sm text-destructive">{errors.hospital.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Doctor</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/Doctors/all")}
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
