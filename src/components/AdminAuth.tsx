
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export const AdminAuth = ({ onAuthenticated }: AdminAuthProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const ADMIN_PASSWORD = "lacasa2024"; // Simple password for demo

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate checking password
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onAuthenticated();
        toast({
          title: "Access Granted",
          description: "Welcome to La Casa Veselukha Ruiz Admin Panel",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Incorrect password. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-sage-50 rustic-texture flex items-center justify-center p-4">
      <Card className="w-full max-w-md premium-shadow border-sage-200 bg-white/90">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-terracotta-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-terracotta-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-playfair text-terracotta-800">
            La Casa Veselukha Ruiz Admin
          </CardTitle>
          <p className="text-sage-600">Enter password to access admin panel</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sage-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="border-sage-200 focus:border-terracotta-400 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-sage-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-sage-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-white"
            >
              {isLoading ? "Checking..." : "Access Admin Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
