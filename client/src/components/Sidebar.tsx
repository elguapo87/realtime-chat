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
  const { users, getUsers, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages, groups, selectedGroup, setSelectedGroup, getUserGroups, getGroupMessages } = chatContext;

  const [input, setInput] = useState("");

  const navigate = useNavigate();

  const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;
  const filteredGroups = input
    ? groups.filter(
      (group) =>
        group.name.toLowerCase().includes(input.toLowerCase()) &&
        authUser && group.members.includes(authUser._id)
    )
    : groups.filter((group) => authUser && group.members.includes(authUser._id));


  useEffect(() => {
    getUsers();
  }, [onlineUsers]);


  useEffect(() => {
    getUserGroups();
  }, [onlineUsers]);

  return (
    <div className={`bg-[#8185b2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser || selectedGroup ? "max-md:hidden" : ""}`}>
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="Logo" className="max-w-40" />

          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="Menu" className="max-h-5 cursor-pointer" />

            <div className="absolute top-8 right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p onClick={() => navigate("/group")} className="cursor-pointer text-sm mb-3">Add Group +</p>
              <p onClick={() => navigate("/profile")} className="cursor-pointer text-sm">Edit Profile</p>
              <hr className="my-2 border-t border-gray-500" />
              <p onClick={logout} className="cursor-pointer text-sm">Logout</p>
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
