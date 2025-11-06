import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Edit, Trash2 } from "lucide-react";
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

const mockDoctors = [
  {
    id: 1,
    firstName: "Doctor1",
    lastName: "Valov",
    email: "doctor1.valov@hospital.com",
    phone: "+1-555-0201",
    experience: "5 years",
    specialization: "Cardiology",
    hospital: "Central Hospital",
    joiningDate: "2020-01-15",
    createdBy: "Admin",
    avatar: "",
  },
  {
    id: 2,
    firstName: "Doctor2",
    lastName: "Johnson",
    email: "doctor2.johnson@hospital.com",
    phone: "+1-555-0202",
    experience: "3 years",
    specialization: "Pediatrics",
    hospital: "Northside Clinic",
    joiningDate: "2021-03-20",
    createdBy: "Manager",
    avatar: "",
  },
];

export default function Doctors() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredDoctors = mockDoctors.filter((doctor) =>
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    toast.success("Doctor deleted successfully!");
    setDeleteId(null);
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
            <Input
              placeholder="Search Doctors..."
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
                  <TableHead>Profile</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Experience</TableHead>
                   <TableHead>Specialization</TableHead>
                   <TableHead>Hospital</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((Doctor) => (
                  <TableRow key={Doctor.id}>
                    <TableCell>{Doctor.id}</TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={Doctor.avatar} />
                        <AvatarFallback>
                          {Doctor.firstName[0]}
                          {Doctor.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {Doctor.firstName} {Doctor.lastName}
                    </TableCell>
                    <TableCell>{Doctor.email}</TableCell>
                    <TableCell>{Doctor.phone}</TableCell>
                    <TableCell>{Doctor.experience}</TableCell>
                    <TableCell>{Doctor.specialization}</TableCell>
                    <TableCell>{Doctor.hospital}</TableCell>
                    <TableCell>{Doctor.joiningDate}</TableCell>
                    <TableCell>{Doctor.createdBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/hospital/Doctors/edit/${Doctor.id}`,{state: Doctor})}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(Doctor.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="add">
          <div className="rounded-md border bg-card p-6">
            <p className="text-muted-foreground">
              Add Doctor form will be rendered here. Navigate to{" "}
              <code>/hospital/Doctors/add</code> for the full form.
            </p>
            <Button onClick={() => navigate("/hospital/Doctors/add")} className="mt-4">
              Go to Add Doctor Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the Doctor.
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
