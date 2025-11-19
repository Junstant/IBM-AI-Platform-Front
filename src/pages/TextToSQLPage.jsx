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
    <div className="space-y-05">
      {/* Header */}
      <div className="bg-ui-02 border border-ui-03 mb-05 p-06">
        <div className="flex items-center justify-between mb-05">
          <div className="flex items-center space-x-04">
            <div className="w-10 h-10 bg-success flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-productive-heading-04 text-text-primary">Texto a SQL - Multi-Modelo</h1>
              <p className="text-body-long text-text-secondary">Convierte preguntas en lenguaje natural a consultas SQL usando diferentes modelos y bases de datos</p>
            </div>
          </div>
          <div className="flex items-center space-x-03">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-02 h-8 px-04 py-02 bg-success text-white hover:bg-[#198038] transition-colors text-label"
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </div>
        </div>
      </div>

      {/* Configuración */}
      {showSettings && (
        <div className="bg-ui-02 border border-ui-03 mb-05 p-06">
          <h3 className="text-lg font-semibold mb-4">Configuración de Runtime</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Configuración de Base de Datos</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-label text-text-primary mb-1">Host</label>
                  <input
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig((prev) => ({ ...prev, host: e.target.value }))}
                    className="w-full h-10 px-04 py-02 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive transition-colors duration-fast"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label text-text-primary mb-1">Port</label>
                    <input
                      type="text"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig((prev) => ({ ...prev, port: e.target.value }))}
                      className="w-full h-10 px-04 py-02 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive transition-colors duration-fast"
                    />
                  </div>
                  <div>
                    <label className="block text-label text-text-primary mb-1">Database</label>
                    <input
                      type="text"
                      value={dbConfig.database}
                      onChange={(e) => setDbConfig((prev) => ({ ...prev, database: e.target.value }))}
                      className="w-full h-10 px-04 py-02 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive transition-colors duration-fast"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label text-text-primary mb-1">Username</label>
                    <input
                      type="text"
                      value={dbConfig.username}
                      onChange={(e) => setDbConfig((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full h-10 px-04 py-02 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive transition-colors duration-fast"
                    />
                  </div>
                  <div>
                    <label className="block text-label text-text-primary mb-1">Password</label>
                    <input
                      type="password"
                      value={dbConfig.password}
                      onChange={(e) => setDbConfig((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full h-10 px-04 py-02 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive transition-colors duration-fast"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Información de Recursos</h4>
              <div className="space-y-3">
                <div className="p-3 bg-ui-01 border border-success">
                  <div className="text-label text-success">Modelos Disponibles</div>
                  <div className="text-caption text-success">{availableModels.length} modelos encontrados</div>
                </div>
                <div className="p-3 bg-ui-01 border border-success">
                  <div className="text-label text-success">Bases de Datos</div>
                  <div className="text-caption text-success">
                    {availableDatabases.length} bases de datos encontradas
                    {availableDatabases.length > 0 && <div className="mt-1 text-caption text-text-secondary">{availableDatabases.reduce((total, db) => total + (db.tables || 0), 0)} tablas en total</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery y Configuración Principal */}
      <div className="bg-ui-02 mb-4 p-6 border border-ui-03">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-productive-heading-03 text-text-primary">Configuración Principal</h2>
          
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
                className="flex items-center space-x-02 h-10 px-06 py-03 bg-success text-white hover:opacity-90 disabled:opacity-50 transition-colors"
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
              <span className="text-caption text-text-secondary">Descubre qué bases de datos y modelos LLM están disponibles</span>
            </div>
          </div>
        )}

        {/* Paso 2: Selección de recursos */}
        {discoveryComplete && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selección de Base de Datos */}
              <div>
                <label className="block text-label text-text-primary mb-2">Base de Datos</label>
                <select
                  value={selectedDatabase?.id || ""}
                  onChange={(e) => {
                    const db = availableDatabases.find((db) => db.id === e.target.value);
                    setSelectedDatabase(db);
                    // Limpiar esquema cuando cambie la BD
                    setSchemaData(null);
                  }}
                  className="w-full h-10 px-04 py-02 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive transition-colors duration-fast"
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
                <label className="block text-label text-text-primary mb-2">Modelo LLM</label>
                <select
                  value={selectedModel?.id || ""}
                  onChange={(e) => {
                    const model = availableModels.find((m) => m.id === e.target.value);
                    setSelectedModel(model);
                  }}
                  className="w-full h-10 px-04 py-02 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive transition-colors duration-fast"
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
              <div className="mt-4 p-4 bg-ui-01 border border-success">
                <h4 className="font-semibold text-success mb-2">Base de Datos Seleccionada</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-success">Nombre:</span>
                    <div className="text-success">{selectedDatabase.name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-success">Tamaño:</span>
                    <div className="text-success">{selectedDatabase.size || "No disponible"}</div>
                  </div>
                  <div>
                    <span className="font-medium text-success">Tablas:</span>
                    <div className="text-success">{selectedDatabase.tables || 0} tablas</div>
                  </div>
                </div>
                {selectedDatabase.description && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-success">Descripción:</span>
                    <div className="text-success">{selectedDatabase.description}</div>
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
              className="flex items-center space-x-02 h-8 px-04 py-02 bg-carbon-gray-70 text-white hover:bg-carbon-gray-80 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Nuevo Discovery</span>
            </button>

            {/* Botón de esquema */}
            {selectedDatabase && (
              <button
                onClick={handleToggleSchemaModal}
                disabled={isLoadingSchema}
                className="flex items-center space-x-2 px-4 py-2 bg-success text-white hover:opacity-90 disabled:opacity-50 transition-colors"
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
                  className="text-left px-4 py-3 bg-ui-01 border border-success hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-colors"
                >
                  <div className="text-sm text-success font-medium">{q}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input principal para preguntas */}
      {selectedDatabase && selectedModel && (
        <div className="relative bg-ui-02 p-6 border border-ui-03">
          <h2 className="text-productive-heading-03 text-text-primary mb-4">Haz tu Pregunta</h2>

          {/* Loader global cuando está procesando */}
          {isLoading && (
            <div className="absolute inset-0 bg-ui-02 bg-opacity-95 flex items-center justify-center z-10">
              <div className="text-center space-y-6">
                {/* Spinner circular simple estilo IBM Carbon */}
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-ui-03 border-t-success rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-productive-heading-03 text-text-primary">Procesando tu consulta</p>
                  <p className="text-caption text-text-secondary">El modelo {selectedModel.name} está analizando tu pregunta...</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-label text-text-primary text-text-primary mb-2">
                Escribe tu pregunta en español sobre la base de datos "{selectedDatabase.name}" usando el modelo "{selectedModel.name}"
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ej: ¿Cuántos clientes tenemos con saldo mayor a 50,000?"
                  className="flex-1 px-4 py-3 border border-ui-04 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isLoading}
                  className="flex items-center space-x-02 h-10 px-06 py-03 bg-success text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-ui-02 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-ui-02 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-ui-02 animate-bounce" style={{ animationDelay: "300ms" }}></div>
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
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200">
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
        <div className="bg-ui-02 p-6 border border-ui-03">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Configuración Incompleta</h3>
            <p className="text-text-secondary mb-4">Para comenzar a hacer preguntas, completa estos pasos:</p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className={`flex items-center space-x-2 ${selectedDatabase ? "text-success" : "text-gray-500"}`}>
                <div className={`w-2 h-2 ${selectedDatabase ? "bg-ui-010" : "bg-gray-300"}`}></div>
                <span>Seleccionar una base de datos ({availableDatabases.length} disponibles)</span>
              </div>
              <div className={`flex items-center space-x-2 ${selectedModel ? "text-success" : "text-gray-500"}`}>
                <div className={`w-2 h-2 ${selectedModel ? "bg-ui-010" : "bg-gray-300"}`}></div>
                <span>Seleccionar un modelo LLM ({availableModels.length} disponibles)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loader para pantalla completa */}
      {isLoadingFullscreen && (
        <div className="fixed inset-0 z-50 bg-ui-02 flex items-center justify-center">
          <div className="text-center space-y-6">
            {/* Spinner circular simple estilo IBM Carbon */}
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-ui-03 border-t-success rounded-full animate-spin"></div>
            </div>
            <div className="space-y-3">
              <p className="text-productive-heading-04 text-text-primary">Activando Modo Pantalla Completa</p>
              <p className="text-body-long text-text-secondary">Preparando la vista optimizada para tus datos...</p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados de la consulta */}
      {results && (
        <div className={`bg-ui-02 mt-4 p-6 border border-ui-03 ${isResultsFullscreen ? "fixed inset-0 z-50 overflow-auto bg-ui-02" : ""}`}>
          {!isResultsFullscreen && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-productive-heading-03 text-text-primary">Resultados</h2>
            </div>
          )}

          {isResultsFullscreen && (
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-ui-02 z-10 border-b border-gray-200 pb-4">
              <h2 className="text-productive-heading-03 text-text-primary">Resultados - Pantalla Completa</h2>
              <button
                onClick={() => setIsResultsFullscreen(false)}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                <span>Cerrar Pantalla Completa</span>
              </button>
            </div>
          )}

          {/* Información de la consulta - Solo en modo normal */}
          {!isResultsFullscreen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-ui-01 border border-success">
                <div className="text-label text-success">Base de Datos</div>
                <div className="text-caption text-success">{results.database_used}</div>
              </div>
              <div className="p-3 bg-ui-01 border border-success">
                <div className="text-label text-success">Modelo LLM</div>
                <div className="text-caption text-success">{results.model_used}</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200">
                <div className="text-sm font-medium text-teal-800">Timestamp</div>
                <div className="text-sm text-teal-600">{results.timestamp}</div>
              </div>
            </div>
          )}

          {/* Respuesta cruda del LLM - Solo en modo normal */}
          {!isResultsFullscreen && rawLLMResponse && (
            <div className="p-4 bg-gray-50 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Query SQL Generada</h4>
                <button
                  onClick={() => copyToClipboard(rawLLMResponse)}
                  className="flex items-center space-x-1 px-2 py-1 bg-success text-white hover:opacity-90 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copiar</span>
                </button>
              </div>
              <pre className="text-sm bg-ui-02 p-3 rounded border overflow-x-auto">{rawLLMResponse}</pre>
            </div>
          )}

          {/* Explicación - Solo en modo normal */}
          {!isResultsFullscreen && (
            <div className="flex items-center space-x-3 p-4 bg-ui-01 border border-success mb-4">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-success">Explicación</h4>
                <p className="text-success mt-1">{results.explanation}</p>
              </div>
            </div>
          )}

          {/* Botones de acción - Solo en modo normal */}
          {!isResultsFullscreen && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadToExcel(results, "sql_query_results")}
                  className="flex items-center space-x-2 px-4 py-2 bg-success text-white hover:opacity-90 transition-colors"
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
                  className="flex items-center space-x-02 h-8 px-04 py-02 bg-carbon-gray-70 text-white hover:opacity-90 disabled:opacity-50 transition-colors"
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
                <div className={`border border-ui-03 ${isResultsFullscreen ? "h-full overflow-auto" : "overflow-x-auto"}`}>
                  <table className="min-w-full divide-y divide-ui-03">
                    <thead className="bg-ui-01 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-success uppercase tracking-wider border-b border-success">#ID</th>
                        {Object.keys(results.results[0]).map((key) => (
                          <th key={key} className="px-6 py-3 text-left text-xs font-medium text-success uppercase tracking-wider border-b border-success">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-ui-02 divide-y divide-ui-03">
                      {currentItems.map((row, index) => {
                        const globalIndex = isResultsFullscreen ? startIndex + index + 1 : index + 1;
                        return (
                          <tr key={globalIndex} className="hover:bg-ui-background transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-success">{globalIndex}</td>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                {value !== null ? String(value) : <span className="text-text-secondary italic">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Paginación y controles */}
                  {!isResultsFullscreen && results.results.length > 15 && (
                    <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-sm text-success text-center border-t border-success">
                      Mostrando {showingCount} de {totalItems} resultados - Usa pantalla completa para ver todos
                    </div>
                  )}

                  {isResultsFullscreen && totalPages > 1 && (
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-success">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-success">
                          Mostrando {startIndex + 1} - {endIndex} de {totalItems} resultados (Página {currentPage} de {totalPages})
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm bg-ui-02 border border-green-300 text-success hover:bg-ui-01 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Anterior
                          </button>
                          <span className="px-3 py-2 text-sm text-success bg-ui-02 border border-green-300">
                            {currentPage} / {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm bg-ui-02 border border-green-300 text-success hover:bg-ui-01 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Siguiente
                          </button>
                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm bg-success text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Cargar Próximos 10,000
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isResultsFullscreen && totalPages === 1 && (
                    <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-sm text-success text-center border-t border-success">
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
          <div className="bg-ui-02 shadow-lg z-50 max-w-7xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold">Esquema de Base de Datos: {selectedDatabase?.name}</h3>
              <div className="flex items-center space-x-3">
                <div className="text-caption text-success">{schemaData?.schema ? Object.keys(schemaData.schema.tables).length : 0} tablas</div>
                <button onClick={handleToggleSchemaModal} className="h-8 px-04 py-02 bg-success text-white hover:opacity-90 transition-colors">
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
                <div className="bg-ui-01 p-4 border border-success">
                  <h4 className="font-semibold text-success mb-2">Base de Datos: {schemaData.database_id}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-success">Tablas:</span>
                      <div className="text-success">{Object.keys(schemaData.schema.tables).length}</div>
                    </div>
                    <div>
                      <span className="font-medium text-success">Relaciones:</span>
                      <div className="text-success">{schemaData.schema.relationships?.length || 0}</div>
                    </div>
                    <div>
                      <span className="font-medium text-success">Columnas totales:</span>
                      <div className="text-success">{Object.values(schemaData.schema.tables).reduce((total, table) => total + table.columns.length, 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Vista interactiva con ReactFlow */}
                <div className="bg-gray-50 p-4 border border-ui-03">
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







