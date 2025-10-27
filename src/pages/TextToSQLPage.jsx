import React, { useState } from "react";
import { Database, Play, Download, Settings, AlertCircle, CheckCircle, Copy, Eye, EyeOff, Loader, RefreshCw } from "lucide-react";
import config from "../config/environment";
import ExcelJS from "exceljs";
import DatabaseSchemaFlow from "../components/DatabaseSchemaFlow";
import SimpleStatus from "../components/SimpleStatus";

const TextToSQLPageContent = () => {
  // Estados principales
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [discoveryComplete, setDiscoveryComplete] = useState(false);
  const [error, setError] = useState(null);
  const [rawLLMResponse, setRawLLMResponse] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [schemaData, setSchemaData] = useState(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isResultsFullscreen, setIsResultsFullscreen] = useState(false);
  const [isLoadingFullscreen, setIsLoadingFullscreen] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10000);

  // Conectividad simple manejada por SimpleStatus

  // Nuevos estados para multi-modelo y multi-BD
  const [availableModels, setAvailableModels] = useState([]);
  const [availableDatabases, setAvailableDatabases] = useState([]);

  // Suggested questions for quick use
  const [suggestedQuestions] = useState([
    "Dame las cuentas bancarias con saldo mayor a 50.000.",
    "Muestra las transacciones de los últimos 30 días.",
    "Clientes con más de 2 cuentas bancarias.",
    "Total de depósitos por mes del último año.",
  ]);
  // Configuración de base de datos
  const [dbConfig, setDbConfig] = useState({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
  });

  // Función para obtener modelos disponibles
  const handleGetAvailableModels = async () => {
    try {
      const response = await fetch("/api/textosql/models");
      if (!response.ok) {
        throw new Error("No se pudieron obtener los modelos disponibles");
      }
      const data = await response.json();
      setAvailableModels(data.models || []);
      return data.models || [];
    } catch (error) {
      console.error("Error obteniendo modelos:", error);
      // Fallback a configuración estática si la API no funciona
      const fallbackModels = [
        { id: "mistral-7b", name: "Mistral 7B", port: "8088", description: "Modelo general equilibrado" },
        { id: "gemma-2b", name: "Gemma 2B", port: "8085", description: "Modelo ligero y rápido" },
        { id: "gemma-4b", name: "Gemma 4B", port: "8086", description: "Modelo balanceado" },
        { id: "gemma-12b", name: "Gemma 12B", port: "8087", description: "Modelo de alta capacidad" },
        { id: "deepseek-1.5b", name: "DeepSeek 1.5B", port: "8091", description: "Ultraligero" },
        { id: "deepseek-8b", name: "DeepSeek 8B", port: "8089", description: "Equilibrado" },
        { id: "deepseek-14b", name: "DeepSeek 14B", port: "8090", description: "Alta capacidad" },
        { id: "granite", name: "IBM Granite", port: "8095", description: "Especializado en código" },
      ];
      setAvailableModels(fallbackModels);
      return fallbackModels;
    }
  };

  // Función para hacer pregunta en lenguaje natural usando el nuevo endpoint dinámico
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError("Debes escribir una pregunta");
      return;
    }

    if (!selectedDatabase) {
      setError("Debes seleccionar una base de datos");
      return;
    }

    if (!selectedModel) {
      setError("Debes seleccionar un modelo LLM");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setRawLLMResponse("");

    try {
      // Usar el nuevo endpoint dinámico
      const response = await fetch("/api/textosql/query/ask-dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          database_id: selectedDatabase.id,
          model_id: selectedModel.id,
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(await response.text());
        }
        throw new Error(errorData.detail?.error || errorData.detail || "Error en la consulta");
      }

      const data = await response.json();

      setRawLLMResponse(data.sql_query);

      const resultData = {
        question: data.question,
        sqlQuery: data.sql_query,
        results: data.results,
        explanation: data.explanation,
        timestamp: new Date().toLocaleString(),
        executionTime: 0,
        error: data.error || null,
        database_used: data.database_used,
        model_used: data.model_used,
      };

      setResults(resultData);
      setCurrentPage(1); // Reset pagination when new results arrive
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para descargar resultados a Excel
  const downloadToExcel = async (data, filename = "query_results") => {
    if (!data || !data.results || data.results.length === 0) return;

    try {
      const workbook = new ExcelJS.Workbook();

      // Hoja de resultados
      const worksheet = workbook.addWorksheet("Results");

      if (data.results.length > 0) {
        // Agregar headers
        const headers = Object.keys(data.results[0]);
        worksheet.addRow(headers);

        // Formatear headers
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE0E0E0" },
          };
        });

        // Agregar datos
        data.results.forEach((row) => {
          const values = headers.map((header) => row[header]);
          worksheet.addRow(values);
        });

        // Auto-ajustar columnas
        worksheet.columns.forEach((column) => {
          column.width = 15;
        });
      }

      // Hoja de información de la query
      const infoSheet = workbook.addWorksheet("Query Info");
      infoSheet.addRow(["Field", "Value"]);
      infoSheet.addRow(["Question", data.question]);
      infoSheet.addRow(["SQL Query", data.sqlQuery]);
      infoSheet.addRow(["Timestamp", data.timestamp]);
      infoSheet.addRow(["Rows", data.results.length]);
      infoSheet.addRow(["Database Used", data.database_used]);
      infoSheet.addRow(["Model Used", data.model_used]);
      infoSheet.addRow(["Explanation", data.explanation]);

      // Formatear headers de info
      infoSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
      });

      // Auto-ajustar columnas
      infoSheet.columns.forEach((column) => {
        column.width = 20;
      });

      // Descargar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating Excel file:", error);
    }
  };

  // Función para copiar query al clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Función para descubrir recursos disponibles (bases de datos y modelos)
  const handleDiscoverResources = async () => {
    setError(null);
    setIsDiscovering(true);
    
    // La conectividad se verifica automáticamente por SimpleStatus
    
    try {
      // Obtener bases de datos disponibles
      const dbsResp = await fetch(`/api/textosql/databases`);
      if (!dbsResp.ok) {
        throw new Error("No se pudieron obtener las bases de datos disponibles");
      }
      const dbsData = await dbsResp.json();
      setAvailableDatabases(dbsData.databases || []);

      // Obtener modelos disponibles
      await handleGetAvailableModels();

      setDiscoveryComplete(true);
    } catch (err) {
      setError(err.message);
      setAvailableDatabases([]);
      setAvailableModels([]);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Función para cargar el esquema de la base de datos específica
  const handleLoadSchema = async () => {
    if (!selectedDatabase) return;

    setIsLoadingSchema(true);
    try {
      const response = await fetch(`/api/textosql/schema/${selectedDatabase.id}`);
      if (!response.ok) {
        throw new Error("No se pudo cargar el esquema de la base de datos");
      }
      const data = await response.json();
      setSchemaData(data);
    } catch (error) {
      console.error("Error loading schema:", error);
      setError(error.message);
    } finally {
      setIsLoadingSchema(false);
    }
  };

  const handleToggleSchemaModal = async () => {
    if (!showSchemaModal && !schemaData && selectedDatabase) {
      await handleLoadSchema();
    }
    setShowSchemaModal((v) => !v);
  };

  return (
    <div className="p-6 bg-ibm-gray-10 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg mb-4 p-6 shadow-sm border border-ibm-gray-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ibm-gray-90">Texto a SQL - Multi-Modelo</h1>
              <p className="text-ibm-gray-70">Convierte preguntas en lenguaje natural a consultas SQL usando diferentes modelos y bases de datos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </div>
        </div>
      </div>

      {/* Configuración */}
      {showSettings && (
        <div className="bg-white rounded-lg mb-4 p-6 shadow-sm border border-ibm-gray-20">
          <h3 className="text-lg font-semibold mb-4">Configuración de Runtime</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Configuración de Base de Datos</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Host</label>
                  <input
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig((prev) => ({ ...prev, host: e.target.value }))}
                    className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Port</label>
                    <input
                      type="text"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig((prev) => ({ ...prev, port: e.target.value }))}
                      className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Database</label>
                    <input
                      type="text"
                      value={dbConfig.database}
                      onChange={(e) => setDbConfig((prev) => ({ ...prev, database: e.target.value }))}
                      className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      value={dbConfig.username}
                      onChange={(e) => setDbConfig((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={dbConfig.password}
                      onChange={(e) => setDbConfig((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Información de Recursos</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Modelos Disponibles</div>
                  <div className="text-sm text-green-600">{availableModels.length} modelos encontrados</div>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                  <div className="text-sm font-medium text-emerald-800">Bases de Datos</div>
                  <div className="text-sm text-emerald-600">
                    {availableDatabases.length} bases de datos encontradas
                    {availableDatabases.length > 0 && <div className="mt-1 text-xs">{availableDatabases.reduce((total, db) => total + (db.tables || 0), 0)} tablas en total</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery y Configuración Principal */}
      <div className="bg-white rounded-lg mb-4 p-6 shadow-sm border border-ibm-gray-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ibm-gray-90">Configuración Principal</h2>
          
          {/* Indicador de conectividad simple */}
          <SimpleStatus 
            url="/api/textosql/health"
            name="FastAPI"
          />
        </div>

        {/* Paso 1: Discovery de recursos */}
        {!discoveryComplete && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Paso 1: Descubrir Recursos Disponibles</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDiscoverResources}
                disabled={isDiscovering}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {isDiscovering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Descubriendo...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Descubrir Bases de Datos y Modelos</span>
                  </>
                )}
              </button>
              <span className="text-sm text-ibm-gray-70">Descubre qué bases de datos y modelos LLM están disponibles</span>
            </div>
          </div>
        )}

        {/* Paso 2: Selección de recursos */}
        {discoveryComplete && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selección de Base de Datos */}
              <div>
                <label className="block text-sm font-medium mb-2">Base de Datos</label>
                <select
                  value={selectedDatabase?.id || ""}
                  onChange={(e) => {
                    const db = availableDatabases.find((db) => db.id === e.target.value);
                    setSelectedDatabase(db);
                    // Limpiar esquema cuando cambie la BD
                    setSchemaData(null);
                  }}
                  className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                >
                  <option value="">-- Selecciona una base de datos --</option>
                  {availableDatabases.map((db) => (
                    <option key={db.id} value={db.id}>
                      {db.name} ({db.size || "Tamaño desconocido"} - {db.tables || 0} tablas)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ibm-gray-60 mt-1">{availableDatabases.length} base(s) de datos encontrada(s)</p>
              </div>

              {/* Selección de Modelo LLM */}
              <div>
                <label className="block text-sm font-medium mb-2">Modelo LLM</label>
                <select
                  value={selectedModel?.id || ""}
                  onChange={(e) => {
                    const model = availableModels.find((m) => m.id === e.target.value);
                    setSelectedModel(model);
                  }}
                  className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                >
                  <option value="">-- Selecciona un modelo --</option>
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ibm-gray-60 mt-1">{availableModels.length} modelo(s) encontrado(s)</p>
              </div>
            </div>

            {/* Información detallada de la base de datos seleccionada */}
            {selectedDatabase && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Base de Datos Seleccionada</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-green-700">Nombre:</span>
                    <div className="text-green-600">{selectedDatabase.name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Tamaño:</span>
                    <div className="text-green-600">{selectedDatabase.size || "No disponible"}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Tablas:</span>
                    <div className="text-green-600">{selectedDatabase.tables || 0} tablas</div>
                  </div>
                </div>
                {selectedDatabase.description && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-green-700">Descripción:</span>
                    <div className="text-green-600">{selectedDatabase.description}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        {discoveryComplete && (
          <div className="flex items-center space-x-4 mt-6">
            {/* Botón para reiniciar discovery */}
            <button
              onClick={() => {
                setDiscoveryComplete(false);
                setSelectedDatabase(null);
                setSelectedModel(null);
                setAvailableDatabases([]);
                setAvailableModels([]);
                setError(null);
                setSchemaData(null);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Nuevo Discovery</span>
            </button>

            {/* Botón de esquema */}
            {selectedDatabase && (
              <button
                onClick={handleToggleSchemaModal}
                disabled={isLoadingSchema}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {isLoadingSchema ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Cargando Esquema...</span>
                  </>
                ) : showSchemaModal ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Ocultar Esquema</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Ver Esquema</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Preguntas sugeridas */}
        {selectedDatabase && selectedModel && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Preguntas Sugeridas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(q);
                  }}
                  className="text-left px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-colors"
                >
                  <div className="text-sm text-green-800 font-medium">{q}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input principal para preguntas */}
      {selectedDatabase && selectedModel && (
        <div className="relative bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Haz tu Pregunta</h2>

          {/* Loader global cuando está procesando */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center z-10">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                  <div
                    className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"
                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-green-700 animate-pulse">🤖 Procesando tu consulta</p>
                  <p className="text-sm text-green-600">El modelo {selectedModel.name} está analizando tu pregunta...</p>
                  <div className="flex justify-center space-x-1 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: "0.8s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">
                Escribe tu pregunta en español sobre la base de datos "{selectedDatabase.name}" usando el modelo "{selectedModel.name}"
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ej: ¿Cuántos clientes tenemos con saldo mayor a 50,000?"
                  className="flex-1 px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  <span className={isLoading ? "animate-pulse" : ""}>{isLoading ? "Analizando tu pregunta..." : "Preguntar"}</span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">Error en la consulta</h4>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensaje cuando no está todo configurado */}
      {discoveryComplete && (!selectedDatabase || !selectedModel) && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ibm-gray-90 mb-2">Configuración Incompleta</h3>
            <p className="text-ibm-gray-70 mb-4">Para comenzar a hacer preguntas, completa estos pasos:</p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className={`flex items-center space-x-2 ${selectedDatabase ? "text-green-600" : "text-gray-500"}`}>
                <div className={`w-2 h-2 rounded-full ${selectedDatabase ? "bg-green-500" : "bg-gray-300"}`}></div>
                <span>Seleccionar una base de datos ({availableDatabases.length} disponibles)</span>
              </div>
              <div className={`flex items-center space-x-2 ${selectedModel ? "text-green-600" : "text-gray-500"}`}>
                <div className={`w-2 h-2 rounded-full ${selectedModel ? "bg-green-500" : "bg-gray-300"}`}></div>
                <span>Seleccionar un modelo LLM ({availableModels.length} disponibles)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loader para pantalla completa */}
      {isLoadingFullscreen && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
              <div
                className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"
                style={{ animationDirection: "reverse", animationDuration: "1.2s" }}
              ></div>
              <div
                className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin absolute top-4 left-1/2 transform -translate-x-1/2"
                style={{ animationDuration: "0.8s" }}
              ></div>
            </div>
            <div className="space-y-3">
              <p className="text-2xl font-bold text-green-600 animate-pulse">🚀 Activando Modo Pantalla Completa</p>
              <p className="text-lg text-green-600">Preparando la vista optimizada para tus datos...</p>
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados de la consulta */}
      {results && (
        <div className={`bg-white rounded-lg mt-4 p-6 shadow-sm border border-ibm-gray-20 ${isResultsFullscreen ? "fixed inset-0 z-50 overflow-auto bg-white" : ""}`}>
          {!isResultsFullscreen && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ibm-gray-90">Resultados</h2>
            </div>
          )}

          {isResultsFullscreen && (
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-ibm-gray-90">Resultados - Pantalla Completa</h2>
              <button
                onClick={() => setIsResultsFullscreen(false)}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                <span>Cerrar Pantalla Completa</span>
              </button>
            </div>
          )}

          {/* Información de la consulta - Solo en modo normal */}
          {!isResultsFullscreen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium text-green-800">Base de Datos</div>
                <div className="text-sm text-green-600">{results.database_used}</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                <div className="text-sm font-medium text-emerald-800">Modelo LLM</div>
                <div className="text-sm text-emerald-600">{results.model_used}</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 rounded-lg">
                <div className="text-sm font-medium text-teal-800">Timestamp</div>
                <div className="text-sm text-teal-600">{results.timestamp}</div>
              </div>
            </div>
          )}

          {/* Respuesta cruda del LLM - Solo en modo normal */}
          {!isResultsFullscreen && rawLLMResponse && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Query SQL Generada</h4>
                <button
                  onClick={() => copyToClipboard(rawLLMResponse)}
                  className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded hover:opacity-90 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copiar</span>
                </button>
              </div>
              <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">{rawLLMResponse}</pre>
            </div>
          )}

          {/* Explicación - Solo en modo normal */}
          {!isResultsFullscreen && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-800">Explicación</h4>
                <p className="text-green-700 mt-1">{results.explanation}</p>
              </div>
            </div>
          )}

          {/* Botones de acción - Solo en modo normal */}
          {!isResultsFullscreen && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadToExcel(results, "sql_query_results")}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Excel</span>
                </button>
                <button
                  onClick={() => {
                    setIsLoadingFullscreen(true);
                    setTimeout(() => {
                      setIsResultsFullscreen(true);
                      setIsLoadingFullscreen(false);
                    }, 300);
                  }}
                  disabled={isLoadingFullscreen}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {isLoadingFullscreen ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Cargando...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Pantalla Completa</span>
                    </>
                  )}
                </button>
              </div>
              <span className="text-sm text-gray-600">{results.results.length} filas encontradas</span>
            </div>
          )}

          {/* Tabla de resultados */}
          {results.results.length > 0 &&
            (() => {
              const totalItems = results.results.length;
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
              const currentItems = isResultsFullscreen ? results.results.slice(startIndex, endIndex) : results.results.slice(0, 15);
              const totalPages = Math.ceil(totalItems / itemsPerPage);
              const showingCount = isResultsFullscreen ? currentItems.length : Math.min(15, totalItems);

              return (
                <div className={`border border-gray-200 rounded-lg ${isResultsFullscreen ? "h-full overflow-auto" : "overflow-x-auto"}`}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-50 to-emerald-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">#ID</th>
                        {Object.keys(results.results[0]).map((key) => (
                          <th key={key} className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider border-b border-green-200">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((row, index) => {
                        const globalIndex = isResultsFullscreen ? startIndex + index + 1 : index + 1;
                        return (
                          <tr key={globalIndex} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{globalIndex}</td>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {value !== null ? String(value) : <span className="text-gray-400 italic">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Paginación y controles */}
                  {!isResultsFullscreen && results.results.length > 15 && (
                    <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-sm text-green-700 text-center border-t border-green-200">
                      Mostrando {showingCount} de {totalItems} resultados - Usa pantalla completa para ver todos
                    </div>
                  )}

                  {isResultsFullscreen && totalPages > 1 && (
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-green-700">
                          Mostrando {startIndex + 1} - {endIndex} de {totalItems} resultados (Página {currentPage} de {totalPages})
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Anterior
                          </button>
                          <span className="px-3 py-2 text-sm text-green-700 bg-white border border-green-300 rounded-lg">
                            {currentPage} / {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Siguiente
                          </button>
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Cargar Próximos 10,000
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isResultsFullscreen && totalPages === 1 && (
                    <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-sm text-green-700 text-center border-t border-green-200">
                      Mostrando todos los {totalItems} resultados
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      )}

      {/* Schema Modal */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 gap-4 flex items-start justify-center p-6">
          <div className="bg-black bg-opacity-40 absolute inset-0" onClick={handleToggleSchemaModal} />
          <div className="bg-white rounded-lg shadow-lg z-50 max-w-7xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold">Esquema de Base de Datos: {selectedDatabase?.name}</h3>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-green-600">{schemaData?.schema ? Object.keys(schemaData.schema.tables).length : 0} tablas</div>
                <button onClick={handleToggleSchemaModal} className="px-3 py-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded hover:opacity-90 transition-colors">
                  Cerrar
                </button>
              </div>
            </div>

            {isLoadingSchema ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-green-500" />
                <span className="ml-2 text-gray-600">Cargando esquema...</span>
              </div>
            ) : schemaData && schemaData.schema ? (
              <div className="space-y-4">
                {/* Información general */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Base de Datos: {schemaData.database_id}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Tablas:</span>
                      <div className="text-green-600">{Object.keys(schemaData.schema.tables).length}</div>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Relaciones:</span>
                      <div className="text-green-600">{schemaData.schema.relationships?.length || 0}</div>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Columnas totales:</span>
                      <div className="text-green-600">{Object.values(schemaData.schema.tables).reduce((total, table) => total + table.columns.length, 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Vista interactiva con ReactFlow */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Vista Interactiva del Esquema</h4>
                  <DatabaseSchemaFlow schemaData={schemaData} />
                  <div className="mt-3 text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Usa los controles en la esquina superior izquierda para hacer zoom y ajustar la vista. Las líneas verdes muestran las relaciones entre tablas.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No se pudo cargar el esquema de la base de datos</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal simplificado - sin preloader complejo
const TextToSQLPage = () => {
  return <TextToSQLPageContent />;
};

export default TextToSQLPage;
