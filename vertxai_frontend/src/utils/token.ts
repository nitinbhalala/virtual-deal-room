import Cookies from "js-cookie";

export const setToken = (token: string) => {
  Cookies.set("token", token, { expires: 1 }); // 1 day
};

export const getToken = () => Cookies.get("token");

export const removeToken = () => Cookies.remove("token");
