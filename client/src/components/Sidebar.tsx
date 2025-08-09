import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { ChatContext } from "../context/ChatContext";

const Sidebar = () => {

  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("Sidebar must be within AppContextProvider");
  const { logout, onlineUsers, authUser } = appContext;

  const chatContext = useContext(ChatContext);
  if (!chatContext) throw new Error("Sidebar must be within ChatContextProvider");
  const { users, getUsers, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages, groups, selectedGroup, setSelectedGroup, getUserGroups, getGroupMessages, deleteGroup, setGroups } = chatContext;

  const [input, setInput] = useState("");

  const [showMenu, setShowMenu] = useState(false);

  const [openGroupButtons, setOpenGroupButtons] = useState(false);

  const navigate = useNavigate();

  const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;
  const filteredGroups = input
    ? groups.filter(
      (group) =>
        group.name.toLowerCase().includes(input.toLowerCase()) &&
        authUser && group.members.includes(authUser._id)
    )
    : groups.filter((group) => authUser && group.members.includes(authUser._id));

  
  const handleDeleteGroup = async (groupId: string) => {
    const confirmation = window.confirm("Are you sure?");
    if (!confirmation) return;

    const groupToDelete = groups.find((g) => g._id === groupId);
    if (!groupToDelete) return;

    try {
      await deleteGroup(groupId);

      setGroups((prev) => prev.filter((g) => g._id !== groupId));

      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
      } 

    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);


  useEffect(() => {
    getUserGroups();
  }, [onlineUsers]);

  return (
    <div onClick={() => setShowMenu(false)} className={`bg-[#8185b2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser || selectedGroup ? "max-md:hidden" : ""}`}>
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="Logo" className="max-w-40" />

          <div className="flex items-center gap-3">
            <img onClick={() => navigate("/help")} src={assets.help_icon} alt="Help" className="w-6 cursor-pointer" />

            <div className="relative py-2">
              <img onClick={(e) => { e.stopPropagation(); setShowMenu(prev => !prev); }} src={assets.menu_icon} alt="Menu" className="max-h-5 cursor-pointer" />

              {
                showMenu
                  &&
                <div className="absolute top-10 right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
                  <p onClick={() => { navigate("/group"); setShowMenu(false); }} className="cursor-pointer text-sm mb-3">Add Group +</p>
                  <p onClick={() => { navigate("/profile"); setShowMenu(false); }} className="cursor-pointer text-sm">Edit Profile</p>
                  <hr className="my-2 border-t border-gray-500" />
                  <p onClick={() => { logout(); setShowMenu(false); }} className="cursor-pointer text-sm">Logout</p>
                </div>
              }

            </div>
          </div>
        </div>

        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Search user..." className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1" />
        </div>
      </div>

      <div className="flex flex-col">
        <>
          {filteredGroups.map((group) => (
            <div onClick={() => { setSelectedGroup(group); setSelectedUser(null); getGroupMessages(group._id) }} key={group._id} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedGroup?._id === group._id && "bg-[#282141]/50"}`}>

              <img src={group.image || assets.avatar_icon} alt="" className="w-[35px] aspect-1/1 rounded-full" />
              <p>{group.name}</p>

              <span className="bg-purple-500 text-white text-xs ml-3 rounded px-0.75">Group</span>

              {
                authUser?._id === group.createdBy
                   ?
                <span onClick={(e) => { e.stopPropagation(); setOpenGroupButtons((prev) => !prev); }} className="ml-3 hover:scale-105 transition-all duration-300">...</span>
                   :
                <div onClick={() => navigate(`/update/${group._id}`)} className="ml-3 text-[11px] uppercase bg-blue-600 text-white rounded py-0.5 px-2 font-semibold max-md:pt-1">Edit</div>
              }

              {
                openGroupButtons
                   &&
                <div onClick={(e) => e.stopPropagation()} className={`absolute ${selectedGroup || selectedUser ? "top-10 right-0" : "top-[80%] right-[20%] md:top-[80%] md:right-[50%]"} z-20 w-max flex flex-col gap-1 p-5 text-center rounded-md bg-[#282142] border border-gray-600 text-gray-100`}>
                  <div onClick={() => navigate(`/update/${group._id}`)} className="text-[11px] uppercase bg-blue-600 text-white rounded py-0.5 px-2 font-semibold max-md:pt-1">Edit</div>
                  {authUser?._id === group.createdBy && <div onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group._id) }} className="text-[11px] uppercase bg-red-500 text-white rounded py-0.5 px-2 font-semibold">Delete</div>}
                </div>
              }
            </div>
          ))}

          {filteredUsers.map((user, index) => (
            <div onClick={() => { setSelectedUser(user); setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 })); setSelectedGroup(null); }} key={index} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && "bg-[#282141]/50"}`}>
              <img src={user?.profileImage || assets.avatar_icon} alt="" className="w-[35px] aspect-1/1 rounded-full" />
              <div className="flex flex-col leading-5">
                <p>{user.fullName}</p>
                {
                  onlineUsers.includes(user._id)
                    ?
                    <span className="text-green-400 text-xs">Online</span>
                    :
                    <span className="text-neutral-400 text-xs">Offline</span>
                }
              </div>
              {unseenMessages[user._id] > 0 && <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">{unseenMessages[user._id]}</p>}
            </div>
          ))}
        </>
      </div>
    </div>
  )
}

export default Sidebar
