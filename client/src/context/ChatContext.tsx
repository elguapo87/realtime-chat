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
    createdBy?: string;
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
    updateGroup: (groupId: string, groupData: { name?: string, members?: string[], image?: string }) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;
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
            const { data } = await axios.get(`/api/group/users/${selectedGroup?._id}`);
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

    // Function to update group
    const updateGroup = async (groupId: string, groupData: { name?: string, members?: string[], image?: string }) => {
        try {
            const { data } = await axios.post(`/api/group/update/${groupId}`, groupData);

            if (data.success) {
                setGroups(prev => prev.map(group => group._id === data.updatedGroup._id ? data.updatedGroup : group));
                toast.success(data.message);
                await getAllUsersOfGroup();

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
            toast.error(errMessage);
        }
    };


    // Function for user leave group
    const leaveGroup = async (groupId: string) => {
        try {
            const { data } = await axios.post(`/api/group/leave/${groupId}`);

            if (data.success) {
                socket?.emit("leaveGroup", groupId);
                setSelectedGroup(null);
                setGroups(prev => prev.filter(g => g._id !== groupId));
                setMessages([]);
                toast.success(data.message);

            } else {
                toast.error(data.message)
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
                axios.post(`/api/group/mark/${newGroupMessage._id}`);
            }
        };

        socket.on("groupMessage", handleGroupMessage);

        return () => {
            socket.off("groupMessage", handleGroupMessage);
        };
    }, [socket, selectedGroup]);


    useEffect(() => {
        const checkBlockStatus = async () => {
            if (!selectedUser?._id) {
                setIsCurrentUserBlocked(false);
                setIsReceiverBlocked(false);
                return;
            }

            try {
                const { data } = await axios.get(`/api/user/blocked-status/${selectedUser._id}`);
                if (data.success) {
                    setIsCurrentUserBlocked(data.isCurrentUserBlocked);
                    setIsReceiverBlocked(data.isReceiverBlocked);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
                toast.error(errMessage);
            }
        };

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

            // Join group socket room so we can receive messages and updates
            socket.emit("joinGroup", newGroup._id);
        };

        socket.on("groupCreated", handleGroupCreated);

        return () => {
            socket.off("groupCreated", handleGroupCreated);
        };
    }, [socket]);


    useEffect(() => {
        if (!socket) return;

        const handleGroupUpdated = (updatedGroup: GroupType) => {
            setGroups(prev => 
                prev.map(group => 
                    group._id === updatedGroup._id ? updatedGroup : group
                )
            );

            // Optional: if the updated group is selected, refresh its member list
            if (selectedGroup?._id === updatedGroup._id) {
                setSelectedGroup(updatedGroup);
                getAllUsersOfGroup();
            }
        };

        socket.on("groupUpdated", handleGroupUpdated);

        return () => {
            socket.off("groupUpdated", handleGroupUpdated);
        };
    }, [socket, selectedGroup]);


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
        getAllUsersOfGroup,
        updateGroup,
        leaveGroup
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContextProvider;