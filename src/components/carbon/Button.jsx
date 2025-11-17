import React from "react";
import { Loader2 } from "lucide-react";

/**
 * 🎨 IBM Carbon Button Component
 * Implementación fiel al Carbon Design System
 *
 * @param {string} variant - 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} disabled
 * @param {boolean} loading
 * @param {ReactNode} icon
 * @param {boolean} iconOnly
 */
const Button = ({ children, variant = "primary", size = "md", disabled = false, loading = false, icon = null, iconOnly = false, className = "", ...props }) => {
  // Variantes de estilo según Carbon Design System
  const variantStyles = {
    primary: `
      bg-interactive text-text-on-color
      hover:bg-[#0050e6] active:bg-[#0043ce]
      disabled:bg-carbon-gray-30 disabled:text-carbon-gray-50 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-carbon-gray-80 text-text-on-color border border-carbon-gray-80
      hover:bg-carbon-gray-70 active:bg-carbon-gray-60
      disabled:bg-carbon-gray-30 disabled:border-carbon-gray-30 disabled:text-carbon-gray-50 disabled:cursor-not-allowed
    `,
    tertiary: `
      bg-transparent text-interactive border border-interactive
      hover:bg-[#edf5ff] hover:text-[#0043ce] hover:border-[#0043ce]
      active:bg-[#d0e2ff] active:text-[#002d9c] active:border-[#002d9c]
      disabled:border-carbon-gray-30 disabled:text-carbon-gray-50 disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent text-interactive border-none
      hover:bg-[#edf5ff] hover:text-[#0043ce]
      active:bg-[#d0e2ff] active:text-[#002d9c]
      disabled:text-carbon-gray-50 disabled:cursor-not-allowed
    `,
    danger: `
      bg-danger text-text-on-color
      hover:bg-[#ba1b23] active:bg-[#a2191f]
      disabled:bg-carbon-gray-30 disabled:text-carbon-gray-50 disabled:cursor-not-allowed
    `,
  };

  // Tamaños según Carbon Design System
  const sizeStyles = {
    sm: iconOnly ? "h-8 w-8 p-01" : "h-8 px-04 py-01 text-label",
    md: iconOnly ? "h-10 w-10 p-02" : "h-10 px-05 py-02 text-body-short",
    lg: iconOnly ? "h-12 w-12 p-03" : "h-12 px-06 py-03 text-body-short",
    xl: iconOnly ? "h-16 w-16 p-04" : "h-16 px-07 py-04 text-heading",
  };

  const baseStyles = `
    inline-flex items-center justify-center
    font-sans font-normal
    rounded-none
    transition-all duration-fast
    focus:outline-none focus:ring-2 focus:ring-interactive focus:ring-offset-2
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `;

  const isDisabled = disabled || loading;

  return (
    <button className={baseStyles} disabled={isDisabled} {...props}>
      {loading ? (
        <>
          <Loader2 className={`${iconOnly ? "" : "mr-02"} w-4 h-4 animate-spin`} />
          {!iconOnly && <span>Cargando...</span>}
        </>
      ) : (
        <>
          {icon && <span className={iconOnly ? "" : "mr-02"}>{icon}</span>}
          {!iconOnly && children}
        </>
      )}
    </button>
  );
};

export default Button;
