import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute'; 
import StartPage from '../pages/StartPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VibeHub from '../pages/VibeHub';
import ArtistProfile from '../pages/ArtistProfile';
import MyBand from '../pages/MyBand';
import GearBudgetScreen from '../pages/GearBudgetScreen';

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
    path: "/gear-budget",
    element: <GearBudgetScreen />,
  },
  {
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
          {
            path: "/profile/:id",
            element: <ArtistProfile />,
          },
          {
            path: "/myband",
            element: <MyBand />,
          },
          // ==========================================
          // 🚨 2. เติมเส้นทางหน้าเครื่องคิดเลขเข้าไปตรงนี้ครับ!
          // ==========================================
        ]
      }
    ]
  }
]);