import { useEffect, useState } from "react";
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
// badge not used in simplified devices table
import { Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AllDevices() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [infoDevice, setInfoDevice] = useState<typeof mockDevices[0] | null>(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const token = authStorage.getToken();
    axios.get(`https://${BASE_URL}/devices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Fetched devices:", response.data);
      setDevices(response.data.data || []);
    })
    .catch((error) => {
      console.error("Error fetching devices:", error);
    });
  }, []);

  const filteredDevices = devices.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    toast.success("Device deleted successfully!");
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Devices</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Devices</TabsTrigger>
          <TabsTrigger value="add">Add Device</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search Devices..."
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
                    <TableHead>Title</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>MAC Address</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>{device.id}</TableCell>
                      <TableCell className="font-medium">{device.title}</TableCell>
                      <TableCell>{device.ip}</TableCell>
                      <TableCell>{device.mac}</TableCell>
                      <TableCell>{device.username}</TableCell>
                      <TableCell>
                        <span className={device.status === "connected" ? "text-green-600" : "text-red-600"}>
                          {device.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setInfoDevice(device)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                         
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(device.id)}
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
              Add Device form will be rendered here. Navigate to <code>/Devices/add</code> for the
              full form.
            </p>
            <Button onClick={() => navigate("/Devices/add")} className="mt-4">
              Go to Add Device Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the Device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={infoDevice !== null} onOpenChange={() => setInfoDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Device Details</DialogTitle>
          </DialogHeader>
          {infoDevice && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{infoDevice.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{infoDevice.ip}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MAC Address</p>
                  <p className="font-medium">{infoDevice.mac}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{infoDevice.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={infoDevice.status === "connected" ? "default" : "destructive"}>
                    {infoDevice.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
