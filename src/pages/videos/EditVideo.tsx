import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
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

const videoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  type: z.enum(["Mobile", "VR"], { required_error: "Type is required" }),
});

type VideoFormData = z.infer<typeof videoSchema>;

export default function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "Cardiology Basics",
      price: "29.99",
      category: "medical",
      type: "Mobile",
    },
  });

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

  const onSubmit = (data: VideoFormData) => {
    console.log(data);
    toast.success("Video updated successfully!");
    navigate("/videos/all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Video #{id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" step="0.01" {...register("price")} />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  defaultValue="medical"
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical Education</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Type *</Label>
                <RadioGroup
                  defaultValue="Mobile"
                  onValueChange={(value) => setValue("type", value as "Mobile" | "VR")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Mobile" id="mobile" />
                    <Label htmlFor="mobile">Mobile</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="VR" id="vr" />
                    <Label htmlFor="vr">VR</Label>
                  </div>
                </RadioGroup>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} />
              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="Preview" className="mt-2 h-32 w-auto rounded" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">Video File (optional)</Label>
              <Input id="video" type="file" accept="video/*" />
            </div>

            <div className="flex gap-4">
              <Button type="submit">Save Changes</Button>
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
