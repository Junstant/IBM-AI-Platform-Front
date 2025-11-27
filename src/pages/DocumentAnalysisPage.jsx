import React, { useState, useEffect } from 'react';
import { Upload, FileText, Send, Database, Zap, CheckCircle, AlertCircle, Loader, Trash2, Search, Settings, RefreshCw, Cpu, Brain } from 'lucide-react';
import SimpleStatus from '../components/SimpleStatus';
import ragService, { APIError } from '../services/ragService';

const DocumentAnalysisPage = () => {
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [stats, setStats] = useState(null);
  
  // ✨ NUEVO: Estados para modelos de embeddings y LLM
  const [availableEmbeddingModels, setAvailableEmbeddingModels] = useState([]);
  const [availableLlmModels, setAvailableLlmModels] = useState([]);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState(null);
  const [selectedLlmModel, setSelectedLlmModel] = useState(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [embeddingsEnabled, setEmbeddingsEnabled] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  // Cargar documentos, estadísticas y modelos al iniciar
  useEffect(() => {
    fetchDocuments();
    fetchStats();
    fetchAvailableModels();
    fetchHealthStatus();
    
    // ✨ Cargar modelos guardados del localStorage
    const savedEmbedding = localStorage.getItem('rag_embedding_model');
    const savedLlm = localStorage.getItem('rag_llm_model');
    
    if (savedEmbedding) {
      try {
        setSelectedEmbeddingModel(JSON.parse(savedEmbedding));
      } catch (e) {
        console.error('Error loading saved embedding model:', e);
      }
    }
    
    if (savedLlm) {
      try {
        setSelectedLlmModel(JSON.parse(savedLlm));
      } catch (e) {
        console.error('Error loading saved LLM model:', e);
      }
    }
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await ragService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (error instanceof APIError) {
        console.error(`API Error ${error.status}: ${error.statusText}`);
      }
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ragService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error instanceof APIError) {
        console.error(`API Error ${error.status}: ${error.statusText}`);
      }
    }
  };

  // ✨ ARQUITECTURA CORRECTA: Nomic (Embeddings) + Mistral/Gemma (LLM)
  const fetchAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const data = await ragService.getModels();
      
      // Modelos de embeddings (SOLO Nomic - Especializado)
      setAvailableEmbeddingModels(data.embedding_models || []);
      
      // Modelos LLM (Para generación de respuestas)
      setAvailableLlmModels(data.llm_models || []);
      
      // Seleccionar modelos actuales
      if (data.current) {
        const currentEmbedding = data.embedding_models?.find(m => m.id === data.current.embedding_model);
        const currentLlm = data.llm_models?.find(m => m.id === data.current.llm_model);
        
        if (currentEmbedding) {
          setSelectedEmbeddingModel(currentEmbedding);
          localStorage.setItem('rag_embedding_model', JSON.stringify(currentEmbedding));
        }
        
        if (currentLlm) {
          setSelectedLlmModel(currentLlm);
          localStorage.setItem('rag_llm_model', JSON.stringify(currentLlm));
        }
      }
      
      // Backend siempre devuelve Nomic - embeddings están habilitados si /models responde OK
      setEmbeddingsEnabled(
        data.embedding_models && 
        data.embedding_models.length > 0 && 
        data.embedding_models[0].id === "nomic-embed-text-v1.5"
      );
    } catch (error) {
      // ⚠️ Sin backend disponible: NO usar fallback
      // Mistral/Gemma NO pueden hacer embeddings correctamente
      console.error('❌ Backend /api/rag/models no disponible. Sistema RAG deshabilitado.');
      if (error instanceof APIError) {
        console.error(`API Error ${error.status}: ${error.statusText}`);
      }
      setAvailableEmbeddingModels([]);
      setAvailableLlmModels([]);
      setSelectedEmbeddingModel(null);
      setSelectedLlmModel(null);
      setEmbeddingsEnabled(false);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // ✨ NUEVO: Health check detallado
  const fetchHealthStatus = async () => {
    try {
      const data = await ragService.checkHealth();
      setHealthStatus(data);
    } catch (error) {
      console.error('Error fetching health status:', error);
      if (error instanceof APIError) {
        console.error(`API Error ${error.status}: ${error.statusText}`);
      }
      setHealthStatus(null);
    }
  };

  // ✨ NUEVO: Cambiar modelo LLM
  const handleChangeLlmModel = (model) => {
    setSelectedLlmModel(model);
    localStorage.setItem('rag_llm_model', JSON.stringify(model));
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
        // ✨ Upload usando ragService con progreso
        const data = await ragService.uploadDocument(file, {
          llm_model: selectedLlmModel?.id,
          onProgress: (progress) => {
            setUploadProgress(progress.percent);
          }
        });
        
        // Recargar lista de documentos y stats
        await fetchDocuments();
        await fetchStats();
        
        // ✨ Mensaje mejorado con info de embeddings (API v3.0 response)
        const embeddingInfo = `\nVectorizado con: Nomic Embed Text v1.5 (768D)`;
        const llmInfo = selectedLlmModel 
          ? `\nModelo LLM: ${selectedLlmModel.name}`
          : '';
        const sizeInfo = `\nTamaño: ${ragService.formatFileSize(data.file_size)}`;
        
        alert(`✓ ${file.name} procesado correctamente\n${data.total_chunks} chunks creados${embeddingInfo}${llmInfo}${sizeInfo}`);
      } catch (error) {
        console.error('Error uploading file:', error);
        if (error instanceof APIError) {
          alert(`Error al subir ${file.name}: ${error.statusText}\n${error.data?.detail || ''}`);
        } else {
          alert(`Error al subir ${file.name}: ${error.message}`);
        }
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
      // ✨ Query usando ragService con top_k configurable
      const data = await ragService.queryDocuments(query, {
        top_k: 5 // Obtener 5 fuentes relevantes
      });
      
      setQueryResult(data);
      
      // Log de fuentes para debugging
      console.log(`✅ Query respondida con ${data.sources.length} fuentes`);
      data.sources.forEach((source, idx) => {
        console.log(`  [${idx + 1}] ${source.filename} (similitud: ${(source.similarity * 100).toFixed(1)}%)`);
      });
    } catch (error) {
      console.error('Error querying:', error);
      if (error instanceof APIError) {
        alert(`Error al consultar: ${error.statusText}\n${error.data?.detail || ''}`);
      } else {
        alert(`Error al consultar: ${error.message}`);
      }
    } finally {
      setIsQuerying(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('¿Estás seguro de eliminar este documento y todos sus chunks?')) {
      return;
    }

    try {
      // ✨ Delete usando ragService
      const result = await ragService.deleteDocument(docId);
      
      await fetchDocuments();
      await fetchStats();
      
      alert(`✓ ${result.message}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      if (error instanceof APIError) {
        if (error.status === 404) {
          alert('Error: Documento no encontrado');
        } else {
          alert(`Error al eliminar: ${error.statusText}\n${error.data?.detail || ''}`);
        }
      } else {
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  // Usar formatFileSize de ragService
  const formatFileSize = (bytes) => ragService.formatFileSize(bytes);

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
              <h1 className="text-productive-heading-04 text-text-primary">Análisis de Documentos RAG v3.0</h1>
              <p className="text-body-long text-text-secondary">Nomic Embeddings (768D) + Milvus HNSW + LLM | Búsqueda semántica &lt;10ms</p>
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

        {/* ✨ Banner de Arquitectura RAG v3.0 */}
        {healthStatus && !embeddingsEnabled && (
          <div className="mb-04 bg-carbon-yellow-10 border border-carbon-yellow-30 p-04 flex items-center space-x-03">
            <AlertCircle className="w-5 h-5 text-carbon-yellow-50 flex-shrink-0" />
            <div>
              <p className="text-label font-semibold text-text-primary">⚠️ Embeddings deshabilitados - Modo básico activo</p>
              <p className="text-caption text-text-secondary">
                El sistema está funcionando con búsqueda por texto. Para búsqueda semántica ultra-rápida, configura Milvus + Nomic Embeddings.
              </p>
            </div>
          </div>
        )}

        {embeddingsEnabled && (
          <div className="mb-04 bg-carbon-green-10 border border-success p-04">
            <div className="flex items-center space-x-03">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-01">
                  <p className="text-label font-semibold text-text-primary">
                    ✅ RAG v3.0: Nomic (768D) + Milvus HNSW + {stats?.llm_model || selectedLlmModel?.name || 'LLM'}
                  </p>
                  {stats?.milvus_connected !== undefined && (
                    <span className={`px-03 py-01 text-white text-caption font-medium ${stats.milvus_connected ? 'bg-success' : 'bg-danger'}`}>
                      {stats.milvus_connected ? '🟢 Milvus Conectado' : '🔴 Milvus Desconectado'}
                    </span>
                  )}
                </div>
                <p className="text-caption text-text-secondary">
                  Sistema configurado con búsqueda vectorial ultra-rápida (&lt;10ms) y generación de respuestas coherentes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✨ Selector de Modelos RAG v3.0 - Separación de Roles */}
        <div className="mb-04 bg-ui-01 border border-ui-03 p-04">
          <div className="flex items-center justify-between mb-03">
            <div className="flex items-center space-x-02">
              <Settings className="w-5 h-5 text-interactive" />
              <h3 className="text-label font-semibold text-text-primary">Configuración de Modelos (Arquitectura v3.0)</h3>
            </div>
            {selectedEmbeddingModel && (
              <span className="px-03 py-01 bg-interactive text-white text-caption font-medium">
                {selectedEmbeddingModel.dimensions}D vectores
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-03">
            {/* Selector de modelo de Embeddings (SOLO Nomic) - Deshabilitado */}
            <div>
              <label className="block text-caption text-text-secondary mb-02">
                <Cpu className="w-3 h-3 inline mr-1" />
                Modelo de Embeddings
              </label>
              <select
                value={selectedEmbeddingModel?.id || ''}
                disabled={true}
                className="w-full h-10 px-03 border border-ui-04 bg-ui-03 text-text-disabled cursor-not-allowed"
                title="Modelo de embeddings fijo: nomic-embed-text-v1.5 (768D)"
              >
                {isLoadingModels && <option>Cargando modelos...</option>}
                {!isLoadingModels && availableEmbeddingModels.length === 0 && <option>No hay modelos disponibles</option>}
                {availableEmbeddingModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.dimensions}D) - {model.description}
                  </option>
                ))}
              </select>
              <p className="text-helper-text text-text-secondary mt-01">
                Modelo fijo: nomic-embed-text-v1.5 (768 dimensiones)
              </p>
            </div>

            {/* Selector de modelo LLM (Para generación) */}
            <div>
              <label className="block text-caption text-text-secondary mb-02">
                <Brain className="w-3 h-3 inline mr-1" />
                Modelo LLM
              </label>
              <select
                value={selectedLlmModel?.id || ''}
                onChange={(e) => {
                  const model = availableLlmModels.find(m => m.id === e.target.value);
                  if (model) handleChangeLlmModel(model);
                }}
                disabled={isLoadingModels || isUploading}
                className="w-full h-10 px-03 border border-ui-04 bg-ui-01 text-text-primary focus:outline-none focus:border-interactive disabled:bg-ui-03 disabled:text-text-disabled"
                title="Modelo SOLO para generar respuestas (NO para embeddings)"
              >
                {isLoadingModels && <option>Cargando modelos...</option>}
                {!isLoadingModels && availableLlmModels.length === 0 && <option>No hay modelos disponibles</option>}
                {availableLlmModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
              <p className="text-helper-text text-text-secondary mt-01">
                Generación de respuestas con contexto (Mistral recomendado)
              </p>
            </div>
          </div>


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
              <p className="text-label text-text-primary">{stats.embedding_model || 'N/A'}</p>
              {stats.embedding_dimension && (
                <p className="text-caption text-text-secondary">{stats.embedding_dimension}D</p>
              )}
            </div>
            <div className="bg-ui-01 border border-ui-03 p-04">
              <div className="flex items-center space-x-02 mb-02">
                <Brain className="w-4 h-4 text-success" />
                <p className="text-caption text-text-secondary">Modelo LLM</p>
              </div>
              <p className="text-label text-text-primary">{stats.llm_model || 'N/A'}</p>
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
                          {source.similarity !== undefined && (
                            <span className="px-02 py-01 bg-interactive text-white text-caption font-medium">
                              {(source.similarity * 100).toFixed(1)}% similitud
                            </span>
                          )}
                        </div>
                        <p className="text-caption text-text-secondary line-clamp-3">{source.content}</p>
                        {source.chunk_index !== undefined && (
                          <p className="text-caption text-text-placeholder mt-01">Chunk #{source.chunk_index}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(queryResult.query_time !== undefined && queryResult.query_time !== null) && (
                <div className="flex items-center space-x-04 text-caption text-text-secondary">
                  <span>⚡ Tiempo: {queryResult.query_time.toFixed(2)}s</span>
                  {queryResult.sources && queryResult.sources.length > 0 && (
                    <span>📚 {queryResult.sources.length} fuentes | Modelo: {stats?.llm_model || selectedLlmModel?.name || 'LLM'}</span>
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

