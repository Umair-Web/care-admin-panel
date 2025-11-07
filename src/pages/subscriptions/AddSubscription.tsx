import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// simplified form: name, price, duration, details
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.preprocess((v) => Number(v), z.number().min(0, "Price is required")),
  duration: z.string().min(1, "Duration is required"),
  details: z.string().min(1, "Details are required"),
});

type SubscriptionFormData = z.infer<typeof SubscriptionSchema>;

export default function AddSubscription() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(SubscriptionSchema),
  });

  const onSubmit = (data: SubscriptionFormData) => {
    console.log(data);
    toast.success("Subscription created successfully!");
    navigate("/Subscriptions/all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add Subscription</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit">Create Subscription</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/Subscriptions/all")}
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
