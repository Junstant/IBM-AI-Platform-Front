import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, FileText, Shield, Image, Database, BarChart3, ChevronRight, ChevronDown } from "lucide-react";

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
        },
        {
          id: "document-analysis",
          label: "Análisis de Documentos",
          icon: FileText,
          path: "/document-analysis",
        },
        {
          id: "fraud-detection",
          label: "Detección de Fraude",
          icon: Shield,
          path: "/fraud-detection",
        },
        {
          id: "image-generator",
          label: "Generador de Imágenes",
          icon: Image,
          path: "/image-generator",
        },
        {
          id: "text-to-sql",
          label: "Text-to-SQL",
          icon: Database,
          path: "/text-to-sql",
        },
        {
          id: "nlp-analysis",
          label: "Análisis NLP",
          icon: BarChart3,
          path: "/nlp-analysis",
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (group) => group.children?.some((child) => location.pathname === child.path);

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
      `}
    >
      <nav>
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
                    {item.children.map((child) => {
                      const Icon = child.icon;
                      const active = isActive(child.path);

                      return (
                        <Link
                          key={child.id}
                          to={child.path}
                          className={`
                            flex items-center space-x-03
                            px-05 pl-7 py-03
                            text-body-short
                            transition-colors duration-fast
                            ${active ? "bg-carbon-blue-10 text-interactive border-l-2 border-interactive font-medium" : "text-text-primary hover:bg-ui-03"}
                          `}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single menu item
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex items-center space-x-03
                px-05 py-03
                text-body-short
                transition-colors duration-fast
                ${active ? "bg-carbon-blue-10 text-interactive border-l-2 border-interactive font-medium" : "text-text-primary hover:bg-ui-03"}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
