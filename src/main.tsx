import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './app/globals.css'
import App from './routes/App'
import Landing from './routes/Landing'
import Auth from './routes/Auth'
import DashboardLayout from './routes/DashboardLayout'
import Dashboard from './routes/Dashboard'
import ProtectedRoute from './routes/ProtectedRoute'
import Notes from './routes/Notes'
import AiTools from './routes/AiTools'
import StudyRoom from './routes/StudyRoom'
import Profile from './routes/Profile'
import { AuthProvider } from './app/providers'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'auth', element: <Auth /> },
      { 
        path: 'dashboard', 
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>, 
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'notes', element: <Notes /> },
          { path: 'ai-tools', element: <AiTools /> },
          { path: 'study-room', element: <StudyRoom /> },
          { path: 'profile', element: <Profile /> },
        ] 
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)


