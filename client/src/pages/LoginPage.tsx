import { useContext, useState } from "react";
import assets from "../assets/assets"
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("LoginPage must be within AppContextProvider") ;
  const { login, validateSignup } = context;

  const [currentState, setCurrentState] = useState<"Sign Up" | "Login">("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmited, setIsDataSubmited] = useState(false);

  const onSubmitHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    
    if (currentState === "Sign Up" && !isDataSubmited) {
      try {
        await validateSignup({ email, fullName, password });
        setIsDataSubmited(true);

      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        const message = err.response?.data?.message || "Validation failed";
        toast.error(message);
      }
      return;
    }

    login(currentState, { fullName, email, password, bio });
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* LEFT */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />

      {/* RIGHT */}
      <form onSubmit={onSubmitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currentState}

          {isDataSubmited && <img onClick={() => setIsDataSubmited(false)} src={assets.arrow_icon} alt="" className="w-5 cursor-pointer" />}
        </h2>

        {
          currentState === "Sign Up" && !isDataSubmited
               &&
          <input onChange={(e) => setFullName(e.target.value)} value={fullName} type="text" className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Full Name" required />
        }

        {
          !isDataSubmited
             &&
          <>
            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email Address" className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </>
        }

        {
          currentState === "Sign Up" && isDataSubmited
               &&
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4} className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Provide a short bio..." required></textarea>
        }

        <button type="submit" className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer">
          {currentState === "Sign Up" ? "Create Account" : "Login Now"}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className="flex flex-col gap-2">
          {
            currentState === "Sign Up"
                 ?
            <p className="text-sm text-gray-600">Already have an account? <span onClick={() => { setCurrentState("Login"); setIsDataSubmited(false); }} className="font-medium text-violet-500 cursor-pointer">Login here</span></p>
                 :
            <p className="text-sm text-gray-600">Create an account? <span onClick={() => setCurrentState("Sign Up")} className="font-medium text-violet-500 cursor-pointer">Click here</span></p>
          }
        </div>
      </form>
    </div>
  )
}

export default LoginPage
