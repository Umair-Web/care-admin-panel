import { Users, Layers, Video, Building2, UserCog, Stethoscope, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    title: "Total Users",
    value: "1,234",
    progress: 68,
    icon: Users,
    color: "text-chart-1",
  },
  {
    title: "Total Categories",
    value: "48",
    progress: 75,
    icon: Layers,
    color: "text-chart-2",
  },
  {
    title: "Total Videos",
    value: "892",
    progress: 82,
    icon: Video,
    color: "text-chart-3",
  },
  {
    title: "Total Hospitals",
    value: "156",
    progress: 64,
    icon: Building2,
    color: "text-chart-4",
  },
  {
    title: "Total Doctors",
    value: "2,847",
    progress: 91,
    icon: Stethoscope,
    color: "text-chart-1",
  },
  {
    title: "Total Managers",
    value: "328",
    progress: 58,
    icon: UserCog,
    color: "text-chart-5",
  },
  {
    title: "Total Patients",
    value: "18,542",
    progress: 95,
    icon: User,
    color: "text-chart-2",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your healthcare management system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">{stat.value}</div>
                <Progress value={stat.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.progress}% of target
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
