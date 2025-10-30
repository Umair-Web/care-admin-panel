import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Construction className="h-24 w-24 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            This feature is currently under development. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;
