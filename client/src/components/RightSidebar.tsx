import assets, { imagesDummyData } from "../assets/assets";

type UserType = {
  _id: string;
  fullName: string;
  profilePic?: string;
  bio?: string;
  email?: string;
};

type HomePageProps = {
  selectedUser: UserType | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  showRightSide?: boolean;
  setShowRightSide?: React.Dispatch<React.SetStateAction<boolean>>;
};

const RightSidebar = ({ selectedUser, setSelectedUser, showRightSide, setShowRightSide }: HomePageProps) => {
  return selectedUser && (
    <div className={`bg-[#8185b2]/10 text-white w-full relative overflow-y-scroll max-md:hidden ${showRightSide && "block!"}`}>
      
      <img onClick={() => setShowRightSide && setShowRightSide(false)} src={assets.arrow_icon} alt="" className="absolute top-3 left-3 md:hidden max-w-7" />

      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt=""  className="w-20 aspect-[1/1] rounded-full" />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          <p className="w-2 h-2 rounded-full bg-green-500"></p>
          {selectedUser.fullName}
        </h1>

        <p className="px-10 mx-auto">{selectedUser.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4" />

      <div className="px-5 text-xs">
        <p className="">Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
          {imagesDummyData.map((img, index) => {
            return (
              <div onClick={() => window.open(img)} key={index} className="cursor-pointer rounded">
                <img src={img} alt="" width={100} height={100} className="w-30 h-full rounded-md" />
              </div>
            );
          })}
        </div>
      </div>

      
      <button className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer">Logout</button>
    </div>
  )
}

export default RightSidebar
