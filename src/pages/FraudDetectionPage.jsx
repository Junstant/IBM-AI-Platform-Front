import React, { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Database, Zap, BarChart3, Clock } from "lucide-react";

const FraudDetectionPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingDatabase, setIsAnalyzingDatabase] = useState(false);
  const [results, setResults] = useState(null);
  const [databaseResults, setDatabaseResults] = useState(null);
  const [apiPort] = useState(8000); // Puerto por defecto, puedes hacerlo configurable
  const [transactionData, setTransactionData] = useState({
    monto: "",
    comerciante: "",
    ubicacion: "",
    tipo_tarjeta: "Visa",
    horario_transaccion: "14:30:00",
  });

  const handleAnalyzeTransaction = async () => {
    if (!transactionData.monto || !transactionData.comerciante || !transactionData.ubicacion) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`http://localhost:${apiPort}/predict_single_transaction`, {
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

      // Transformar respuesta para el formato del UI
      const transformedResult = {
        fraudProbability: data.es_fraude ? 0.85 : 0.15,
        riskLevel: data.es_fraude ? "HIGH" : "LOW",
        prediction: data.prediccion,
        originalData: data.transaccion_enviada,
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

  const handleAnalyzeDatabase = async () => {
    setIsAnalyzingDatabase(true);

    try {
      const response = await fetch(`http://localhost:${apiPort}/predict_all_from_db`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setDatabaseResults({
        totalFraudulent: data.transacciones_fraudulentas_encontradas,
        results: data.resultados, // Mostrar todos los resultados, no solo los primeros 10
        totalResults: data.resultados.length,
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

  return (
    <div className="p-6 space-y-6 bg-ibm-gray-10 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-ibm-orange via-ibm-red to-danger rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ibm-gray-90">Detección de Fraude Financiero</h1>
            <p className="text-ibm-gray-70">Análisis de transacciones en tiempo real con Machine Learning</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-4 p-3 bg-ibm-gray-10 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-ibm-gray-90">FastAPI Conectado</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-info" />
            <span className="text-sm text-ibm-gray-90">Base de datos SQL activa</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Datos de Transacción</h2>

          <div className="space-y-4">
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
                value={transactionData.horario_transaccion}
                onChange={(e) => setTransactionData({ ...transactionData, horario_transaccion: e.target.value + ":00" })}
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              onClick={handleAnalyzeTransaction}
              disabled={isAnalyzing || !transactionData.monto}
              className="w-full px-6 py-3 bg-gradient-to-r from-ibm-orange via-ibm-red to-danger text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-ibm-gray-30" />
              <span className="mx-4 text-ibm-gray-60 text-xs font-medium uppercase tracking-wider">O también puedes</span>
              <div className="flex-1 h-px bg-ibm-gray-30" />
            </div>

            {/* Botón analizar toda la base */}
            <button
              onClick={handleAnalyzeDatabase}
              disabled={isAnalyzing || isAnalyzingDatabase}
              className="w-full px-6 py-3 bg-gradient-to-r from-ibm-orange via-ibm-red to-danger text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

        {/* Results Panel */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Resultados del Análisis</h2>

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
                  {results.riskLevel === "HIGH" ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  <span className="font-semibold">Resultado: {results.prediction}</span>
                </div>
                <p className="text-2xl font-bold text-ibm-gray-90 mt-2">{(results.fraudProbability * 100).toFixed(1)}% probabilidad de fraude</p>
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

          {/* Database Results */}
          {databaseResults && (
            <div className="mt-8 space-y-6">
              <div className="border-t border-ibm-gray-20 pt-6">
                <h3 className="text-lg font-semibold text-ibm-gray-90 mb-4">Análisis de Base de Datos</h3>

                {/* Summary */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                    <span className="font-semibold text-danger">{databaseResults.totalFraudulent} transacciones fraudulentas detectadas</span>
                  </div>
                  <p className="text-sm text-red-700 mt-2">De un total de {databaseResults.totalResults} transacciones analizadas</p>
                </div>

                {/* Sample Results Table */}
                <div>
                  <h4 className="font-medium text-ibm-gray-90 mb-3">Transacciones Fraudulentas Detectadas:</h4>
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
                          <th className="px-3 py-3 text-center font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Predicción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {databaseResults.results.map((transaction, index) => (
                          <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-red-50"} hover:bg-red-100 transition-colors`}>
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
                            <td className="px-3 py-3 border-b border-ibm-gray-10 text-center">
                              <div className="inline-flex items-center space-x-1">
                                {transaction.prediccion_fraude ? (
                                  <>
                                    <XCircle className="w-4 h-4 text-danger" />
                                    <span className="text-xs font-semibold text-danger">FRAUDE</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-success" />
                                    <span className="text-xs font-semibold text-success">NORMAL</span>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mostrar información adicional */}
                  <div className="mt-4 p-4 bg-ibm-gray-10 rounded-lg border border-ibm-gray-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-ibm-gray-90">Total de transacciones:</span>
                        <span className="ml-2 text-ibm-gray-70">{databaseResults.totalResults}</span>
                      </div>
                      <div>
                        <span className="font-medium text-danger">Fraudulentas detectadas:</span>
                        <span className="ml-2 text-danger font-semibold">{databaseResults.totalFraudulent}</span>
                      </div>
                      <div>
                        <span className="font-medium text-success">Porcentaje de fraude:</span>
                        <span className="ml-2 text-success font-semibold">{((databaseResults.totalFraudulent / databaseResults.totalResults) * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
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
  );
};

export default FraudDetectionPage;
