import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Brain, MessageSquare, Image, FileText, BarChart3, Zap, Settings, ChevronLeft, ChevronRight, Bot, Cpu, Shield } from "lucide-react";
import imblogo from "../assets/imblogo.jpg"

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Bot, label: "Chatbot IA", path: "/chatbot" },
    { icon: Shield, label: "Detección de Fraude", path: "/fraud-detection" },
    { icon: Brain, label: "Text-to-SQL", path: "/text-to-sql" },
    { icon: FileText, label: "Análisis Documentos", path: "/document-analysis" },
    { icon: MessageSquare, label: "Análisis NLP", path: "/nlp" },
    { icon: Image, label: "Generador Imágenes", path: "/image-generator" },
    { icon: BarChart3, label: "Métricas Detalladas", path: "/metrics" },
    { icon: Cpu, label: "Analytics IA", path: "/analytics" },
    { icon: Settings, label: "Configuración", path: "/settings" },
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
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
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
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-ibm-gray-70">
        {!isCollapsed && (
          <div className="text-xs text-ibm-gray-60 text-center">
            <p>IBM AI Platform</p>
            <p>v1.0.0</p>
            <p>Desarrollado por Jung</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
