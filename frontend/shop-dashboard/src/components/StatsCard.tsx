import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
}

const StatsCard = ({ title, value, icon: Icon, gradient }: StatsCardProps) => {
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border-border/50">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-br ${gradient} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/80">{title}</p>
              <p className="text-4xl font-bold">{value}</p>
            </div>
            
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
