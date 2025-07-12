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
  const { logout, onlineUsers } = appContext;
  
  const chatContext = useContext(ChatContext);
  if (!chatContext) throw new Error("RightSidebar must be within ChatContextProvider");
  const { selectedUser, messages, handleBlock, isReceiverBlocked, isCurrentUserBlocked } = chatContext;

  const [msgImages, setMsgImages] = useState<string[]>([]);

  // Get all images from messages and set them to state
  useEffect(() => {
    setMsgImages(
      messages.filter((msg) => msg.image).map((msg) => msg.image)
    )
  }, [messages, onlineUsers]);

  return selectedUser && (
    <div className={`bg-[#8185b2]/10 text-white w-full relative overflow-y-scroll max-md:hidden ${showRightSide && "block!"}`}>
      
      <img onClick={() => setShowRightSide && setShowRightSide(false)} src={assets.arrow_icon} alt="" className="absolute top-3 left-3 md:hidden max-w-7" />

      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img src={selectedUser?.profileImage || assets.avatar_icon} alt=""  className="w-20 aspect-[1/1] rounded-full" />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-1">

          {
            onlineUsers.includes(selectedUser._id)
              &&
            <p className="w-2 h-2 rounded-full bg-green-500"></p>
          }

          {selectedUser.fullName}
        </h1>

        <p className="px-10 mx-auto">{selectedUser.bio}</p>

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
