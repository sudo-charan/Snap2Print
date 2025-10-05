import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer, Zap, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center animate-pulse-glow">
              <Printer className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Snap2Print
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
            The fastest way to manage print jobs at your college xerox center. 
            No more WhatsApp chaos. No more USB cables. Just scan, print, done.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 shadow-elevated hover:shadow-xl transition-all"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              Login to Dashboard
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          {[
            {
              icon: Zap,
              title: "Instant File Transfer",
              description: "Students scan QR code and upload files in seconds. No internet lag, no confusion.",
              gradient: "from-primary to-secondary",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Files transfer directly to your dashboard. No data stored on student devices.",
              gradient: "from-success to-emerald-500",
            },
            {
              icon: Clock,
              title: "Real-Time Updates",
              description: "Track all print jobs live. See pending, completed, and manage everything easily.",
              gradient: "from-warning to-orange-500",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-primary rounded-3xl p-12 max-w-4xl mx-auto shadow-elevated animate-fade-in">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Revolutionize Your Xerox Center?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join the future of college printing. Set up your shop in less than 5 minutes.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
          >
            Create Free Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
