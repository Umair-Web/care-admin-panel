import { useEffect, useState } from "react";
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
import { Edit, Trash2, Eye } from "lucide-react";
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
import axios from "axios";

const mockSubscriptions = [
  {
    id: 1,
    name: "Cardiology Basics",
    price: 29.99,
    details: "Intro course to cardiology fundamentals",
    duration: "3 months",
  },
  {
    id: 2,
    name: "VR Surgery Simulation",
    price: 49.99,
    details: "Hands-on VR surgical procedures training",
    duration: "6 months",
  },
];

export default function AllSubscriptions() {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [mockSubscriptions, setMockSubscriptions] = useState<Array<{
    id: number;
    name: string;
    price: number;
    details: string;
    duration: string;
  }>>([]);

  const token = authStorage.getToken();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = () => {
    axios.get(`https://${BASE_URL}/subscriptions`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

    }).then((response) => {
      console.log("All Subscription Success");
      console.log("All Subscription Response:", response);



      setMockSubscriptions(response.data.subscriptions);


      // navigate("/Subscriptions/all");

    }).catch((error) => {
      console.error("All Subscription Error:", error);
      console.error("All Subscription Error Response:", error.response);
      console.error("All Subscription Error Data:", error.response?.data);
    });

  }


  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredSubscriptions = mockSubscriptions.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `https://${BASE_URL}/subscription/${deleteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Subscription deleted successfully!");
      // Refresh the list
      fetchSubscriptions();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete subscription");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Subscriptions</TabsTrigger>
          <TabsTrigger value="add">Add Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search Subscriptions..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>{subscription.id}</TableCell>
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell>${subscription.price.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs truncate">{subscription.details}</TableCell>
                    <TableCell>{subscription.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/Subscriptions/edit/${subscription.id}`, { state: subscription })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(subscription.id)}
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
              Add Subscription form will be rendered here. Navigate to <code>/Subscriptions/add</code> for the
              full form.
            </p>
            <Button onClick={() => navigate("/Subscriptions/add")} className="mt-4">
              Go to Add Subscription Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the Subscription.
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
