import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.any().optional(),
  subscriptions: z.array(z.string()),
});

type CategoryFormData = z.infer<typeof CategorySchema>;

interface Subscription {
  id: string;
  name: string;
  price: number;
}

interface Category {
  id: number;
  name: string;
  image: string;
  subscriptions: Subscription[];
  created_at: string;
  updated_at: string;
}

export default function EditCategories() {
  const navigate = useNavigate();
  const location = useLocation();
  const category = (location.state || {}) as Category;
  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      image: undefined,
      subscriptions: [],
    },
  });

  const selectedSubscriptions = watch("subscriptions");

  useEffect(() => {
    // Fetch available subscriptions
    axios
      .get(`http://${BASE_URL}/subscriptions`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.subscriptions) {
          setAvailableSubscriptions(response.data.subscriptions);
        }
      })
      .catch((error) => {
        console.error("Error fetching subscriptions:", error);
      });
  }, []);

  // Set initial image preview
  useEffect(() => {
    if (category && category.image) {
      setCurrentImagePreview(category.image);
      setSelectedImagePreview(null);
    }
  }, [category]);

  // Populate form with category data
  useEffect(() => {
    if (category && Object.keys(category).length > 0) {
      const subscriptionIds = category.subscriptions?.map((sub) => String(sub.id)) || [];
      reset({
        name: category.name || "",
        image: undefined,
        subscriptions: subscriptionIds,
      });
    }
  }, [category, reset]);

const onSubmit = async (data: CategoryFormData) => {
  try {
    console.log("=== SUBMITTING CATEGORY ===");

    const formData = new FormData();
    formData.append('_method', 'PUT'); // Tell Laravel this is a PUT request
    formData.append('name', data.name);
    
    const imageFile = data.image?.[0];
    if (imageFile) {
      console.log("Image file found:", imageFile.name);
      formData.append('image', imageFile);
    }
    
    selectedSubscriptions.forEach((subId) => {
      formData.append('subscription_id[]', subId);
    });

    console.log("FormData entries:");
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    await axios.post(`http://${BASE_URL}/category/${category.id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Category updated successfully!");
    navigate("/categories/all");
  } catch (error) {
    console.error("Error updating category:", error);
    console.error("Error Data:", error.response?.data);
    toast.error("Failed to update category");
  }
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Category</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Image Preview */}
              {currentImagePreview && !selectedImagePreview && (
                <div className="space-y-2">
                  <Label>Current Image</Label>
                  <div className="mt-2">
                    <img
                      src={`http://${BASE_URL}/storage/${currentImagePreview}`}
                      alt="Category"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                </div>
              )}

              {/* Selected Image Preview */}
              {selectedImagePreview && (
                <div className="space-y-2">
                  <Label>New Image</Label>
                  <div className="mt-2">
                    <img
                      src={selectedImagePreview}
                      alt="New Category"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Change Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSelectedImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setSelectedImagePreview(null);
                    }
                  }}
                />
              </div>

              {/* Subscriptions */}
              <div className="space-y-2">
                <Label htmlFor="subscriptions">Subscriptions</Label>
                <Controller
                  control={control}
                  name="subscriptions"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm w-full"
                        >
                          {field.value && field.value.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((id: string) => {
                                const sub = availableSubscriptions.find(
                                  (s) => String(s.id) === id
                                );
                                return (
                                  <Badge key={id} variant="default">
                                    {sub?.name || id}
                                  </Badge>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Select subscriptions
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div className="space-y-2">
                          {availableSubscriptions.map((sub) => (
                            <label
                              key={sub.id}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={field.value?.includes(String(sub.id))}
                                onCheckedChange={(checked) => {
                                  const current = Array.isArray(field.value)
                                    ? field.value
                                    : [];
                                  const subId = String(sub.id);
                                  if (checked) {
                                    field.onChange([...current, subId]);
                                  } else {
                                    field.onChange(
                                      current.filter((c) => c !== subId)
                                    );
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <span className="font-medium">{sub.name}</span>
                                <p className="text-xs text-muted-foreground">
                                  ${sub.price}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Category"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/categories/all")}
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
