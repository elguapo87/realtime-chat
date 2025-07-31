import EmojiPicker from "emoji-picker-react";
import { useContext, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import toast from "react-hot-toast";

type EmojiProps = {
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

const Emoji = ({ setInput }: EmojiProps) => {

    const chatContext = useContext(ChatContext);
    if (!chatContext) throw new Error("ChatContainer must be within ChatContextProvider");
    const { isReceiverBlocked, isCurrentUserBlocked } = chatContext;

    const [openPicker, setOpenPicker] = useState(false);

    const sendEmoji = (e: { emoji: string; }) => {
        setInput(prev => prev + e.emoji)
        setOpenPicker(false);
    };

    const handleSendEmoji = (e: { emoji: string }) => {
        if (isReceiverBlocked || isCurrentUserBlocked) {
            toast.error("You can't send emojies");
            setOpenPicker(false);
            return;
        }

        sendEmoji(e)
    };

    return (
        <div className="relative mr-2 cursor-pointer">
            <img onClick={() => setOpenPicker((prev) => !prev)} src={assets.emoji_icon} alt="" className="w-7 h-7" />
            <div className="absolute bottom-10 right-0 max-md:translate-x-12.5 max-sm:scale-90">
                <EmojiPicker open={openPicker} onEmojiClick={handleSendEmoji} />
            </div>
        </div>
    )
}

export default Emoji
