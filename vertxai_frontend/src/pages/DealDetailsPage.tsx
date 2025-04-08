import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/navbar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { DocumentUploader } from "@/components/documents/document-uploader";
import { PriceNegotiation } from "@/components/deals/price-negotiation";
import { useToast } from "@/components/ui/use-toast";
import { FileText, MessageSquare, DollarSign, Calendar, User, Edit, Pause } from "lucide-react";

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

// Mock deal data
const mockDeal = {
  id: "deal-1",
  title: "Software Development Project",
  description:
    "Development of a custom CRM system with customer management, invoicing, and reporting features. Including 3 months of support and bug fixes after delivery.",
  price: 15000,
  status: "progress" as "pending" | "progress" | "completed" | "cancelled" ,
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
    const timestamp = new Date(now.getTime() - (messageContents.length - i) * 3600000);
    
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [deal, setDeal] = useState(mockDeal);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: user?.id || "",
      senderName: user?.name || "",
      timestamp: new Date(),
      isRead: false,
    };
    
    setMessages([...messages, newMessage]);
    
    // Simulate reply after 2 seconds
    if (messages.length < 15) {
      setTimeout(() => {
        const replyMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          content: "Thanks for your message. I'll get back to you soon.",
          senderId: user?.role === "buyer" ? "seller-1" : "buyer-1",
          senderName: user?.role === "buyer" ? "Tech Solutions Inc." : "Global Commerce Ltd.",
          timestamp: new Date(),
          isRead: false,
        };
        
        setMessages((prevMessages) => [...prevMessages, replyMessage]);
      }, 2000);
    }
  };

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
      senderId: user?.id || "",
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
            <div>
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
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Buyer: {deal.buyer.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Seller: {deal.seller.name}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-2 ml-auto">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => navigate(`/deals/${id}/edit`)}
              >
                <Edit className="h-4 w-4" /> Edit Deal
              </Button>
              
              {deal.status === "progress" && (
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
              
              {(deal.status === "pending" || deal.status === "progress") && (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chat */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="chat">
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="chat" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" /> Messages
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> Documents ({documents.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-0">
              <div className="bg-white rounded-lg shadow-sm border h-[500px]">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    dealParticipants={{
                      buyer: deal.buyer,
                      seller: deal.seller,
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium mb-4">Deal Documents</h3>
                  <DocumentUploader
                    documents={documents}
                    onUpload={handleUploadDocument}
                    onDelete={handleDeleteDocument}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Deal Info and Negotiation */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <PriceNegotiation
                initialPrice={deal.price}
                offers={offers}
                onMakeOffer={handleMakeOffer}
                onAcceptOffer={handleAcceptOffer}
                onRejectOffer={handleRejectOffer}
                dealStatus={deal.status}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DealDetailsPage;
