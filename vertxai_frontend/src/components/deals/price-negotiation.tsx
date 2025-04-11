
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useChatSocket } from "@/hooks/useChatSocket";

type Offer = {
  id: string;
  amount: number;
  createdAt: Date;
  senderId: string;
  senderName: string;
  status: "pending" | "accepted" | "rejected";
};

type PriceNegotiationProps = {
  initialPrice: number;
  offers: Offer[];
  onMakeOffer: (amount: number) => Promise<void>;
  onAcceptOffer: (offerId: string) => Promise<void>;
  onRejectOffer: (offerId: string) => Promise<void>;
  dealStatus: "pending" | "progress" | "completed" | "cancelled";
  selectedSeller: any;
  dealId: string;
  sellerId: string;
};

export function PriceNegotiation({
  initialPrice,
  offers,
  onMakeOffer,
  onAcceptOffer,
  onRejectOffer,
  dealStatus,
  selectedSeller,
  dealId,
  sellerId
}: PriceNegotiationProps) {
  console.log("🚀 ~ selectedSeller:", selectedSeller)
  const [newOfferAmount, setNewOfferAmount] = useState(initialPrice?.toString());
  const [negotiationData, setNegotiationData] = useState([]);
  const { user } = useAuth();
  console.log("🚀 ~ user:", user)
  const [hasPendingOffer, setHasPendingOffer] = useState(false);

  const handelOnChatOfferDataGet = (data) => {
    console.log("🚀 ~ handelOnChatOfferDataGet ~ data:", data)
    setNegotiationData(data?.offers)

  }

  const { newOffer, chatGetOffer } = useChatSocket({
    onChatOfferDataGet: handelOnChatOfferDataGet,

  })


  useEffect(() => {
    if (selectedSeller?.roomId && sellerId) {
      const payload = { roomId: selectedSeller?.roomId, buyerId: selectedSeller?.buyerId, sellerId, dealId }
      chatGetOffer(payload)
    }
  }, [selectedSeller, sellerId])

  useEffect(() => {
    // Check if current user has a pending offer
    if (user) {
      const userPendingOffer = offers.find(
        (offer) => offer.senderId === user._id && offer.status === "pending"
      );
      setHasPendingOffer(!!userPendingOffer);
    }
  }, [offers, user]);

  const handleMakeOffer = async () => {
    const amount = parseFloat(newOfferAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await onMakeOffer(amount);
      const payload = { roomId: selectedSeller?.roomId, buyerId: selectedSeller?.buyerId, sellerId, dealId, price: amount }
      newOffer(payload)
      // setHasPendingOffer(true);
    } catch (error) {
      console.error("Failed to make offer:", error);
    }
  };

  const isDisabled = dealStatus === "completed" || dealStatus === "cancelled";
  const sortedOffers = [...offers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const latestOffer = sortedOffers[0];

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Price Negotiation</h3>
          <Badge variant={isDisabled ? "outline" : "default"}>
            {isDisabled ? "Closed" : "Open"}
          </Badge>
        </div>

        <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Initial Price</p>
            <p className="text-xl font-bold">${initialPrice?.toLocaleString()}</p>
          </div>
          {latestOffer && (
            <>
              <ArrowRight className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Latest Offer</p>
                <p className="text-xl font-bold">${latestOffer?.amount?.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>

        {!isDisabled && user && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="number"
                  value={newOfferAmount}
                  onChange={(e) => setNewOfferAmount(e.target.value)}
                  className="pl-10"
                  placeholder="Enter offer amount"
                  disabled={hasPendingOffer || isDisabled}
                />
              </div>
              <Button
                onClick={handleMakeOffer}
                disabled={hasPendingOffer || isDisabled}
              >
                Make Offer
              </Button>
            </div>
            {hasPendingOffer && (
              <p className="text-xs text-amber-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" /> You have a pending offer. Wait for a response before making another offer.
              </p>
            )}
          </div>
        )}
      </div>

      {sortedOffers.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h4 className="font-medium text-sm">Offer History</h4>
          </div>
          <div className="divide-y h-60 overflow-y-auto">
            {sortedOffers.map((offer) => {
              const isCurrentUserOffer = user?._id === offer?.senderId;
              const canRespondToOffer = user && !isCurrentUserOffer && offer?.status === "pending" && !isDisabled;

              return (
                <div key={offer.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {isCurrentUserOffer ? "You" : offer?.senderName} offered ${offer?.amount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {offer.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      {offer?.status === "pending" ? (
                        canRespondToOffer ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRejectOffer(offer?.id)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onAcceptOffer(offer?.id)}
                            >
                              Accept
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending
                          </Badge>
                        )
                      ) : offer?.status === "accepted" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Accepted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
