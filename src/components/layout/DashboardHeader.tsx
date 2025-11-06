import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export function DashboardHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    return paths.map((path, index) => ({
      label: path.charAt(0).toUpperCase() + path.slice(1).replace("-", " "),
      path: "/" + paths.slice(0, index + 1).join("/"),
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    toast.success("Logged out successfully!");
    localStorage.removeItem("isAuthenticated");
    navigate("/signin");
  };

  return (
    <header className="h-[75px] border-b bg-card px-6  flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path}>
              {index > 0 && <span className="mx-2">/</span>}
              <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                {crumb.label}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 w-64"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="" alt="User" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
