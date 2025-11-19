import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
  video: z.any().optional(),
});

type VideoFormData = z.infer<typeof videoSchema>;

interface Category {
  id: number;
  name: string;
}

interface Video {
  id: number;
  title: string;
  category_id: number;
  category: {
    id: number;
    name: string;
  };
  image: string;
  video: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export default function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [video, setVideo] = useState<Video | null>(location.state || null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!location.state);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
  });

  // Fetch video data if not passed via location.state
  useEffect(() => {
    if (!video && id) {
      fetchVideoData();
    }
    fetchCategories();
  }, []);

  // Set form data when video is loaded
  useEffect(() => {
    if (video && categories.length > 0) {
      reset({
        title: video.title,
        category_id: String(video.category_id),
        type: video.type,
      });

      // Set existing thumbnails/video previews
      if (video.image) {
        setThumbnailPreview(`http://${BASE_URL}/storage/${video.image}`);
      }
      if (video.video) {
        setVideoPreview(`http://${BASE_URL}/storage/${video.video}`);
      }
      setInitialLoading(false);
    }
  }, [video, categories, reset]);

  const fetchVideoData = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`http://${BASE_URL}/videos`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const videoData = response.data.videos.find((v: Video) => v.id === Number(id));
      if (videoData) {
        setVideo(videoData);
      } else {
        toast.error("Video not found");
        navigate("/videos/all");
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error("Failed to load video data");
      navigate("/videos/all");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`http://${BASE_URL}/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: VideoFormData) => {
    try {
      setLoading(true);
      console.log("=== UPDATING VIDEO ===");

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category_id", data.category_id);
      formData.append("type", data.type);
      formData.append("_method", "PUT"); // Laravel method spoofing

      const imageFile = data.image?.[0];
      if (imageFile) {
        console.log("New image file:", imageFile.name, "Size:", imageFile.size);
        formData.append("image", imageFile);
      }

      const videoFile = data.video?.[0];
      if (videoFile) {
        console.log("New video file:", videoFile.name, "Size:", videoFile.size);
        formData.append("video", videoFile);
      }

      console.log("Updating video with FormData");

      await axios.post(`http://${BASE_URL}/video/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let the browser set Content-Type with boundary
        },
        timeout: 600000,
      });

      toast.success("Video updated successfully!");
      navigate("/videos/all");
    } catch (error: any) {
      console.error("Error updating video:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.response?.data?.message);
      
      const errorMessage = 
        error.response?.data?.message ||
        "Failed to update video";
      
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
          <p className="mt-2 text-muted-foreground">Loading video data...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Video not found</p>
          <Button onClick={() => navigate("/videos/all")} className="mt-4">
            Back to Videos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Video: {video.title}</h1>
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

            {/* Current Video Preview */}
            {video.video && (
              <div className="space-y-2">
                <Label>Current Video</Label>
                <div className="border rounded-md p-4">
                  <video
                    src={`http://${BASE_URL}/storage/${video.video}`}
                    controls
                    className="h-40 w-auto rounded-md"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current video file - upload a new file to replace it
                  </p>
                </div>
              </div>
            )}

            {/* Thumbnail Image */}
            <div className="space-y-2">
              <Label htmlFor="image">Thumbnail Image</Label>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    {thumbnailPreview.startsWith('data:') ? 'New thumbnail preview' : 'Current thumbnail'}
                  </p>
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
              <Label htmlFor="video">Replace Video File (Optional)</Label>
              <Input
                id="video"
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv"
                {...register("video")}
                onChange={(e) => {
                  register("video").onChange?.(e);
                  handleVideoChange(e);
                }}
              />
              {videoPreview && videoPreview.startsWith('data:') && (
                <div className="mt-2">
                  <video
                    src={videoPreview}
                    controls
                    className="h-40 w-auto rounded-md"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-sm text-muted-foreground mt-1">New video preview</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Leave empty to keep the current video file
              </p>
              {errors.video && (
                <p className="text-sm text-destructive">
                  {typeof errors.video.message === "string"
                    ? errors.video.message
                    : "Video file error"}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Video"}
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
