import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.preprocess((v) => Number(v), z.number().min(0, "Price is required")),
  details: z.string().min(1, "Details are required"),
  duration: z.string().min(1, "Duration is required"),
});

type SubscriptionFormData = z.infer<typeof SubscriptionSchema>;

export default function EditSubscription() {
  const { id } = useParams();
  const location = useLocation();
  const subscription = (location.state || {}) as Partial<{
    id: number;
    name: string;
    price: number;
    details: string;
    duration: string;
  }>;

  const navigate = useNavigate();
  const [preview, setPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(SubscriptionSchema),
    defaultValues: {
      name: "",
      price: 0,
      details: "",
      duration: "",
    } as any,
  });

  useEffect(() => {
    if (subscription && Object.keys(subscription).length > 0) {
      reset({
        name: subscription.name ?? "",
        price: subscription.price ?? 0,
        details: subscription.details ?? "",
        duration: subscription.duration ?? "",
      } as any);
    }
  }, [subscription, reset]);

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

  const onSubmit = (data: SubscriptionFormData) => {
    const payload = {
      id: subscription.id,
      ...data,
    };
    console.log("Updated subscription:", payload);
    toast.success("Subscription updated successfully!");
    navigate("/subscriptions/all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Subscription #{id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* <div className="flex items-center gap-4 mb-6">
              <div>
                <Label htmlFor="image">Thumbnail</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              </div>
            </div> */}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" step="0.01" {...register("price" as any)} />
                {errors.price && (
                  <p className="text-sm text-destructive">{(errors.price as any).message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="details">Details *</Label>
                <Input id="details" {...register("details")} />
                {errors.details && (
                  <p className="text-sm text-destructive">{errors.details.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input id="duration" {...register("duration")} />
                {errors.duration && (
                  <p className="text-sm text-destructive">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit">Update Subscription</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/subscriptions/all")}
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
