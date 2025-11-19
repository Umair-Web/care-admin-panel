import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category_id: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Type is required"),
  image: z.any().optional(),
  video: z.any().refine((files) => files?.length > 0, "Video file is required"),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface Category {
  id: number;
  name: string;
}

export default function AddVideo() {
  const navigate = useNavigate();
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios
      .get(`http://${BASE_URL}/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.categories) {
          setCategories(response.data.categories);
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: VideoFormData) => {
  try {
    setLoading(true);
    console.log("=== SUBMITTING VIDEO ===");

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category_id", data.category_id);
    formData.append("type", data.type);

    const imageFile = data.image?.[0];
    if (imageFile) {
      console.log("Image file:", imageFile.name, "Size:", imageFile.size);
      formData.append("image", imageFile);
    }

    const videoFile = data.video?.[0];
    if (videoFile) {
      console.log("Video file:", videoFile.name, "Size:", videoFile.size, "Type:", videoFile.type);
      formData.append("video", videoFile);
    }

    console.log("Sending FormData with multipart/form-data");

    await axios.post(`http://${BASE_URL}/video`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // IMPORTANT: Do NOT set Content-Type header
        // Let the browser automatically set it with boundary
      },
      timeout: 600000,
    });

    toast.success("Video created successfully!");
    reset();
    setThumbnailPreview("");
    navigate("/videos/all");
  } catch (error: any) {
    console.error("Error creating video:", error);
    console.error("Error status:", error.response?.status);
    console.error("Error message:", error.response?.data?.message);
    
    const errorMessage = 
      error.response?.data?.message ||
      "Failed to create video";
    
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Video</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category_id && (
                  <p className="text-sm text-destructive">{errors.category_id.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type *</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value || ""}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Mobile" id="mobile" />
                        <Label htmlFor="mobile" className="font-normal cursor-pointer">
                          Mobile
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="VR" id="vr" />
                        <Label htmlFor="vr" className="font-normal cursor-pointer">
                          VR
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>

            {/* Thumbnail Image */}
            <div className="space-y-2">
              <Label htmlFor="image">Thumbnail Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                {...register("image")}
                onChange={(e) => {
                  register("image").onChange?.(e);
                  handleThumbnailChange(e);
                }}
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="h-32 w-auto rounded-md"
                  />
                </div>
              )}
              {errors.image && (
                <p className="text-sm text-destructive">
                  {typeof errors.image.message === "string"
                    ? errors.image.message
                    : "Image file error"}
                </p>
              )}
            </div>

            {/* Video File */}
            <div className="space-y-2">
              <Label htmlFor="video">Video File *</Label>
              <Input
                id="video"
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv"
                {...register("video")}
              />
              {errors.video && (
                <p className="text-sm text-destructive">
                  {typeof errors.video.message === "string"
                    ? errors.video.message
                    : "Video file is required"}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Video"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/videos/all")}
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
