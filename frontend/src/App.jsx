// frontend/src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRouter';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;