import { useContext, useEffect, useState } from 'react'
import { ChatContext } from '../context/ChatContext';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';

const UpdateGroup = () => {

    const appContext = useContext(AppContext);
    if (!appContext) throw new Error("UpdateGroup must be within AppContextProvider");
    const { authUser } = appContext;

    const chatContext = useContext(ChatContext);
    if (!chatContext) throw new Error("UpdateGroup must be within ChatContextProvider");
    const { users, selectedGroup, updateGroup, leaveGroup } = chatContext;

    // console.log(selectedGroup);

    const [groupImage, setGroupImage] = useState<File | null>(null);
    const [groupName, setGroupName] = useState(selectedGroup?.name || "");
    const [groupImageUrl, setGroupImageUrl] = useState(selectedGroup?.image || "");

    const [searchUser, setSearchUser] = useState("");

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    
    const navigate = useNavigate();

    const currentMemberIds = selectedGroup ? selectedGroup.members.map((member) => member) : [];

    const newMembers = users.filter((user) => !currentMemberIds.includes(user._id));
    
    const filteredUsers = searchUser ? newMembers.filter((user) => user.fullName.toLowerCase().includes(searchUser.toLowerCase())) : newMembers;

    const currentGroupMembers = [
        ...users.filter((user) => currentMemberIds.includes(user._id)),
        ...(authUser?._id ? [authUser] : [])
    ];

    const sortedCurrentGroupMembers = currentGroupMembers.slice().sort((a, b) => (a._id === authUser?._id ? -1 : b._id === authUser?._id ? 1 : 0))
     
    const handleUpdateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedGroup?._id) {
             toast.error("No group selected to update.");
            return;
        }

        try {
            let imageBase64 = "";

            const updateData = {
                name: groupName,
                members: selectedUserIds
            };

            if (groupImage) {
                const reader = new FileReader();
                reader.readAsDataURL(groupImage);
                reader.onloadend = async () => {
                    imageBase64 = reader.result as string;
                    await updateGroup(selectedGroup._id, {
                        ...updateData,
                        image: imageBase64
                    });
                    navigate("/");
                };

            } else {
                await updateGroup(selectedGroup._id, updateData);
                navigate("/");
            }
            
        } catch (error) {
            toast.error("Failed to update group.");
            console.error(error);
        }
    };


    const handleLeaveGroup = async () => {
        try {
            if (!selectedGroup?._id) {
                toast.error("No group selected to leave.");
                return;
            }

            await leaveGroup(selectedGroup._id);
            navigate("/");

        } catch (error) {
            toast.error("Failed to leave group.");
            console.error(error);
        }
    };

    useEffect(() => {
        if (selectedGroup) {
            setGroupName(selectedGroup.name);
        }
    }, [selectedGroup]);

    return (
        <div className='border h-screen sm:px-[15%] sm:py-[5%]'>
            <form onSubmit={handleUpdateGroup} className='relative backdrop-blur-xl md:border-2 md:border-gray-600 md:rounded-2xl overflow-hidden h-[100%] flex items-start'>

                <div className='flex-1 h-[90%] mt-2'>
                    <div onClick={() => navigate("/")} className='absolute top-2 right-2 md:top-3 md:right-4 text-white text-lg md:text-2xl font-semibold cursor-pointer'>X</div>

                    <div className='ml-5 mt-4 mb-2 flex items-end justify-between'>
                        <h2 className='text-white text-lg'>Change group image</h2>
                        
                        <label htmlFor="group-image" className='mr-10'>
                            <input onChange={(e) => { const file = e.target.files?.[0]; if (file) { setGroupImage(file); setGroupImageUrl(URL.createObjectURL(file)); } }} id='group-image' type="file" accept="image/png, image/jpeg" hidden />
                            <img src={groupImageUrl ? groupImageUrl : groupImage ? URL.createObjectURL(groupImage) : assets.avatar_icon} alt="" className='w-10 md:w-15 h-10 md:h-15 rounded-full' />
                        </label>                   
                    </div>

                    <div className='h-[1px] my-3 border-none bg-gray-400 mx-5' />

                    <div className='ml-5 mb-2 text-white flex items-center justify-between'>
                        <h2 className='text-lg'>Change Name</h2>
                        <input onChange={(e) => setGroupName(e.target.value)} value={groupName} type="text" placeholder={selectedGroup?.name} className='bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8]' />
                    </div>

                    <div className='h-[1px] my-3 border-none bg-gray-400 mx-5' />
                    
                    <h2 className='ml-5 mb-2 text-white text-lg'>Current group members</h2>

                    <div className='overflow-y-scroll h-[25%] md:max-h-[30%]'>
                    {sortedCurrentGroupMembers.map((user) => (
                        <div key={user._id} className='flex items-center justify-between md:gap-3 p-2 pl-4 rounded max-sm:text-sm'>
                            <div className='flex items-center gap-2 md:gap-3'>
                                <img src={user.profileImage || assets.avatar_icon} alt="" className="w-[35px] aspect-1/1 rounded-full" />

                                <p className='leading-5 text-white'>
                                    {user.fullName}
                                    {user._id === authUser?._id && " (You)"}
                                </p>
                            </div>
                            {user._id === authUser?._id && <div onClick={handleLeaveGroup} className='bg-red-500 text-white px-2 py-0.5 text-xs md:text-sm rounded mr-2 cursor-pointer'>Leave Group</div>}
                            
                        </div>
                    ))}

                    </div>
                        
                    <h2 className='text-white text-lg ml-5 mt-2'>Add new members to group chat</h2>

                    <div className='ml-2 mt-2 bg-[#282142] rounded-full py-3 px-4 flex items-center gap-2 w-[80%]'>
                        <img src={assets.search_icon} alt="Search" className='w-3' />
                        <input onChange={(e) => setSearchUser(e.target.value)} value={searchUser} type="text" placeholder='Search user...' className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8]' />
                    </div>

                    <div className='mt-3 flex-1 overflow-y-scroll max-h-[30%]'>
                        
                        {filteredUsers.map((user, index) => (
                            <div key={index} className={`relative flex items-center justify-between p-2 pl-4 rounded cursor-pointer max-sm:text-sm`}>

                                <div className='flex items-center gap-2 md:gap-3'>
                                    <img src={user?.profileImage || assets.avatar_icon} alt="" className="w-[35px] aspect-1/1 rounded-full" />
                        
                                    <p className='leading-5 text-white'>{user.fullName}</p>
                                </div>

                                
                                <input onChange={() => { setSelectedUserIds((prev) => prev.includes(user._id) ? prev.filter((id) => id !== user._id) : [...prev, user._id] )}} type="checkbox" className='h-4 w-4 cursor-pointer mr-5' checked={selectedUserIds.includes(user._id)} />
                            </div>
                        ))}
                    </div>

                    <button type='submit' className='absolute max-md:mx-3 bottom-2 left-0 md:bottom-2 md:left-2 max-md:w-[95%] bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-30 rounded-full cursor-pointer'>Update</button>
                </div>

                <div className='flex-1 self-center transform translate-x-[10%] max-md:hidden'>
                    <div className=''>
                        <img src={assets.logo_big} alt="" className='' />
                    </div>
                </div>
            </form>
        </div>
    )
}

export default UpdateGroup

