// services/authService.ts
import api from "@/utils/api";

type User = {
    id: string;
    name: string;
    email: string;
    role: "buyer" | "seller";
};

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


// ✅ Deals
export const CreateDeals = async (data: {
    title: string;
    description: string;
    price: any;
    // status: string;
    sellerId:string;
}) => {
    const response = await api.post("/deals", data);
    return response.data; // should return { token, user }
};

//Show Deals
export const getAllDeals = async () => {
    const response = await api.get("/deals");
    return response.data; // should return { token, user }
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
