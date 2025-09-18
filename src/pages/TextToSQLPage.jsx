import React, { useState, useEffect } from "react";
import { Database, Play, Download, History, Settings, HelpCircle, AlertCircle, CheckCircle, Copy, Eye, EyeOff, Loader, RefreshCw } from "lucide-react";
import config from "../config/environment";
import ExcelJS from "exceljs";

const TextToSQLPage = () => {
  // Estados principales
  const [selectedModel, setSelectedModel] = useState();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [connected, setConnected] = useState(false);
  const [availableDatabases, setAvailableDatabases] = useState([]);
  const [selectedDatabaseName, setSelectedDatabaseName] = useState(config.database.name || "");
  const [error, setError] = useState(null);
  const [rawLLMResponse, setRawLLMResponse] = useState("");
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

  // Configuración de API LLM
  const [llmConfig, setLlmConfig] = useState({
    host: config.database.host,
    port: selectedModel?.port || "8096",
  });

  useEffect(() => {
    if (selectedModel) {
      setLlmConfig((prev) => ({ ...prev, port: selectedModel.port }));
    }
  }, [selectedModel]);

  // Función para hacer pregunta en lenguaje natural
  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedModel || !connected || !selectedDatabaseName) {
      setError("Debes conectarte a la base de datos, seleccionar una base de datos y un modelo antes de hacer preguntas");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setRawLLMResponse("");

    try {
      // Primero obtener la query SQL del LLM
      const llmResponse = await fetch(`http://${llmConfig.host}:${llmConfig.port}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel.name,
          messages: [
            {
              role: "system",
              content: `Eres un experto en SQL para PostgreSQL. Convierte preguntas en lenguaje natural a consultas SQL válidas para la base de datos ${dbConfig.database}. 
              
              Responde SOLO con el query SQL, sin explicaciones adicionales. El query debe ser ejecutable directamente.
              
              Esquema de la base de datos:
              - Tabla: clientes (id, nombre, email, telefono, fecha_registro)
              - Tabla: cuentas_bancarias (id, cliente_id, numero_cuenta, tipo_cuenta, saldo, fecha_creacion)
              - Tabla: transacciones (id, cuenta_origen_id, cuenta_destino_id, monto, tipo_transaccion, fecha_transaccion, descripcion)
              
              Usa JOINs cuando sea necesario para relacionar las tablas.`,
            },
            {
              role: "user",
              content: question,
            },
          ],
          max_tokens: 500,
          temperature: 0.1,
        }),
      });

      if (!llmResponse.ok) {
        throw new Error(`Error del LLM: ${llmResponse.status}`);
      }

      const llmData = await llmResponse.json();
      const sqlQuery = llmData.choices[0].message.content.trim();
      setRawLLMResponse(sqlQuery);

      // Ejecutar la query SQL

      const dbResponse = await fetch(`http://${dbConfig.host}:${dbConfig.port}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dbConfig,
          query: sqlQuery,
        }),
      });

      if (!dbResponse.ok) {
        const errorData = await dbResponse.json();
        throw new Error(`Error de base de datos: ${errorData.error || "Error desconocido"}`);
      }

      const queryResults = await dbResponse.json();

      // Generar explicación de los resultados
      const explanationResponse = await fetch(`http://${llmConfig.host}:${llmConfig.port}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel.name,
          messages: [
            {
              role: "system",
              content: "Explica de manera concisa y clara los resultados de la consulta SQL en español.",
            },
            {
              role: "user",
              content: `Pregunta original: ${question}\nQuery SQL: ${sqlQuery}\nResultados obtenidos: ${queryResults.rows.length} filas\nPrimeras filas: ${JSON.stringify(
                queryResults.rows.slice(0, 3)
              )}`,
            },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      let explanation = `Se obtuvieron ${queryResults.rows.length} resultados.`;
      if (explanationResponse.ok) {
        const explanationData = await explanationResponse.json();
        explanation = explanationData.choices[0].message.content.trim();
      }

      const resultData = {
        question,
        sqlQuery,
        results: queryResults.rows,
        explanation,
        timestamp: new Date().toLocaleString(),
        executionTime: queryResults.executionTime || 0,
      };

      setResults(resultData);
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

  // Connect to database test endpoint
  const handleConnectDatabase = async () => {
    setError(null);
    try {
      const resp = await fetch(`http://${dbConfig.host}:${dbConfig.port}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbConfig),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "No se pudo conectar a la base");
      }
      setConnected(true);
      // fetch available DBs
      const listResp = await fetch(`http://${dbConfig.host}:${dbConfig.port}/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: dbConfig.host, port: dbConfig.port, username: dbConfig.username, password: dbConfig.password }),
      });
      if (listResp.ok) {
        const listData = await listResp.json();
        setAvailableDatabases(listData.databases || []);
      }
    } catch (err) {
      setError(err.message);
      setConnected(false);
    }
  };

  const handleSelectDatabase = (name) => {
    setSelectedDatabaseName(name);
    setDbConfig((prev) => ({ ...prev, database: name }));
  };

  const handleToggleSchemaModal = () => setShowSchemaModal((v) => !v);

  return (
    <div className="p-6 space-y-6 bg-ibm-gray-10 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ibm-gray-90">Texto a SQL</h1>
              <p className="text-ibm-gray-70">Convierte preguntas en lenguaje natural a consultas SQL</p>
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h3 className="text-lg font-semibold mb-4">Configuración de Runtime</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">LLM Runtime API</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Host</label>
                  <input
                    type="text"
                    value={llmConfig.host}
                    onChange={(e) => setLlmConfig((prev) => ({ ...prev, host: e.target.value }))}
                    className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Port</label>
                  <input
                    type="text"
                    value={llmConfig.port}
                    onChange={(e) => setLlmConfig((prev) => ({ ...prev, port: e.target.value }))}
                    className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Conexión de Base de Datos</h4>
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
          </div>
        </div>
      )}

      {/* Conexión y Configuración Principal */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Configuración Principal</h2>
        
        {/* Controles de conexión */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Conexión a Base de Datos</label>
            <button
              onClick={handleConnectDatabase}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                connected 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white hover:opacity-90'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{connected ? "✓ Conectado a banco_global" : "Conectar a banco_global"}</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base de Datos</label>
            <select 
              value={selectedDatabaseName} 
              onChange={(e) => handleSelectDatabase(e.target.value)}
              disabled={!connected}
              className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Selecciona una base de datos --</option>
              <option value="banco_global">banco_global</option>
              {availableDatabases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Modelo LLM</label>
            <select 
              value={selectedModel?.name || ""}
              onChange={(e) => {
                const model = [
                  { name: "Gemma 2b", port: config.llm.gemma2b },
                  { name: "Google Gemma 12b", port: config.llm.gemma12b },
                  { name: "Mistral", port: config.llm.mistral },
                  { name: "Granite", port: config.llm.granite },
                  { name: "Google gemma 4b", port: config.llm.gemma4b },
                  { name: "Deepseek 1.5b", port: config.llm.deepseek1_5b },
                  { name: "Deepseek 8b", port: config.llm.deepseek8b },
                  { name: "Deepseek 14b", port: config.llm.deepseek14b },
                ].find((m) => m.name === e.target.value);
                setSelectedModel(model);
              }}
              disabled={!connected || !selectedDatabaseName}
              className="w-full px-3 py-2 border border-ibm-gray-30 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Selecciona un modelo --</option>
              <option value="Gemma 2b">Gemma 2b</option>
              <option value="Google Gemma 12b">Google Gemma 12b</option>
              <option value="Mistral">Mistral</option>
              <option value="Granite">Granite</option>
              <option value="Google gemma 4b">Google gemma 4b</option>
              <option value="Deepseek 1.5b">Deepseek 1.5b</option>
              <option value="Deepseek 8b">Deepseek 8b</option>
              <option value="Deepseek 14b">Deepseek 14b</option>
            </select>
          </div>
        </div>

        {/* Botón de esquema */}
        {connected && selectedDatabaseName && (
          <div className="mb-4">
            <button
              onClick={handleToggleSchemaModal}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-colors"
            >
              {showSchemaModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showSchemaModal ? "Ocultar" : "Ver"} Esquema de la Base de Datos</span>
            </button>
          </div>
        )}

        {/* Preguntas sugeridas */}
        {connected && selectedDatabaseName && selectedModel && (
          <div>
            <h3 className="font-semibold mb-3">Preguntas Sugeridas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(q);
                    handleAskQuestion();
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
      {connected && selectedDatabaseName && selectedModel && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Haz tu Pregunta</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">
                Escribe tu pregunta en español sobre la base de datos
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
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  <span>{isLoading ? "Procesando..." : "Preguntar"}</span>
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
      {(!connected || !selectedDatabaseName || !selectedModel) && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ibm-gray-90 mb-2">Configuración Requerida</h3>
            <p className="text-ibm-gray-70 mb-4">
              Para comenzar a hacer preguntas, necesitas:
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className={`flex items-center space-x-2 ${connected ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Conectar a la base de datos banco_global</span>
              </div>
              <div className={`flex items-center space-x-2 ${selectedDatabaseName ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${selectedDatabaseName ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Seleccionar una base de datos</span>
              </div>
              <div className={`flex items-center space-x-2 ${selectedModel ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${selectedModel ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Elegir un modelo LLM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados de la consulta */}
      {results && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Resultados</h2>
          
          {/* Respuesta cruda del LLM */}
          {rawLLMResponse && (
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

          {/* Explicación */}
          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-800">Respuesta</h4>
              <p className="text-green-700 mt-1">{results.explanation}</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-3">
              <button
                onClick={() => downloadToExcel(results, "sql_query_results")}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Excel</span>
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {results.results.length} filas • Tiempo: {results.executionTime}ms
            </span>
          </div>

          {/* Tabla de resultados */}
          {results.results.length > 0 && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(results.results[0]).map((key) => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.results.slice(0, 10).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value !== null ? String(value) : "NULL"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.results.length > 10 && (
                <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                  Mostrando 10 de {results.results.length} resultados
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Schema Modal */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="bg-black bg-opacity-40 absolute inset-0" onClick={handleToggleSchemaModal} />
          <div className="bg-white rounded-lg shadow-lg z-50 max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Esquema de Base de Datos</h3>
              <button onClick={handleToggleSchemaModal} className="px-3 py-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded">
                Cerrar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-600 mb-2">clientes</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• id (Primary Key)</li>
                  <li>• nombre</li>
                  <li>• email</li>
                  <li>• telefono</li>
                  <li>• fecha_registro</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-600 mb-2">cuentas_bancarias</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• id (Primary Key)</li>
                  <li>• cliente_id (Foreign Key)</li>
                  <li>• numero_cuenta</li>
                  <li>• tipo_cuenta</li>
                  <li>• saldo</li>
                  <li>• fecha_creacion</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-600 mb-2">transacciones</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• id (Primary Key)</li>
                  <li>• cuenta_origen_id</li>
                  <li>• cuenta_destino_id</li>
                  <li>• monto</li>
                  <li>• tipo_transaccion</li>
                  <li>• fecha_transaccion</li>
                  <li>• descripcion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToSQLPage;
