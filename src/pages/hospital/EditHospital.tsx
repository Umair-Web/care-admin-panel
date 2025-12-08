import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";

interface Manager {
  id: number;
  name?: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Department {
  id: number;
  name: string;
}

const hospitalSchema = z.object({
  name: z.string().min(1, "Hospital name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  license_number: z.string().min(1, "License number is required"),
  established_date: z.string().min(1, "Established date is required"),
  manager_id: z.string().optional(),
  department_id: z.string().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
});

type HospitalFormData = z.infer<typeof hospitalSchema>;

export default function EditHospital() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [managersLoading, setManagersLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
  });

  useEffect(() => {
    fetchManagers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    // Populate form with data from navigation state after managers/departments are loaded
    const hospitalData = location.state;
    console.log("Location state data:", hospitalData);

    if (hospitalData && !managersLoading && !departmentsLoading) {
      console.log("Hospital data from location state:", hospitalData);
      
      // Format date for HTML date input (YYYY-MM-DD)
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formatting date:', error);
          return dateString;
        }
      };
      
      const formData = {
        name: hospitalData.name || '',
        address: hospitalData.address || '',
        city: hospitalData.city || '',
        state: hospitalData.state || '',
        phone_number: hospitalData.phone_number || '',
        email: hospitalData.email || '',
        license_number: hospitalData.license_number || '',
        established_date: formatDateForInput(hospitalData.established_date || ''),
        manager_id: (hospitalData.manager?.id || hospitalData.manager_id)?.toString() || '',
        department_id: (hospitalData.department?.id || hospitalData.department_id)?.toString() || '',
        postal_code: hospitalData.postal_code || '',
      };
      
      console.log("Manager data:", hospitalData.manager);
      console.log("Department data:", hospitalData.department);
      console.log("Manager ID being set:", (hospitalData.manager?.id || hospitalData.manager_id)?.toString() || '');
      console.log("Department ID being set:", (hospitalData.department?.id || hospitalData.department_id)?.toString() || '');
      console.log("Form data being set:", formData);
      reset(formData);
    }
  }, [location.state, reset, managersLoading, departmentsLoading]);

  const fetchManagers = async () => {
    try {
      setManagersLoading(true);
      const token = authStorage.getToken();
      const response = await axios.get(`https://${BASE_URL}/managers`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Managers response:", response.data);
      if (response.data.status === 'success' && response.data.data) {
        setManagers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast.error("Failed to load managers");
    } finally {
      setManagersLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const token = authStorage.getToken();
      console.log("Fetching departments...");
      
      const response = await axios.get(`https://${BASE_URL}/departments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Departments response:", response.data);

      if (response.data.status === 'success') {
        setDepartments(response.data.data);
      } else {
        toast.error("Failed to load departments");
      }
    } catch (error: any) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const onSubmit = async (data: HospitalFormData) => {
    try {
      setLoading(true);
      const token = authStorage.getToken();
      
      const response = await axios.put(`https://${BASE_URL}/hospital/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data.status === 'success') {
        toast.success("Hospital updated successfully!");
        navigate("/hospital/list/all");
      } else {
        toast.error('Failed to update hospital');
      }
    } catch (error: any) {
      console.error('Error updating hospital:', error);
      if (error.response?.data?.errors) {
        // Handle Laravel validation errors
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach(key => {
          toast.error(`${key}: ${validationErrors[key][0]}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to update hospital');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Hospital #{id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hospital Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" {...register("address")} />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...register("city")} />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input id="state" {...register("state")} />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input id="postal_code" {...register("postal_code")} />
                {errors.postal_code && (
                  <p className="text-sm text-destructive">{errors.postal_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input id="phone_number" {...register("phone_number")} />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">{errors.phone_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">License Number *</Label>
                <Input id="license_number" {...register("license_number")} />
                {errors.license_number && (
                  <p className="text-sm text-destructive">{errors.license_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="established_date">Established Date *</Label>
                <Input id="established_date" type="date" {...register("established_date")} />
                {errors.established_date && (
                  <p className="text-sm text-destructive">{errors.established_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_id">Manager</Label>
                <Controller
                  name="manager_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          managersLoading 
                            ? "Loading managers..." 
                            : managers.length === 0 
                            ? "No managers available" 
                            : "Select manager"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {!managersLoading && managers.length > 0 && (
                          managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id.toString()}>
                              {manager.user ? `${manager.user.first_name} ${manager.user.last_name}` : manager.name || `Manager ${manager.id}`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.manager_id && (
                  <p className="text-sm text-destructive">{errors.manager_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department_id">Department</Label>
                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          departmentsLoading 
                            ? "Loading departments..." 
                            : departments.length === 0 
                            ? "No departments available" 
                            : "Select department"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {!departmentsLoading && departments.length > 0 && (
                          departments.map((department) => (
                            <SelectItem key={department.id} value={department.id.toString()}>
                              {department.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department_id && (
                  <p className="text-sm text-destructive">{errors.department_id.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Hospital"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospital/list")}
                disabled={loading}
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
