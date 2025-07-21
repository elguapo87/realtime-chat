import { Navigate, Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useContext } from "react"
import { AppContext } from "./context/AppContext"
import Group from "./components/Group"
import UpdateGroup from "./components/UpdateGroup"

const App = () => {

  const context = useContext(AppContext);
  if (!context) throw new Error("App must be within AppContextProvider");
  const { authUser } = context;

  return ( 
    <div className="bg-[url('/chat_image.jpg')] bg-cover bg-no-repeat">
      <Toaster />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/group" element={authUser ? <Group /> : <Navigate to="/login" />} />
        <Route path="/update/:id" element={authUser ? <UpdateGroup /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
