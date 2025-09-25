import React from "react";
import { Link } from "react-router-dom";
import { Brain, Zap, TrendingUp, Users, Activity, ArrowUpRight, Bot, Image, FileText, BarChart3, MessageSquare, Cpu, Settings, Shield } from "lucide-react";

const DashboardPage = () => {
  const stats = [
    {
      title: "Modelos IA Activos",
      value: "12",
      change: "+2.5%",
      icon: Brain,
      color: "text-primary",
      bgColor: "bg-ibm-blue-10",
    },
    {
      title: "Consultas Procesadas",
      value: "1,543",
      change: "+12.3%",
      icon: Activity,
      color: "text-success",
      bgColor: "bg-green-50",
    },
    {
      title: "Tiempo de Respuesta",
      value: "0.8s",
      change: "-15.2%",
      icon: Zap,
      color: "text-success",
      bgColor: "bg-green-50",
    },
    {
      title: "Precisión Global",
      value: "97.8%",
      change: "+3.1%",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-green-50",
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

      {/* Recent Activity */}
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
                className={`w-2 h-2 rounded-full ${activity.type === "success" ? "bg-success" : activity.type === "info" ? "bg-info" : activity.type === "warning" ? "bg-warning" : "bg-ibm-gray-40"}`}
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
