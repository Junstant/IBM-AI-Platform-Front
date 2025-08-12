import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Database, Zap, BarChart3, Clock } from 'lucide-react';

const FraudDetectionPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    merchant: '',
    location: '',
    cardType: 'credit',
    timeOfDay: 'morning'
  });

  const handleAnalyzeTransaction = async () => {
    setIsAnalyzing(true);
    
    try {
      // Aquí conectarás con tu API de FastAPI
      // const response = await fetch('http://localhost:8000/predict-fraud', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(transactionData)
      // });
      // const data = await response.json();
      
      // Simulación temporal - reemplaza con tu llamada real
      setTimeout(() => {
        const mockResult = {
          fraudProbability: Math.random() > 0.7 ? 0.85 : 0.15,
          riskLevel: Math.random() > 0.7 ? 'HIGH' : 'LOW',
          factors: [
            { factor: 'Ubicación inusual', weight: 0.3, suspicious: Math.random() > 0.5 },
            { factor: 'Horario de transacción', weight: 0.2, suspicious: Math.random() > 0.5 },
            { factor: 'Monto de transacción', weight: 0.4, suspicious: Math.random() > 0.5 },
            { factor: 'Historial del comerciante', weight: 0.1, suspicious: Math.random() > 0.5 }
          ],
          processingTime: '127ms',
          timestamp: new Date().toLocaleString()
        };
        setResults(mockResult);
        setIsAnalyzing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error analyzing transaction:', error);
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-danger bg-red-50';
      case 'MEDIUM': return 'text-warning bg-yellow-50';
      case 'LOW': return 'text-success bg-green-50';
      default: return 'text-ibm-gray-70 bg-ibm-gray-10';
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
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">
                Monto de la transacción
              </label>
              <input
                type="number"
                value={transactionData.amount}
                onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                placeholder="Ej: 1250.00"
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">
                Comerciante
              </label>
              <input
                type="text"
                value={transactionData.merchant}
                onChange={(e) => setTransactionData({...transactionData, merchant: e.target.value})}
                placeholder="Ej: Amazon, Walmart, etc."
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                value={transactionData.location}
                onChange={(e) => setTransactionData({...transactionData, location: e.target.value})}
                placeholder="Ej: Nueva York, USA"
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">
                Tipo de tarjeta
              </label>
              <select
                value={transactionData.cardType}
                onChange={(e) => setTransactionData({...transactionData, cardType: e.target.value})}
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="credit">Crédito</option>
                <option value="debit">Débito</option>
                <option value="prepaid">Prepago</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ibm-gray-90 mb-2">
                Horario de transacción
              </label>
              <select
                value={transactionData.timeOfDay}
                onChange={(e) => setTransactionData({...transactionData, timeOfDay: e.target.value})}
                className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="morning">Mañana (6:00-12:00)</option>
                <option value="afternoon">Tarde (12:00-18:00)</option>
                <option value="evening">Noche (18:00-24:00)</option>
                <option value="late_night">Madrugada (00:00-6:00)</option>
              </select>
            </div>

            <button
              onClick={handleAnalyzeTransaction}
              disabled={isAnalyzing || !transactionData.amount}
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
              onClick={() => alert('Funcionalidad de análisis masivo próximamente')}
              disabled={isAnalyzing}
              className="w-full px-6 py-3 bg-gradient-to-r from-ibm-orange via-ibm-red to-danger text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analizar toda la base de datos</span>
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
                  {results.riskLevel === 'HIGH' ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <span className="font-semibold">Riesgo: {results.riskLevel}</span>
                </div>
                <p className="text-2xl font-bold text-ibm-gray-90 mt-2">
                  {(results.fraudProbability * 100).toFixed(1)}% probabilidad de fraude
                </p>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="text-lg font-semibold text-ibm-gray-90 mb-3">Factores de Riesgo</h3>
                <div className="space-y-2">
                  {results.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-ibm-gray-10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${factor.suspicious ? 'bg-warning' : 'bg-success'}`}></div>
                        <span className="text-sm text-ibm-gray-90">{factor.factor}</span>
                      </div>
                      <div className="text-xs text-ibm-gray-60">
                        Peso: {(factor.weight * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
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
      </div>
    </div>
  );
};

export default FraudDetectionPage;
