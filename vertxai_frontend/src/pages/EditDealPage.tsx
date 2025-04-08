
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/navbar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

// Mock deal for demonstration
const mockDeal = {
  id: "deal-1",
  title: "Software Development Project",
  description:
    "Development of a custom CRM system with customer management, invoicing, and reporting features. Including 3 months of support and bug fixes after delivery.",
  price: 15000,
  status: "progress" as "pending" | "progress" | "completed" | "cancelled" | "on-hold",
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  seller: {
    id: "seller-1",
    name: "Tech Solutions Inc.",
  },
  buyer: {
    id: "buyer-1",
    name: "Global Commerce Ltd.",
  },
};

const EditDealPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"pending" | "progress" | "completed" | "cancelled" | "on-hold">("pending");

  // Fetch deal data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Mock API call to fetch deal data
    setIsLoading(true);
    setTimeout(() => {
      // In a real application, you would fetch the deal data from an API
      setTitle(mockDeal.title);
      setDescription(mockDeal.description);
      setPrice(mockDeal.price.toString());
      setStatus(mockDeal.status);
      setIsLoading(false);
    }, 800);
  }, [id, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Mock API call to update deal
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Deal Updated",
        description: "Your deal has been successfully updated",
      });

      // Redirect to deal details page
      navigate(`/deals/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update deal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container px-4 py-8 flex justify-center items-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <span className="ml-3">Loading deal data...</span>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate(`/deals/${id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Deal
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Edit Deal</h1>

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
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter the price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: "pending" | "progress" | "completed" | "cancelled" | "on-hold") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/deals/${id}`)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditDealPage;
