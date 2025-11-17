import React, { useState } from "react";
import { Header, Sidebar } from "./carbon";

/**
 * 🎨 Layout Principal con estética IBM Carbon
 * Estructura de 3 partes: Header (parte del flujo flex) + Sidebar (aside lateral) + Main (contenido)
 */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-ui-background overflow-hidden">
      {/* 1. Header - Parte del flujo flex (h-10 = 2.5rem) */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* 2 & 3. Container para Sidebar + Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* 2. Sidebar - Aside lateral parte del flujo flex */}
        <Sidebar isOpen={sidebarOpen} />

        {/* 3. Main Content - Contenido principal con padding uniforme */}
        <main className="flex-1 overflow-auto">
          {/* Todas las páginas usan el mismo padding: p-06 bg-ui-background */}
          <div className="p-06 bg-ui-background min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
