import React from "react";

/**
 * 🎨 IBM Carbon Card Component
 * Diseñado para contener contenido agrupado con la estética IBM Cloud
 *
 * @param {ReactNode} children
 * @param {boolean} elevated - Para agregar sombra sutil
 * @param {boolean} interactive - Para estados hover
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 */
const Card = ({ children, title, subtitle, elevated = false, interactive = false, padding = "md", className = "", ...props }) => {
  const paddingStyles = {
    none: "",
    sm: "p-04",
    md: "p-06",
    lg: "p-07",
  };

  const baseStyles = `
    bg-ui-02 
    border border-ui-03
    ${elevated ? "shadow-sm" : ""}
    ${interactive ? "hover:border-interactive hover:shadow-md cursor-pointer transition-all duration-moderate" : ""}
    ${paddingStyles[padding]}
    ${className}
  `;

  return (
    <div className={baseStyles} {...props}>
      {(title || subtitle) && (
        <div className={`${padding !== "none" ? "mb-05" : ""} border-b border-ui-03 pb-04`}>
          {title && <h3 className="text-productive-heading-03 font-medium text-text-primary">{title}</h3>}
          {subtitle && <p className="text-body-long text-text-secondary mt-01">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
