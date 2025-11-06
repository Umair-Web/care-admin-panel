import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";

const DoctorSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
    phone: z.string().min(1, "Phone number is required"),
    experience: z.string().optional(),
    joiningDate: z.string().min(1, "Joining date is required"),
    specialization: z.string().min(1, "Specialization is required"),
    hospital: z.string().min(1, "Hospital is required"),
    createdBy: z.string().min(1, "Created by is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type DoctorFormData = z.infer<typeof DoctorSchema>;

export default function AddDoctor() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(DoctorSchema),
  });

  const onSubmit = (data: DoctorFormData) => {
    console.log(data);
    toast.success("Doctor created successfully!");
    navigate("/Doctor/list/all");
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
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
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
                <Input id="experience" {...register("experience")} placeholder="e.g. 5 years" />
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
                        <SelectValue placeholder="Select specialization" />
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
                        <SelectValue placeholder="Select hospital" />
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

              <div className="space-y-2">
                <Label htmlFor="createdBy">Created By *</Label>
                <Controller
                  control={control}
                  name="createdBy"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select creator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.createdBy && (
                  <p className="text-sm text-destructive">{errors.createdBy.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Create Doctor</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/Doctors")}
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
