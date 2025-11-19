import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { authStorage } from "@/utils/authStorage";
const token = authStorage.getToken();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const managerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    phone_number: z.string().min(1, "Phone number is required"),
    joining_date: z.string().min(1, "Joining date is required"),
    profile_image: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ManagerFormData = z.infer<typeof managerSchema>;

export default function AddManager() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManagerFormData>({
    resolver: zodResolver(managerSchema),
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

  const onSubmit = async (data: ManagerFormData) => {
    try {
      setLoading(true);
      console.log("=== SUBMITTING MANAGER ===");

      console.log("Token exists:", !!token);
      console.log("Token length:", token?.length);
      console.log("Token preview:", token?.substring(0, 20) + "...");

      console.log("Form data:", data);

      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone_number", data.phone_number);
      formData.append("joining_date", data.joining_date);
      formData.append("role_id", "4"); // Manager role ID (as string)

      const imageFile = data.profile_image?.[0];
      if (imageFile) {
        console.log(
          "Profile image file:",
          imageFile.name,
          "Size:",
          imageFile.size,
          "Type:",
          imageFile.type
        );
        formData.append("profile_image", imageFile);
      } else {
        console.log("No profile image selected");
      }

      // Log all FormData entries for debugging
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log("Sending FormData to create manager");

      const response = await axios.post(
        `http://${BASE_URL}/api/managers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type, let browser set it with boundary
          },
        }
      )

      console.log("Manager created successfully:", response.data);

      toast.success("Manager created successfully!");
      navigate("/hospital/managers/all");
    } catch (error: any) {
      console.error("Error creating manager:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.response?.data?.message);
      console.log('Auth test failed:', error.response?.status, error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Failed to create manager";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Manager</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manager Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={preview} />
                <AvatarFallback>MG</AvatarFallback>
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
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input id="phone_number" {...register("phone_number")} />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">
                    {errors.phone_number.message}
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
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date *</Label>
                <Input
                  id="joining_date"
                  type="date"
                  {...register("joining_date")}
                />
                {errors.joining_date && (
                  <p className="text-sm text-destructive">
                    {errors.joining_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Manager"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/managers/all")}
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
