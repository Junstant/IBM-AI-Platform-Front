import React, { useState } from 'react';
import { Brain, MessageSquare, FileText, BarChart3, Download, Maximize2, XCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import ModelSelector from '../components/ModelSelector';
import * as ExcelJS from 'exceljs';

const NLPAnalysisPage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingDatabase, setIsAnalyzingDatabase] = useState(false);
  const [results, setResults] = useState(null);
  const [databaseResults, setDatabaseResults] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedText, setSelectedText] = useState(null);
  const [showFullscreenTable, setShowFullscreenTable] = useState(false);
  const [selectedModel, setSelectedModel] = useState();

  // Estado para los datos del análisis de texto
  const [textData, setTextData] = useState({
    texto: "",
    idioma: "es",
    tipo_analisis: "sentiment",
  });

  // Descargar Excel con ExcelJS
  const handleDownloadExcel = async () => {
    if (!databaseResults?.results) {
      alert('No hay datos para descargar');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Análisis NLP');

    // Headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Texto', key: 'texto', width: 50 },
      { header: 'Idioma', key: 'idioma', width: 15 },
      { header: 'Sentimiento', key: 'sentimiento', width: 15 },
      { header: 'Confianza', key: 'confianza', width: 15 },
      { header: 'Entidades', key: 'entidades', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Fecha Análisis', key: 'fecha_analisis', width: 20 },
    ];

    // Agregar datos
    databaseResults.results.forEach(result => {
      worksheet.addRow({
        id: result.id,
        texto: result.texto,
        idioma: result.idioma,
        sentimiento: result.sentimiento,
        confianza: result.confianza_sentimiento,
        entidades: result.entidades ? result.entidades.join(', ') : '',
        categoria: result.categoria,
        fecha_analisis: result.fecha_analisis,
      });
    });

    // Generar archivo y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analisis_nlp.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const [apiPort] = useState(8000); // Puerto por defecto

  const handleAnalyzeText = async () => {
    if (!textData.texto.trim()) {
      alert("Por favor ingrese un texto para analizar");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(`http://${ServerIP}:${apiPort}/analyze_text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texto: textData.texto,
          idioma: textData.idioma,
          tipo_analisis: textData.tipo_analisis,
          modelo: selectedModel?.name || "default",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Datos recibidos del análisis NLP:", data);

      const transformedResult = {
        sentiment: data.sentimiento || "neutral",
        confidence: data.confianza_sentimiento || 0,
        entities: data.entidades || [],
        category: data.categoria || "general",
        language: data.idioma_detectado || textData.idioma,
        keywords: data.palabras_clave || [],
        emotions: data.emociones || {},
        originalText: textData.texto,
        processingTime: "< 1s",
        timestamp: new Date().toLocaleString(),
      };

      setResults(transformedResult);
    } catch (error) {
      console.error("Error analyzing text:", error);
      alert(`Error al conectar con la API: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ServerIP = import.meta.env.VITE_SERVER_IP || "localhost";

  const handleAnalyzeDatabase = async () => {
    setIsAnalyzingDatabase(true);

    try {
      console.log("Iniciando análisis masivo de textos...");
      const response = await fetch(`http://${ServerIP}:${apiPort}/analyze_all_texts`, {
        method: "GET",
      });

      console.log("Respuesta recibida:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Datos recibidos:", {
        total_textos: data.total_textos_analizados,
        total_resultados: data.resultados?.length,
      });

      setDatabaseResults({
        totalAnalyzed: data.total_textos_analizados,
        results: data.resultados || [],
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

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positivo':
      case 'positive':
        return "text-green-700 bg-green-50 border-green-200";
      case 'negativo':
      case 'negative':
        return "text-red-700 bg-red-50 border-red-200";
      case 'neutral':
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positivo':
      case 'positive':
        return <CheckCircle className="w-5 h-5" />;
      case 'negativo':
      case 'negative':
        return <XCircle className="w-5 h-5" />;
      case 'neutral':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getConfidenceInterpretation = (confidence) => {
    if (confidence >= 0.9) return "Muy alta confianza";
    if (confidence >= 0.7) return "Alta confianza";
    if (confidence >= 0.5) return "Confianza moderada";
    if (confidence >= 0.3) return "Baja confianza";
    return "Muy baja confianza";
  };

  const handleViewText = (textAnalysis) => {
    setSelectedText(textAnalysis);
    setShowModal(true);
  };

  return (
    <div className="space-y-05">
      {/* Header */}
      <div className="bg-ui-02 border border-ui-03 p-06 mb-05">
        <div className="flex items-center space-x-04 mb-04">
          <div className="w-10 h-10 bg-carbon-blue-60 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-productive-heading-04 text-text-primary">Procesamiento de Lenguaje Natural</h1>
            <p className="text-body-long text-text-secondary">Análisis de sentimientos, entidades y categorización de texto con IA</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-04 p-03 bg-ui-01 border border-ui-03">
          <div className="flex items-center space-x-02">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-label text-text-primary">API NLP Conectada</span>
          </div>
          <div className="flex items-center space-x-02">
            <FileText className="w-4 h-4 text-interactive" />
            <span className="text-label text-text-primary">Motor de análisis activo</span>
          </div>
        </div>
      </div>

      <div className="space-y-05">
        {/* Input Form */}
        <div className="bg-ui-02 border border-ui-03 p-06">
          <h2 className="text-productive-heading-03 text-text-primary mb-05">Análisis de Texto</h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Selector de modelo */}
            <div className="col-span-1">
              <ModelSelector 
                value={selectedModel?.id} 
                onChange={setSelectedModel} 
                showPort={true} 
                hideLabel={false} 
              />
            </div>

            {/* Área de texto */}
            <div>
              <label className="block text-label text-text-primary mb-02">Texto a analizar</label>
              <textarea
                value={textData.texto}
                onChange={(e) => setTextData({ ...textData, texto: e.target.value })}
                placeholder="Ingrese el texto que desea analizar..."
                className="w-full h-32 px-05 py-03 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive resize-none"
              />
            </div>

            {/* Configuraciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-label text-text-primary mb-02">Idioma</label>
                <select
                  value={textData.idioma}
                  onChange={(e) => setTextData({ ...textData, idioma: e.target.value })}
                  className="w-full h-12 px-05 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="auto">Detección automática</option>
                </select>
              </div>

              <div>
                <label className="block text-label text-text-primary mb-02">Tipo de análisis</label>
                <select
                  value={textData.tipo_analisis}
                  onChange={(e) => setTextData({ ...textData, tipo_analisis: e.target.value })}
                  className="w-full h-12 px-05 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive"
                >
                  <option value="sentiment">Análisis de sentimientos</option>
                  <option value="entities">Extracción de entidades</option>
                  <option value="category">Categorización</option>
                  <option value="complete">Análisis completo</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-between items-center mt-05">
              <button
                onClick={handleAnalyzeText}
                disabled={isAnalyzing || !textData.texto.trim()}
                className="px-06 py-03 bg-carbon-blue-60 text-white hover:bg-carbon-blue-70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-02"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Analizar Texto</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAnalyzeDatabase}
                disabled={isAnalyzingDatabase}
                className="px-06 py-03 bg-carbon-gray-80 text-white hover:bg-carbon-gray-70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-02"
              >
                {isAnalyzingDatabase ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analizando BD...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Analizar Base de Datos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Individual Analysis Results */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
            <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Resultado del Análisis Individual</h2>

            {!results && !isAnalyzing && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-ibm-gray-40 mx-auto mb-4" />
                <p className="text-ibm-gray-60">Ingrese un texto y analice para ver los resultados</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-ibm-gray-20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-ibm-gray-70">Ejecutando análisis NLP...</p>
                <p className="text-sm text-ibm-gray-60 mt-2">Procesando lenguaje natural</p>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                {/* Sentiment */}
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getSentimentColor(results.sentiment)}`}>
                    {getSentimentIcon(results.sentiment)}
                    <span className="font-semibold">Sentimiento: {results.sentiment}</span>
                  </div>
                  <p className="text-2xl font-bold text-ibm-gray-90 mt-2">
                    {(results.confidence * 100).toFixed(1)}% de confianza
                  </p>
                  <p className="text-sm text-ibm-gray-60 mt-1">{getConfidenceInterpretation(results.confidence)}</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-ibm-gray-10 p-4 rounded-lg">
                    <h4 className="font-medium text-ibm-gray-90 mb-2">Idioma detectado:</h4>
                    <p className="text-ibm-gray-70">{results.language}</p>
                  </div>

                  <div className="bg-ibm-gray-10 p-4 rounded-lg">
                    <h4 className="font-medium text-ibm-gray-90 mb-2">Categoría:</h4>
                    <p className="text-ibm-gray-70">{results.category}</p>
                  </div>

                  {results.entities && results.entities.length > 0 && (
                    <div className="bg-ibm-gray-10 p-4 rounded-lg">
                      <h4 className="font-medium text-ibm-gray-90 mb-2">Entidades identificadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.entities.map((entity, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.keywords && results.keywords.length > 0 && (
                    <div className="bg-ibm-gray-10 p-4 rounded-lg">
                      <h4 className="font-medium text-ibm-gray-90 mb-2">Palabras clave:</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-right">
                  <span className="text-xs text-ibm-gray-60">
                    Tiempo de procesamiento: {results.processingTime} | {results.timestamp}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Database Results */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
            <h2 className="text-xl font-bold text-ibm-gray-90 mb-4">Análisis Masivo de Textos</h2>

            {!databaseResults && !isAnalyzingDatabase && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-ibm-gray-40 mx-auto mb-4" />
                <p className="text-ibm-gray-60">Ejecute el análisis masivo para ver los resultados</p>
              </div>
            )}

            {isAnalyzingDatabase && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-ibm-gray-20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-ibm-gray-70">Analizando base de datos...</p>
                <p className="text-sm text-ibm-gray-60 mt-2">Procesando múltiples textos</p>
              </div>
            )}

            {databaseResults && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-blue-700">{databaseResults.totalAnalyzed}</h3>
                    <p className="text-sm text-blue-600">Textos analizados</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h3 className="text-2xl font-bold text-green-700">{databaseResults.totalResults}</h3>
                    <p className="text-sm text-green-600">Resultados obtenidos</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-ibm-gray-90">Análisis de Textos:</h4>
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
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Texto</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Sentimiento</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Confianza</th>
                          <th className="px-3 py-3 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20">Categoría</th>
                        </tr>
                      </thead>
                      <tbody>
                        {databaseResults.results.map((analysis, index) => (
                          <tr
                            key={index}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition-colors cursor-pointer`}
                            onClick={() => handleViewText(analysis)}
                          >
                            <td className="px-3 py-3 text-ibm-gray-90 border-b border-ibm-gray-10 font-mono text-xs">{analysis.id}</td>
                            <td className="px-3 py-3 text-ibm-gray-70 border-b border-ibm-gray-10 max-w-48 truncate" title={analysis.texto}>
                              {analysis.texto}
                            </td>
                            <td className="px-3 py-3 text-ibm-gray-90 border-b border-ibm-gray-10">
                              <span className={`px-2 py-1 rounded text-xs ${getSentimentColor(analysis.sentimiento)}`}>
                                {analysis.sentimiento}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-ibm-gray-90 border-b border-ibm-gray-10 font-semibold">
                              {(analysis.confianza_sentimiento * 100).toFixed(1)}%
                            </td>
                            <td className="px-3 py-3 text-ibm-gray-70 border-b border-ibm-gray-10 text-xs">{analysis.categoria}</td>
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

      {/* Modal para detalles del análisis */}
      {showModal && selectedText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative max-h-96 overflow-y-auto">
            <button className="absolute top-2 right-2 text-ibm-gray-60 hover:text-danger text-xl font-bold" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h3 className="text-lg font-semibold text-ibm-gray-90 mb-4">Detalle del Análisis NLP</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">ID:</span> {selectedText.id}
              </div>
              <div>
                <span className="font-medium">Texto:</span> 
                <p className="mt-1 p-3 bg-gray-50 rounded border text-sm">{selectedText.texto}</p>
              </div>
              <div>
                <span className="font-medium">Sentimiento:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${getSentimentColor(selectedText.sentimiento)}`}>
                  {selectedText.sentimiento}
                </span>
              </div>
              <div>
                <span className="font-medium">Confianza:</span> {(selectedText.confianza_sentimiento * 100).toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Idioma:</span> {selectedText.idioma}
              </div>
              <div>
                <span className="font-medium">Categoría:</span> {selectedText.categoria}
              </div>
              {selectedText.entidades && (
                <div>
                  <span className="font-medium">Entidades:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedText.entidades.map((entity, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium">Fecha de análisis:</span> {selectedText.fecha_analisis}
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
                <h2 className="text-xl font-bold text-ibm-gray-90">Análisis NLP - Vista Completa</h2>
                <p className="text-sm text-ibm-gray-70">{databaseResults.totalAnalyzed} textos analizados</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={handleDownloadExcel} className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
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
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Texto</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Sentimiento</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Confianza</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Idioma</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Categoría</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Entidades</th>
                      <th className="px-4 py-4 text-left font-medium text-ibm-gray-90 border-b border-ibm-gray-20 bg-ibm-gray-10">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {databaseResults.results.map((analysis, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition-colors`}>
                        <td className="px-4 py-4 text-ibm-gray-90 border-b border-ibm-gray-10 font-mono">{analysis.id}</td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10 max-w-md" title={analysis.texto}>
                          {analysis.texto}
                        </td>
                        <td className="px-4 py-4 text-ibm-gray-90 border-b border-ibm-gray-10">
                          <span className={`px-2 py-1 rounded text-xs ${getSentimentColor(analysis.sentimiento)}`}>
                            {analysis.sentimiento}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-ibm-gray-90 border-b border-ibm-gray-10 font-semibold">
                          {(analysis.confianza_sentimiento * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10">{analysis.idioma}</td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10">{analysis.categoria}</td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10">
                          {analysis.entidades && analysis.entidades.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {analysis.entidades.slice(0, 3).map((entity, idx) => (
                                <span key={idx} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                  {entity}
                                </span>
                              ))}
                              {analysis.entidades.length > 3 && (
                                <span className="text-xs text-gray-500">+{analysis.entidades.length - 3} más</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-ibm-gray-70 border-b border-ibm-gray-10">{analysis.fecha_analisis}</td>
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

export default NLPAnalysisPage;

