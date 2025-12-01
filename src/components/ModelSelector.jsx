import React, { useState } from "react";
import config from "../config/environment";

// ✅ USAR MODELOS DESDE CONFIGURACIÓN CENTRALIZADA
const MODELS = config.llm.availableModels;

/**
 * ModelSelector
 * @param {Object} props
 * @param {string} [props.value] - Selected model id (e.g., "gemma-2b")
 * @param {function} [props.onChange] - Callback with selected model object
 * @param {boolean} [props.showPort] - Show port next to selector
 */
export default function ModelSelector({ value, onChange, showPort = true, hideLabel = false }) {
  // Buscar por id (más confiable que name)
  const [selected, setSelected] = useState(
    MODELS.find((m) => m.id === value) || MODELS[0]
  );

  const handleChange = (e) => {
    const model = MODELS.find((m) => m.id === e.target.value);
    setSelected(model);
    if (onChange) onChange(model);
  };

  return (
    <div className="w-full">
      {!hideLabel && (
        <label className="block text-label text-text-primary mb-02">
          Selecciona el modelo de Machine Learning
        </label>
      )}
      <div className="flex items-center space-x-03">
        <select
          value={selected.id}
          onChange={handleChange}
          className="h-8 px-04 py-01 border border-ui-04 focus:outline-none focus:border-interactive bg-ui-01 text-text-primary text-sm min-w-[170px] transition-colors duration-fast"
        >
          {MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        {showPort && (
          <span className="text-caption text-text-secondary whitespace-nowrap">
            Puerto: <span className="font-medium text-text-primary">{selected.port}</span>
          </span>
        )}
      </div>
    </div>
  );
}
