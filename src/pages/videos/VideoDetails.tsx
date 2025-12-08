import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, ArrowLeft, Trash2 } from "lucide-react";
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

export default function VideoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideoData();
    }
  }, [id]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://${BASE_URL}/videos`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const videoData = response.data.videos.find((v: Video) => v.id === Number(id));
      if (videoData) {
        setVideo(videoData);
      } else {
        toast.error("Video not found");
        navigate("/videos/all");
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error("Failed to load video data");
      navigate("/videos/all");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!video) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`https://${BASE_URL}/video/${video.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          id: video.id
        }
      });

      toast.success("Video deleted successfully!");
      navigate("/videos/all");
    } catch (error: any) {
      console.error("Delete error:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete video";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading video details...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Video not found</p>
          <Button onClick={() => navigate("/videos/all")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/videos/all")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </Button>
          <h1 className="text-3xl font-bold">Video Details</h1>
        </div>
        <div className="flex gap-2">
     
   
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Video Player</CardTitle>
            </CardHeader>
            <CardContent>
              {video.video ? (
                <video
                  src={`https://${BASE_URL}/storage/${video.video}`}
                  controls
                  className="w-full h-auto rounded-md"
                  preload="metadata"
                  poster={video.image ? `https://${BASE_URL}/storage/${video.image}` : undefined}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">No video file available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Video Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-lg font-semibold">{video.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge variant="secondary" className="mt-1">
                  {video.category?.name || "No Category"}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <Badge variant="outline" className="mt-1">
                  {video.type || "Default"}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Video ID</p>
                <p className="text-sm">{video.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(video.created_at)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDate(video.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Thumbnail */}
          {video.image && (
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={`https://${BASE_URL}/storage/${video.image}`}
                  alt={video.title}
                  className="w-full h-auto rounded-md"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}