import axios, { AxiosError } from "axios";
import { createContext, useContext, useEffect, useState } from "react";

import type { AxiosStatic } from "axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { ChatContext } from "./ChatContext";


type UserData = {
    _id: string;
    email: string;
    fullName: string;
    profileImage: string;
    bio: string;
    blocked?: string[];
};

interface AppContextType {
    backendUrl: string;
    axios: AxiosStatic;
    token: string | null;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    authUser: UserData | null;
    setAuthUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    socket: Socket | null;
    setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
    login: (state: "Login" | "Sign Up", credentials: Partial<UserData> & { password: string }) => Promise<void>;
    updateProfile: (body: { fullName: string, bio: string, profileImage?: string }) => Promise<void>;
    validateSignup: (credentials: { email: string, password: string, fullName: string }) => Promise<void>;
    logout: () => Promise<void>;
    onlineUsers: string[];
    setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;
    handleBlock: (userId: string) => Promise<void>;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    axios.defaults.baseURL = backendUrl;

    const getInitialToken = () => {
        const stored = localStorage.getItem("token");
        if (!stored || stored === "null" || stored === "undefined") return null;
        return stored;
    };

    const [token, setToken] = useState<string | null>(getInitialToken());
    const [authUser, setAuthUser] = useState<UserData | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    const [isCurrentUserBlocked, setIsCurrentUserBlocked] = useState(false);
    const [isReceiverBlocked, setIsReceiverBlocked] = useState(false);

    const context = useContext(ChatContext);
    if (!context) throw new Error("AppContext must be within ChatContextProvider");
    const { selectedUser } = context;

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/user/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            } else {
                logout();
            }

        } catch (error) {
            console.error("checkAuth failed", error);
            logout();
        }
    };


    const validateSignup = async (credentials: { email: string, password: string, fullName: string }) => {
        const { data } = await axios.post("/api/user/validate-signup", credentials);
        return data;
    };


    // Login function to handle user authentication and socket connection
    const login = async (state: "Login" | "Sign Up", credentials: Partial<UserData> & { password: string }) => {
        try {
            const endpoint = state === "Sign Up" ? "signup" : "login";
            const { data } = await axios.post(`/api/user/${endpoint}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            let errMessage = "An unknown error occurred";

            if (axios.isAxiosError(error)) {
                errMessage = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                errMessage = error.message;
            }

            toast.error(errMessage);
        }
    };


    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common['token'] = null;
        toast.success("Logged out successfully");
        socket?.disconnect();
    };


    // Update profile funciton to handle profile updates
    const updateProfile = async (body: { fullName: string, bio: string, profileImage?: string }) => {
        try {
            const { data } = await axios.put("/api/user/update", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success(data.message);

            } else {
                toast.error(data.message);
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


    const handleBlock = async (userId: string) => {
        try {
            const endpoint = isReceiverBlocked ? `/api/user/unblock/${userId}` : `/api/user/block/${userId}`;
            const { data } = await axios.put(endpoint);

            if (data.success) {
                setIsReceiverBlocked((prev) => !prev);
                toast.success(data.message);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };


    useEffect(() => {
        if (token && token !== "null" && token !== "undefined") {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        } else {
            delete axios.defaults.headers.common['token'];
        }
    }, [token]);

    useEffect(() => {
        return () => {
            socket?.disconnect();
        };
    }, [socket]);

    useEffect(() => {
        if (authUser && selectedUser) {
            setIsCurrentUserBlocked(selectedUser.blocked?.includes(authUser._id) ?? false);
            setIsReceiverBlocked(authUser.blocked?.includes(selectedUser._id) ?? false);
        }
    }, [authUser, selectedUser]);

    const value = {
        axios,
        backendUrl,
        token,
        setToken,
        authUser,
        setAuthUser,
        login,
        logout,
        updateProfile,
        validateSignup,
        socket,
        setSocket,
        onlineUsers,
        setOnlineUsers,
        isCurrentUserBlocked,
        isReceiverBlocked,
        handleBlock
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
};

export default AppContextProvider;