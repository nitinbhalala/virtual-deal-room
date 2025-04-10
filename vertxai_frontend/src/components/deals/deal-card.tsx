
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MessageSquare, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";


export type Deal = {
  _id: string;
  title: string;
  description: string;
  price: number;
  status: "pending" | "progress" | "completed" | "cancelled";
  createdAt: string;
  messages: number;
  documents: number;
  seller: {
    _id: string;
    name: string;
  };
  buyer: {
    _id: string;
    name: string;
  };
};

// export function DealCard({ deal }: { deal: Deal }) {
//   console.log("🚀 ~ DealCard ~ deal1111111:", deal)
//   return (
//     <Link to={`/deals/${deal?._id}?sellerId=${deal?.seller?._id}`}>
//       <Card className="h-full hover:shadow-md transition-shadow">
//         <CardHeader className="pb-2">
//           <div className="flex justify-between items-start">
//             <CardTitle className="text-lg font-semibold">{deal.title}</CardTitle>
//             <StatusBadge status={deal.status} />
//           </div>
//         </CardHeader>
//         <CardContent>
//           <p className="text-sm text-gray-600 mb-2 line-clamp-2">{deal.description}</p>
//           <p className="font-bold text-lg">${deal.price.toLocaleString()}</p>
//           <div className="text-xs text-gray-500 mt-2">
//             Between {deal.buyer.name} & {deal.seller.name}
//           </div>
//         </CardContent>
//         <CardFooter className="pt-2 border-t flex justify-between text-sm text-gray-500">
//           <div className="flex items-center">
//             <MessageSquare className="h-4 w-4 mr-1" />
//             <span>{deal.messages}</span>
//           </div>
//           <div className="flex items-center">
//             <FileText className="h-4 w-4 mr-1" />
//             <span>{deal.documents}</span>
//           </div>
//           <div>
//             {new Date(deal.createdAt).toLocaleDateString(undefined, {
//               month: "short",
//               day: "numeric",
//             })}
//           </div>
//         </CardFooter>
//       </Card>
//     </Link>
//   );
// }

export function DealCard({ deal }: { deal: Deal }) {

  const userDetails = JSON.parse(localStorage?.getItem("user"));

  const isBuyer = userDetails?.role === "buyer";
  // const isClickable =
  //   userDetails?.role === "seller" && userDetails?._id === deal?.seller?._id;
  const isClickable =
    isBuyer || (userDetails?.role === "seller" && userDetails?._id === deal?.seller?._id);

  const { toast } = useToast();

  const buyerName = deal.buyer?.name ?? "Unknown Buyer";
  const sellerName = deal.seller?.name ?? "Unknown Seller";
  const sellerId = deal.seller?._id ?? "unknown";

  const handleBlockedClick = (e) => {
    e.stopPropagation() // stop event bubbling
    toast({
      title: "Not Allowed",
      description: "You can only view your own deals.",
    })
  }

  const cardContent = (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{deal.title}</CardTitle>
          <StatusBadge status={deal.status} />
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{deal.description}</p>
        <p className="font-bold text-lg">${deal.price.toLocaleString()}</p>
        <div className="text-xs text-gray-500 mt-2">
          Between {buyerName} & {sellerName}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t flex justify-between text-sm text-gray-500">
        <div className="flex items-center ">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{deal.messages}</span>
        </div>
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          <span>{deal.documents}</span>
        </div>
        <div>
          {new Date(deal.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <>
      {/* {isClickable && */}
      {/* <Link to={`/deals/${deal?._id}?sellerId=${sellerId}`}>
          <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{deal.title}</CardTitle>
                <StatusBadge status={deal.status} />
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{deal.description}</p>
              <p className="font-bold text-lg">${deal.price.toLocaleString()}</p>
              <div className="text-xs text-gray-500 mt-2">
                Between {buyerName} & {sellerName}
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t flex justify-between text-sm text-gray-500">
              <div className="flex items-center ">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{deal.messages}</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                <span>{deal.documents}</span>
              </div>
              <div>
                {new Date(deal.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </CardFooter>
          </Card>

        </Link> */}
      {isClickable ? (
        <Link
          to={`/deals/${deal?._id}?sellerId=${sellerId}`}
          className="deal-link"
        >
          {cardContent}
        </Link>
      ) : (
        <div
          onClick={handleBlockedClick}
          className="cursor-not-allowed"
        >
          {cardContent}
        </div>
      )}
      {/* } */}
    </>
  );
}
