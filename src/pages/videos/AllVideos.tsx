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
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Maximize } from "lucide-react";
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
import axios from "axios";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

interface Video {
  id: number;
  title: string;
  category_id: number;
  category: {
    id: number;
    name: string;
  };
  image: string;
  video: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export default function AllVideos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = () => {
    setLoading(true);
    axios
      .get(`https://${BASE_URL}/videos`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Fetched videos:", response.data);
        if (response.data.videos) {
          setVideos(response.data.videos);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
        console.error("Error response:", error.response);
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://${BASE_URL}/video/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          id: deleteId
        }
      });

      toast.success("Video deleted successfully!");
      setDeleteId(null);
      fetchVideos();
    } catch (error: any) {
      console.error("Delete error:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete video";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Videos</h1>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="add">Add Video</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search videos..."
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
                  <TableHead>Category</TableHead>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Loading videos...
                    </TableCell>
                  </TableRow>
                ) : filteredVideos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No videos found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVideos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>{video.id}</TableCell>
                      <TableCell className="font-medium">{video.title}</TableCell>
                      <TableCell>{video.category?.name || "N/A"}</TableCell>
                      <TableCell>
                        {video.image ? (
                          <img
                            src={`https://${BASE_URL}/storage/${video.image}`}
                            alt={video.title}
                            className="h-10 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-16 bg-muted rounded"></div>
                        )}
                      </TableCell>
                      <TableCell>
                        {video.video ? (
                          <div className="relative group">
                            <video
                              src={`https://${BASE_URL}/storage/${video.video}`}
                              controls
                              className="h-20 w-32 rounded cursor-pointer"
                              preload="metadata"
                              onClick={() => setFullscreenVideo(video)}
                            >
                              Your browser does not support the video tag.
                            </video>
                            <div 
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center cursor-pointer transition-all"
                              onClick={() => setFullscreenVideo(video)}
                            >
                              <Maximize className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 w-32 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            No Video
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {video.type || "Default"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/videos/details/${video.id}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/videos/edit/${video.id}`, {
                                state: video,
                              })
                            }
                            title="Edit Video"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(video.id)}
                            title="Delete Video"
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
              Add Video form will be rendered here. Navigate to <code>/videos/add</code> for the
              full form.
            </p>
            <Button onClick={() => navigate("/videos/add")} className="mt-4">
              Go to Add Video Form
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Fullscreen Video Dialog */}
      <Dialog open={fullscreenVideo !== null} onOpenChange={() => setFullscreenVideo(null)}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-2">
          <DialogHeader>
            <DialogTitle>{fullscreenVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
            {fullscreenVideo?.video && (
              <video
                src={`https://${BASE_URL}/storage/${fullscreenVideo.video}`}
                controls
                autoPlay
                className="w-full h-full max-h-[calc(90vh-80px)] object-contain"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the video.
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
