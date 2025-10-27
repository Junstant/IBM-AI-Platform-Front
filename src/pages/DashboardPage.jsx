import React from "react";
import { Link } from "react-router-dom";
import { Brain, Zap, TrendingUp, Users, Activity, ArrowUpRight, Bot, Image, FileText, BarChart3, MessageSquare, Cpu, Settings, Shield } from "lucide-react";
import { useStatsAPI } from "../hooks/useStatsAPI";
import ModelStatusCard from "../components/stats/ModelStatusCard";
import PerformanceChart from "../components/stats/PerformanceChart";
import ResourcesGauge from "../components/stats/ResourcesGauge";
import ErrorsTable from "../components/stats/ErrorsTable";
import FunctionalityMetrics from "../components/stats/FunctionalityMetrics";
import AlertsPanel from "../components/stats/AlertsPanel";
import LastUpdated from "../components/stats/LastUpdated";

const DashboardPage = () => {
  const { useDashboardSummary, useModelsStatus, useAlerts } = useStatsAPI();
  const { data: summary, loading: summaryLoading, refresh: refreshSummary, lastUpdated } = useDashboardSummary();
  const { data: models, loading: modelsLoading } = useModelsStatus();
  const { data: alerts, resolveAlert } = useAlerts();

  // Stats con datos reales o fallback
  const stats = [
    {
      title: "Modelos IA Activos",
      value: summary?.active_models || "0",
      change: summary?.error_models > 0 ? `${summary.error_models} errores` : "Todos OK",
      icon: Brain,
      color: summary?.error_models > 0 ? "text-red-500" : "text-primary",
      bgColor: summary?.error_models > 0 ? "bg-red-50" : "bg-ibm-blue-10",
    },
    {
      title: "Consultas Procesadas",
      value: summary?.daily_queries ? summary.daily_queries.toLocaleString() : "0",
      change: summary?.daily_successful_queries ? 
        `${Math.round((summary.daily_successful_queries / summary.daily_queries) * 100)}% éxito` : 
        "Sin datos",
      icon: Activity,
      color: "text-success",
      bgColor: "bg-green-50",
    },
    {
      title: "Tiempo de Respuesta",
      value: summary?.avg_response_time ? `${summary.avg_response_time.toFixed(2)}s` : "N/A",
      change: summary?.avg_response_time ? 
        (summary.avg_response_time < 1 ? "Excelente" : 
         summary.avg_response_time < 3 ? "Bueno" : "Lento") : 
        "Sin datos",
      icon: Zap,
      color: summary?.avg_response_time ? 
        (summary.avg_response_time < 1 ? "text-success" : 
         summary.avg_response_time < 3 ? "text-yellow-500" : "text-red-500") : 
        "text-gray-500",
      bgColor: summary?.avg_response_time ? 
        (summary.avg_response_time < 1 ? "bg-green-50" : 
         summary.avg_response_time < 3 ? "bg-yellow-50" : "bg-red-50") : 
        "bg-gray-50",
    },
    {
      title: "Precisión Global",
      value: summary?.global_accuracy ? `${summary.global_accuracy.toFixed(1)}%` : "N/A",
      change: summary?.global_accuracy ? 
        (summary.global_accuracy >= 95 ? "Excelente" : 
         summary.global_accuracy >= 90 ? "Bueno" : "Necesita mejora") : 
        "Sin datos",
      icon: TrendingUp,
      color: summary?.global_accuracy ? 
        (summary.global_accuracy >= 95 ? "text-success" : 
         summary.global_accuracy >= 90 ? "text-yellow-500" : "text-red-500") : 
        "text-gray-500",
      bgColor: summary?.global_accuracy ? 
        (summary.global_accuracy >= 95 ? "bg-green-50" : 
         summary.global_accuracy >= 90 ? "bg-yellow-50" : "bg-red-50") : 
        "bg-gray-50",
    },
  ];

  const quickActions = [
    {
      title: "Chatbot Inteligente",
      description: "Asistente virtual con IA conversacional",
      icon: Bot,
      color: "bg-gradient-ibm",
      path: "/chatbot",
    },
    {
      title: "Generador de Imágenes",
      description: "Crea contenido visual con IA generativa",
      icon: Image,
      color: "bg-gradient-to-r from-ibm-purple to-ibm-magenta",
      path: "/image-generator",
    },
    {
      title: "Análisis de Documentos",
      description: "Extrae información de documentos con IA",
      icon: FileText,
      color: "bg-gradient-to-r from-ibm-teal to-ibm-cyan",
      path: "/document-analysis",
    },
    {
      title: "Analytics Avanzado",
      description: "Métricas y análisis con machine learning",
      icon: BarChart3,
      color: "bg-gradient-to-r from-ibm-orange to-ibm-yellow",
      path: "/analytics",
    },
    {
      title: "Procesamiento NLP",
      description: "Análisis de lenguaje natural avanzado",
      icon: MessageSquare,
      color: "bg-gradient-to-r from-ibm-blue-60 via-ibm-purple to-ibm-magenta",
      path: "/nlp-models",
    },
    {
      title: "Modelos ML",
      description: "Entrenar y desplegar modelos de ML",
      icon: Cpu,
      color: "bg-gradient-to-r from-ibm-orange via-ibm-red to-danger",
      path: "/ml-models",
    },
    {
      title: "Automatización IA",
      description: "Workflows automáticos con inteligencia",
      icon: Zap,
      color: "bg-gradient-to-r from-ibm-cyan via-ibm-blue-60 to-primary",
      path: "/automation",
    },
    {
      title: "Configuración",
      description: "Ajustes y personalización del sistema",
      icon: Settings,
      color: "bg-gradient-to-r from-ibm-gray-70 to-ibm-gray-90",
      path: "/settings",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ibm-gray-90 mb-2">Dashboard de IA</h1>
        <p className="text-ibm-gray-70">Bienvenido a la plataforma de inteligencia artificial de IBM, haga click en la demo que desea utilizar</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm text-success font-medium flex items-center">
                  {stat.change}
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-ibm-gray-90 mb-1">{stat.value}</h3>
              <p className="text-sm text-ibm-gray-70">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <h2 className="text-xl font-bold text-ibm-gray-90 mb-6">Demos Disponibles</h2>
        <div className="overflow-y-auto max-h-[400px] p-3 scrollbar-hide">
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="group cursor-pointer rounded-lg p-6 text-white relative overflow-hidden transition-transform duration-200 hover:scale-105 block"
                  style={{ background: action.color.includes("gradient") ? "" : action.color }}
                >
                  {action.color.includes("gradient") && <div className={`absolute inset-0 ${action.color}`} />}
                  <div className="relative z-10">
                    <Icon className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold mb-2 text-sm">{action.title}</h3>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-ibm-gray-60">↑ Desplázate verticalmente para ver todos los demos ↓</p>
        </div>
      </div>

      {/* Stats en tiempo real y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modelos activos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-ibm-gray-90">Estado de Modelos IA</h2>
              <LastUpdated 
                timestamp={lastUpdated} 
                onRefresh={refreshSummary}
                loading={summaryLoading}
              />
            </div>
            
            {modelsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-32 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : models && models.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.slice(0, 4).map((model) => (
                  <ModelStatusCard key={model.model_name} model={model} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay modelos configurados</p>
                <p className="text-sm">Los modelos aparecerán aquí cuando estén activos</p>
              </div>
            )}
            
            {models && models.length > 4 && (
              <div className="mt-4 text-center">
                <Link 
                  to="/analytics" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver todos los modelos ({models.length}) →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Panel de alertas */}
        <div className="lg:col-span-1">
          <AlertsPanel 
            alerts={alerts}
            onResolveAlert={resolveAlert}
            maxAlerts={6}
          />
        </div>
      </div>

      {/* Recursos del sistema */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <h2 className="text-xl font-bold text-ibm-gray-90 mb-6">Recursos del Sistema</h2>
        <ResourcesGauge />
      </div>

      {/* Actividad reciente y errores */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Errores recientes */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-6">Errores Recientes</h2>
          <ErrorsTable maxErrors={5} />
        </div>

        {/* Métricas por funcionalidad */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
          <h2 className="text-xl font-bold text-ibm-gray-90 mb-6">Rendimiento por Funcionalidad</h2>
          <FunctionalityMetrics />
        </div>
      </div>

      {/* Performance charts */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <h2 className="text-xl font-bold text-ibm-gray-90 mb-6">Tendencias de Rendimiento</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart 
            title="Tiempo de Respuesta" 
            dataKey="response_time" 
            type="line"
            color="#8884d8"
          />
          <PerformanceChart 
            title="Consultas por Hora" 
            dataKey="requests_count" 
            type="area"
            color="#82ca9d"
          />
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-ibm-gray-20">
        <h2 className="text-xl font-bold text-ibm-gray-90 mb-6">Actividad Reciente</h2>
        <div className="space-y-4">
          {[
            { time: "Hace 2 minutos", action: "Nuevo modelo de ML entrenado", type: "success" },
            { time: "Hace 15 minutos", action: "Análisis de documento completado", type: "info" },
            { time: "Hace 1 hora", action: "Chatbot Watson actualizado", type: "warning" },
            { time: "Hace 3 horas", action: "Backup de datos completado", type: "success" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-ibm-gray-10 transition-colors">
              <div
                className={`w-2 h-2 rounded-full ${activity.type === "success" ? "bg-green-500" : activity.type === "info" ? "bg-blue-500" : activity.type === "warning" ? "bg-yellow-500" : "bg-ibm-gray-40"}`}
              />
              <div className="flex-1">
                <p className="text-sm text-ibm-gray-90">{activity.action}</p>
                <p className="text-xs text-ibm-gray-60">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
