import React, { useState, useEffect } from 'react';
import { Upload, FileText, Send, Database, Zap, CheckCircle, AlertCircle, Loader, Trash2, Search, Settings, RefreshCw, Cpu } from 'lucide-react';
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
  
  // ✨ NUEVO: Estados para modelos de embeddings
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [embeddingsEnabled, setEmbeddingsEnabled] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [generateEmbeddings, setGenerateEmbeddings] = useState(true);

  // Cargar documentos, estadísticas y modelos al iniciar
  useEffect(() => {
    fetchDocuments();
    fetchStats();
    fetchAvailableModels();
    fetchHealthStatus();
    
    // ✨ Cargar modelo guardado del localStorage
    const savedModel = localStorage.getItem('rag_selected_model');
    if (savedModel) {
      try {
        setSelectedModel(JSON.parse(savedModel));
      } catch (e) {
        console.error('Error loading saved model:', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ✨ NUEVO: Obtener modelos de embeddings disponibles
  const fetchAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await fetch('/api/rag/models');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.available_models || []);
        
        // Si hay un modelo actual, seleccionarlo
        if (data.current_model) {
          const currentModel = data.available_models.find(m => m.name === data.current_model);
          if (currentModel && !selectedModel) {
            setSelectedModel(currentModel);
            localStorage.setItem('rag_selected_model', JSON.stringify(currentModel));
          }
        }
        
        setEmbeddingsEnabled(data.embeddings_enabled || false);
      } else {
        // Fallback con modelos por defecto
        const fallbackModels = [
          { name: "all-MiniLM-L12-v2", dimensions: 384, description: "Modelo ligero y rápido" },
          { name: "nomic-embed-text", dimensions: 768, description: "Modelo balanceado" },
        ];
        setAvailableModels(fallbackModels);
        setSelectedModel(fallbackModels[0]);
        setEmbeddingsEnabled(false);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setEmbeddingsEnabled(false);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // ✨ NUEVO: Health check detallado
  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/rag/health');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data);
      }
    } catch (error) {
      console.error('Error fetching health status:', error);
      setHealthStatus(null);
    }
  };

  // ✨ NUEVO: Cambiar modelo de embeddings
  const handleChangeModel = async (model) => {
    setSelectedModel(model);
    localStorage.setItem('rag_selected_model', JSON.stringify(model));
    
    // Intentar cambiar el modelo en el backend
    try {
      const response = await fetch('/api/rag/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: model.name }),
      });
      
      if (response.ok) {
        await fetchHealthStatus(); // Actualizar estado
        alert(`✓ Modelo cambiado a ${model.name} (${model.dimensions} dims)`);
      }
    } catch (error) {
      console.error('Error changing model:', error);
      alert('⚠️ Modelo seleccionado localmente. El backend usará el modelo por defecto.');
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
        
        // ✨ NUEVO: Incluir modelo de embeddings seleccionado
        if (selectedModel) {
          formData.append('embedding_model', selectedModel.name);
        }
        formData.append('generate_embeddings', generateEmbeddings);

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
        
        // ✨ Mensaje mejorado con info de embeddings
        const embeddingInfo = generateEmbeddings && selectedModel 
          ? `\nModelo: ${selectedModel.name} (${selectedModel.dimensions} dims)`
          : '\nModo: Solo texto (sin embeddings)';
        
        alert(`✓ ${file.name} procesado correctamente\n${data.chunks_created} chunks creados${embeddingInfo}`);
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
        // ✅ FIX: Cambiar "question" por "query" para coincidir con el backend
        body: JSON.stringify({ 
          query: query,
          top_k: 3
        }),
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
              <p className="text-body-long text-text-secondary">Retrieval-Augmented Generation con Búsqueda Semántica y Gemma-2B</p>
            </div>
          </div>
          <div className="flex items-center space-x-03">
            <SimpleStatus url="/api/rag/health" name="RAG Service" />
            <button
              onClick={fetchHealthStatus}
              className="px-03 py-02 h-8 border border-ui-04 bg-ui-01 hover:bg-ui-03 transition-colors flex items-center space-x-02"
              title="Actualizar estado"
            >
              <RefreshCw className="w-4 h-4 text-text-primary" />
            </button>
          </div>
        </div>

        {/* ✨ NUEVO: Banner de estado de embeddings */}
        {healthStatus && !embeddingsEnabled && (
          <div className="mb-04 bg-carbon-yellow-10 border border-carbon-yellow-30 p-04 flex items-center space-x-03">
            <AlertCircle className="w-5 h-5 text-carbon-yellow-50 flex-shrink-0" />
            <div>
              <p className="text-label font-semibold text-text-primary">⚠️ Embeddings deshabilitados - Modo básico activo</p>
              <p className="text-caption text-text-secondary">
                El sistema está funcionando con búsqueda por texto. Para búsqueda semántica, instala pgvector y configura el servicio de embeddings.
              </p>
            </div>
          </div>
        )}

        {embeddingsEnabled && (
          <div className="mb-04 bg-carbon-green-10 border border-success p-04 flex items-center space-x-03">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <div className="flex-1">
              <p className="text-label font-semibold text-text-primary">✅ Sistema completo con búsqueda semántica</p>
              <p className="text-caption text-text-secondary">
                Los documentos se procesarán con embeddings vectoriales para búsquedas más inteligentes.
              </p>
            </div>
          </div>
        )}

        {/* ✨ NUEVO: Selector de Modelo de Embeddings */}
        <div className="mb-04 bg-ui-01 border border-ui-03 p-04">
          <div className="flex items-center justify-between mb-03">
            <div className="flex items-center space-x-02">
              <Cpu className="w-5 h-5 text-interactive" />
              <h3 className="text-label font-semibold text-text-primary">Modelo de Embeddings</h3>
            </div>
            {selectedModel && (
              <span className="px-03 py-01 bg-interactive text-white text-caption font-medium">
                {selectedModel.dimensions} dimensiones
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-03">
            {/* Selector de modelo */}
            <div>
              <label className="block text-caption text-text-secondary mb-02">Seleccionar Modelo</label>
              <select
                value={selectedModel?.name || ''}
                onChange={(e) => {
                  const model = availableModels.find(m => m.name === e.target.value);
                  if (model) handleChangeModel(model);
                }}
                disabled={isLoadingModels || isUploading}
                className="w-full h-10 px-03 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive disabled:bg-ui-03 disabled:text-text-disabled"
              >
                {isLoadingModels && <option>Cargando modelos...</option>}
                {!isLoadingModels && availableModels.length === 0 && <option>No hay modelos disponibles</option>}
                {availableModels.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} ({model.dimensions} dims) - {model.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle de embeddings */}
            <div>
              <label className="block text-caption text-text-secondary mb-02">Generar Embeddings</label>
              <div className="flex items-center space-x-03 h-10">
                <button
                  onClick={() => setGenerateEmbeddings(!generateEmbeddings)}
                  disabled={!embeddingsEnabled || isUploading}
                  className={`flex-1 h-10 px-04 border transition-colors flex items-center justify-center space-x-02 ${
                    generateEmbeddings && embeddingsEnabled
                      ? 'bg-success border-success text-white'
                      : 'bg-ui-01 border-ui-04 text-text-secondary'
                  } disabled:bg-ui-03 disabled:border-ui-03 disabled:text-text-disabled disabled:cursor-not-allowed`}
                >
                  {generateEmbeddings ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-label font-medium">
                    {generateEmbeddings ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Info adicional */}
          {selectedModel && (
            <div className="mt-03 text-caption text-text-secondary">
              <p>📌 <strong>Modelo actual:</strong> {selectedModel.name}</p>
              <p>📏 <strong>Dimensiones:</strong> {selectedModel.dimensions}</p>
              <p>📝 <strong>Descripción:</strong> {selectedModel.description}</p>
            </div>
          )}
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
                <p className="text-caption text-text-secondary">Chunks</p>
              </div>
              <p className="text-productive-heading-03 text-text-primary">{stats.total_chunks}</p>
            </div>
            <div className="bg-ui-01 border border-ui-03 p-04">
              <div className="flex items-center space-x-02 mb-02">
                <Cpu className="w-4 h-4 text-interactive" />
                <p className="text-caption text-text-secondary">Modelo Embeddings</p>
              </div>
              <p className="text-label text-text-primary">{selectedModel?.name || 'N/A'}</p>
            </div>
            <div className="bg-ui-01 border border-ui-03 p-04">
              <div className="flex items-center space-x-02 mb-02">
                <CheckCircle className="w-4 h-4 text-success" />
                <p className="text-caption text-text-secondary">Modelo LLM</p>
              </div>
              <p className="text-label text-text-primary">Gemma-2B</p>
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
                          {source.rank !== undefined && (
                            <span className="text-caption text-text-secondary">
                              Relevancia: {source.rank.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-caption text-text-secondary line-clamp-3">{source.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {queryResult.query_time && (
                <div className="flex items-center space-x-04 text-caption text-text-secondary">
                  <span>⚡ Tiempo: {queryResult.query_time.toFixed(2)}s</span>
                  {queryResult.sources && (
                    <span>📚 {queryResult.sources.length} fuentes consultadas</span>
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
                        <span>{doc.total_chunks} chunks</span>
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
            Sube documentos para comenzar a hacer preguntas con RAG
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysisPage;

