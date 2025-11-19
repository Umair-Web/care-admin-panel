import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";
import { useEffect, useState } from "react";
import axios from "axios";
import { set } from "date-fns";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const token = authStorage.getToken();

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.any().refine((files) => files?.length > 0, "Image file is required"),
  types: z.array(z.number()).min(1, "At least one type is required"),
});

type CategoryFormData = z.infer<typeof CategorySchema>;

export default function AddCategory() {

  const [subscriptions, setMockSubscriptions] = useState<Array<{ id: string; name: string }>>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
  });

  // Log errors whenever they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

  const onSubmit = (data: CategoryFormData) => {
    console.log("=== FORM SUBMITTED ===");
    console.log("Form data:", data);

    const imageFile = data.image[0];
    console.log("Image file:", imageFile?.name);

    console.log("Selected types datatype:", typeof data.types);
    console.log("Selected types:",  data.types);

    // Create FormData instead of JSON
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('image', imageFile);
    
    data.types.forEach((typeId) => {
    formData.append('subscription_id[]', typeId.toString());
  });

    axios.post(`http://${BASE_URL}/category`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      }
    })
      .then(() => {
        toast.success("Category created successfully!");
        navigate("/categories/all");
      })
      .catch((error) => {
        console.error("Add Category Error:", error);
        console.error("Error Data:", error.response?.data);
        toast.error(error.response?.data?.message || "Failed to create category");
      });
  };
  // Getting Subscriptions


  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = () => {
    axios.get(`http://${BASE_URL}/subscriptions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

    }).then((response) => {
      console.log("All Subscription Success");
      console.log("All Subscription Response:", response);

      const subscriptionlist = response.data.subscriptions;
      console.log("Subscription List:", subscriptionlist);

      // Store full subscription objects with id and name
      setMockSubscriptions(subscriptionlist);
      console.log("Subscriptions fetched:", subscriptionlist);

    }).catch((error) => {
      console.error("All Subscription Error:", error);
      console.error("All Subscription Error Response:", error.response);
      console.error("All Subscription Error Data:", error.response?.data);
    });

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Category</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  {...register("image", {
                    onChange: (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                  })}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-md" />
                  </div>
                )}
                {errors.image && (
                  <p className="text-sm text-destructive">
                    {typeof errors.image.message === 'string' ? errors.image.message : 'Image file is required'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="types">Types *</Label>
                <Controller
                  control={control}
                  name="types"
                  render={({ field }) => {
                    const options = [

                      ...subscriptions
                    ];
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm w-full">
                            {field.value && field.value.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {field.value.map((id: string) => {
                                  const subscription = subscriptions.find(s => s.id === id);
                                  return (
                                    <Badge key={id} variant="default">
                                      {subscription?.name || id}
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Select types</span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="space-y-2">
                            {options.map((opt) => (
                              <label key={opt.id} className="flex items-center gap-2">
                                <Checkbox
                                  checked={field.value?.includes(opt.id)}
                                  onCheckedChange={(checked) => {
                                    const current = Array.isArray(field.value) ? field.value : [];
                                    if (checked) {
                                      field.onChange([...current, opt.id]);
                                    } else {
                                      field.onChange(current.filter((c) => c !== opt.id));
                                    }
                                  }}
                                />
                                <span className="capitalize">{opt.name}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {errors.types && (
                  <p className="text-sm text-destructive">{(errors.types as any).message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Create Category</Button>
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
