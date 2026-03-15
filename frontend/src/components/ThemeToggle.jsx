import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { config, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-4 py-2 font-black uppercase transition border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-200 active:translate-y-1 active:shadow-none ${
        config.theme === 'dark' ? 'bg-gray-800 text-white border-white hover:bg-gray-700' : 'bg-white text-black'
      }`}
    >
      {config.theme === 'light' ? (
        <><Moon size={20} /> Dark Mode</>
      ) : (
        <><Sun size={20} className="text-yellow-400" /> Light Mode</>
      )}
    </button>
  );
}