import React from "react";

/**
 * 🎨 IBM Carbon Input Component
 * Text input field siguiendo Carbon Design System
 *
 * @param {string} label - Etiqueta del input
 * @param {string} helperText - Texto de ayuda debajo del input
 * @param {string} errorText - Mensaje de error
 * @param {boolean} invalid - Estado de error
 * @param {boolean} disabled
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const Input = ({ label, helperText, errorText, invalid = false, disabled = false, size = "md", className = "", ...props }) => {
  const sizeStyles = {
    sm: "h-8 px-04 py-01 text-caption",
    md: "h-10 px-05 py-02 text-body-short",
    lg: "h-12 px-06 py-03 text-body-short",
  };

  const inputStyles = `
    w-full
    font-sans
    bg-ui-01
    border
    ${invalid ? "border-danger focus:border-danger" : "border-ui-04 focus:border-interactive"}
    text-text-primary
    placeholder-text-placeholder
    rounded-none
    transition-colors duration-fast
    focus:outline-none focus:ring-0
    disabled:bg-carbon-gray-10 disabled:border-carbon-gray-30 disabled:text-carbon-gray-50 disabled:cursor-not-allowed
    ${sizeStyles[size]}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && <label className="block text-label font-normal text-text-primary mb-02">{label}</label>}

      <input className={inputStyles} disabled={disabled} aria-invalid={invalid} aria-describedby={helperText || errorText ? "input-helper-text" : undefined} {...props} />

      {(helperText || errorText) && (
        <div id="input-helper-text" className={`text-caption mt-02 ${invalid ? "text-danger" : "text-text-secondary"}`}>
          {invalid ? errorText : helperText}
        </div>
      )}
    </div>
  );
};

export default Input;
