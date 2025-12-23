import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const deviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.string().min(1, "Status is required"),
  group_id: z.string().optional(),
  type_id: z.string().optional(),
  tag_id: z.string().optional(),
  android_version: z.string().optional(),
  client_app_version: z.string().optional(),
  arborxr_home_version: z.string().optional(),
  storage_used: z.string().optional(),
  battery: z.string().optional(),
  ssid: z.string().optional(),
  signal_strength: z.string().optional(),
  frequency: z.string().optional(),
  link_speed: z.string().optional(),
  ip_address: z.string().optional(),
  mac_address: z.string().optional(),
  randomize_mac_address: z.string().optional(),
  note: z.string().optional(),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

const EditDevice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
  });

  useEffect(() => {
    const device = location.state?.device;
    
    if (!device) {
      toast.error("No device data provided");
      navigate("/devices/list");
      return;
    }

    reset({
      title: device.title || "",
      status: device.status?.toString() || "0",
      group_id: device.group_id?.toString() || "",
      type_id: device.type_id?.toString() || "",
      tag_id: device.tag_id?.toString() || "",
      android_version: device.android_version?.toString() || "",
      client_app_version: device.client_app_version || "",
      arborxr_home_version: device.arborxr_home_version || "",
      storage_used: device.storage_used || "",
      battery: device.battery || "",
      ssid: device.ssid || "",
      signal_strength: device.signal_strength || "",
      frequency: device.frequency || "",
      link_speed: device.link_speed || "",
      ip_address: device.ip_address || "",
      mac_address: device.mac_address || "",
      randomize_mac_address: device.randomize_mac_address || "",
      note: device.note || "",
    });
  }, [location.state, navigate, reset]);

  const onSubmit = async (data: DeviceFormData) => {
    try {
      setLoading(true);
      const token = authStorage.getToken();

      const payload = {
        title: data.title,
        status: parseInt(data.status),
        group_id: data.group_id ? parseInt(data.group_id) : null,
        type_id: data.type_id ? parseInt(data.type_id) : null,
        tag_id: data.tag_id ? parseInt(data.tag_id) : null,
        android_version: data.android_version
          ? parseInt(data.android_version)
          : null,
        client_app_version: data.client_app_version || null,
        arborxr_home_version: data.arborxr_home_version || null,
        storage_used: data.storage_used || null,
        battery: data.battery || null,
        ssid: data.ssid || null,
        signal_strength: data.signal_strength || null,
        frequency: data.frequency || null,
        link_speed: data.link_speed || null,
        ip_address: data.ip_address || null,
        mac_address: data.mac_address || null,
        randomize_mac_address: data.randomize_mac_address || null,
        note: data.note || null,
      };


      console.log("Updating device:", payload);
      
      const response = await axios.post(
        `https://${BASE_URL}/devices/update/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Device updated successfully!");
        navigate("/devices/list");
      }
    } catch (error: any) {
      console.error("Error updating device:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error("Failed to update device");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/devices/list")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Device</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter device title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Connected</SelectItem>
                        <SelectItem value="0">Disconnected</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>

              {/* IP Address */}
              <div className="space-y-2">
                <Label htmlFor="ip_address">IP Address</Label>
                <Input
                  id="ip_address"
                  placeholder="Enter IP address"
                  {...register("ip_address")}
                />
              </div>

              {/* MAC Address */}
              <div className="space-y-2">
                <Label htmlFor="mac_address">MAC Address</Label>
                <Input
                  id="mac_address"
                  placeholder="Enter MAC address"
                  {...register("mac_address")}
                />
              </div>

              {/* Group ID */}
              <div className="space-y-2">
                <Label htmlFor="group_id">Group ID</Label>
                <Input
                  id="group_id"
                  type="number"
                  placeholder="Enter group ID"
                  {...register("group_id")}
                />
              </div>

              {/* Type ID */}
              <div className="space-y-2">
                <Label htmlFor="type_id">Type ID</Label>
                <Input
                  id="type_id"
                  type="number"
                  placeholder="Enter type ID"
                  {...register("type_id")}
                />
              </div>

              {/* Tag ID */}
              <div className="space-y-2">
                <Label htmlFor="tag_id">Tag ID</Label>
                <Input
                  id="tag_id"
                  type="number"
                  placeholder="Enter tag ID"
                  {...register("tag_id")}
                />
              </div>

              {/* Android Version */}
              <div className="space-y-2">
                <Label htmlFor="android_version">Android Version</Label>
                <Input
                  id="android_version"
                  type="number"
                  placeholder="Enter Android version"
                  {...register("android_version")}
                />
              </div>

              {/* Client App Version */}
              <div className="space-y-2">
                <Label htmlFor="client_app_version">Client App Version</Label>
                <Input
                  id="client_app_version"
                  placeholder="Enter client app version"
                  {...register("client_app_version")}
                />
              </div>

              {/* ArborXR Home Version */}
              <div className="space-y-2">
                <Label htmlFor="arborxr_home_version">
                  ArborXR Home Version
                </Label>
                <Input
                  id="arborxr_home_version"
                  placeholder="Enter ArborXR home version"
                  {...register("arborxr_home_version")}
                />
              </div>

              {/* Storage Used */}
              <div className="space-y-2">
                <Label htmlFor="storage_used">Storage Used</Label>
                <Input
                  id="storage_used"
                  placeholder="Enter storage used"
                  {...register("storage_used")}
                />
              </div>

              {/* Battery */}
              <div className="space-y-2">
                <Label htmlFor="battery">Battery</Label>
                <Input
                  id="battery"
                  placeholder="Enter battery level"
                  {...register("battery")}
                />
              </div>

              {/* SSID */}
              <div className="space-y-2">
                <Label htmlFor="ssid">SSID</Label>
                <Input
                  id="ssid"
                  placeholder="Enter SSID"
                  {...register("ssid")}
                />
              </div>

              {/* Signal Strength */}
              <div className="space-y-2">
                <Label htmlFor="signal_strength">Signal Strength</Label>
                <Input
                  id="signal_strength"
                  placeholder="Enter signal strength"
                  {...register("signal_strength")}
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  placeholder="Enter frequency"
                  {...register("frequency")}
                />
              </div>

              {/* Link Speed */}
              <div className="space-y-2">
                <Label htmlFor="link_speed">Link Speed</Label>
                <Input
                  id="link_speed"
                  placeholder="Enter link speed"
                  {...register("link_speed")}
                />
              </div>

              {/* Randomize MAC Address */}
              <div className="space-y-2">
                <Label htmlFor="randomize_mac_address">
                  Randomize MAC Address
                </Label>
                <Input
                  id="randomize_mac_address"
                  placeholder="Enter randomize MAC address"
                  {...register("randomize_mac_address")}
                />
              </div>
            </div>

            {/* Note - Full width */}
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Enter notes"
                rows={4}
                {...register("note")}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/devices/list")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Device"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditDevice;
