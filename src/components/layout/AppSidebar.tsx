import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Hospital,
  Smartphone,
  Layers,
  CreditCard,
  Video,
  LogOut,
  ChevronRight,
  Building2,
  UserCog,
  Stethoscope,
  User,
  GraduationCap,
  Briefcase,
  Activity,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import logo from "../../assets/logo.png";
const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/users/all", icon: Users },
  {
    title: "Hospital",
    icon: Hospital,
    submenu: [
      { title: "Hospitals", url: "/hospital/list/all", icon: Building2 },
      { title: "Managers", url: "/hospital/managers/all", icon: UserCog },
      { title: "Doctors", url: "/hospital/doctors/all", icon: Stethoscope },
      { title: "Patients", url: "/hospital/patients/all", icon: User },
      { title: "Specializations", url: "/hospital/specializations/all", icon: GraduationCap },
      { title: "Departments", url: "/hospital/departments/all", icon: Briefcase },
    ],
  },
  { title: "Devices", url: "/devices/list", icon: Smartphone },
  { title: "Category", url: "/categories/all", icon: Layers },
  { title: "Subscription", url: "/subscriptions/all", icon: CreditCard },
  { title: "Videos", url: "/videos/all", icon: Video },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    toast.success("Logged out successfully!");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem('dashboardReloaded');
    navigate("/signin");
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="p-4 border-b flex items-center gap-2">
        <div className="bg-white p-2 rounded-lg">
          <img
            src={logo}
            alt="Metanoia-VR Logo"
            width={28}
            height={28}
          />
        </div>
        {!isCollapsed ? (
          <span className="font-bold text-lg">Metanoia-VR</span>
        ) : (
          <img
            src={logo}
            alt="Metanoia-VR Logo"
            width={22}
            height={22}
            className="absolute"
          />
        )}

      </div>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Main Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) =>
                item.submenu ? (
                  <Collapsible key={item.title} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                          {!isCollapsed && (
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <NavLink
                                  to={subItem.url}
                                  className={({ isActive }) =>
                                    isActive ? "bg-sidebar-accent" : ""
                                  }
                                >
                                  <subItem.icon className="h-4 w-4" />
                                  {!isCollapsed && <span>{subItem.title}</span>}
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? "bg-sidebar-accent" : ""
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-2 border-t">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  );
}
