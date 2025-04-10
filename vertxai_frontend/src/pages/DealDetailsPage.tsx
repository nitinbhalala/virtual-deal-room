import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/navbar";
// import { ChatInterface } from "@/components/chat/chat-interface";
import { DocumentUploader } from "@/components/documents/document-uploader";
import { PriceNegotiation } from "@/components/deals/price-negotiation";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  MessageSquare,
  DollarSign,
  Calendar,
  User,
  Edit,
  Pause,
} from "lucide-react";
import ChatInterface from "@/components/chat/chat-interface";
import { getAllDeals, getAllDocument } from "@/services/authService";
import { useChatSocket } from "@/hooks/useChatSocket";

// Mock data types
type Message = {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isRead: boolean;
};

type Document = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
};

type Offer = {
  id: string;
  amount: number;
  createdAt: Date;
  senderId: string;
  senderName: string;
  status: "pending" | "accepted" | "rejected";
};

interface SingleBuyerItem {
  seller: {
    sellerId: string;
    name: string;
  };
  deal: {
    _id: string;
    title: string;
    description: string;
    price: number;
    status: string;
    sellerId: string;
    buyerId: string;
    createdAt: string;
    updatedAt: string;
    documents: number;
    messages: number;
  };
  buyers: {
    roomId: string;
    buyerId: string;
    name: string;
    email: string;
  }[];
}

// Mock deal data
// const mockDeal = {
//   id: "deal-1",
//   title: "Software Development Project",
//   description:
//     "Development of a custom CRM system with customer management, invoicing, and reporting features. Including 3 months of support and bug fixes after delivery.",
//   price: 15000,
//   status: "progress" as "pending" | "progress" | "completed" | "cancelled",
//   createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
//   seller: {
//     id: "seller-1",
//     name: "Tech Solutions Inc.",
//   },
//   buyer: {
//     id: "buyer-1",
//     name: "Global Commerce Ltd.",
//   },
// };

// Generate mock messages
const generateMockMessages = (): Message[] => {
  const messages: Message[] = [];
  const now = new Date();

  const messageContents = [
    "Hi there, I'm interested in this deal.",
    "Great! What specific questions do you have?",
    "What's your timeline for delivery?",
    "We can deliver within 8 weeks of signing the contract.",
    "That sounds reasonable. Can we negotiate on the price a bit?",
    "We may have some flexibility. What did you have in mind?",
    "Could we do $13,500?",
    "Let me check with my team and get back to you.",
    "I've discussed with the team. We can do $14,200 as our best offer.",
    "That works for me. I'll prepare the documents.",
  ];

  for (let i = 0; i < messageContents.length; i++) {
    const isEven = i % 2 === 0;
    const timestamp = new Date(
      now.getTime() - (messageContents.length - i) * 3600000
    );

    messages.push({
      id: `msg-${i + 1}`,
      content: messageContents[i],
      senderId: isEven ? "buyer-1" : "seller-1",
      senderName: isEven ? "Global Commerce Ltd." : "Tech Solutions Inc.",
      timestamp,
      isRead: true,
    });
  }

  return messages;
};

