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

const PatientSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
    phone: z.string().min(1, "Phone number is required"),
    dob: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    address: z.string().min(1, "Address is required"),
    hospital: z.string().min(1, "Hospital is required"),
    assignedDoctor: z.string().min(1, "Assigned doctor is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type PatientFormData = z.infer<typeof PatientSchema>;

export default function AddPatient() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema),
  });

  const onSubmit = (data: PatientFormData) => {
    console.log(data);
    toast.success("Patient created successfully!");
    navigate("/hospital/Patients");
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
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input id="dob" type="date" {...register("dob")} />
                {errors.dob && (
                  <p className="text-sm text-destructive">{errors.dob.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
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
                <Label htmlFor="address">Address *</Label>
                <Input id="address" {...register("address")} />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
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
                <Label htmlFor="assignedDoctor">Assign Doctor *</Label>
                <Controller
                  control={control}
                  name="assignedDoctor"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor1">Doctor1 Valov</SelectItem>
                        <SelectItem value="doctor2">Doctor2 Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.assignedDoctor && (
                  <p className="text-sm text-destructive">{errors.assignedDoctor.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit"  onClick={() => navigate("/hospital/patients/all")}>Create Patient</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/patients/all")}
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
