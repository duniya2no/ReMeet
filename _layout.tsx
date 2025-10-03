import { Stack } from "expo-router";
import { ThemeProvider } from "./themecontext";


export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
