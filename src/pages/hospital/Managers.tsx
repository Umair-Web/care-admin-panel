import { useState, useEffect } from "react";
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
import axios from "axios";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

// Helper function to construct proper image URL
const getImageUrl = (profileImage: string | null): string => {
  if (!profileImage) return "";
  
  // If already starts with https or httpss, return as is
  if (profileImage.startsWith('https')) {
    return profileImage;
  }
  
  // If starts with /storage, prepend base URL only
  if (profileImage.startsWith('/storage')) {
    return `https://${BASE_URL}${profileImage}`;
  }
  
  // If starts with assets/, it's in public directory (no /storage/ prefix needed)
  if (profileImage.startsWith('assets/')) {
    return `https://${BASE_URL}/${profileImage}`;
  }
  
  // For other formats (profile_images/, etc.), add /storage/ prefix
  return `https://${BASE_URL}/storage/${profileImage}`;
};

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
}

interface Manager {
  id: number;
  user_id: number;
  phone_number: string;
  joining_date: string;
  user: User;
}

export default function Managers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredManagers = managers.filter((manager) =>
    `${manager.user.first_name} ${manager.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // ✅ FIXED: Use /api/managers instead of /managers
      await axios.delete(`https://${BASE_URL}/managers/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Manager deleted successfully!");
      setDeleteId(null);
      fetchManagers(); // Refresh the list
    } catch (error: any) {
      console.error("Delete error:", error);
      console.log("Error details:", error.response);
      const errorMessage = error.response?.data?.message || "Failed to delete manager";
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hospital Managers</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Managers</TabsTrigger>
          <TabsTrigger value="add">Add Manager</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search managers..."
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
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading managers...
                    </TableCell>
                  </TableRow>
                ) : filteredManagers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No managers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredManagers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell>{manager.id}</TableCell>
                      <TableCell>
                        <Avatar>
                          <AvatarImage 
                            src={getImageUrl(manager.user.profile_image)} 
                          />
                          <AvatarFallback>
                            {manager.user.first_name[0]}
                            {manager.user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {manager.user.first_name} {manager.user.last_name}
                      </TableCell>
                      <TableCell>{manager.user.email}</TableCell>
                      <TableCell>{manager.phone_number || "N/A"}</TableCell>
                      <TableCell>{formatDate(manager.joining_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/hospital/managers/edit/${manager.id}`, { state: manager })}
                            title="Edit Manager"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(manager.id)}
                            title="Delete Manager"
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
              Add Manager form will be rendered here. Navigate to{" "}
              <code>/hospital/managers/add</code> for the full form.
            </p>
            <Button onClick={() => navigate("/hospital/managers/add")} className="mt-4">
              Go to Add Manager Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the manager.
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
