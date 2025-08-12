import React, { useState } from 'react';
import { Upload, FileText, Eye, Download, AlertCircle } from 'lucide-react';

const DocumentAnalysisPage = () => {
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: new Date(),
      status: 'processing',
      analysis: null
    }));

    setDocuments(prev => [...newDocuments, ...prev]);

    // Simular procesamiento
    newDocuments.forEach(doc => {
      setTimeout(() => {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id 
            ? {
                ...d,
                status: 'completed',
                analysis: {
                  extractedText: `Análisis completado para ${doc.name}`,
                  entities: ['Persona', 'Organización', 'Fecha', 'Ubicación'],
                  sentiment: 'Positivo',
                  confidence: 0.94,
                  wordCount: 1250,
                  language: 'Español'
                }
              }
            : d
        ));
      }, 3000 + Math.random() * 2000);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6 bg-ibm-gray-10 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-ibm-teal to-ibm-cyan rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ibm-gray-90">Análisis de Documentos</h1>
            <p className="text-ibm-gray-70">Extrae información y analiza contenido con IA</p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-ibm-blue-10' 
              : 'border-ibm-gray-30 hover:border-ibm-gray-40'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-ibm-gray-60 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ibm-gray-90 mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </h3>
          <p className="text-ibm-gray-70 mb-4">
            Soporta PDF, DOCX, TXT, y más formatos
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.doc,.rtf"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-ibm-teal to-ibm-cyan text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Seleccionar Archivos</span>
          </label>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-6">Documentos Procesados</h2>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-ibm-gray-20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-ibm-gray-60" />
                    <div>
                      <h3 className="font-medium text-ibm-gray-90">{doc.name}</h3>
                      <p className="text-sm text-ibm-gray-70">
                        {formatFileSize(doc.size)} • {doc.uploadTime.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.status === 'processing' && (
                      <div className="flex items-center space-x-2 text-warning">
                        <div className="w-4 h-4 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Procesando...</span>
                      </div>
                    )}
                    {doc.status === 'completed' && (
                      <span className="text-sm text-success font-medium">✓ Completado</span>
                    )}
                  </div>
                </div>

                {doc.analysis && (
                  <div className="bg-ibm-gray-10 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-ibm-gray-90 mb-1">Idioma</h4>
                        <p className="text-sm text-ibm-gray-70">{doc.analysis.language}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-ibm-gray-90 mb-1">Palabras</h4>
                        <p className="text-sm text-ibm-gray-70">{doc.analysis.wordCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-ibm-gray-90 mb-1">Confianza</h4>
                        <p className="text-sm text-ibm-gray-70">{(doc.analysis.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-ibm-gray-90 mb-2">Entidades Encontradas</h4>
                      <div className="flex flex-wrap gap-2">
                        {doc.analysis.entities.map((entity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary text-white text-xs rounded-md"
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-ibm-gray-20 hover:bg-ibm-gray-30 rounded-lg transition-colors text-sm">
                        <Eye className="w-4 h-4" />
                        <span>Ver Análisis</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-ibm-blue-70 text-white rounded-lg transition-colors text-sm">
                        <Download className="w-4 h-4" />
                        <span>Descargar Reporte</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="bg-white rounded-lg p-12 shadow-sm border border-ibm-gray-20 text-center">
          <div className="w-16 h-16 bg-ibm-gray-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-ibm-gray-60" />
          </div>
          <h3 className="text-lg font-semibold text-ibm-gray-90 mb-2">
            No hay documentos para analizar
          </h3>
          <p className="text-ibm-gray-70 mb-4">
            Sube tus documentos para comenzar el análisis con IA
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysisPage;
