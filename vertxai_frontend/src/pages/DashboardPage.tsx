import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/navbar";
import { DealList } from "@/components/deals/deal-list";
import { Deal } from "@/components/deals/deal-card";
import { Plus, BarChart3 } from "lucide-react";
import { getAllDeals } from "@/services/authService";


const DashboardPage = () => {
  const userDetails = JSON.parse(localStorage?.getItem("user"));
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [buyersList, setBuyersList] = useState<any[]>([]);
  // console.log("🚀 ~ DashboardPage ~ buyersList:", buyersList)

  // const handleBuyerListReceived = useCallback((buyers: any[]) => {
  //   setBuyersList(buyers);
  // }, []);

  // const { sendMessage } = useChatSocket({
  //   onBuyerListReceived: handleBuyerListReceived,
  // });

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem("user")) {
      navigate("/login");
      return;
    }
    // setDeals(generateMockDeals);

    const fetchDeals = async () => {
      try {
        const alldeals = await getAllDeals();
        console.log("🚀 ~ fetchDeals ~ alldeals:", alldeals);
        setDeals(alldeals);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, [isAuthenticated, navigate]);

  // const myDeals = deals.filter((deal) => {
  //   if (user?.role === "buyer") {
  //     return deal.buyer._id === user._id;
  //   } else {
  //     return deal.seller._id === user._id;
  //   }
  // });

  const myDeals = deals.filter((deal) => {
    if (!deal || !user) return false;
 
    if (user.role === "buyer") {
      return deal?.buyer?._id === user._id;
    } else {
      return deal?.seller?._id === user._id;
    }
  });
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {userDetails?.role === "seller" && (
            <Link to="/deals/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Deal
              </Button>
            </Link>
          )}
        </div>

        <Tabs
          defaultValue={`${userDetails?.role === "seller" ? "deals" : "all"}`}
        >
          <TabsList className="mb-6">
            {userDetails?.role === "seller" && (
              <TabsTrigger value="deals">My Deals</TabsTrigger>
            )}
            <TabsTrigger value="all">All Deals</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
            </TabsTrigger>
          </TabsList>

          {userDetails?.role === "seller" && (
            <TabsContent value="deals">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-4 text-gray-500">Loading your deals...</p>
                </div>
              ) : myDeals.length > 0 ? (
                <DealList deals={myDeals} />
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border">
                  <h3 className="text-lg font-medium mb-2">No deals yet</h3>
                  <p className="text-gray-500 mb-6">
                    Get started by creating your first deal
                  </p>
                  <Link to="/deals/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Create Deal
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-gray-500">Loading deals...</p>
              </div>
            ) : (
              <DealList deals={deals} />
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Deal Analytics</h2>
              <p className="text-gray-500">Analytics feature coming soon...</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="text-sm font-medium text-green-800">
                    Completed Deals
                  </h3>
                  <p className="text-2xl font-bold text-green-700 mt-2">
                    {deals.filter((d) => d.status === "completed").length}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800">
                    Active Deals
                  </h3>
                  <p className="text-2xl font-bold text-blue-700 mt-2">
                    {deals.filter((d) => d.status === "progress").length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Pending Deals
                  </h3>
                  <p className="text-2xl font-bold text-yellow-700 mt-2">
                    {deals.filter((d) => d.status === "pending").length}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;
