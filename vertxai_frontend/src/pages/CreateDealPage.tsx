import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/navbar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { CreateDeals } from "@/services/authService";

const CreateDealPage = () => {
  const userDetails = JSON.parse(localStorage?.getItem("user"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/login");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sellerId = userDetails?._id;
      await CreateDeals({
        title,
        description,
        price,
        sellerId,
      });

      toast({
        title: "Deal Created",
        description: "Your deal has been successfully created",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container max-w-4xl px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Create a New Deal</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear title for your deal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this deal involves, terms, and any other relevant details"
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Starting Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter the starting price"
                min="0"
                step="0.01"
                required
              />
              <p className="text-sm text-gray-500">
                This is your {user?.role === "seller" ? "asking" : "offer"}{" "}
                price. It can be negotiated later.
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                    Deal
                  </>
                ) : (
                  "Create Deal"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateDealPage;
