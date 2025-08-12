import React, { useState } from "react";

const MODELS = [
  { name: "Gemma 2b", port: 8093 },
  { name: "Google Gemma 12b", port: 2005 },
  { name: "Mistral", port: 8096 },
  { name: "Granite", port: 8095 },
  { name: "Google gemma 4b", port: 8094 },
  { name: "Deepseek 1.5b", port: 8092 },
  { name: "Deepseek 8b", port: 8091 },
  { name: "Deepseek 14b", port: 8090 },
];

/**
 * ModelSelector
 * @param {Object} props
 * @param {string} [props.value] - Selected model name
 * @param {function} [props.onChange] - Callback with selected model object
 * @param {boolean} [props.showPort] - Show port next to selector
 */
export default function ModelSelector({ value, onChange, showPort = true, hideLabel = false }) {
  const [selected, setSelected] = useState(
    MODELS.find((m) => m.name === value) || MODELS[0]
  );

  const handleChange = (e) => {
    const model = MODELS.find((m) => m.name === e.target.value);
    setSelected(model);
    if (onChange) onChange(model);
  };

  return (
    <div className="w-full">
      {!hideLabel && (
        <label className="block text-sm font-medium text-ibm-gray-90 mb-2">
          Selecciona el modelo de Machine Learning
        </label>
      )}
      <div className="flex items-center space-x-3">
        <select
          value={selected.name}
          onChange={handleChange}
          className="h-12 px-4 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-ibm-gray-90 text-sm min-w-[170px] shadow-sm"
        >
          {MODELS.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
        {showPort && (
          <span className="text-xs text-ibm-gray-70 whitespace-nowrap">
            Puerto: <span className="font-semibold text-ibm-gray-90">{selected.port}</span>
          </span>
        )}
      </div>
    </div>
  );
}
