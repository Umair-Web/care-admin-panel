import { useState, useEffect } from "react";
import { Users, Layers, Video, Building2, UserCog, Stethoscope, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import axios from "axios";
import { authStorage } from "@/utils/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const token = authStorage.getToken();

interface DashboardStatistics {
  total_users: number;
  total_categories: number;
  total_videos: number;
  total_hospitals: number;
  total_doctors: number;
  total_managers: number;
  total_patients: number;
  users_by_role: {
    patients: number;
    managers: number;
    admins: number;
  };
  recent_stats: {
    users_this_month: number;
    hospitals_this_month: number;
    doctors_this_month: number;
    patients_this_month: number;
  };
}

const Dashboard = () => {
  
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
 
  // Debug state changes
  useEffect(() => {
   
    console.log("Statistics state updated:", statistics);
    console.log("Loading state:", loading);
  }, [statistics, loading]);

  useEffect(() => {
   
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://${BASE_URL}/dashboard/statistics`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Full response:", response.data);
      console.log("Response data:", response.data.data || response.data);

      // Handle both formats: {success: true, data: {...}} and {status: 'success', data: {...}} and direct data
      let statisticsData = null;
      if (response.data.success === true && response.data.data) {
        statisticsData = response.data.data;
      } else if (response.data.status === 'success' && response.data.data) {
        statisticsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Handle direct response format
        statisticsData = response.data;
      }

      console.log("Processed statistics data:", statisticsData);

      if (statisticsData && statisticsData.total_users !== undefined) {
        setStatistics(statisticsData);
        console.log("Statistics set successfully:", statisticsData);
      } else {
        console.error("Invalid statistics data format:", statisticsData);
        toast.error("Invalid statistics data format");
      }
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const calculateProgress = (current: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min(Math.round((current / total) * 100), 100);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your Metanoia-VR management system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-4" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your Metanoia-VR management system
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No statistics available at the moment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: formatNumber(statistics?.total_users || 0),
      rawValue: statistics?.total_users || 0,
      thisMonth: statistics?.recent_stats?.users_this_month || 0,
      icon: Users,
      color: "#FF7E41",
    },
    {
      title: "Total Categories",
      value: formatNumber(statistics?.total_categories || 0),
      rawValue: statistics?.total_categories || 0,
      thisMonth: 0, // No monthly data for categories in API
      icon: Layers,
      color: "#FF7E41",
    },
    {
      title: "Total Videos",
      value: formatNumber(statistics?.total_videos || 0),
      rawValue: statistics?.total_videos || 0,
      thisMonth: 0, // No monthly data for videos in API
      icon: Video,
      color: "#FF7E41",
    },
    {
      title: "Total Hospitals",
      value: formatNumber(statistics?.total_hospitals || 0),
      rawValue: statistics?.total_hospitals || 0,
      thisMonth: statistics?.recent_stats?.hospitals_this_month || 0,
      icon: Building2,
      color: "#FF7E41",
    },
    {
      title: "Total Doctors",
      value: formatNumber(statistics?.total_doctors || 0),
      rawValue: statistics?.total_doctors || 0,
      thisMonth: statistics?.recent_stats?.doctors_this_month || 0,
      icon: Stethoscope,
      color: "#FF7E41",
    },
    {
      title: "Total Managers",
      value: formatNumber(statistics?.total_managers || 0),
      rawValue: statistics?.total_managers || 0,
      thisMonth: 0, // Calculate based on users_by_role if needed
      icon: UserCog,
      color: "#FF7E41",
    },
    {
      title: "Total Patients",
      value: formatNumber(statistics?.total_patients || 0),
      rawValue: statistics?.total_patients || 0,
      thisMonth: statistics?.recent_stats?.patients_this_month || 0,
      icon: User,
      color: "#FF7E41",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your Metanoia-VR management system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const progress = stat.thisMonth > 0 
            ? calculateProgress(stat.thisMonth, stat.rawValue) 
            : calculateProgress(stat.rawValue, Math.max(stat.rawValue * 1.2, 100));
          
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5`} style={{ color: stat.color }} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{stat.value}</div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.thisMonth > 0 
                    ? `${stat.thisMonth} added this month`
                    : `${progress}% of target`
                  }
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats Cards for Role Distribution */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Patients</span>
                <span className="font-medium">{formatNumber(statistics?.users_by_role?.patients || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Managers</span>
                <span className="font-medium">{formatNumber(statistics?.users_by_role?.managers || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Admins</span>
                <span className="font-medium">{formatNumber(statistics?.users_by_role?.admins || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month's Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Users</span>
                <span className="font-medium">{statistics?.recent_stats?.users_this_month || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Hospitals</span>
                <span className="font-medium">{statistics?.recent_stats?.hospitals_this_month || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Doctors</span>
                <span className="font-medium">{statistics?.recent_stats?.doctors_this_month || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Patients</span>
                <span className="font-medium">{statistics?.recent_stats?.patients_this_month || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Entities</span>
                <span className="font-medium">
                  {formatNumber(
                    (statistics?.total_users || 0) + 
                    (statistics?.total_hospitals || 0) + 
                    (statistics?.total_doctors || 0) + 
                    (statistics?.total_patients || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Content Items</span>
                <span className="font-medium">
                  {formatNumber((statistics?.total_categories || 0) + (statistics?.total_videos || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
