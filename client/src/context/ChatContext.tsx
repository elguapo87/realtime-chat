import { createContext, useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import toast from "react-hot-toast";

type UserType = {
    _id: string;
    email: string;
    fullName: string;
    profileImage: string;
    bio: string;
    blocked?: string[];
};

type MessageDataType = {
    senderId: string;
    receiverId: string;
    text: string;
    image: string;
    createdAt: Date;
};

interface ChatContextType {
    messages: MessageDataType[];
    setMessages: React.Dispatch<React.SetStateAction<MessageDataType[]>>;
    selectedUser: UserType | null;
    setSelectedUser: React.Dispatch<React.SetStateAction<UserType | null>>;
    users: UserType[];
    setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
    getUsers: () => Promise<void>;
    unseenMessages: Record<string, number>;
    setUnseenMessages: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    sendMessage: (messageData: Partial<MessageDataType>) => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
};

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [messages, setMessages] = useState<MessageDataType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});

    const context = useContext(AppContext);
    if (!context) throw new Error("ChatContextProvider must be within AppContextProvider");
    const { axios, socket } = context;

    // Function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/message/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };

    // Function to get messages for selected user
    const getMessages = async (userId: string) => {
        try {
            const { data } = await axios.get(`api/message/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };

    // Function to send message to selected user
    const sendMessage = async (messageData: Partial<MessageDataType>) => {
        try {
            const { data } = await axios.post(`/api/message/send/${selectedUser?._id}`, messageData);
            if (data.success) {
                setMessages((prevMessges) => [...prevMessges, data.newMessage]);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };

    // Function to subscribe to messages for selected user
    const subscribeToMessages = async () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.post(`/api/message/mark/${newMessage._id}`);

            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages, [newMessage.senderId]:
                        prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }));
            }
        });
    };


    // Function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    };


    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages, setMessages,
        users, setUsers,
        selectedUser, setSelectedUser,
        getUsers,
        sendMessage,
        unseenMessages, setUnseenMessages,
        getMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContextProvider;