// File: simport { BarChart, Bot, Database, Shield, Home, Cpu, Plus, Sparkles, MessageSquare, FileText, Brain, Search, Hash, Tag } from 'lucide-react';c/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import ChatbotPage from "./pages/ChatbotPage";
import ImageGeneratorPage from "./pages/ImageGeneratorPage";
import DocumentAnalysisPage from "./pages/DocumentAnalysisPage";
import FraudDetectionPage from "./pages/FraudDetectionPage";
import NLPAnalysisPage from "./pages/NLPAnalysisPage";
import TextToSQLPage from "./pages/TextToSQLPage";
import { BarChart, Bot, Database, Shield, Home, Cpu, Plus,Brain,Search,Hash,Tag, Sparkles, MessageSquare, FileText } from "lucide-react";

// Páginas temporales para las rutas faltantes
const AnalyticsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-ibm-gray-90 mb-4">Analytics IA</h1>
    <div className="bg-white rounded-lg p-8 text-center border border-ibm-gray-20">
      <p className="text-ibm-gray-70">Página de Analytics en desarrollo...</p>
    </div>
  </div>
);

const MLModelsPage = () => (
  <div className="p-6 space-y-6 bg-ibm-gray-10 min-h-screen">
    <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-ibm-orange via-ibm-red to-danger rounded-lg flex items-center justify-center">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ibm-gray-90">Casos de Machine Learning</h1>
          <p className="text-ibm-gray-70">Casos de uso y modelos entrenados disponibles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/fraud-detection" className="group bg-gradient-to-r from-ibm-red via-danger to-ibm-orange text-white rounded-lg p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white bg-opacity-10 rounded flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Detección de Fraude Financiero</h3>
          </div>
          <p className="text-sm opacity-90 mb-4">Modelo entrenado para detectar transacciones fraudulentas en tiempo real</p>
          <div className="flex items-center justify-between text-xs">
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded">Activo</span>
            <span>Precisión: 97.8%</span>
          </div>
        </Link>

        <div className="bg-ibm-gray-20 text-ibm-gray-70 rounded-lg p-6 border-2 border-dashed border-ibm-gray-30">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Predicción de Demanda</h3>
            <p className="text-sm">En fase de entrenamiento</p>
          </div>
        </div>

        <div className="bg-ibm-gray-20 text-ibm-gray-70 rounded-lg p-6 border-2 border-dashed border-ibm-gray-30">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Próximamente</h3>
            <p className="text-sm">Más modelos de ML en desarrollo</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NLPPage = () => (
  <div className="p-6 space-y-6 bg-ibm-gray-10 min-h-screen">
    <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ibm-gray-90">Procesamiento de Lenguaje Natural</h1>
          <p className="text-ibm-gray-70">Herramientas avanzadas de análisis y procesamiento de texto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/text-to-sql" className="group bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-lg p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white bg-opacity-10 rounded flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Texto a SQL</h3>
          </div>
          <p className="text-sm opacity-90 mb-4">Convierte consultas en lenguaje natural a comandos SQL ejecutables</p>
          <div className="flex items-center justify-between text-xs">
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded">Activo</span>
            <span>Precisión: 89.5%</span>
          </div>
        </Link>

        <Link to="/nlp" className="group bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white rounded-lg p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-white bg-opacity-10 rounded flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Análisis de Sentimientos</h3>
          </div>
          <p className="text-sm opacity-90 mb-4">Análisis de sentimientos, extracción de entidades y categorización de texto</p>
          <div className="flex items-center justify-between text-xs">
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded">Activo</span>
            <span>Precisión: 94.2%</span>
          </div>
        </Link>

        <div className="bg-ibm-gray-20 text-ibm-gray-70 rounded-lg p-6 border-2 border-dashed border-ibm-gray-30">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Hash className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Extracción de Entidades</h3>
            <p className="text-sm">En desarrollo</p>
          </div>
        </div>

        <div className="bg-ibm-gray-20 text-ibm-gray-70 rounded-lg p-6 border-2 border-dashed border-ibm-gray-30">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Clasificación de Texto</h3>
            <p className="text-sm">En desarrollo</p>
          </div>
        </div>

        <div className="bg-ibm-gray-20 text-ibm-gray-70 rounded-lg p-6 border-2 border-dashed border-ibm-gray-30">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Próximamente</h3>
            <p className="text-sm">Más herramientas de NLP</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AutomationPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-ibm-gray-90 mb-4">Automatización</h1>
    <div className="bg-white rounded-lg p-8 text-center border border-ibm-gray-20">
      <p className="text-ibm-gray-70">Página de Automatización en desarrollo...</p>
    </div>
  </div>
);

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-ibm-gray-90 mb-4">Configuración</h1>
    <div className="bg-white rounded-lg p-8 text-center border border-ibm-gray-20">
      <p className="text-ibm-gray-70">Página de Configuración en desarrollo...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-ibm-gray-10 text-ibm-gray-90 font-sans">
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/image-generator" element={<ImageGeneratorPage />} />
            <Route path="/document-analysis" element={<DocumentAnalysisPage />} />
            <Route path="/fraud-detection" element={<FraudDetectionPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/nlp" element={<NLPAnalysisPage />} />
            <Route path="/nlp-models" element={<NLPPage />} />
            <Route path="/text-to-sql" element={<TextToSQLPage />} />
            <Route path="/ml-models" element={<MLModelsPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
