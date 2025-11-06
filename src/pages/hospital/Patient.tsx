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
import { Edit, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const mockPatients = [
  {
    id: 1,
    firstName: "patient1",
    lastName: "Brown",
    email: "alice.brown@patient.com",
    phone: "+1-555-1001",
    dob: "1990-06-12",
    gender: "Female",
    address: "123 Main St",
    createdBy: "Admin",
    assignedHospital: "Central Hospital",
    assignedDoctor: "Doctor1 Valov",
    avatar: "",
  },
  {
    id: 2,
    firstName: "patirent2",
    lastName: "Smith",
    email: "bob.smith@patient.com",
    phone: "+1-555-1002",
    dob: "1985-02-20",
    gender: "Male",
    address: "456 Elm Ave",
    createdBy: "Manager",
    assignedHospital: "Northside Clinic",
    assignedDoctor: "Doctor2 Johnson",
    avatar: "",
  },
];

export default function Patient() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = mockPatients.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    toast.success("Patient deleted successfully!");
    setDeleteId(null);
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
            <Input
              placeholder="Search patients..."
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
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Assign Hospital</TableHead>
                  <TableHead>Assign Doctor</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={p.avatar} />
                        <AvatarFallback>
                          {p.firstName[0]}
                          {p.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{p.firstName} {p.lastName}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                    <TableCell>{p.dob}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>{p.address}</TableCell>
                    <TableCell>{p.createdBy}</TableCell>
                    <TableCell>{p.assignedHospital}</TableCell>
                    <TableCell>{p.assignedDoctor}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* <Button variant="ghost" size="icon" onClick={() => navigate(`/hospital/patients/view/${p.id}`, { state: p })}>
                          <Eye className="h-4 w-4" />
                        </Button> */}
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/hospital/patients/edit/${p.id}`, { state: p })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
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
              Add Patient form will be rendered here. Navigate to <code>/hospital/patients/add</code> for the full form.
            </p>
            <Button onClick={() => navigate("/hospital/patients/add")} className="mt-4">
              Go to Add Patient Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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