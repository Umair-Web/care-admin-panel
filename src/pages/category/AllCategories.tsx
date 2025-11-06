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
// badge not used in simplified Categories table
import { Edit, Trash2, Eye } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

const mockCategories = [
  {
    id: 1,
    name: "CardioPlus",
    types: ["monthly", "trial"],
    image: "https://via.placeholder.com/64?text=C+P",
  },
  {
    id: 2,
    name: "SurgeryVR Pro",
    types: ["yearly"],
    image: "https://via.placeholder.com/64?text=SVR",
  },
];

export default function AllCategories() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [infoCategories, setInfoCategories] = useState<typeof mockCategories[0] | null>(null);

  const filteredCategories = mockCategories.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    toast.success("Categories deleted successfully!");
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="add">Add Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search Categories..."
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
                  <TableHead>Type</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((Categories) => (
                  <TableRow key={Categories.id}>
                    <TableCell className="font-medium">{Categories.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* <Avatar className="h-8 w-8">
                            <AvatarImage src={Categories.image} />
                            <AvatarFallback>{Categories.name[0]}</AvatarFallback>
                          </Avatar> */}
                        <span className="font-medium">{Categories.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{Categories.types.join(", ")}</TableCell>
                    <TableCell>
                      <img src={Categories.image} alt={Categories.name} className="h-8 w-8 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setInfoCategories(Categories)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/categories/edit/${Categories.id}`, { state: Categories })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(Categories.id)}
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
              Add Categories form will be rendered here. Navigate to <code>/Categories/add</code> for the
              full form.
            </p>
            <Button onClick={() => navigate("/Categories/add")} className="mt-4">
              Go to Add Categories Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the Categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={infoCategories !== null} onOpenChange={() => setInfoCategories(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categories Details</DialogTitle>
          </DialogHeader>
          {infoCategories && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={infoCategories.image} />
                  <AvatarFallback className="text-lg">{infoCategories.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{infoCategories.name}</h3>
                  <p className="text-sm text-muted-foreground">{infoCategories.types.join(", ")}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Categories ID</p>
                  <p className="font-medium">{infoCategories.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
