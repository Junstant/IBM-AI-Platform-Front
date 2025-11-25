import React from "react";
import { Bell, User, HelpCircle, Settings, Menu } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * 🎨 IBM Carbon Header Component
 * Top navigation bar oscura como en IBM Cloud
 */
const Header = ({ onMenuClick }) => {
  return (
    <header className="h-10 bg-carbon-gray-90 border-b border-carbon-gray-80 flex items-center px-05 flex-shrink-0">
      {/* Left: Menu button + Logo */}
      <div className="flex items-center space-x-04">
        <button onClick={onMenuClick} className="text-white hover:bg-carbon-gray-80 p-02 transition-colors duration-fast" aria-label="Toggle menu">
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center space-x-02 text-white hover:text-carbon-blue-40 transition-colors duration-fast">
          <span className="text-productive-heading-02 font-medium">IBM AI Platform</span>
        </Link>
      </div>

      {/* Center: Search or breadcrumbs (opcional) */}
      <div className="flex-1 mx-06">{/* Aquí podrías agregar un search bar */}</div>

      {/* Right: Icons */}
      <div className="flex items-center space-x-01">
        <button className="text-white hover:bg-carbon-gray-80 p-02 transition-colors duration-fast rounded-none" title="Ayuda">
          <HelpCircle className="w-5 h-5" />
        </button>

        <button className="text-white hover:bg-carbon-gray-80 p-02 transition-colors duration-fast rounded-none" title="Notificaciones">
          <Bell className="w-5 h-5" />
        </button>

        <button className="text-white hover:bg-carbon-gray-80 p-02 transition-colors duration-fast rounded-none" title="Configuración">
          <Settings className="w-5 h-5" />
        </button>

        <button className="text-white hover:bg-carbon-gray-80 p-02 transition-colors duration-fast rounded-none" title="Perfil">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
