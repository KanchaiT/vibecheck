import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRouter';
import { ThemeProvider } from './context/ThemeContext'; // 👈 1. นำเข้า ThemeProvider ที่เราเพิ่งสร้าง

function App() {
  return (
    // 👈 2. เอา ThemeProvider มาครอบ RouterProvider เอาไว้
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;