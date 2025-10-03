import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const lightColors = {
  primary: "#4C8BF5",
  background: "#F9F9F9",
  text: "#333",
  card: "#fff",
  gray: "#777",
};

const darkColors = {
  primary: "#4C8BF5",
  background: "#121212",
  text: "#fff",
  card: "#1E1E1E",
  gray: "#777",
};

type ThemeContextType = {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  COLORS: typeof lightColors;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  COLORS: lightColors,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.darkMode !== undefined) {
          setDarkMode(data.darkMode);
        }
      }
    };

    fetchTheme();
  }, []);

  const COLORS = darkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};
