import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Emoji from "./Emoji";

type HomePageProps = {
  showRightSide?: boolean;
  setShowRightSide?: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatContainer = ({ showRightSide, setShowRightSide }: HomePageProps) => {

  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("ChatContainer must be within AppContextProvider");
  const { authUser, onlineUsers } = appContext;

  const chatContext = useContext(ChatContext);
  if (!chatContext) throw new Error("ChatContainer must be within ChatContextProvider");
  const { selectedUser, setSelectedUser, messages, getMessages, sendMessage, isCurrentUserBlocked, isReceiverBlocked, selectedGroup, setSelectedGroup, getGroupMessages, sendGroupMessage } = chatContext;

  const scrollEnd = useRef<HTMLDivElement | null>(null);

  const [input, setInput] = useState<string>("");

  // Handle sending a text of message 
  const handleSendMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (input.trim() === "") return null;

    if (selectedUser) {
      await sendMessage({ text: input.trim() });

    } else {
      await sendGroupMessage({ text: input.trim() });
    }

    setInput("");
  };

  // Handle sending image of message
  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === "string") {
        if (selectedUser) {
          await sendMessage({ image: reader.result });

        } else if (selectedGroup) {
          await sendGroupMessage({ image: reader.result });
        }

      } else {
        toast.error("Failed to read image file");
      }
      e.target.value;
    };

    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCurrentUserBlocked || isReceiverBlocked) {
      toast.error("You can't send an image.");
      return;
    }

    handleSendImage(e);
  };

  const currentMessages = selectedUser ? messages : (selectedGroup ? messages : []);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
       
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    }
  }, [selectedUser, selectedGroup]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (selectedUser || selectedGroup) && !showRightSide ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser?.profileImage || selectedGroup?.image || assets.avatar_icon} alt="" className="w-8 h-8 aspect-square rounded-full" />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser?.fullName || selectedGroup?.name}

          {
            selectedUser ? (
              onlineUsers.includes(selectedUser._id)
                ? <span className="w-2 h-2 rounded-full bg-green-500"></span>
                : <span className="border border-gray-500 text-gray-400 px-1.5 py-[1px] text-xs rounded-full">Offline</span>
            ) : selectedGroup ? (
              <span className="bg-purple-500 text-white text-xs ml-3 rounded px-0.75">Group</span>
            ) : null
          }
          
        </p>

        <img onClick={() => { setSelectedUser(null); setSelectedGroup(null); }} src={assets.arrow_icon} alt="" className="md:hidden max-w-7" />
        <img onClick={() => setShowRightSide?.(true)} src={assets.arrow_icon} alt="" className="md:hidden rotate-180 max-w-7" />
      </div>

      {/* CHAT AREA */}
      <div className="flex flex-col md:gap-5 h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {currentMessages.map((msg, index) => (
          <div key={index} className={`flex items-center gap-2 justify-end ${msg?.senderId !== authUser?._id && "flex-row-reverse"}`}>
            {
              msg?.image
                ?
              <img onClick={() => window.open(msg?.image)} src={msg.image} alt="" className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8 cursor-pointer" />
                :
              <p className={`p-2 w-fit max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-words text-white ${msg?.senderId === authUser?._id ? "rounded-br-none bg-violet-500/30" : "rounded-bl-none bg-violet-500/80"}`}>
                {msg?.text}
              </p>
            }

            <div className="text-center text-xs self-end flex flex-col gap-1">
              <img src={msg?.senderId === authUser?._id ? authUser?.profileImage || assets.avatar_icon : selectedUser?.profileImage || assets.avatar_icon} alt="" className={`w-8 md:w-10 aspect-square rounded-full`} />
              <p className="text-stone-200">{formatMessageTime(msg?.createdAt)}</p>
            </div>
          </div>
        ))}

        <div ref={scrollEnd}></div>
      </div>

      {/* BOTTOM AREA */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input onChange={(e) => setInput(e.target.value)} value={input} onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null} type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You can't send a message" : "Send a message"} className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400" disabled={isCurrentUserBlocked || isReceiverBlocked} />
          <input onChange={handleImageChange} type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img onClick={() => { if (isCurrentUserBlocked || isReceiverBlocked) { toast.error("You can't send an image."); } }} src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
          </label>

          <Emoji setInput={setInput} />

          <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer" />
        </div>
      </div>
    </div>

  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
