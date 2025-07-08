import axios from "axios";
import { createContext, useEffect, useState } from "react";

import type { AxiosStatic } from "axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";


type UserData = {
    _id: string;
    email: string;
    fullName: string;
    profileImage: string;
    bio: string;
};

interface AppContextType {
    backendUrl: string;
    axios: AxiosStatic;
    token: string | null;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    authUser: UserData | null;
    setAuthUser: React.Dispatch<React.SetStateAction<UserData | null>>;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    axios.defaults.baseURL = backendUrl;

    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState<UserData | null>(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/user/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };


    // Conncect socket function to handle socket connection and online users update
    const connectSocket = (userData: { _id: string }) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    };


    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        }
    }, [token]);

    const value = {
        axios,
        backendUrl,
        token,
        setToken,
        authUser,
        setAuthUser
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
};

export default AppContextProvider;