import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { ChatContext } from "../context/ChatContext";

type HomePageProps = {
  showRightSide?: boolean;
  setShowRightSide?: React.Dispatch<React.SetStateAction<boolean>>;
};

const RightSidebar = ({ showRightSide, setShowRightSide }: HomePageProps) => {

  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("RightSidebar must be within AppContextProvider");
  const { logout, onlineUsers, authUser } = appContext;
  
  const chatContext = useContext(ChatContext);
  if (!chatContext) throw new Error("RightSidebar must be within ChatContextProvider");
  const { selectedUser, messages, handleBlock, isReceiverBlocked, isCurrentUserBlocked, selectedGroup, getAllUsersOfGroup, groupMembers } = chatContext;

  const [msgImages, setMsgImages] = useState<string[]>([]);

  const [showAllMembers, setShowAllMembers] = useState(false);

  const sortedMembers = groupMembers.slice().sort((a, b) => (a._id === authUser?._id ? -1 : b._id === authUser?._id ? 1 : 0));

  const maxVisible = 5;
  const visibleMembers = sortedMembers.slice(0, maxVisible);
  const remainingCount = sortedMembers.length - maxVisible;

  useEffect(() => {
    if (selectedGroup) {
      getAllUsersOfGroup();
    }
  }, [selectedGroup]);

  // Get all images from messages and set them to state
  useEffect(() => {
    if (selectedUser || selectedGroup) {
      setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));

    } else {
      setMsgImages([]);
    }
    
  }, [messages, selectedUser, selectedGroup]);

  if (!selectedUser && !selectedGroup) return null;

  return (
    <div className={`bg-[#8185b2]/10 text-white w-full relative overflow-y-scroll max-md:hidden ${showRightSide && "block!"}`}>
      
      <img onClick={() => setShowRightSide && setShowRightSide(false)} src={assets.arrow_icon} alt="" className="absolute top-3 left-3 md:hidden max-w-7" />

      <div className={`flex flex-col items-center gap-2 text-xs font-light mx-auto ${!selectedGroup ? "pt-16" : "pt-4"}`}>
        <img src={selectedUser?.profileImage || selectedGroup?.image || assets.avatar_icon} alt=""  className="w-20 aspect-[1/1] rounded-full" />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-1">

          {
            selectedUser
                ?
            selectedUser.fullName
                :
            selectedGroup?.name || "Group Chat"
          }


          {
            selectedUser && onlineUsers.includes(selectedUser._id)
              &&
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          }
        </h1>

        {selectedUser && <p className="px-10 mx-auto">{selectedUser.bio}</p>}

        {
          selectedUser
              &&
          <button onClick={() => handleBlock(selectedUser._id)} className="mt-3 bg-gradient-to-r from-red-400 to-red-500 text-white border-none text-sm font-light py-2 px-6 rounded-full cursor-pointer" disabled={isCurrentUserBlocked}>
            {
              isCurrentUserBlocked
                  ? 
              "You Are Blocked"
                  :
              isReceiverBlocked
                  ?
              "Unblock"
                  :
              "Block"
            }
          </button>
        }

        {
          selectedGroup
              &&
          <div>
            {visibleMembers.map((member) => (
              <div key={member._id}>
                <p>
                  {member.fullName}
                  {member._id === authUser?._id && " (You)"}
                </p>
              </div>
            ))}

            {
              remainingCount > 0
                &&
              <button onClick={() => setShowAllMembers(true)} className="text-xs text-purple-400 underline">
                + {remainingCount} more...
              </button>
            }

            {
              showAllMembers
                 &&
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-5 rounded-lg max-h-[80vh] overflow-y-auto text-gray-800">
                  <h2 className="text-lg font-semibold mb-4">Group Members</h2>
                  {sortedMembers.map((member) => (
                    <div key={member._id} className="mb-2 text-sm">
                      {member.fullName}
                      {member._id === authUser?._id && " (You)"}
                    </div>
                  ))}
                  <button onClick={() => setShowAllMembers(false)} className="mt-4 bg-purple-500 text-white px-4 py-2 rounded">
                    Close
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <hr className="border-[#ffffff50] my-4" />

      <div className="px-5 text-sm">
        <p className="max-md:text-center">Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-4 opacity-80">
          {msgImages.map((img, index) => {
            return (
              <div onClick={() => window.open(img)} key={index} className="cursor-pointer rounded">
                <img src={img} alt="" width={100} height={100} className="w-30 h-full rounded-md" />
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={logout} className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer">Logout</button>
    </div>
  )
}

export default RightSidebar
