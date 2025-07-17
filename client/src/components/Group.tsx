import { useContext, useState } from 'react'
import { ChatContext } from '../context/ChatContext';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Group = () => {

    const chatContext = useContext(ChatContext);
    if (!chatContext) throw new Error("Group must be within ChatContextProvider");
    const { users, createGroup } = chatContext;

    const [groupImage, setGroupImage] = useState<File | null>(null);
    const [groupName, setGroupName] = useState("");
    const [searchUser, setSearchUser] = useState("");

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    
    const navigate = useNavigate();

    const filteredUsers = searchUser ? users.filter((user) => user.fullName.toLowerCase().includes(searchUser.toLowerCase())) : users;

    const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!groupName.trim() || selectedUserIds.length === 0) {
            toast.error("Please enter a group name and select at least one user.");
            return;
        }

        try {
            let imageBase64 = "";
            if (groupImage) {
                const reader = new FileReader();
                reader.readAsDataURL(groupImage);
                reader.onloadend = async () => {
                    imageBase64 = reader.result as string;
                    await createGroup({
                        name: groupName,
                        members: selectedUserIds,
                        image: imageBase64
                    });
                    navigate("/");
                };

            } else {
                await createGroup({
                    name: groupName,
                    members: selectedUserIds
                });
                navigate("/");
            }
            
        } catch (error) {
            toast.error("Failed to create group.");
        }
    };

    return (
        <div className='border h-screen sm:px-[15%] sm:py-[5%]'>
            <form onSubmit={handleCreateGroup} className='relative backdrop-blur-xl md:border-2 md:border-gray-600 md:rounded-2xl overflow-hidden h-[100%]'>

                <div onClick={() => navigate("/")} className='absolute top-2 right-2 md:top-3 md:right-4 text-white text-lg md:text-2xl font-semibold cursor-pointer'>X</div>

                <div className='ml-5 mt-4 mb-2 flex items-end gap-20'>
                    <h2 className='text-white text-lg'>Select group image</h2>
                    
                    <label htmlFor="group-image">
                        <input onChange={(e) => setGroupImage(e.target.files && e.target.files[0])} id='group-image' type="file" accept="image/png, image/jpeg" hidden />
                        <img src={groupImage ? URL.createObjectURL(groupImage) : assets.avatar_icon} alt="" className='w-10 md:w-15 h-10 md:h-15 rounded-full' />
                    </label>                   
                </div>

                <div className='h-[1px] my-3 border-none bg-gray-400 md:w-[26%] mx-5' />

                <div className='ml-5 mb-2 text-white flex items-center gap-3 w-[85%] md:w-[26%]'>
                    <h2 className='text-lg'>Group Name</h2>
                    <input onChange={(e) => setGroupName(e.target.value)} value={groupName} type="text" placeholder='Add group name' className='bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8] flex-1' />
                </div>

                <div className='h-[1px]  my-3border-none bg-gray-400 md:w-[26%] mx-5' />

                <h2 className='text-white text-lg ml-5 mt-2'>Select users for group chat</h2>

                <div className='ml-2 mt-2 bg-[#282142] rounded-full py-3 px-4 flex items-center gap-2 w-[85%] md:w-[28%]'>
                    <img src={assets.search_icon} alt="Search" className='w-3' />
                    <input onChange={(e) => setSearchUser(e.target.value)} value={searchUser} type="text" placeholder='Search user...' className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' />
                </div>

                <div className='flex h-[90%] mt-2'>
                    <div className='flex-1  overflow-y-scroll h-[60%] md:h-[65%]'>
                        {filteredUsers.map((user, index) => (
                            <div key={index} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm`}>

                                <img src={user?.profileImage || assets.avatar_icon} alt="" className="w-[35px] aspect-1/1 rounded-full" />
                    
                                <p className='leading-5 text-white'>{user.fullName}</p>
                                
                                <input onChange={() => { setSelectedUserIds((prev) => prev.includes(user._id) ? prev.filter((id) => id !== user._id) : [...prev, user._id] )}} type="checkbox" className='ml-51 h-4 w-4 cursor-pointer' checked={selectedUserIds.includes(user._id)} />
                            </div>
                        ))}
                    </div>

                    <div className='flex-1 flex items-center justify-center max-md:hidden'>
                        <div className='transform -translate-x-[60%] -translate-y-[65%]'>
                            <img src={assets.logo_big} alt="" className='' />
                        </div>
                    </div>
                </div>

                <button type='submit' className='absolute bottom-2 left-2 max-md:transform max-md:translate-x-1/3 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer'>Create</button>
            </form>
        </div>
    )
}

export default Group
