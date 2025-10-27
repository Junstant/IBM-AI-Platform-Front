import React, { useState } from "react";
import ExcelJS from "exceljs";
import { Shield, AlertTriangle, CheckCircle, XCircle, Database, Zap, BarChart3, Clock, Maximize2 } from "lucide-react";
import SimpleStatus from "../components/SimpleStatus";

const FraudDetectionPageContent = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingDatabase, setIsAnalyzingDatabase] = useState(false);
  const [results, setResults] = useState(null);
  const [databaseResults, setDatabaseResults] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFullscreenTable, setShowFullscreenTable] = useState(false);
  
  // Conectividad simple manejada por SimpleStatus
  // Descargar Excel con exceljs
  const handleDownloadExcel = async () => {
    if (!databaseResults?.results) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transacciones Fraudulentas");
    // Definir columnas
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Origen", key: "cuenta_origen_id", width: 20 },
      { header: "Destino", key: "cuenta_destino_id", width: 20 },
      { header: "Monto", key: "monto", width: 12 },
      { header: "Comerciante", key: "comerciante", width: 20 },
      { header: "Ubicación", key: "ubicacion", width: 20 },
      { header: "Tarjeta", key: "tipo_tarjeta", width: 15 },
      { header: "Fecha", key: "fecha_transaccion", width: 15 },
      { header: "Hora", key: "horario_transaccion", width: 10 },
      { header: "Probabilidad (%)", key: "probabilidad_fraude", width: 15 },
      { header: "Nivel Riesgo", key: "nivel_riesgo", width: 15 },
      { header: "Predicción", key: "prediccion", width: 15 },
    ];

    // Agregar filas
    databaseResults.results.forEach((t) => {
      worksheet.addRow({
        ...t,
        monto: t.monto?.toFixed(2),
        horario_transaccion: t.horario_transaccion?.slice(0, 8),
        probabilidad_fraude: t.probabilidad_fraude ? `${(t.probabilidad_fraude * 100).toFixed(1)}%` : "N/A",
        nivel_riesgo: t.nivel_riesgo || "NO DEFINIDO",
        prediccion: t.prediccion || (t.prediccion_fraude ? "FRAUDE" : "NORMAL"),
      });
    });

    // Generar archivo y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transacciones_fraudulentas.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  const [transactionData, setTransactionData] = useState({
    monto: "",
    comerciante: "",
    ubicacion: "",
    tipo_tarjeta: "Visa",
    horario_transaccion: "14:30:00.000000",
  });

  const handleAnalyzeTransaction = async () => {
    if (!transactionData.monto || !transactionData.comerciante || !transactionData.ubicacion) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`/predict_single_transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monto: parseFloat(transactionData.monto),
          comerciante: transactionData.comerciante,
          ubicacion: transactionData.ubicacion,
          tipo_tarjeta: transactionData.tipo_tarjeta,
          horario_transaccion: transactionData.horario_transaccion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Datos recibidos del análisis individual:", data);
      console.log("Probabilidad de fraude recibida:", data.probabilidad_fraude);
      console.log("Todos los campos disponibles:", Object.keys(data));

      // Transformar respuesta para el formato del UI
      // Intentar diferentes nombres de campo que podría usar el backend
      let probability = data.probabilidad_fraude || data.fraud_probability || data.probability || 0;

      const transformedResult = {
        fraudProbability: probability,
        riskLevel: probability >= 0.7 ? "HIGH" : probability >= 0.3 ? "MEDIUM" : "LOW",
        prediction: data.prediccion || data.prediction || "Sin predicción",
        originalData: data.transaccion_enviada || data,
        processingTime: "< 1s",
        timestamp: new Date().toLocaleString(),
      };

      setResults(transformedResult);
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      alert(`Error al conectar con la API: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ServerIP = import.meta.env.VITE_SERVER_IP || "localhost";

  const handleAnalyzeDatabase = async () => {
    setIsAnalyzingDatabase(true);

    try {
      console.log("Iniciando petición a la API...");
      const response = await fetch("/api/fraude/predict_all_from_db", {
        method: "GET",
      });

      console.log("Respuesta recibida:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log("Parseando JSON...");
      const data = await response.json();
      console.log("Datos recibidos completos:", data);
      console.log("Transacciones fraudulentas encontradas:", data.transacciones_fraudulentas_encontradas);
      console.log("Total resultados:", data.resultados?.length);
      console.log("Primeras 3 transacciones:", data.resultados?.slice(0, 3));

      // Mapear los datos según la nueva documentación
      const mappedResults =
        data.resultados?.map((transaction) => ({
          id: transaction.id,
          cuenta_origen_id: transaction.cuenta_origen || `cuenta_${transaction.id}_origen`,
          cuenta_destino_id: transaction.cuenta_destino || `cuenta_${transaction.id}_destino`,
          monto: transaction.monto,
          comerciante: transaction.comerciante,
          ubicacion: transaction.ubicacion,
          tipo_tarjeta: transaction.tipo_tarjeta,
          fecha_transaccion: transaction.fecha_transaccion,
          horario_transaccion: transaction.horario_transaccion,
          prediccion_fraude: transaction.es_fraude, // Mapear es_fraude a prediccion_fraude
          probabilidad_fraude: transaction.probabilidad_fraude,
          prediccion: transaction.prediccion,
          nivel_riesgo: transaction.nivel_riesgo,
        })) || [];

      console.log("Resultados mapeados:", mappedResults.slice(0, 3));

      setDatabaseResults({
        totalFraudulent: data.transacciones_fraudulentas_encontradas,
        results: mappedResults, // Usar todos los resultados ya que el endpoint solo devuelve fraudulentas
        totalResults: data.resultados?.length || 0,
        timestamp: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error("Error analyzing database:", error);
      alert(`Error al conectar con la API: ${error.message}`);
    } finally {
      setIsAnalyzingDatabase(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH":
        return "text-danger bg-red-50";
      case "MEDIUM":
        return "text-warning bg-yellow-50";
      case "LOW":
        return "text-success bg-green-50";
      default:
        return "text-ibm-gray-70 bg-ibm-gray-10";
    }
  };

  const getProbabilityInterpretation = (probability) => {
    if (probability === undefined || probability === null || isNaN(probability)) {
      return "No se pudo determinar el nivel de riesgo";
    }
    if (probability >= 0.9) return "Muy alta probabilidad de fraude";
    if (probability >= 0.7) return "Alta probabilidad de fraude";
    if (probability >= 0.5) return "Probabilidad moderada de fraude";
    if (probability >= 0.3) return "Baja probabilidad de fraude";
    return "Muy baja probabilidad de fraude";
  };

  return (
    <div className="p-6 bg-ibm-gray-10 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-ibm-orange via-ibm-red to-danger rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ibm-gray-90">Detección de fraude financiero</h1>
            <p className="text-ibm-gray-70">
              Análisis de transacciones con Machine Learning - aprende de los comportamientos de tu base de datos para detectar cosas fuera de lo usual, tanto patrones como anomalías.
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-4 p-3 bg-ibm-gray-10 rounded-lg">
          <SimpleStatus 
            url="http://localhost:8001/api/fraude/health"
            name="FastAPI"
          />
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-info" />
            <span className="text-sm text-ibm-gray-90">Base de datos SQL activa</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-5">
        {/* Input Form - Ahora ocupa todo el ancho */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Datos de Transacción</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">Monto de la transacción</label>
              <input
                type="number"
                step="0.01"
                value={transactionData.monto}
                onChange={(e) => setTransactionData({ ...transactionData, monto: e.target.value })}
                placeholder="Ej: 1250.00"
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">Comerciante</label>
              <input
                type="text"
                value={transactionData.comerciante}
                onChange={(e) => setTransactionData({ ...transactionData, comerciante: e.target.value })}
                placeholder="Ej: Amazon, Walmart, etc."
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">Ubicación</label>
              <input
                type="text"
                value={transactionData.ubicacion}
                onChange={(e) => setTransactionData({ ...transactionData, ubicacion: e.target.value })}
                placeholder="Ej: Nueva York, USA"
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">Tipo de tarjeta</label>
              <select
                value={transactionData.tipo_tarjeta}
                onChange={(e) => setTransactionData({ ...transactionData, tipo_tarjeta: e.target.value })}
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="American Express">American Express</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">Horario de transacción</label>
              <input
                type="time"
                value={transactionData.horario_transaccion?.slice(0, 5)} // Solo mostrar HH:MM en el input
                onChange={(e) => setTransactionData({ ...transactionData, horario_transaccion: e.target.value + ":00.000000" })}
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleAnalyzeTransaction}
              disabled={isAnalyzing || !transactionData.monto}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-ibm-orange via-ibm-red to-danger text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analizar Transacción</span>
                </>
              )}
            </button>

            <button
              onClick={handleAnalyzeDatabase}
              disabled={isAnalyzing || isAnalyzingDatabase}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-ibm-orange via-ibm-red to-danger text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnalyzingDatabase ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analizando base de datos...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  <span>Analizar toda la base de datos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section - Ahora abajo de los inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Single Transaction Results */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
            <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Resultado del Análisis Individual</h2>

            {!results && !isAnalyzing && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-ibm-gray-40 mx-auto mb-4" />
                <p className="text-ibm-gray-60">Complete los datos y analice para ver los resultados</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-ibm-gray-20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-ibm-gray-70">Ejecutando modelo de ML...</p>
                <p className="text-sm text-ibm-gray-60 mt-2">Consultando base de datos SQL</p>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                {/* Risk Level */}
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getRiskColor(results.riskLevel)}`}>
                    {results.riskLevel === "HIGH" ? <XCircle className="w-5 h-5" /> : results.riskLevel === "MEDIUM" ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="font-semibold">
                      Resultado:{" "}
                      {results.fraudProbability !== undefined && !isNaN(results.fraudProbability) && results.fraudProbability >= 0.5
                        ? "Fraude detectado"
                        : results.prediction === "Sin predicción"
                        ? "Transacción normal"
                        : results.prediction}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-ibm-gray-90 mt-2">
                    {results.fraudProbability !== undefined && !isNaN(results.fraudProbability)
                      ? `${(results.fraudProbability * 100).toFixed(1)}% probabilidad de fraude`
                      : "Probabilidad no disponible"}
                  </p>
                  <p className="text-sm text-ibm-gray-60 mt-1">
                    {results.fraudProbability !== undefined && !isNaN(results.fraudProbability) ? getProbabilityInterpretation(results.fraudProbability) : "No se pudo determinar el nivel de riesgo"}
                  </p>
                </div>

                {/* Transaction Details */}
                <div>
                  <h3 className="text-lg font-semibold text-ibm-gray-90 mb-3">Detalles de la Transacción</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-ibm-gray-10 rounded-lg">
                      <span className="text-sm text-ibm-gray-70">Monto</span>
                      <span className="text-sm font-semibold text-ibm-gray-90">${results.originalData?.monto}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-ibm-gray-10 rounded-lg">
                      <span className="text-sm text-ibm-gray-70">Comerciante</span>
                      <span className="text-sm font-semibold text-ibm-gray-90">{results.originalData?.comerciante}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-ibm-gray-10 rounded-lg">
                      <span className="text-sm text-ibm-gray-70">Ubicación</span>
                      <span className="text-sm font-semibold text-ibm-gray-90">{results.originalData?.ubicacion}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-ibm-gray-10 rounded-lg">
                      <span className="text-sm text-ibm-gray-70">Tipo de Tarjeta</span>
                      <span className="text-sm font-semibold text-ibm-gray-90">{results.originalData?.tipo_tarjeta}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-ibm-gray-10 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm text-ibm-gray-70">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Tiempo de procesamiento: {results.processingTime}</span>
                    </div>
                    <span>{results.timestamp}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Database Results */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
            <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Análisis de Base de Datos</h2>

            {!databaseResults && !isAnalyzingDatabase && (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-ibm-gray-40 mx-auto mb-4" />
                <p className="text-ibm-gray-60">Analice la base de datos para ver las transacciones fraudulentas</p>
              </div>
            )}

            {isAnalyzingDatabase && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-ibm-gray-20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-ibm-gray-70">Analizando base de datos...</p>
                <p className="text-sm text-ibm-gray-60 mt-2">Procesando transacciones con ML</p>
              </div>
            )}

            {databaseResults && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                    <span className="font-semibold text-danger">{databaseResults.totalFraudulent} transacciones fraudulentas detectadas</span>
                  </div>
                </div>

                {/* Sample Results Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-ibm-gray-90">Transacciones Fraudulentas:</h4>
                    <div className="flex space-x-2">
                      <button onClick={handleDownloadExcel} className="px-3 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors text-sm">
                        Descargar Excel
                      </button>
                      <button
                        onClick={() => setShowFullscreenTable(true)}
                        className="flex items-center space-x-2 px-3 py-2 bg-ibm-gray-20 text-ibm-gray-90 rounded-lg hover:bg-ibm-gray-30 transition-colors"
                      >
                        <Maximize2 className="w-4 h-4" />
                        <span className="text-sm">Ver en pantalla completa</span>
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto border border-ibm-gray-20 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-ibm-gray-10 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">ID</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Origen</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Destino</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Monto</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Comerciante</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Ubicación</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Tarjeta</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Fecha</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Hora</th>
                          <th className="px-3 py-3 text-center font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Probabilidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {databaseResults.results.map((transaction, index) => (
                          <tr
                            key={index}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-red-50"} hover:bg-red-100 transition-colors cursor-pointer`}
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowModal(true);
                            }}
                          >
                            <td className="px-3 py-3 text-ibm-gray-90 border-b border-ibm-gray-10 font-mono text-xs">{transaction.id}</td>
                            <td className="px-3 py-3 text-ibm-gray-70 border-b border-ibm-gray-10 font-mono text-xs">{transaction.cuenta_origen_id}</td>
                            <td className="px-3 py-3 text-ibm-gray-70 border-b border-ibm-gray-10 font-mono text-xs">{transaction.cuenta_destino_id}</td>
                            <td className="px-3 py-3 text-ibm-gray-90 border-b border-ibm-gray-10 font-semibold">${transaction.monto?.toFixed(2)}</td>
                            <td className="px-3 py-3 text-ibm-gray-90 border-b border-ibm-gray-10 max-w-32 truncate" title={transaction.comerciante}>
                              {transaction.comerciante}
                            </td>
                            <td className="px-3 py-3 text-ibm-gray-70 border-b border-ibm-gray-10 max-w-32 truncate" title={transaction.ubicacion}>
                              {transaction.ubicacion}
                            </td>
                            <td className="px-3 py-3 text-ibm-gray-70 border-b border-ibm-gray-10 text-xs">{transaction.tipo_tarjeta}</td>
                            <td className="px-3 py-3 text-ibm-gray-70 border-b border-ibm-gray-10 text-xs">{transaction.fecha_transaccion}</td>
                            <td className="px-3 py-3 text-ibm-gray-70 border-b border-ibm-gray-10 text-xs font-mono">{transaction.horario_transaccion?.slice(0, 8)}</td>
                            <td className="px-3 py-3 border-b border-ibm-gray-10">
                              <div className="flex items-center justify-center gap-2">
                                {(() => {
                                  const probability = transaction.probabilidad_fraude || 0;
                                  const riskLevel = probability >= 0.7 ? "HIGH" : probability >= 0.3 ? "MEDIUM" : "LOW";
                                  const iconColor = riskLevel === "HIGH" ? "text-red-500" : riskLevel === "MEDIUM" ? "text-yellow-500" : "text-green-500";
                                  const Icon = riskLevel === "HIGH" ? XCircle : riskLevel === "MEDIUM" ? AlertTriangle : CheckCircle;

                                  return (
                                    <>
                                      <Icon className={`w-4 h-4 ${iconColor}`} />
                                      <span className={`font-medium text-xs ${iconColor}`}>{(probability * 100).toFixed(1)}%</span>
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Timestamp */}
                  <div className="mt-4 text-right">
                    <span className="text-xs text-ibm-gray-60">Análisis realizado: {databaseResults.timestamp}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para detalles de transacción */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-ibm-gray-60 hover:text-danger text-xl font-bold" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h3 className="text-lg font-semibold text-ibm-gray-90 mb-4">Detalle de Transacción</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">ID:</span> {selectedTransaction.id}
              </div>
              <div>
                <span className="font-medium">Origen:</span> {selectedTransaction.cuenta_origen_id}
              </div>
              <div>
                <span className="font-medium">Destino:</span> {selectedTransaction.cuenta_destino_id}
              </div>
              <div>
                <span className="font-medium">Monto:</span> ${selectedTransaction.monto?.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Comerciante:</span> {selectedTransaction.comerciante}
              </div>
              <div>
                <span className="font-medium">Ubicación:</span> {selectedTransaction.ubicacion}
              </div>
              <div>
                <span className="font-medium">Tarjeta:</span> {selectedTransaction.tipo_tarjeta}
              </div>
              <div>
                <span className="font-medium">Fecha:</span> {selectedTransaction.fecha_transaccion}
              </div>
              <div>
                <span className="font-medium">Hora:</span> {selectedTransaction.horario_transaccion}
              </div>
              <div className="border-t pt-3 mt-3">
                <span className="font-medium">Probabilidad de Fraude:</span>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const probability = selectedTransaction.probabilidad_fraude || 0;
                    const riskLevel = probability >= 0.7 ? "HIGH" : probability >= 0.3 ? "MEDIUM" : "LOW";
                    const iconColor = riskLevel === "HIGH" ? "text-red-500" : riskLevel === "MEDIUM" ? "text-yellow-500" : "text-green-500";
                    const Icon = riskLevel === "HIGH" ? XCircle : riskLevel === "MEDIUM" ? AlertTriangle : CheckCircle;

                    return (
                      <>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                        <span className={`font-semibold text-lg ${iconColor}`}>{(probability * 100).toFixed(1)}%</span>
                        <span className="text-gray-600 text-sm">({riskLevel === "HIGH" ? "Alto riesgo" : riskLevel === "MEDIUM" ? "Riesgo medio" : "Bajo riesgo"})</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pantalla completa para la tabla */}
      {showFullscreenTable && databaseResults && (
        <div className="fixed inset-0 z-50 bg-white mt-0">
          <div className="h-screen flex flex-col">
            {/* Header del modal */}
            <div className="bg-white border-b border-ibm-gray-20 p-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-ibm-gray-90">Transacciones Fraudulentas - Vista Completa</h2>
                <p className="text-sm text-ibm-gray-70">{databaseResults.totalFraudulent} transacciones fraudulentas detectadas</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={handleDownloadExcel} className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Descargar Excel</span>
                </button>
                <button onClick={() => setShowFullscreenTable(false)} className="px-4 py-2 bg-ibm-gray-20 text-ibm-gray-90 rounded-lg hover:bg-ibm-gray-30 transition-colors">
                  Cerrar
                </button>
              </div>
            </div>

            {/* Contenido de la tabla */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto pb-20">
                <table className="w-full text-sm">
                  <thead className="bg-ibm-gray-10 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">ID</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Cuenta Origen</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Cuenta Destino</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Monto</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Comerciante</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Ubicación</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Tipo de Tarjeta</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Fecha</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Hora</th>
                      <th className="px-4 py-4 text-center font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Probabilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {databaseResults.results.map((transaction, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-red-50"} hover:bg-red-100 transition-colors`}>
                        <td className="px-4 py-4 text-ibm-gray-90 border-b border-ibm-gray-10 font-mono">{transaction.id}</td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10 font-mono">{transaction.cuenta_origen_id}</td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10 font-mono">{transaction.cuenta_destino_id}</td>
                        <td className="px-4 py-4 text-ibm-gray-90 border-b border-ibm-gray-10 font-semibold">${transaction.monto?.toFixed(2)}</td>
                        <td className="px-4 py-4 text-ibm-gray-90 border-b border-ibm-gray-10" title={transaction.comerciante}>
                          {transaction.comerciante}
                        </td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10" title={transaction.ubicacion}>
                          {transaction.ubicacion}
                        </td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10">{transaction.tipo_tarjeta}</td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10">{transaction.fecha_transaccion}</td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10 font-mono">{transaction.horario_transaccion?.slice(0, 8)}</td>
                        <td className="px-4 py-4 border-b border-ibm-gray-10">
                          <div className="flex items-center justify-center gap-2">
                            {(() => {
                              const probability = transaction.probabilidad_fraude || 0;
                              const riskLevel = probability >= 0.7 ? "HIGH" : probability >= 0.3 ? "MEDIUM" : "LOW";
                              const iconColor = riskLevel === "HIGH" ? "text-red-500" : riskLevel === "MEDIUM" ? "text-yellow-500" : "text-green-500";
                              const Icon = riskLevel === "HIGH" ? XCircle : riskLevel === "MEDIUM" ? AlertTriangle : CheckCircle;

                              return (
                                <>
                                  <Icon className={`w-4 h-4 ${iconColor}`} />
                                  <span className={`font-medium ${iconColor}`}>{(probability * 100).toFixed(1)}%</span>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal simplificado - sin preloader complejo
const FraudDetectionPage = () => {
  return <FraudDetectionPageContent />;
};

export default FraudDetectionPage;
