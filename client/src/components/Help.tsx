import { useNavigate } from "react-router-dom"

const Help = () => {

  const navigate = useNavigate();

  return (
    <div className='border h-screen sm:max-w-[500px] sm:mx-auto sm:py-[5%]'>
      <div className="w-full px-4 relative text-stone-50 backdrop-blur-xl md:border-2 md:border-gray-600 md:rounded-2xl h-full">
        <div onClick={() => navigate("/")} className="absolute top-3 right-3 text-xl md:text-2xl font-semibold cursor-pointer">X</div>

        <div className="h-full overflow-y-scroll">
          <h1 className="mt-10 text-lg md:text-3xl text-center">Chat Help & Usage Guide</h1>

          <h2 className="mt-5 text-base sm:text-xl">Online Status</h2>
          <ul className="ml-8 text-sm sm:text-base list-disc">
            <li>🟢 A green dot means the user is online</li>
            <li>Offline label appears when a user is not active</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-xl">💬 Messaging</h2>
          <ul className="ml-8 text-sm sm:text-base list-disc">
            <li>Tap on a user or group to start chatting</li>
            <li>Type your message and press Enter or click the Send button</li>
            <li>You can also send images by clicking the gallery icon 📷</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-xl">👀 Message Status</h2>
          <ul className="ml-8 text-sm sm:text-base list-disc">
            <li>New messages from users you haven't opened will show a badge count</li>
            <li>All messages are marked as seen when you open the chat</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-xl">🚫 Blocking</h2>
          <ul className="ml-8 text-sm sm:text-base list-disc">
            <li>Use the Block button to block a user</li>
            <li>Blocked users can't send you messages, and you won't see theirs either</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-xl">👥 Groups</h2>
          <ul className="ml-8 text-sm sm:text-base list-disc">
            <li>You can create group and add users to that group</li>
            <li>Send messages to multiple users in a group chat</li>
            <li>Group messages work the same as private chats</li>
          </ul>

          <h2 className="mt-5 text-base sm:text-xl">🔍 Search</h2>
          <ul className="ml-8 text-sm sm:text-base list-disc">
            <li>Use the Search bar in the sidebar to quickly find users or groups</li>
          </ul>

          <hr className="mt-10 mb-2 border-none h-[0.5px] w-full bg-stone-300" />

          <p className="text-xs sm:text-sm text-center pb-3">StraightTalk Chat, created by @P.G. dev, All Rights reserved</p>
        </div>
      </div>
    </div>
  )
}

export default Help
