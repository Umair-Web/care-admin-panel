import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

// Helper function to construct proper image URL
const getImageUrl = (profileImage: string | null): string => {
  if (!profileImage) return "";
  
  // If already starts with http or https, return as is
  if (profileImage.startsWith('http')) {
    return profileImage;
  }
  
  // If starts with /storage, prepend base URL only
  if (profileImage.startsWith('/storage')) {
    return `http://${BASE_URL}${profileImage}`;
  }
  
  // If starts with assets/, it's in public directory (no /storage/ prefix needed)
  if (profileImage.startsWith('assets/')) {
    return `http://${BASE_URL}/${profileImage}`;
  }
  
  // For other formats (profile_images/, etc.), add /storage/ prefix
  return `http://${BASE_URL}/storage/${profileImage}`;
};

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role_id: z.string().min(1, "Role is required"),
  image: z.any().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  cpassword: z.string(),
}).refine((data) => data.password === data.cpassword, {
  message: "Passwords don't match",
  path: ["cpassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id?: number;
  role_name?: string;
  role?: { name: string };
  profile_image?: string;
}

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userData, setUserData] = useState<User | null>(location.state || null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role_id: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      cpassword: "",
    },
  });

  const watchedFirstName = profileForm.watch("first_name", "");
  const watchedLastName = profileForm.watch("last_name", "");

  useEffect(() => {
    fetchRoles();
    
    if (userData) {
      populateUserData();
    } else if (id) {
      // Fallback: fetch user data if not passed via navigation state
      fetchUserData();
    }
  }, [userData, id]);

  const fetchRoles = async () => {
    try {
      const staticRoles = [
        { id: 1, name: "Super Admin" },
        { id: 2, name: "Administrator" },
        { id: 3, name: "User" },
        { id: 4, name: "Hospital Manager" },
        { id: 5, name: "Patient" },
      ];
      setRoles(staticRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    }
  };

  const fetchUserData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://${BASE_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data.data || response.data;
      setUserData(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const populateUserData = () => {
    if (!userData) return;

    profileForm.reset({
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
      email: userData.email || "",
      role_id: (userData.role_id || "").toString(),
    });

    if (userData.profile_image) {
      setImagePreview(getImageUrl(userData.profile_image));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      formData.append("role_id", data.role_id);
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      console.log("Updating profile with data:", data);

      // Use dedicated POST route for FormData handling
      const response = await axios.post(`http://${BASE_URL}/user/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Profile updated successfully!");
        navigate("/users/all");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("current_password", data.current_password);
      formData.append("password", data.password);
      formData.append("cpassword", data.cpassword);

      const response = await axios.post(`http://${BASE_URL}/user/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Password updated successfully!");
        passwordForm.reset();
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('id', id as string);

      const response = await axios.post(`http://${BASE_URL}/user/delete`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Account deleted successfully!");
        navigate("/users/all");
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users/all")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground mt-2">Update user information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={imagePreview} />
                <AvatarFallback className="text-2xl">
                  {watchedFirstName[0] || ""}{watchedLastName[0] || ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="image" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                    Update Profile Image
                  </div>
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  onChange={handleImageChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max 5MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  placeholder="Enter first name"
                  {...profileForm.register("first_name")}
                />
                {profileForm.formState.errors.first_name && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="last_name"
                  placeholder="Enter last name"
                  {...profileForm.register("last_name")}
                />
                {profileForm.formState.errors.last_name && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.last_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...profileForm.register("email")}
                />
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_id">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="role_id"
                  control={profileForm.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {profileForm.formState.errors.role_id && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.role_id.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/users/all")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">
                Current Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="current_password"
                type="password"
                placeholder="Enter current password"
                {...passwordForm.register("current_password")}
              />
              {passwordForm.formState.errors.current_password && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.current_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                New Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                {...passwordForm.register("password")}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpassword">
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cpassword"
                type="password"
                placeholder="Confirm new password"
                {...passwordForm.register("cpassword")}
              />
              {passwordForm.formState.errors.cpassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.cpassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Once you delete this account, there is no going back. Please be certain.
          </p>
          <div className="space-y-2">
            <Label htmlFor="deletePassword">Confirm Password</Label>
            <Input
              id="deletePassword"
              type="password"
              placeholder="Enter password to confirm"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  {loading ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    user account and remove all associated data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} disabled={loading}>
                    {loading ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => navigate("/users/all")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUser;
