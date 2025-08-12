import React, { useState } from 'react';
import { Upload, Download, Sparkles, Image as ImageIcon, Settings } from 'lucide-react';

const ImageGeneratorPage = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    
    // Simular generación de imagen
    setTimeout(() => {
      const newImage = {
        id: Date.now(),
        prompt: prompt,
        url: `https://picsum.photos/512/512?random=${Date.now()}`,
        timestamp: new Date()
      };
      setGeneratedImages([newImage, ...generatedImages]);
      setIsGenerating(false);
      setPrompt('');
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6 bg-ibm-gray-10 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-ibm-purple to-ibm-magenta rounded-lg flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ibm-gray-90">Generador de Imágenes IA</h1>
            <p className="text-ibm-gray-70">Crea imágenes únicas usando inteligencia artificial</p>
          </div>
        </div>

        {/* Generation Form */}
        <form onSubmit={handleGenerateImage} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-ibm-gray-90 mb-2">
              Descripción de la imagen
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe la imagen que quieres generar... (ej: Un paisaje futurista con edificios cristalinos bajo un cielo púrpura)"
              rows={3}
              className="w-full px-4 py-3 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <select className="px-4 py-2 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>512x512</option>
                <option>768x768</option>
                <option>1024x1024</option>
              </select>
              <select className="px-4 py-2 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Estilo Realista</option>
                <option>Estilo Artístico</option>
                <option>Estilo Cartoon</option>
                <option>Estilo Abstracto</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-ibm-purple to-ibm-magenta text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Imagen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Images Grid */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-6">Imágenes Generadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image) => (
              <div key={image.id} className="group relative bg-ibm-gray-10 rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-64 object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200" />
                
                {/* Image Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-sm mb-2 line-clamp-2">{image.prompt}</p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors text-xs flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>Descargar</span>
                    </button>
                    <button className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-colors text-xs flex items-center space-x-1">
                      <Settings className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {image.timestamp.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedImages.length === 0 && !isGenerating && (
        <div className="bg-white rounded-lg p-12 shadow-sm border border-ibm-gray-20 text-center">
          <div className="w-16 h-16 bg-ibm-gray-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-ibm-gray-60" />
          </div>
          <h3 className="text-lg font-semibold text-ibm-gray-90 mb-2">
            No hay imágenes generadas aún
          </h3>
          <p className="text-ibm-gray-70 mb-4">
            Escribe una descripción y genera tu primera imagen con IA
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageGeneratorPage;
