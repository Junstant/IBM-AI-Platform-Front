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
    <div className="space-y-05">
      {/* Header */}
      <div className="bg-ui-02 border border-ui-03 p-06">
        <div className="flex items-center space-x-04 mb-04">
          <div className="w-10 h-10 bg-carbon-gray-70 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-productive-heading-04 text-text-primary">Análisis de Documentos</h1>
            <p className="text-body-long text-text-secondary">Extrae información y analiza contenido con IA</p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed p-07 text-center transition-colors ${
            dragActive 
              ? 'border-interactive bg-carbon-blue-10' 
              : 'border-ui-04 hover:border-ui-05'
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
            className="inline-flex items-center space-x-02 px-05 py-03 bg-carbon-gray-70 text-white hover:bg-carbon-gray-60 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Seleccionar Archivos</span>
          </label>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="bg-ui-02 border border-ui-03 p-06">
          <h2 className="text-productive-heading-03 text-text-primary mb-05">Documentos Procesados</h2>
          <div className="space-y-04">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-ui-03 p-04">
                <div className="flex items-center justify-between mb-03">
                  <div className="flex items-center space-x-03">
                    <FileText className="w-5 h-5 text-text-secondary" />
                    <div>
                      <h3 className="text-label font-medium text-text-primary">{doc.name}</h3>
                      <p className="text-caption text-text-secondary">
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
                  <div className="bg-ui-01 border border-ui-03 p-04 space-y-03">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-label font-medium text-text-primary mb-01">Idioma</h4>
                        <p className="text-label text-text-secondary">{doc.analysis.language}</p>
                      </div>
                      <div>
                        <h4 className="text-label font-medium text-text-primary mb-01">Palabras</h4>
                        <p className="text-label text-text-secondary">{doc.analysis.wordCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="text-label font-medium text-text-primary mb-01">Confianza</h4>
                        <p className="text-label text-text-secondary">{(doc.analysis.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-label font-medium text-text-primary mb-02">Entidades Encontradas</h4>
                      <div className="flex flex-wrap gap-2">
                        {doc.analysis.entities.map((entity, index) => (
                          <span
                            key={index}
                            className="px-02 py-01 bg-interactive text-white text-caption"
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-03">
                      <button className="flex items-center space-x-02 px-05 py-02 bg-ui-01 hover:bg-ui-03 border border-ui-04 transition-colors text-label">
                        <Eye className="w-4 h-4" />
                        <span>Ver Análisis</span>
                      </button>
                      <button className="flex items-center space-x-02 px-05 py-02 bg-interactive hover:bg-[#0050e6] text-white transition-colors text-label">
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
        <div className="bg-ui-02 border border-ui-03 p-12 text-center">
          <div className="w-16 h-16 bg-ui-01 border border-ui-03 flex items-center justify-center mx-auto mb-04">
            <FileText className="w-8 h-8 text-text-placeholder" />
          </div>
          <h3 className="text-productive-heading-03 text-text-primary mb-02">
            No hay documentos para analizar
          </h3>
          <p className="text-body-long text-text-secondary mb-04">
            Sube tus documentos para comenzar el análisis con IA
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysisPage;

