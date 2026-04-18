import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/index.css";


import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { SidebarLayoutProvider } from "./context/SidebarLayoutContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Toaster } from "@/components/atoms/ui/sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <SidebarLayoutProvider defaultSidebarLayout='icon' storageKey='vite-ui-sidebar-layout'>
          <AuthProvider>
            <Toaster />
            <App />
          </AuthProvider>
        </SidebarLayoutProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
