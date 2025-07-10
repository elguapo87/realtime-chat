import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './context/AppContext.tsx'
import ChatContextProvider from './context/ChatContext.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppContextProvider>
      <ChatContextProvider>
        <App />
      </ChatContextProvider>
    </AppContextProvider>
  </BrowserRouter>
)
