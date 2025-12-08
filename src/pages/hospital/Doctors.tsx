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
import { Edit, Trash2, Plus, Search, Eye } from "lucide-react";
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

interface Doctor {
  id: number;
  fullname: string;
  email: string;
  phone_number: string;
  gender: string;
  experience: string;
  joining_date: string;
  profile_image?: string;
  specialization?: {
    id: number;
    name: string;
  };
  hospital?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export default function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://${BASE_URL}/doctors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Doctors response:", response.data);
      if (response.data.status === "success" && response.data.data) {
        setDoctors(response.data.data);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.hospital?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await axios.delete(
        `https://${BASE_URL}/doctor/${deleteId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response:", response.data);
      if (response.data.status === "success") {
        toast.success("Doctor deleted successfully!");
        setDoctors(doctors.filter((d) => d.id !== deleteId));
      } else {
        toast.error("Failed to delete doctor");
      }
    } catch (error: any) {
      console.error("Error deleting doctor:", error);
      toast.error(error.response?.data?.message || "Failed to delete doctor");
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

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";
    // Assuming the images are served from storage folder
    if (imagePath.startsWith("https")) {
      return imagePath;
    }
    return `https://${BASE_URL}/storage/${imagePath}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hospital Doctors</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Doctors</TabsTrigger>
          <TabsTrigger value="add">Add Doctor</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      Loading doctors...
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      {searchTerm
                        ? "No doctors found matching your search."
                        : "No doctors found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>{doctor.id}</TableCell>
                      <TableCell>
                        <Avatar>
                          <AvatarImage
                            src={getImageUrl(`https://${BASE_URL}${doctor.profile_image}`)}
                          />
                          <AvatarFallback>
                            {getInitials(doctor.fullname)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {doctor.fullname}
                      </TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.phone_number}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doctor.gender === "male"
                              ? "default"
                              : doctor.gender === "female"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {doctor.gender?.charAt(0).toUpperCase() +
                            doctor.gender?.slice(1) || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{doctor.experience} years</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {doctor.specialization?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{doctor.hospital?.name || "N/A"}</TableCell>
                      <TableCell>{doctor.creator?.role_id==1? "Admin" : "N/A"}</TableCell>
                      <TableCell>{formatDate(doctor.joining_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/hospital/doctors/edit/${doctor.id}`, {
                                state: { doctor },
                              })
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(doctor.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the doctor "
                                  {doctor.fullname}" and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => setDeleteId(null)}
                                >
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
              <p className="text-muted-foreground">
                Click the button below to add a new doctor to the system.
              </p>
              <Button onClick={() => navigate("/hospital/doctors/add")}>
                Add Doctor
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
