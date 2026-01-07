import { Slot } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export default function RootLayout() {
  
  return (
    <AuthProvider>
      <Slot/>
    </AuthProvider>
  )
}