import { useEffect } from "react";
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

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().min(1, "Image URL is required"),
  types: z.array(z.string()).min(1, "At least one type is required"),
});

type CategoryFormData = z.infer<typeof CategorySchema>;

export default function EditCategories() {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = (location.state || {}) as Partial<CategoryFormData & { id?: number }>;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      image: "",
      types: [],
    },
  });

  useEffect(() => {
    if (initial && Object.keys(initial).length > 0) {
      reset({
        name: (initial as any).name || "",
        image: (initial as any).image || "",
        types: (initial as any).types || [],
      });
    }
  }, [initial, reset]);

  const onSubmit = (data: CategoryFormData) => {
    const payload = {
      ...data,
      id: (initial as any).id,
    };
    console.log("Updated category:", payload);
    toast.success("Category updated successfully!");
    navigate("/categories/all");
  };

  const options = ["monthly", "trial", "yearly", "lifetime"];

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
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL *</Label>
                <Input id="image" {...register("image")} />
                {errors.image && (
                  <p className="text-sm text-destructive">{errors.image.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="types">Types *</Label>
                <Controller
                  control={control}
                  name="types"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm w-full">
                          {field.value && field.value.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((t: string) => (
                                <Badge key={t} variant="default">{t}</Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Select types</span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="space-y-2">
                          {options.map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <Checkbox
                                checked={field.value?.includes(opt)}
                                onCheckedChange={(checked) => {
                                  const current = Array.isArray(field.value) ? field.value : [];
                                  if (checked) {
                                    field.onChange([...current, opt]);
                                  } else {
                                    field.onChange(current.filter((c) => c !== opt));
                                  }
                                }}
                              />
                              <span className="capitalize">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.types && (
                  <p className="text-sm text-destructive">{(errors.types as any).message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Category</Button>
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
