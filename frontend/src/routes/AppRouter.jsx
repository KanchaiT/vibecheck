import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute'; // 👈 นำเข้าด่านตรวจของเรา
import StartPage from '../pages/StartPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VibeHub from '../pages/VibeHub';
import ArtistProfile from '../pages/ArtistProfile';
import MyBand from '../pages/MyBand';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />, 
  },
  {
    path: "/login",
    element: <Login />, 
  },
  {
    path: "/register",
    element: <Register />, 
  },
  {
    // 👈 เอา ProtectedRoute มาครอบกลุ่มที่มี MainLayout ไว้
    element: <ProtectedRoute />, 
    children: [
      {
        element: <MainLayout />, 
        children: [
          {
            path: "/hub",
            element: <VibeHub />,
          },
          {
            path: "/profile",
            element: <ArtistProfile />,
          },
          // ==========================================
          // 🚨 เติมเส้นทางนี้เข้าไป เพื่อให้ดูโปรไฟล์คนอื่นได้!
          // ==========================================
          {
            path: "/profile/:id",
            element: <ArtistProfile />,
          },
          {
            path: "/myband",
            element: <MyBand />,
          }
        ]
      }
    ]
  }
]);