// Generate mock documents
const generateMockDocuments = (): Document[] => {
  return [
    {
      id: "doc-1",
      name: "Project_Proposal.pdf",
      size: 2500000,
      type: "application/pdf",
      url: "#",
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "doc-2",
      name: "Contract_Draft.docx",
      size: 1200000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      url: "#",
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "doc-3",
      name: "Requirements.pdf",
      size: 3500000,
      type: "application/pdf",
      url: "#",
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];
};

// Generate mock offers
const generateMockOffers = (): Offer[] => {
  return [
    {
      id: "offer-1",
      amount: 15000,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      senderId: "seller-1",
      senderName: "Tech Solutions Inc.",
      status: "rejected",
    },
    {
      id: "offer-2",
      amount: 13500,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      senderId: "buyer-1",
      senderName: "Global Commerce Ltd.",
      status: "rejected",
    },
    {
      id: "offer-3",
      amount: 14200,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      senderId: "seller-1",
      senderName: "Tech Solutions Inc.",
      status: "accepted",
    },
  ];
};

const DealDetailsPage = () => {
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  // Create an instance of URLSearchParams with the query string
  const queryParams = new URLSearchParams(location.search);
  const [selectedSeller, setSelectedSeller] = useState<{ buyerId?: string; name?: string } | null>(null);
  console.log("🚀 ~ DealDetailsPage ~ selectedSeller:-----0000000000", selectedSeller)


  // Get the sellerId value
  const sellerId = queryParams.get("sellerId");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [deal, setDeal] = useState<any | null>(null);

  const [buyersList, setBuyersList] = useState<any[]>([]); // Handle buyer list here

  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [singlebuyersList, setsingleBuyersList] =
    useState<SingleBuyerItem | null>(null);
  console.log("🚀 ~ DealDetailsPage ~ singlebuyersList:", singlebuyersList);
  const [documents1, setDocuments1] = useState<DocumentType[]>([]);
  console.log("🚀 ~ DealDetailsPage ~ documents1:", documents1)
  const [loading, setLoading] = useState(true);


  const deal1 = singlebuyersList?.[0]?.deal;
  const seller = singlebuyersList?.[0]?.seller;
  const buyers = singlebuyersList?.[0]?.buyers || [];


  const fetchDocuments = async () => {
    try {
      if (id && selectedSeller?.buyerId && currentUser?._id) {
        setLoading(true);
        const data:any = await getAllDocument(id, selectedSeller?.buyerId, currentUser._id);
        setDocuments1(data); // data should be the array
        console.log("📄 Documents fetched:", data);
      } else {
        console.log("❌ Missing one or more IDs.");
        setLoading(false);
      }
    } catch (error) {
      console.error("🚨 Error fetching documents:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };


   useEffect(() => {
      fetchDocuments();
    }, [id, selectedSeller?.buyerId, currentUser?._id]);



  const uniqueBuyers = buyersList
    .flatMap((item) =>
      item.buyers.map((buyer) => ({
        ...buyer,
        deal: item.deal,
        seller: item.seller,
      }))
    )
    .filter(
      (buyer, index, self) =>
        index ===
        self.findIndex((b) => b.email === buyer.email && b.name === buyer.name)
    );

  const handleBuyerListReceived = useCallback((buyers: any[]) => {
    setBuyersList(buyers);
  }, []);

  const handleSingleBuyerListReceived = useCallback((data: SingleBuyerItem) => {
    setsingleBuyersList(data);
  }, []);

  const { sendMessage, joinChat } = useChatSocket({
    onBuyerListReceived: handleBuyerListReceived,
    onSingleBuyerListReceived: handleSingleBuyerListReceived,
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (currentUser?._id && id) {
      sendMessage("single_buyer_list", {
        sellerId: currentUser._id,
        dealId: id,
      });
    }
  }, []);

  useEffect(() => {
    const fetchAndSetDeal = async () => {
      try {
        const allDeals = await getAllDeals();
        const matchedDeal = allDeals.find((d: any) => d._id === id);
        if (matchedDeal) {
          setDeal(matchedDeal);
        } else {
          console.warn("Deal not found!");
        }
      } catch (error) {
        console.error("Error fetching deal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetDeal();
  }, [id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem("user")) {
      navigate("/login");
      return;
    }

    // Fetch deal data (mock)
    setTimeout(() => {
      setMessages(generateMockMessages());
      setDocuments(generateMockDocuments());
      setOffers(generateMockOffers());
      setIsLoading(false);
    }, 800);
  }, [id, isAuthenticated, navigate]);

  const handleUploadDocument = async (file: File) => {
    // Mock document upload
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: "#",
      uploadedAt: new Date(),
    };

    setDocuments([...documents, newDocument]);

    toast({
      title: "Document Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const handleDeleteDocument = async (id: string) => {
    // Mock document deletion
    await new Promise((resolve) => setTimeout(resolve, 500));

    setDocuments(documents.filter((doc) => doc.id !== id));

    toast({
      title: "Document Deleted",
      description: "The document has been removed.",
    });
  };

  const handleMakeOffer = async (amount: number) => {
    // Mock offer creation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      amount,
      createdAt: new Date(),
      senderId: user?._id || "",
      senderName: user?.name || "",
      status: "pending",
    };

    setOffers([newOffer, ...offers]);

    toast({
      title: "Offer Sent",
      description: `Your offer of $${amount.toLocaleString()} has been sent.`,
    });
  };

  const handleAcceptOffer = async (offerId: string) => {
    // Mock offer acceptance
    await new Promise((resolve) => setTimeout(resolve, 800));

    setOffers(
      offers.map((offer) =>
        offer.id === offerId ? { ...offer, status: "accepted" } : offer
      )
    );

    // Update deal price to the accepted offer amount
    const acceptedOffer = offers.find((offer) => offer.id === offerId);
    if (acceptedOffer) {
      setDeal({ ...deal, price: acceptedOffer.amount });
    }

    toast({
      title: "Offer Accepted",
      description: "You have accepted the offer.",
    });
  };

  const handleRejectOffer = async (offerId: string) => {
    // Mock offer rejection
    await new Promise((resolve) => setTimeout(resolve, 800));

    setOffers(
      offers.map((offer) =>
        offer.id === offerId ? { ...offer, status: "rejected" } : offer
      )
    );

    toast({
      title: "Offer Rejected",
      description: "You have rejected the offer.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container px-4 py-8 flex justify-center items-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <span className="ml-3">Loading deal details...</span>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container px-4 py-8">
        {/* Deal Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{deal.title}</h1>
                <StatusBadge status={deal.status} />
              </div>
              <p className="text-gray-600 mb-4">{deal.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                  <span>${deal.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  <span>{new Date(deal.createdAt).toLocaleDateString()}</span>
                </div>
                {buyersList.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Buyer: {deal.buyer?.name || "N/A"}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Seller: {deal.seller?.name || "N/A"}</span>
                </div>
              </div>
            </div> */}
            <div className="w-full">
              {!deal1 || !seller ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-4 text-gray-500">Fetching deal details, please wait...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{deal1?.title}</h1>
                    <StatusBadge status={deal1?.status} />
                  </div>
                  <p className="text-gray-600 mb-4">{deal1?.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      <span>${deal1?.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{new Date(deal1?.createdAt)?.toLocaleDateString()}</span>
                    </div>

                    {buyers?.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        <span>Buyer(s): N/A {/* {buyers.map((b:any) => b.name).join(", ")} */}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      <span>Seller: {seller?.name || "N/A"}</span>
                    </div>
                  </div>
                </>
              )}
            </div>


            <div className="flex flex-row md:flex-col gap-2 ml-auto">
              {currentUser?.role !== "buyer" && (
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => navigate(`/deals/${id}/edit`)}
                >
                  <Edit className="h-4 w-4" /> Edit Deal
                </Button>
              )}
              {deal?.status === "progress" && buyersList?.length > 0 && (
                <>
                  {/* <Button
                    variant="outline"
                    className="border-purple-500 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                    onClick={() => {
                      setDeal({ ...deal, status: "on-hold" });
                      toast({
                        title: "Deal On Hold",
                        description: "The deal has been put on hold.",
                      });
                    }}
                  >
                    <Pause className="h-4 w-4" /> Put On Hold
                  </Button> */}
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => {
                      setDeal({ ...deal, status: "completed" });
                      toast({
                        title: "Deal Completed",
                        description: "The deal has been marked as completed.",
                      });
                    }}
                  >
                    Complete Deal
                  </Button>
                </>
              )}

              {(deal?.status === "pending" || deal?.status === "progress") && (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setDeal({ ...deal, status: "cancelled" });
                    toast({
                      title: "Deal Cancelled",
                      description: "The deal has been cancelled.",
                    });
                  }}
                >
                  Cancel Deal
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Deal Content */}
        {(currentUser?.role === "buyer" || (currentUser?.role === "seller" && buyersList?.length > 0)) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chat */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="chat">
                <TabsList className="w-full justify-start mb-4">
                  <TabsTrigger value="chat" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" /> Messages
                  </TabsTrigger>
                  {selectedSeller && (
                    <TabsTrigger value="documents" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" /> Documents (
                      {documents1?.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="chat" className="mt-0">
                  <div className="bg-white rounded-lg shadow-sm border h-[500px]">
                    <div className="flex w-full h-full">
                      <div className="w-[26%] bg-gray-100 p-4 overflow-y-auto">
                        {singlebuyersList?.[0]?.buyers?.map((buyer, index) => {
                          const currentList = singlebuyersList[0]; // clean destructuring
                          return (
                            <div
                              key={index}
                              className="mb-3 p-2 bg-white shadow rounded break-words cursor-pointer hover:bg-gray-50"
                              onClick={() => {
                                const currentUser = JSON.parse(
                                  localStorage.getItem("user") || "{}"
                                );
                                if (currentUser?.role === "seller") {
                                  setSelectedSeller(buyer)
                                  joinChat("join_chat", {
                                    sellerId: currentList?.seller?.sellerId,
                                    buyerId: buyer?.buyerId,
                                    dealId: currentList?.deal?._id,
                                  });
                                }
                              }}
                            >
                              <div className="font-semibold text-sm">
                                {buyer?.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {buyer?.email}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right side: Chat Interface */}
                      <div className="flex-1 bg-white p-4">
                        <ChatInterface
                          // buyerId={CurrentUser?._id}
                          sellerId={sellerId}
                          dealId={id}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium mb-4">Deal Documents</h3>
                    <DocumentUploader
                      documents={documents}
                      onUpload={handleUploadDocument}
                      onDelete={handleDeleteDocument}
                      buyerId={selectedSeller?.buyerId}
                      setDocuments1={setDocuments1}
                      documents1={documents1}
                      fetchDocuments={fetchDocuments}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Deal Info and Negotiation */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <PriceNegotiation
                  selectedSeller={selectedSeller}
                  sellerId={sellerId}
                  dealId={id}
                  initialPrice={deal?.price}
                  offers={offers}
                  onMakeOffer={handleMakeOffer}
                  onAcceptOffer={handleAcceptOffer}
                  onRejectOffer={handleRejectOffer}
                  dealStatus={deal?.status}
                />
              </div>
            </div>
          </div>
        )}



      </main>
    </div>
  );
};

export default DealDetailsPage;
