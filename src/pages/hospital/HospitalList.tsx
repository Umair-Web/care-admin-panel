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

const mockHospitals = [
  {
    id: 1,
    name: "City General Hospital ss",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    phone: "+1-555-0101",
    email: "info@citygeneral.com",
    license: "LIC-2024-001",
    established: "2010-05-15",
    manager: "John Smith",
    departments: "Cardiology, Surgery",
    postalCode: "10001",
    isActive: true,
  },
  {
    id: 2,
    name: "Memorial Medical Center",
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    phone: "+1-555-0102",
    email: "contact@memorial.com",
    license: "LIC-2024-002",
    established: "2015-08-20",
    manager: "Sarah Johnson",
    departments: "Emergency, Pediatrics",
    postalCode: "90001",
    isActive: true,
  },
];

export default function HospitalList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredHospitals = mockHospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    toast.success("Hospital deleted successfully!");
    setDeleteId(null);
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
                  <TableHead>Departments</TableHead>
                  <TableHead>Postal Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell>{hospital.id}</TableCell>
                    <TableCell className="font-medium">{hospital.name}</TableCell>
                    <TableCell>{hospital.address}</TableCell>
                    <TableCell>{hospital.city}</TableCell>
                    <TableCell>{hospital.state}</TableCell>
                    <TableCell>{hospital.phone}</TableCell>
                    <TableCell>{hospital.email}</TableCell>
                    <TableCell>{hospital.license}</TableCell>
                    <TableCell>{hospital.established}</TableCell>
                    <TableCell>{hospital.manager}</TableCell>
                    <TableCell>{hospital.departments}</TableCell>
                    <TableCell>{hospital.postalCode}</TableCell>
                    <TableCell>
                      <Badge variant={hospital.isActive ? "default" : "secondary"}>
                        {hospital.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/hospital/list/edit/${hospital.id}`,{state: hospital})}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(hospital.id)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
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
                ))}
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
