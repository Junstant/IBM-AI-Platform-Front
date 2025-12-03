import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, FileText, Shield, Image, Database, BarChart3, ChevronRight, ChevronDown, Cpu, Settings } from "lucide-react";

/**
 * 🎨 IBM Carbon Sidebar Component
 * Sidebar fija con estética IBM Cloud
 */
const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState(["ai-features"]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]));
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
      enabled: true,
    },
    {
      id: "ai-features",
      label: "Funcionalidades IA",
      icon: null,
      isGroup: true,
      children: [
        {
          id: "chatbot",
          label: "Chatbot Inteligente",
          icon: MessageSquare,
          path: "/chatbot",
          enabled: true,
        },
        {
          id: "document-analysis",
          label: "Análisis de Documentos",
          icon: FileText,
          path: "/document-analysis",
          enabled: true,
        },
        {
          id: "fraud-detection",
          label: "Detección de Fraude",
          icon: Shield,
          path: "/fraud-detection",
          enabled: true,
        },
        {
          id: "image-generator",
          label: "Generador de Imágenes",
          icon: Image,
          path: "/image-generator",
          enabled: false,
        },
        {
          id: "text-to-sql",
          label: "Text-to-SQL",
          icon: Database,
          path: "/text-to-sql",
          enabled: true,
        },
        {
          id: "nlp-analysis",
          label: "Análisis NLP",
          icon: BarChart3,
          path: "/nlp-analysis",
          enabled: false,
        },
      ],
    },
    {
      id: "metrics",
      label: "Métricas Detalladas",
      icon: BarChart3,
      path: "/metrics",
      enabled: true,
    },
    {
      id: "settings",
      label: "Configuración",
      icon: Settings,
      path: "/settings",
      enabled: false,
    },
  ];

  // Bottom menu items
  const bottomMenuItems = [
    {
      id: "analytics",
      label: "Analytics IA",
      icon: Cpu,
      path: "/analytics",
      enabled: false,
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (group) => group.children?.some((child) => location.pathname === child.path);

  const renderMenuItem = (item, isChild = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const enabled = item.enabled !== false;

    const baseClasses = `
      flex items-center space-x-03
      ${isChild ? "px-05 pl-7" : "px-05"} py-03
      text-body-short
      transition-colors duration-fast
    `;

    if (!enabled) {
      return (
        <div
          key={item.id}
          className={`${baseClasses} opacity-40 cursor-not-allowed text-text-secondary`}
          title="En desarrollo"
        >
          <Icon className={`${isChild ? "w-4" : "w-5"} h-${isChild ? "4" : "5"} flex-shrink-0`} />
          <span>{item.label}</span>
          <span className="ml-auto text-xs">(Próximamente)</span>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path}
        className={`
          ${baseClasses}
          ${active ? "bg-carbon-blue-10 text-interactive border-l-2 border-interactive font-medium" : "text-text-primary hover:bg-ui-03"}
        `}
      >
        <Icon className={`${isChild ? "w-4" : "w-5"} h-${isChild ? "4" : "5"} flex-shrink-0`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`
        ${isOpen ? "w-64" : "w-0"}
        bg-ui-01
        ${isOpen ? "border-r border-ui-03" : "border-0"}
        transition-all duration-moderate
        ${isOpen ? "translate-x-0" : "-translate-x-64"}
        overflow-hidden
        flex-shrink-0
        flex flex-col
      `}
    >
      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.isGroup) {
            const isExpanded = expandedGroups.includes(item.id);
            const hasActiveChild = isGroupActive(item);

            return (
              <div key={item.id} className="mb-01">
                <button
                  onClick={() => toggleGroup(item.id)}
                  className={`
                    w-full flex items-center justify-between
                    px-05 py-03
                    text-label text-text-secondary
                    hover:bg-ui-03
                    transition-colors duration-fast
                    ${hasActiveChild ? "bg-ui-03" : ""}
                  `}
                >
                  <span className="font-medium">{item.label}</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-01">
                    {item.children.map((child) => renderMenuItem(child, true))}
                  </div>
                )}
              </div>
            );
          }

          // Single menu item
          return renderMenuItem(item);
        })}

        {/* Bottom menu section - Analytics IA */}
        <div className="mt-04 pt-04 border-t border-ui-03">
          {bottomMenuItems.map((item) => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-05 py-04 border-t border-ui-03 bg-ui-02">
        <p className="text-xs text-text-secondary text-center">
          IBM AI Platform v2.1.0
        </p>
        <p className="text-xs text-text-secondary text-center mt-01">
          Made by <span className="font-medium text-interactive">Lucas Jung</span>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
