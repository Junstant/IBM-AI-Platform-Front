import React, { useState } from "react";
import config from "../config/environment";

const MODELS = [
  { name: "Gemma 2b", port: config.llm.gemma2b },     // gemma2b-td-server
  { name: "Google Gemma 12b", port: config.llm.gemma12b },   // google_gemma12b-td-server
  { name: "Mistral", port: config.llm.mistral },      // mistral-td-server
  { name: "Granite", port: config.llm.granite },      // granite-td-server
  { name: "Google gemma 4b", port: config.llm.gemma4b },    // google_gemma4b-td-server
  { name: "Deepseek 1.5b", port: config.llm.deepseek1_5b },      // deepseek1.5B-td-server
  { name: "Deepseek 8b", port: config.llm.deepseek8b },        // deepseek8b-td-server
  { name: "Deepseek 14b", port: config.llm.deepseek14b },       // deepseek14B-td-server
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
        <label className="block text-label text-text-primary mb-02">
          Selecciona el modelo de Machine Learning
        </label>
      )}
      <div className="flex items-center space-x-03">
        <select
          value={selected.name}
          onChange={handleChange}
          className="h-8 px-04 py-01 border border-ui-04 focus:outline-none focus:border-interactive bg-ui-01 text-text-primary text-sm min-w-[170px] transition-colors duration-fast"
        >
          {MODELS.map((model) => (
            <option key={model.name} value={model.name}>
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
