import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Brain, MessageSquare, Image, FileText, BarChart3, Zap, Settings, ChevronLeft, ChevronRight, Bot, Cpu, Shield } from "lucide-react";
import imblogo from "../assets/imblogo.jpg"

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/", enabled: true },
    { icon: Bot, label: "Chatbot IA", path: "/chatbot", enabled: true },
    { icon: Shield, label: "Detección de Fraude", path: "/fraud-detection", enabled: true },
    { icon: Brain, label: "Text-to-SQL", path: "/text-to-sql", enabled: true },
    { icon: FileText, label: "Análisis Documentos", path: "/document-analysis", enabled: true },
    { icon: MessageSquare, label: "Análisis NLP", path: "/nlp", enabled: false },
    { icon: Image, label: "Generador Imágenes", path: "/image-generator", enabled: false },
    { icon: BarChart3, label: "Métricas Detalladas", path: "/metrics", enabled: true },
    { icon: Settings, label: "Configuración", path: "/settings", enabled: false },
  ];

  const bottomMenuItems = [
    { icon: Cpu, label: "Analytics IA", path: "/analytics", enabled: false },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`
      bg-ibm-gray-100 border-r border-ibm-gray-20 h-screen flex flex-col
      transition-all duration-300 ease-in-out
      ${isCollapsed ? "w-16" : "w-64"}
    `}
    >
      {/* Header */}
      <div className="p-4 border-b border-ibm-gray-70">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-ibm rounded-lg flex items-center justify-center">
                <img src={imblogo} alt="IBM Logo" className="rounded-sm" />
              </div>
              <h1 className="text-lg font-semibold text-ibm-gray-10">IBM AI Platform</h1>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-ibm-gray-20 transition-colors">
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-ibm-gray-70" /> : <ChevronLeft className="w-4 h-4 text-ibm-gray-70" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col">
        <ul className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const disabled = !item.enabled;

            return (
              <li key={item.path}>
                {disabled ? (
                  <div
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg
                      opacity-40 cursor-not-allowed text-ibm-gray-60
                    `}
                    title={isCollapsed ? `${item.label} (Próximamente)` : "Próximamente"}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${active ? "bg-primary text-white shadow-md" : "text-ibm-gray-10 hover:bg-ibm-gray-20 hover:text-ibm-gray-90"}
                    `}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Bottom Menu Items */}
        <div className="mt-4 pt-4 border-t border-ibm-gray-70">
          <ul className="space-y-2">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const disabled = !item.enabled;

              return (
                <li key={item.path}>
                  {disabled ? (
                    <div
                      className={`
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg
                        opacity-40 cursor-not-allowed text-ibm-gray-60
                      `}
                      title={isCollapsed ? `${item.label} (Próximamente)` : "Próximamente"}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200
                        ${active ? "bg-primary text-white shadow-md" : "text-ibm-gray-10 hover:bg-ibm-gray-20 hover:text-ibm-gray-90"}
                      `}
                      title={isCollapsed ? item.label : ""}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-ibm-gray-70">
        {!isCollapsed && (
          <div className="text-xs text-ibm-gray-60 text-center">
            <p className="font-semibold text-ibm-gray-10">IBM AI Platform</p>
            <p className="mt-1">v2.1.0</p>
            <p className="mt-2 text-ibm-gray-50">Made by Lucas Jung</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
