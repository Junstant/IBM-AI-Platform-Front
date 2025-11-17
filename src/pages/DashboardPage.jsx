import React from "react";
import { Link } from "react-router-dom";
import { Brain, Zap, TrendingUp, Activity, Bot, Image, FileText, BarChart3, MessageSquare, Cpu, Settings, Shield, Database, ArrowUpRight } from "lucide-react";
import { Card } from "../components/carbon";
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
      change: summary?.daily_successful_queries ? `${Math.round((summary.daily_successful_queries / summary.daily_queries) * 100)}% éxito` : "Sin datos",
      icon: Activity,
      color: "text-success",
      bgColor: "bg-green-50",
    },
    {
      title: "Tiempo de Respuesta",
      value: summary?.avg_response_time ? `${summary.avg_response_time.toFixed(2)}s` : "N/A",
      change: summary?.avg_response_time ? (summary.avg_response_time < 1 ? "Excelente" : summary.avg_response_time < 3 ? "Bueno" : "Lento") : "Sin datos",
      icon: Zap,
      color: summary?.avg_response_time ? (summary.avg_response_time < 1 ? "text-success" : summary.avg_response_time < 3 ? "text-yellow-500" : "text-red-500") : "text-gray-500",
      bgColor: summary?.avg_response_time ? (summary.avg_response_time < 1 ? "bg-green-50" : summary.avg_response_time < 3 ? "bg-yellow-50" : "bg-red-50") : "bg-gray-50",
    },
    {
      title: "Precisión Global",
      value: summary?.global_accuracy ? `${summary.global_accuracy.toFixed(1)}%` : "N/A",
      change: summary?.global_accuracy ? (summary.global_accuracy >= 95 ? "Excelente" : summary.global_accuracy >= 90 ? "Bueno" : "Necesita mejora") : "Sin datos",
      icon: TrendingUp,
      color: summary?.global_accuracy ? (summary.global_accuracy >= 95 ? "text-success" : summary.global_accuracy >= 90 ? "text-yellow-500" : "text-red-500") : "text-gray-500",
      bgColor: summary?.global_accuracy ? (summary.global_accuracy >= 95 ? "bg-green-50" : summary.global_accuracy >= 90 ? "bg-yellow-50" : "bg-red-50") : "bg-gray-50",
    },
  ];

  const quickActions = [
    {
      title: "Chatbot Inteligente",
      description: "Asistente virtual con IA conversacional",
      icon: Bot,
      color: "interactive",
      path: "/chatbot",
    },
    {
      title: "Detección de Fraude",
      description: "Machine Learning para prevención de fraude",
      icon: Shield,
      color: "danger",
      path: "/fraud-detection",
    },
    {
      title: "Text-to-SQL",
      description: "Convierte lenguaje natural en consultas SQL",
      icon: Database,
      color: "success",
      path: "/text-to-sql",
    },
    {
      title: "Generador de Imágenes",
      description: "Crea contenido visual con IA generativa",
      icon: Image,
      color: "carbon-blue-70",
      path: "/image-generator",
    },
    {
      title: "Análisis de Documentos",
      description: "Extrae información de documentos con IA",
      icon: FileText,
      color: "carbon-gray-70",
      path: "/document-analysis",
    },
    {
      title: "Procesamiento NLP",
      description: "Análisis de lenguaje natural avanzado",
      icon: MessageSquare,
      color: "interactive",
      path: "/nlp-analysis",
    },
  ];

  return (
    <div className="space-y-06">
      {/* Header */}
      <div className="my-5">
        <h1 className="text-3xl font-semibold text-primary mb-03">Dashboard de IA</h1>
        <p className="text-secondary">Bienvenido a la plataforma de inteligencia artificial de IBM, haga click en la demo que desea utilizar</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-05">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} padding="md" interactive>
              <div className="flex items-center justify-between mb-05">
                <div className={`p-03 rounded ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm text-success font-medium flex items-center">
                  {stat.change}
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-02">{stat.value}</h3>
              <p className="text-sm text-secondary">{stat.title}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-primary mb-06">Demos Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-05">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            // Map color names to both border and text colors
            const colorStyles = {
              interactive: { border: "border-t-interactive", text: "text-interactive" },
              danger: { border: "border-t-danger", text: "text-danger" },
              success: { border: "border-t-success", text: "text-success" },
              "carbon-blue-70": { border: "border-t-carbon-blue-70", text: "text-carbon-blue-70" },
              "carbon-gray-70": { border: "border-t-carbon-gray-70", text: "text-carbon-gray-70" },
            };
            const colors = colorStyles[action.color] || colorStyles.interactive;

            return (
              <Link
                key={index}
                to={action.path}
                className={`group cursor-pointer bg-ui-02 border border-ui-03 p-05 transition-all duration-moderate hover:shadow-md block border-t-4 ${colors.border}`}
              >
                <Icon className={`w-8 h-8 mb-04 ${colors.text}`} />
                <h3 className="font-semibold mb-02 text-sm text-primary">{action.title}</h3>
                <p className="text-xs text-secondary">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Stats en tiempo real y alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-05">
        {/* Modelos activos */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-05">
              <h2 className="text-xl font-semibold text-primary">Estado de Modelos IA</h2>
              <LastUpdated timestamp={lastUpdated} onRefresh={refreshSummary} loading={summaryLoading} />
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
              <div className="mt-05 text-center">
                <Link to="/analytics" className="text-interactive hover:text-carbon-blue-70 text-sm font-medium">
                  Ver todos los modelos ({models.length}) →
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Panel de alertas */}
        <div className="lg:col-span-1">
          <AlertsPanel alerts={alerts} onResolveAlert={resolveAlert} maxAlerts={6} />
        </div>
      </div>

      {/* Recursos del sistema */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-primary mb-06">Recursos del Sistema</h2>
        <ResourcesGauge />
      </Card>

      {/* Actividad reciente y errores */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-05">
        {/* Errores recientes */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-primary mb-06">Errores Recientes</h2>
          <ErrorsTable maxErrors={5} />
        </Card>

        {/* Métricas por funcionalidad */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-primary mb-06">Rendimiento por Funcionalidad</h2>
          <FunctionalityMetrics />
        </Card>
      </div>

      {/* Performance charts */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-primary mb-06">Tendencias de Rendimiento</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart title="Tiempo de Respuesta" dataKey="response_time" type="line" color="#8884d8" />
          <PerformanceChart title="Consultas por Hora" dataKey="requests_count" type="area" color="#82ca9d" />
        </div>
      </Card>

      {/* Actividad reciente */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-primary mb-06">Actividad Reciente</h2>
        <div className="space-y-4">
          {[
            { time: "Hace 2 minutos", action: "Nuevo modelo de ML entrenado", type: "success" },
            { time: "Hace 15 minutos", action: "Análisis de documento completado", type: "info" },
            { time: "Hace 1 hora", action: "Chatbot Watson actualizado", type: "warning" },
            { time: "Hace 3 horas", action: "Backup de datos completado", type: "success" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-04 p-04 rounded hover:bg-ui-03 transition-colors duration-fast">
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.type === "success" ? "bg-success" : activity.type === "info" ? "bg-interactive" : activity.type === "warning" ? "bg-carbon-yellow-30" : "bg-carbon-gray-50"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-primary">{activity.action}</p>
                <p className="text-xs text-secondary">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
