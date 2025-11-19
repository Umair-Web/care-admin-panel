import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Power } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";

interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phone_number: string;
  email: string;
  license_number: string;
  established_date: string;
  postal_code: string;
  manager?: { id: number; name: string; };
  department?: { id: number; name: string; };
  created_at: string;
  updated_at: string;
}

export default function HospitalList() {
  
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = authStorage.getToken();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`http://${BASE_URL}/hospitals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.status === 'success') {
        setHospitals(response.data.data);
        console.log('Fetched hospitals:', response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch hospitals');
      }
    } catch (error: any) {
      console.error('Error fetching hospitals:', error);
      setError(error.response?.data?.message || 'Failed to fetch hospitals');
      toast.error(error.response?.data?.message || 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await axios.delete(`http://${BASE_URL}/hospital/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.status === 'success') {
        toast.success("Hospital deleted successfully!");
        console.log('Delete response:', response.data);
        setHospitals(hospitals.filter(hospital => hospital.id !== deleteId));
      } else {
        toast.error('Failed to delete hospital');
      }
    } catch (error: any) {
      console.error('Error deleting hospital:', error);
      toast.error(error.response?.data?.message || 'Failed to delete hospital');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = (id: number) => {
    toast.success("Hospital status updated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hospitals</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Hospitals</TabsTrigger>
          <TabsTrigger value="add">Add Hospital</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Established</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Postal Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-4">
                      Loading hospitals...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-4 text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredHospitals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-4">
                      No hospitals found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHospitals.map((hospital) => (
                    <TableRow key={hospital.id}>
                      <TableCell>{hospital.id}</TableCell>
                      <TableCell className="font-medium">{hospital.name}</TableCell>
                      <TableCell>{hospital.address}</TableCell>
                      <TableCell>{hospital.city}</TableCell>
                      <TableCell>{hospital.state}</TableCell>
                      <TableCell>{hospital.phone_number}</TableCell>
                      <TableCell>{hospital.email}</TableCell>
                      <TableCell>{hospital.license_number}</TableCell>
                      <TableCell>{hospital.established_date}</TableCell>
                      <TableCell>{hospital.manager?.user.first_name || 'N/A'}</TableCell>
                      <TableCell>{hospital.department?.name || 'N/A'}</TableCell>
                      <TableCell>{hospital.postal_code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/hospital/list/edit/${hospital.id}`, { state: hospital })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleActive(hospital.id)}
                          >
                            <Power className="h-4 w-4" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(hospital.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="add">
          <div className="rounded-md border bg-card p-6">
            <p className="text-muted-foreground">
              Add Hospital form will be rendered here. Navigate to{" "}
              <code>/hospital/list/add</code> for the full form.
            </p>
            <Button onClick={() => navigate("/hospital/list/add")} className="mt-4">
              Go to Add Hospital Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hospital.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
