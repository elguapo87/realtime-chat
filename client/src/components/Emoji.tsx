import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import assets from "../assets/assets";

type EmojiProps = {
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

const Emoji = ({ setInput }: EmojiProps) => {

    const [openPicker, setOpenPicker] = useState(false);

    const sendEmoji = (e: { emoji: string; }) => {
        setInput(prev => prev + e.emoji)
        setOpenPicker(false);
    };

    return (
        <div className="relative mr-2 cursor-pointer">
            <img onClick={() => setOpenPicker((prev) => !prev)} src={assets.emoji_icon} alt="" className="w-7 h-7" />
            <div className="absolute bottom-10 right-0 max-md:translate-x-12.5 max-sm:scale-90">
                <EmojiPicker open={openPicker} onEmojiClick={sendEmoji} />
            </div>
        </div>
    )
}

export default Emoji
