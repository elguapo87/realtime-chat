import { useContext, useState } from "react"
import ChatContainer from "../components/ChatContainer"
import RightSidebar from "../components/RightSidebar"
import Sidebar from "../components/Sidebar"
import { ChatContext } from "../context/ChatContext"

const HomePage = () => {

  const chatContext = useContext(ChatContext);
  if (!chatContext) throw new Error("RightSidebar must be within ChatContextProvider");
  const { selectedUser, selectedGroup } = chatContext;

  const [showRightSide, setShowRightSide] = useState(false);

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div className={`backdrop-blur-xl md:border-2 md:border-gray-600 md:rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${selectedUser || selectedGroup ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]" : "md:grid-cols-2"}`}>
        <Sidebar />
        <ChatContainer showRightSide={showRightSide} setShowRightSide={setShowRightSide} />
        <RightSidebar showRightSide={showRightSide} setShowRightSide={setShowRightSide} />
      </div>
    </div>
  )
}

export default HomePage
