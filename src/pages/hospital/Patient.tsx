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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Eye, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

interface Patient {
  id: number;
  user_id: number;
  date_of_birth: string;
  gender: string;
  address: string;
  hospital_id: number;
  doctor_id: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  hospital?: {
    id: number;
    name: string;
  };
  doctor?: {
    id: number;
    fullname: string;
  };
}

export default function Patient() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://${BASE_URL}/patients`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Patients response:", response.data);
      if (response.data.status === 'success' && response.data.data) {
        setPatients(response.data.data);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.doctor?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleting(true);
      const response = await axios.delete(`http://${BASE_URL}/api/patient/${deleteId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete response:", response.data);
      if (response.data.status === 'success') {
        toast.success("Patient deleted successfully!");
        setPatients(patients.filter(p => p.id !== deleteId));
      } else {
        toast.error("Failed to delete patient");
      }
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      toast.error(error.response?.data?.message || "Failed to delete patient");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    return "P";
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Laravel stores with /storage/ prefix, so use it directly
    return `http://${BASE_URL}${imagePath}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Patients</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Patients</TabsTrigger>
          <TabsTrigger value="add">Add Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading patients...
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      {searchTerm ? "No patients found matching your search." : "No patients found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.id}</TableCell>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={getImageUrl(patient.user?.profile_image)} />
                          <AvatarFallback>
                            {getInitials(patient.user?.first_name, patient.user?.last_name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {patient.user?.first_name} {patient.user?.last_name}
                      </TableCell>
                      <TableCell>{patient.user?.email}</TableCell>
                      <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          patient.gender === 'male' ? 'default' : 
                          patient.gender === 'female' ? 'secondary' : 'outline'
                        }>
                          {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{patient.address}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {patient.hospital?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.doctor?.fullname || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                        
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/hospital/patients/edit/${patient.id}`, { 
                              state: { patient } 
                            })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteId(patient.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the patient
                                  "{patient.user?.first_name} {patient.user?.last_name}" and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDelete}
                                  disabled={deleting}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
            <div className="text-start space-y-4">
              <h3 className="text-lg font-medium">Add New Patient</h3>
              <p className="text-muted-foreground">
                Click the button below to add a new patient to the system.
              </p>
              <Button onClick={() => navigate("/hospital/patients/add")}>
               
                Add Patient
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}