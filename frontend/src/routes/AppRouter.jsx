import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute'; // 👈 นำเข้าด่านตรวจของเรา
import StartPage from '../pages/StartPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VibeHub from '../pages/VibeHub';
import ArtistProfile from '../pages/ArtistProfile';
import MyBand from '../pages/MyBand';
import ProductExplorer from '../pages/ProductExplorer';
import MultiStepForm from '../pages/MultiStepForm';
import InventoryManager from '../pages/InventoryManager';
import FeedbackPage from '../pages/FeedbackPage'; // 🚨 1. นำเข้า FeedbackPage ตรงนี้
import DynamicFormEngine from '../pages/DynamicFormEngine';
// ==========================================

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
    path: "/products", // 👈 เข้าผ่าน /products
    element: <ProductExplorer />,
  },
  {
    path: "/register-advanced", // สร้าง URL ใหม่สำหรับเทสข้อนี้โดยเฉพาะ
    element: <MultiStepForm />,
  },
  {
    path: "/inventory",
    element: <InventoryManager />,
  },
  {
    path: "/dynamic-form",
    element: <DynamicFormEngine />,
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
          {
            path: "/profile/:id",
            element: <ArtistProfile />,
          },
          {
            path: "/myband",
            element: <MyBand />,
          },
          // ==========================================
          // 🚨 2. เติมเส้นทาง /feedback เข้าไปตรงนี้ครับ!
          // ==========================================
          {
            path: "/feedback",
            element: <FeedbackPage />,
          },
        ]
      }
    ]
  }
]);