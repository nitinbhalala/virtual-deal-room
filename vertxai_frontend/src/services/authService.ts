// services/authService.ts
import api from "@/utils/api";

type User = {
    id: string;
    name: string;
    email: string;
    role: "buyer" | "seller";
};

export interface DocumentResponse {
    token: string;
    user: any; // Replace `any` with the actual user type if available
}

// ✅ Register
export const registerUser = async (data: {
    name: string;
    email: string;
    password: string;
    role: "buyer" | "seller";
}) => {
    const response = await api.post("/users", data);
    return response.data; // should return { token, user }
};

// ✅ Login
export const loginUser = async (data: {
    email: string;
    password: string;
}) => {
    const response = await api.post("/users/login", data);
    return response.data; // should return { token, user }
};


export interface DealPayload {
    title: string;
    description: string;
    price: number;
    status: "pending" | "progress" | "completed" | "cancelled" | "on-hold";
}

export interface DealResponse {
    id: string;
    title: string;
    description: string;
    price: number;
    status: string;
    createdAt: string;
    seller: { id: string; name: string };
    buyer: { id: string; name: string };
}


// ✅ Deals
export const CreateDeals = async (data: {
    title: string;
    description: string;
    price: any;
    // status: string;
    sellerId: string;
}) => {
    const response = await api.post("/deals", data);
    return response.data; // should return { token, user }
};

//Show Deals
export const getAllDeals = async () => {
    const response = await api.get("/deals");
    return response.data; // should return { token, user }
};



//Show Deals
// export const getAlldocument = async (dealId,buyerId,sellerId) => {
//     const response = await api.get(`/document/${dealId}${buyerId}${sellerId}`);
//     return response.data; // should return { token, user }
// };

export const getAllDocument = async (
    dealId: string,
    buyerId: string,
    sellerId: string
): Promise<DocumentResponse> => {
    const url = `/document?dealId=${dealId}&buyerId=${buyerId}&sellerId=${sellerId}`;
    const response = await api.get<DocumentResponse>(url);
    return response.data;
};

export const deleteDocumentById = async (id: string): Promise<void> => {
    const response = await api.delete(`/document/${id}`);
    console.log("🗑️ ~ deleteDocumentById ~ response:", response);
};

// 📦 Common API function for creating/uploading document
export const createDocument = async (formData: FormData): Promise<any> => {
    const response = await api.post('/document', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    console.log("📤 ~ createDocument ~ response:", response);
    return response.data;
};

// ✅ Get current user (if your backend supports)
export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data; // should return user object
};

// ❌ Optional Logout (depends on backend; often it's just clearing token client-side)
export const logoutUser = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};


export const getDealById = async (id: string) => {
    const response = await api.get(`/deals?id=${id}`);
    console.log("🚀 ~ getDealById ~ response:", response)
    return response.data;
};

// ✅ Update deal
export const updateDealById = async (id: string, payload: DealPayload): Promise<DealResponse> => {
    const response = await api.put<DealResponse>(`/deals/${id}`, payload);
    return response.data;
};

