import React, { useState } from "react";
import { Send, Bot, User, AlertCircle, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import { Highlight, themes } from "prism-react-renderer";
import ModelSelector from "../components/ModelSelector";
import SimpleStatus from "../components/SimpleStatus";
import chatbotService, { APIError } from "../services/chatbotService";

const ChatbotPageContent = () => {
  const [selectedModel, setSelectedModel] = useState({
    id: "gemma-2b",
    name: "Gemma 2B",
    port: "8085",
    description: "Modelo ligero y rápido (seleccionado por defecto)",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    chatbotService.getInitialMessage(selectedModel)
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Conectividad simple manejada por SimpleStatus

  // Función para limpiar el historial de conversación
  const clearConversation = () => {
    setMessages([chatbotService.getResetMessage()]);
  };

  // Usar chatbotService para construir el prompt (movido a servicio)
  // Ya no necesitamos esta función aquí

  // Usar chatbotService para enviar mensajes (movido a servicio)
  // Ya no necesitamos esta función aquí

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (!selectedModel) {
      alert("Por favor selecciona un modelo antes de enviar un mensaje");
      return;
    }

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    // Guardar el mensaje actual para pasarlo al historial
    const currentMessage = inputMessage;
    const currentMessages = [...messages, newMessage];

    setMessages(currentMessages);
    setInputMessage("");
    setIsLoading(true);

    // Crear el mensaje del bot vacío que se irá llenando
    const botMessageId = messages.length + 2;
    const botResponse = {
      id: botMessageId,
      text: "",
      sender: "bot",
      timestamp: new Date(),
      model: selectedModel.name,
      isStreaming: true,
      tokensPerSecond: 0,
      totalTokens: 0,
    };

    // Agregar el mensaje del bot vacío
    setMessages((prev) => [...prev, botResponse]);
    setIsLoading(false);

    try {
      // Construir el prompt con historial
      const fullPrompt = chatbotService.buildConversationPrompt(messages, currentMessage);
      
      // Enviar mensaje a llama.cpp server usando chatbotService
      await chatbotService.sendCompletion(
        fullPrompt, 
        selectedModel, 
        (streamedText, tokensPerSecond, totalTokens) => {
          // Actualizar el mensaje del bot con el texto que va llegando y métricas
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === botMessageId 
                ? { ...msg, text: streamedText, tokensPerSecond, totalTokens }
                : msg
            )
          );
        }
      );

      // Marcar como completado
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Error enviando mensaje a llama.cpp:", error);

      const errorMessage = error instanceof APIError
        ? `Error ${error.status}: ${error.statusText}`
        : error.message;

      // Reemplazar el mensaje vacío con el error
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? {
                ...msg,
                text: `Error al conectar con ${selectedModel.name}: ${errorMessage}. Verifica que el modelo esté ejecutándose en el puerto ${selectedModel.port}.`,
                isError: true,
                isStreaming: false,
              }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col -m-06" style={{ height: 'calc(97vh - 2.5rem)' }}>
      {/* Header compacto */}
      <div className="bg-ui-02 border-b border-ui-03 px-06 py-05 flex-shrink-0">
        <div className="flex items-center justify-between gap-04">
          <div className="flex items-center space-x-04">
            <div className="w-10 h-10 bg-interactive flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-productive-heading-03 text-text-primary">Chatbot con llama.cpp</h1>
              <p className="text-caption text-text-secondary">{selectedModel ? `${selectedModel.name} (Puerto: ${selectedModel.port})` : "Selecciona un modelo"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-03">
            <button onClick={clearConversation} className="flex items-center space-x-02 px-04 py-02 bg-danger text-white hover:bg-[#ba1b23] transition-colors text-label h-8" title="Limpiar conversación">
              <Trash2 className="w-4 h-4" />
              <span>Limpiar</span>
            </button>

            <SimpleStatus url={selectedModel ? `/proxy/${selectedModel.port}/health` : null} name={selectedModel ? selectedModel.name : "Modelo"} />
          </div>
        </div>
      </div>

      {/* Chat Messages con flex-1 para ocupar espacio disponible */}
      <div className="flex-1 overflow-y-auto px-06 py-06 bg-ui-background" style={{ minHeight: 0 }}>
        <div className="max-w-4xl mx-auto space-y-05 flex flex-col">
          {/* Context indicator */}
          {messages.length > 1 && (
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs">
                <Bot className="w-3 h-3" />
                <span>Conversación con memoria contextual activa ({messages.filter((m) => m.sender === "user").length} mensajes del usuario)</span>
              </div>
              {messages.filter((m) => m.sender === "user").length > 2 && (
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-success text-white text-xs ml-2">
                  <span className="font-semibold">TOON</span>
                  <span>Formato optimizado para tokens</span>
                </div>
              )}
            </div>
          )}

          {messages.map((message) => {
            // Determinar el ancho máximo basado en el tipo de mensaje
            const maxWidth = message.sender === "user" ? "max-w-xs lg:max-w-md" : "max-w-3xl lg:max-w-4xl";

            return (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex ${maxWidth} w-full ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} space-x-2 gap-1`}>
                  <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${message.sender === "user" ? "bg-carbon-gray-70" : "bg-interactive"}`}>
                    {message.sender === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div
                    className={`px-4 py-3 min-w-0 flex-1 break-words ${
                      message.sender === "user"
                        ? "bg-interactive text-white mx-3"
                        : message.isError
                        ? "bg-carbon-red-10 border border-danger text-danger ml-3"
                        : "bg-ui-02 border border-ui-03 text-primary ml-3"
                    }`}
                  >
                    {/* Renderizar con Markdown para mensajes del bot, texto plano para mensajes del usuario */}
                    {message.sender === "bot" && !message.isError ? (
                      <div className="text-sm prose prose-sm max-w-none overflow-hidden markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          rehypePlugins={[rehypeRaw, rehypeSlug, rehypeAutolinkHeadings]}
                          components={{
                            // Estilos personalizados para elementos Markdown
                            p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                            ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1 break-words">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1 break-words">{children}</ol>,
                            li: ({ children }) => <li className="break-words leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold break-words">{children}</strong>,
                            em: ({ children }) => <em className="italic break-words">{children}</em>,
                            code: ({ inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || "");
                              const language = match ? match[1].toLowerCase() : "text";

                              if (!inline && match) {
                                return (
                                  <div className="my-4 overflow-hidden border border-gray-300 shadow-sm">
                                    <div className="bg-gray-100 text-gray-700 px-4 py-2 text-xs font-medium border-b border-gray-300 flex items-center justify-between">
                                      <span className="uppercase tracking-wide">{language}</span>
                                      <span className="text-gray-500">código</span>
                                    </div>
                                    <Highlight theme={themes.github} code={String(children).replace(/\n$/, "")} language={language}>
                                      {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre className={`${className} p-0 overflow-x-auto text-sm bg-white`} style={{ ...style, backgroundColor: "#ffffff" }}>
                                          {tokens.map((line, i) => (
                                            <div key={i} {...getLineProps({ line })} className="flex hover:bg-gray-50">
                                              <span className="inline-block w-12 text-gray-400 text-right pr-4 pl-4 py-1 bg-gray-50 border-r border-gray-200 select-none text-xs leading-5">
                                                {i + 1}
                                              </span>
                                              <span className="flex-1 px-4 py-1">
                                                {line.map((token, key) => (
                                                  <span key={key} {...getTokenProps({ token })} />
                                                ))}
                                              </span>
                                            </div>
                                          ))}
                                        </pre>
                                      )}
                                    </Highlight>
                                  </div>
                                );
                              }

                              // Código inline
                              return (
                                <code className="bg-gray-100 px-1.5 py-0.5 text-xs font-mono break-all inline-block max-w-full text-gray-800" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 pb-2 border-b border-gray-200 text-gray-900 break-words first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 break-words">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900 break-words">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-base font-semibold mb-2 mt-3 text-gray-800 break-words">{children}</h4>,
                            h5: ({ children }) => <h5 className="text-sm font-semibold mb-1 mt-2 text-gray-800 break-words">{children}</h5>,
                            h6: ({ children }) => <h6 className="text-sm font-medium mb-1 mt-2 text-gray-700 break-words">{children}</h6>,
                            // Estilos para tablas mejoradas y más legibles
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-6 border border-gray-300 shadow-sm bg-white">
                                <table className="min-w-full table-auto">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => <thead>{children}</thead>,
                            tbody: ({ children }) => <tbody>{children}</tbody>,
                            tr: ({ children, ...props }) => {
                              const isHeader = props.isHeader;
                              return <tr className={`border-b border-gray-200 ${isHeader ? "bg-gray-100" : "hover:bg-gray-50"} transition-colors`}>{children}</tr>;
                            },
                            th: ({ children }) => <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-gray-100 border-b-2 border-gray-300 break-words">{children}</th>,
                            td: ({ children }) => (
                              <td className="px-6 py-4 text-sm text-gray-700 break-words border-b border-gray-200">
                                <div className="max-w-xs overflow-hidden">{children}</div>
                              </td>
                            ),
                            // Estilos para listas de tareas
                            input: ({ checked, ...props }) => <input type="checkbox" checked={checked} readOnly className="mr-2" {...props} />,
                            // Estilos para enlaces
                            a: ({ children, href }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                                {children}
                              </a>
                            ),
                            // Estilos para texto tachado
                            del: ({ children }) => <del className="line-through text-gray-500 break-words">{children}</del>,
                            // Estilos para blockquotes mejorados
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-500 pl-4 py-3 my-4 bg-blue-50 italic break-words">
                                <div className="text-gray-700">{children}</div>
                              </blockquote>
                            ),
                            // Estilos para divisores
                            hr: () => <hr className="my-6 border-gray-300" />,
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm break-words overflow-wrap-anywhere">{message.text}</p>
                    )}

                    {/* Cursor parpadeante cuando está haciendo streaming */}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-interactive ml-1 animate-pulse"></span>
                    )}

                    <div className="flex items-center flex-wrap text-xs mt-2 gap-2">
                      <p className={`text-xs ${message.sender === "user" ? "text-white opacity-80" : message.isError ? "text-danger" : "text-secondary"}`}>{message.timestamp.toLocaleTimeString()}</p>
                      {message.model && <p className="text-xs text-white bg-interactive px-2 py-1">{message.model}</p>}
                      {message.isStreaming && <span className="text-xs text-text-secondary italic">escribiendo...</span>}
                      {message.sender === "bot" && message.tokensPerSecond > 0 && (
                        <span className="text-xs bg-success text-white px-2 py-1 font-semibold">
                          {message.tokensPerSecond} tok/s
                        </span>
                      )}
                      {message.sender === "bot" && message.totalTokens > 0 && !message.isStreaming && (
                        <span className="text-xs bg-ui-03 text-text-secondary px-2 py-1">
                          {message.totalTokens} tokens
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex flex-row space-x-2 max-w-3xl lg:max-w-4xl w-full">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-carbon-gray-80">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 bg-ui-02 border border-ui-03 text-primary ml-3 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm break-words">{selectedModel?.name} está pensando...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Form fijo abajo */}
      <div className="bg-ui-02 border-t border-ui-03 px-06 py-05 flex-shrink-0">
        <div className="flex items-center gap-03 max-w-6xl mx-auto">
          {/* Selector de modelo */}
          <div className="flex-shrink-0 min-w-[280px]">
            <ModelSelector value={selectedModel?.name} onChange={setSelectedModel} showPort={true} hideLabel={true} />
          </div>

          {/* Warning cuando no hay modelo */}
          {!selectedModel && (
            <div className="flex items-center space-x-02 bg-carbon-yellow-20 border border-carbon-yellow-30 text-carbon-gray-100 px-03 py-02 text-caption h-8">
              <AlertCircle className="w-4 h-4" />
              <span>Selecciona un modelo</span>
            </div>
          )}

          {/* Input y botón */}
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-02">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 h-8 px-04 py-01 border border-ui-04 bg-ui-01 text-text-primary text-body-short focus:outline-none focus:border-interactive transition-colors duration-fast"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !selectedModel}
              className="px-04 h-8 bg-interactive text-white hover:bg-carbon-blue-70 transition-colors duration-fast disabled:bg-carbon-gray-30 disabled:cursor-not-allowed flex items-center space-x-02 text-label"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente principal simplificado - sin preloader complejo
const ChatbotPage = () => {
  return <ChatbotPageContent />;
};

export default ChatbotPage;
