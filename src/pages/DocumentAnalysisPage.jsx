import React, { useState, useEffect } from 'react';
import { Upload, FileText, Send, Database, Zap, CheckCircle, AlertCircle, Loader, Trash2, Search } from 'lucide-react';
import SimpleStatus from '../components/SimpleStatus';

const DocumentAnalysisPage = () => {
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [stats, setStats] = useState(null);

  // Cargar documentos y estadísticas al iniciar
  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/rag/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/rag/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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
    uploadFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    for (const file of files) {
      // Validar tamaño (50MB máximo)
      if (file.size > 50 * 1024 * 1024) {
        alert(`El archivo ${file.name} excede el tamaño máximo de 50MB`);
        continue;
      }

      // Validar extensión
      const validExtensions = ['.pdf', '.docx', '.txt', '.csv', '.xlsx', '.md'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(fileExt)) {
        alert(`Formato no soportado: ${fileExt}. Formatos válidos: ${validExtensions.join(', ')}`);
        continue;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/rag/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Recargar lista de documentos y stats
        await fetchDocuments();
        await fetchStats();
        
        alert(`✓ ${file.name} procesado correctamente\n${data.chunks_created} chunks creados`);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error al subir ${file.name}: ${error.message}`);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) {
      alert('Por favor ingresa una pregunta');
      return;
    }

    setIsQuerying(true);
    setQueryResult(null);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setQueryResult(data);
    } catch (error) {
      console.error('Error querying:', error);
      alert(`Error al consultar: ${error.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('¿Estás seguro de eliminar este documento y todos sus chunks?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rag/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      await fetchDocuments();
      await fetchStats();
      alert('Documento eliminado correctamente');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(`Error al eliminar: ${error.message}`);
    }
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
        <div className="flex items-center justify-between mb-04">
          <div className="flex items-center space-x-04">
            <div className="w-10 h-10 bg-carbon-gray-70 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-productive-heading-04 text-text-primary">Análisis de Documentos RAG</h1>
              <p className="text-body-long text-text-secondary">Retrieval-Augmented Generation con pgvector y Gemma-2B</p>
            </div>
          </div>
          <SimpleStatus url="/api/rag/health" name="RAG Service" />
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-04 mb-04">
            <div className="bg-ui-01 border border-ui-03 p-04">
              <div className="flex items-center space-x-02 mb-02">
                <FileText className="w-4 h-4 text-interactive" />
                <p className="text-caption text-text-secondary">Documentos</p>
              </div>
              <p className="text-productive-heading-03 text-text-primary">{stats.total_documents}</p>
            </div>
            <div className="bg-ui-01 border border-ui-03 p-04">
              <div className="flex items-center space-x-02 mb-02">
                <Database className="w-4 h-4 text-success" />
                <p className="text-caption text-text-secondary">Chunks Vectoriales</p>
              </div>
              <p className="text-productive-heading-03 text-text-primary">{stats.total_chunks}</p>
            </div>
            <div className="bg-ui-01 border border-ui-03 p-04">
              <div className="flex items-center space-x-02 mb-02">
                <Zap className="w-4 h-4 text-warning" />
                <p className="text-caption text-text-secondary">Dimensiones</p>
              </div>
              <p className="text-productive-heading-03 text-text-primary">384</p>
            </div>
            <div className="bg-ui-01 border border-ui-03 p-04">
              <div className="flex items-center space-x-02 mb-02">
                <CheckCircle className="w-4 h-4 text-success" />
                <p className="text-caption text-text-secondary">Modelo</p>
              </div>
              <p className="text-label text-text-primary">MiniLM-L12-v2</p>
            </div>
          </div>
        )}

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
          <Upload className="w-12 h-12 text-text-placeholder mx-auto mb-04" />
          <h3 className="text-productive-heading-03 text-text-primary mb-02">
            Arrastra archivos aquí o haz clic para seleccionar
          </h3>
          <p className="text-body-long text-text-secondary mb-04">
            Soporta: PDF, DOCX, TXT, CSV, XLSX, MD • Máximo 50MB
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.csv,.xlsx,.md,.doc"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center space-x-02 px-05 py-03 h-10 text-white transition-colors cursor-pointer ${
              isUploading 
                ? 'bg-carbon-gray-50 cursor-not-allowed' 
                : 'bg-carbon-gray-70 hover:bg-carbon-gray-60'
            }`}
          >
            {isUploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Procesando... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Seleccionar Archivos</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* RAG Query Section */}
      <div className="bg-ui-02 border border-ui-03 p-06">
        <div className="flex items-center space-x-02 mb-04">
          <Search className="w-5 h-5 text-interactive" />
          <h2 className="text-productive-heading-03 text-text-primary">Consultar Documentos</h2>
        </div>
        
        <div className="space-y-04">
          <div className="flex space-x-03">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isQuerying && handleQuery()}
              placeholder="Pregunta sobre tus documentos..."
              className="flex-1 px-04 py-02 h-10 border border-ui-04 bg-ui-01 text-text-primary placeholder-text-placeholder focus:outline-none focus:border-interactive"
              disabled={isQuerying || documents.length === 0}
            />
            <button
              onClick={handleQuery}
              disabled={isQuerying || !query.trim() || documents.length === 0}
              className={`flex items-center space-x-02 px-05 py-02 h-10 text-white transition-colors ${
                isQuerying || !query.trim() || documents.length === 0
                  ? 'bg-carbon-gray-50 cursor-not-allowed'
                  : 'bg-interactive hover:bg-[#0050e6]'
              }`}
            >
              {isQuerying ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Consultar</span>
                </>
              )}
            </button>
          </div>

          {/* Query Result */}
          {queryResult && (
            <div className="bg-ui-01 border border-ui-03 p-05 space-y-04">
              <div>
                <h3 className="text-label font-semibold text-text-primary mb-02">Respuesta:</h3>
                <p className="text-body-long text-text-primary whitespace-pre-wrap">{queryResult.answer}</p>
              </div>

              {queryResult.sources && queryResult.sources.length > 0 && (
                <div>
                  <h3 className="text-label font-semibold text-text-primary mb-02">Fuentes Consultadas:</h3>
                  <div className="space-y-02">
                    {queryResult.sources.map((source, idx) => (
                      <div key={idx} className="bg-ui-02 border border-ui-03 p-03">
                        <div className="flex items-center justify-between mb-01">
                          <p className="text-label font-medium text-text-primary">{source.filename}</p>
                          <span className="text-caption text-text-secondary">
                            Similitud: {(source.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-caption text-text-secondary line-clamp-2">{source.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {queryResult.query_time && (
                <div className="flex items-center space-x-04 text-caption text-text-secondary">
                  <span>Tiempo de consulta: {queryResult.query_time.toFixed(2)}s</span>
                  {queryResult.chunks_found && (
                    <span>Chunks encontrados: {queryResult.chunks_found}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="bg-ui-02 border border-ui-03 p-06">
          <h2 className="text-productive-heading-03 text-text-primary mb-05">Base de Conocimiento</h2>
          <div className="space-y-03">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-ui-03 p-04">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-03 flex-1">
                    <FileText className="w-5 h-5 text-interactive" />
                    <div className="flex-1">
                      <h3 className="text-label font-medium text-text-primary">{doc.filename}</h3>
                      <div className="flex items-center space-x-04 text-caption text-text-secondary mt-01">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{doc.chunks_count} chunks</span>
                        <span>•</span>
                        <span>{new Date(doc.uploaded_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="flex items-center space-x-02 px-03 py-02 h-8 bg-danger hover:bg-[#ba1b23] text-white transition-colors ml-03"
                    title="Eliminar documento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="bg-ui-02 border border-ui-03 p-12 text-center">
          <div className="w-16 h-16 bg-ui-01 border border-ui-03 flex items-center justify-center mx-auto mb-04">
            <Database className="w-8 h-8 text-text-placeholder" />
          </div>
          <h3 className="text-productive-heading-03 text-text-primary mb-02">
            Base de conocimiento vacía
          </h3>
          <p className="text-body-long text-text-secondary mb-04">
            Sube documentos para comenzar búsquedas semánticas con RAG
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysisPage;

