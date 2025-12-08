import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

// Helper function to construct proper image URL
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

const managerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  phone_number: z.string().min(1, "Phone number is required"),
  joining_date: z.string().min(1, "Joining date is required"),
  profile_image: z.any().optional(),
});

type ManagerFormData = z.infer<typeof managerSchema>;

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
}

interface Manager {
  id: number;
  user_id: number;
  phone_number: string;
  joining_date: string;
  user: User;
}

export default function EditManager() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [manager, setManager] = useState<Manager | null>(location.state || null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!location.state);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManagerFormData>({
    resolver: zodResolver(managerSchema),
  });

  // Fetch manager data if not passed via location.state
  useEffect(() => {
    if (!manager && id) {
      fetchManagerData();
    }
  }, []);

  // Set form data when manager is loaded
  useEffect(() => {
    if (manager) {
      // Format the joining_date for HTML date input (YYYY-MM-DD)
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formatting date:', error);
          return dateString;
        }
      };

      reset({
        first_name: manager.user.first_name,
        last_name: manager.user.last_name,
        email: manager.user.email,
        phone_number: manager.phone_number,
        joining_date: formatDateForInput(manager.joining_date),
        password: "", // Don't prefill password
      });

      // Set existing profile image preview
      if (manager.user.profile_image) {
        setPreview(getImageUrl(manager.user.profile_image));
      }
      setInitialLoading(false);
    }
  }, [manager, reset]);

  const fetchManagerData = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`https://${BASE_URL}/api/managers/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === 'success' && response.data.data) {
        setManager(response.data.data);
      } else {
        toast.error("Manager not found");
        navigate("/hospital/managers/all");
      }
    } catch (error) {
      console.error("Error fetching manager:", error);
      toast.error("Failed to load manager data");
      navigate("/hospital/managers/all");
    } finally {
      setInitialLoading(false);
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
const onSubmit = async (data: ManagerFormData) => {
  try {
    setLoading(true);
    console.log("=== UPDATING MANAGER ===");
    console.log("Form data:", data);

    const formData = new FormData();
    
    // ✅ ADD: Laravel method spoofing for PUT
    formData.append("_method", "PUT");
    
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("phone_number", data.phone_number);
    formData.append("joining_date", data.joining_date);

    // Only append password if it's provided
    if (data.password && data.password.trim() !== "") {
      formData.append("password", data.password);
    }

    const imageFile = data.profile_image?.[0];
    if (imageFile) {
      console.log("New profile image file:", imageFile.name, "Size:", imageFile.size);
      formData.append("profile_image", imageFile);
    }

    // Debug FormData entries
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    console.log("Updating manager with FormData");

    // ✅ CHANGE: Use POST instead of PUT with FormData
    const response = await axios.post(`https://${BASE_URL}/managers/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData
      },
    });

    console.log("Manager updated successfully:", response.data);
    toast.success("Manager updated successfully!");
    navigate("/hospital/managers/all");
  } catch (error: any) {
    console.error("Error updating manager:", error);
    console.error("Error status:", error.response?.status);
    console.error("Error message:", error.response?.data?.message);
    
    const errorMessage = 
      error.response?.data?.message ||
      "Failed to update manager";
    
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
          <p className="mt-2 text-muted-foreground">Loading manager data...</p>
        </div>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Manager not found</p>
          <Button onClick={() => navigate("/hospital/managers/all")} className="mt-4">
            Back to Managers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Manager: {manager.user.first_name} {manager.user.last_name}</h1>
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
                <AvatarFallback>
                  {manager.user.first_name[0]}
                  {manager.user.last_name[0]}
                </AvatarFallback>
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
                {preview && preview.startsWith('data:') && (
                  <p className="text-sm text-muted-foreground mt-1">New profile image selected</p>
                )}
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
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" {...register("last_name")} />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
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
                <Label htmlFor="password">New Password (Optional)</Label>
                <Input id="password" type="password" {...register("password")} placeholder="Leave empty to keep current password" />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date *</Label>
                <Input id="joining_date" type="date" {...register("joining_date")} />
                {errors.joining_date && (
                  <p className="text-sm text-destructive">{errors.joining_date.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Manager"}
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
