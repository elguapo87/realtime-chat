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
    _id?: string;
    senderId: string;
    receiverId?: string;
    groupId?: string;
    text: string;
    image: string;
    createdAt: Date;
};

type GroupType = {
    _id: string;
    name: string;
    image: string;
    members: string[];
    createdBy: string;
};

type GroupMembers = {
    _id: string;
    fullName: string;
    profileImage: string;
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
    isCurrentUserBlocked: boolean;
    isReceiverBlocked: boolean;
    handleBlock: (userId: string) => Promise<void>;
    groups: GroupType[];
    setGroups: React.Dispatch<React.SetStateAction<GroupType[]>>;
    createGroup: (groupData: { name: string; members: string[]; image?: string }) => Promise<void>;
    getUserGroups: () => Promise<void>;
    selectedGroup: GroupType | null;
    setSelectedGroup: React.Dispatch<React.SetStateAction<GroupType | null>>;
    getGroupMessages: (groupId: string) => Promise<void>;
    sendGroupMessage: (messageData: Partial<MessageDataType>) => Promise<void>;
    groupMembers: GroupMembers[];
    setGroupMembers: React.Dispatch<React.SetStateAction<GroupMembers[]>>;
    getAllUsersOfGroup: () => Promise<void>;
};

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [messages, setMessages] = useState<MessageDataType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});

    const [isCurrentUserBlocked, setIsCurrentUserBlocked] = useState(false);
    const [isReceiverBlocked, setIsReceiverBlocked] = useState(false);

    const [groups, setGroups] = useState<GroupType[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);

    const [groupMembers, setGroupMembers] = useState<GroupMembers[]>([]);

    const context = useContext(AppContext);
    if (!context) throw new Error("ChatContextProvider must be within AppContextProvider");
    const { axios, socket, authUser } = context;

    useEffect(() => {
        if (selectedUser) setSelectedGroup(null);
    }, [selectedUser]);

    useEffect(() => {
        if (selectedGroup) setSelectedUser(null);
    }, [selectedGroup]);

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

    // Function to handle block / unblock user
    const handleBlock = async (userId: string) => {
        try {
            const endpoint = isReceiverBlocked ? `/api/user/unblock/${userId}` : `/api/user/block/${userId}`;
            const { data } = await axios.put(endpoint);

            if (data.success) {
                toast.success(data.message);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };

    // Function to create group chat 
    const createGroup = async (groupData: { name: string; members: string[]; image?: string }) => {
        try {
            const { data } = await axios.post("/api/group/create", groupData);

            if (data.success) {
                setGroups((prev) => [...prev, data.group]);
                toast.success("Group created");

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };


    // Function to get all user chat groups
    const getUserGroups = async () => {
        try {
            const { data } = await axios.get("/api/group/user-groups");

            if (data.success) {
                setGroups(data.groups);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    }


    // Function to get group user messages
    const getGroupMessages = async (groupId: string) => {
        try {
            const { data } = await axios.get(`/api/group/messages/${groupId}`);
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


    // Function to send message to group
    const sendGroupMessage = async (messageData: Partial<MessageDataType>) => {
        if (!selectedGroup?._id) {
            toast.error("No group selected");
            return;
        }

        try {
            const { data } = await axios.post(`/api/group/send/${selectedGroup._id}`, messageData);
            if (!data.success) {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };

    // Function to get all users of group
    const getAllUsersOfGroup = async () => {
        try {
            const { data } = await axios.get("/api/group/users");
            if (data.success) {
                setGroupMembers(data.members);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };


    useEffect(() => {
        if (!socket) return;
        if (selectedGroup?._id) {
            socket.emit("joinGroup", selectedGroup._id);
        }
        return () => {
            if (selectedGroup?._id) {
                socket.emit("leaveGroup", selectedGroup._id);
            }
        };

    }, [socket, selectedGroup]);


    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage: MessageDataType) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                setMessages(prev => [...prev, newMessage]);
                axios.post(`/api/message/mark/${newMessage._id}`);
            } else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser]);



    useEffect(() => {
        if (!socket) return;

        const handleGroupMessage = (newGroupMessage: MessageDataType) => {
            if (selectedGroup && newGroupMessage.groupId === selectedGroup._id) {
                setMessages(prev => [...prev, newGroupMessage]);
            } else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [newGroupMessage.groupId!]: (prev[newGroupMessage.groupId!] || 0) + 1,
                }));
            }
        };

        socket.on("groupMessage", handleGroupMessage);

        return () => {
            socket.off("groupMessage", handleGroupMessage);
        };
    }, [socket, selectedGroup]);


    useEffect(() => {
        const checkBlockStatus = async () => { /* unchanged */ };
        checkBlockStatus();
    }, [selectedUser]);


    useEffect(() => {
        if (!socket) return;

        const handleBlockStatusChanged = ({ blockerId, blockedId, isBlocked }: { blockerId: string; blockedId: string; isBlocked: boolean }) => {
            if (authUser?._id === blockedId && selectedUser?._id === blockerId) setIsCurrentUserBlocked(isBlocked);
            if (authUser?._id === blockerId && selectedUser?._id === blockedId) setIsReceiverBlocked(isBlocked);
        };

        socket.on("blockStatusChanged", handleBlockStatusChanged);

        return () => {
            socket.off("blockStatusChanged", handleBlockStatusChanged);
        };
    }, [socket, authUser, selectedUser]);


    useEffect(() => {
        if (!socket) return;

        const handleGroupCreated = (newGroup: GroupType) => {
            setGroups(prev => {
                // Avoid duplicates:
                if (prev.some(group => group._id === newGroup._id)) return prev;
                return [...prev, newGroup];
            });
        };

        socket.on("groupCreated", handleGroupCreated);

        return () => {
            socket.off("groupCreated", handleGroupCreated);
        };
    }, [socket]);


    const value = {
        messages, setMessages,
        users, setUsers,
        selectedUser, setSelectedUser,
        getUsers,
        sendMessage,
        unseenMessages, setUnseenMessages,
        getMessages,
        isCurrentUserBlocked,
        isReceiverBlocked,
        handleBlock,
        groups, setGroups,
        createGroup,
        getUserGroups,
        selectedGroup, setSelectedGroup,
        getGroupMessages,
        sendGroupMessage,
        groupMembers, 
        setGroupMembers,
        getAllUsersOfGroup
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContextProvider;