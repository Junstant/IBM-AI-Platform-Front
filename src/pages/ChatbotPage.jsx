import React, { useState } from "react";
import { Send, Bot, User, AlertCircle, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { Highlight, themes } from "prism-react-renderer";
import ModelSelector from "../components/ModelSelector";

const ChatbotPage = () => {
  const [selectedModel, setSelectedModel] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connected"); // 'connected', 'error', 'loading'
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de IA con memoria contextual alimentado por modelos llama.cpp. Puedo recordar nuestra conversación completa y responder de manera coherente. Selecciona un modelo y comencemos a chatear.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Función para limpiar el historial de conversación
  const clearConversation = () => {
    setMessages([
      {
        id: 1,
        text: "¡Conversación reiniciada! Soy tu asistente de IA con memoria contextual. ¿En qué puedo ayudarte?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  // Función para construir el prompt con historial completo
  const buildConversationPrompt = (messages, newMessage) => {
    // Mensaje del sistema para definir el comportamiento del asistente
    const conversation = [
      {
        role: "system",
        content:
          "Eres un asistente de IA amigable y útil. Responde siempre en el mismo idioma que el usuario. Mantén un tono profesional pero cercano. Si el usuario cambia de idioma, adapta tu respuesta al nuevo idioma.",
      },
    ];

    // Agregar mensajes del historial (excluyendo los mensajes iniciales del bot)
    messages.forEach((msg) => {
      if (msg.sender === "user") {
        conversation.push({ role: "user", content: msg.text });
      } else if (msg.sender === "bot" && !msg.text.includes("Soy tu asistente de IA") && !msg.text.includes("Conversación reiniciada")) {
        // Excluir los mensajes de bienvenida inicial
        conversation.push({ role: "assistant", content: msg.text });
      }
    });

    // Agregar el nuevo mensaje del usuario
    conversation.push({ role: "user", content: newMessage });

    // Limitar el historial para evitar exceder el límite de tokens (últimos 10 intercambios)
    const maxMessages = 21; // sistema + 20 mensajes (10 intercambios)
    if (conversation.length > maxMessages) {
      // Mantener siempre el mensaje del sistema y los últimos mensajes
      const systemMessage = conversation[0];
      const recentMessages = conversation.slice(-(maxMessages - 1));
      conversation.splice(0, conversation.length, systemMessage, ...recentMessages);
    }

    // Construir el prompt en formato ChatML
    const prompt = conversation
      .map((m) => {
        if (m.role === "system") {
          return `<|system|>\n${m.content}`;
        } else if (m.role === "user") {
          return `<|user|>\n${m.content}`;
        } else {
          return `<|assistant|>\n${m.content}`;
        }
      })
      .join("\n");

    // Agregar el inicio de la respuesta del asistente
    return prompt + "\n<|assistant|>\n";
  };

  // Función para enviar mensaje a llama.cpp server con historial completo
  const sendToLlamaServer = async (newMessage, model, conversationHistory) => {
    if (!model) {
      throw new Error("No se ha seleccionado un modelo");
    }

    // Construir el prompt con todo el historial
    const fullPrompt = buildConversationPrompt(conversationHistory, newMessage);

    const response = await fetch(`/proxy/${model.port}/completion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama",
        prompt: fullPrompt,
        max_tokens: 1024,
        temperature: 0.6,
        top_k: 50,
        top_p: 0.95,
        presence_penalty: 1.1,
        frequency_penalty: 0.8,
        stop: ["</s>", "<|user|>", "<|system|>", "Human:", "User:"],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    let responseText = data.content || data.text || "Sin respuesta del modelo";

    // Limpiar la respuesta de posibles tokens especiales
    responseText = responseText
      .replace(/<\|assistant\|>/g, "")
      .replace(/<\|user\|>/g, "")
      .replace(/<\|system\|>/g, "")
      .trim();

    return responseText;
  };

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
    setConnectionStatus("loading");

    try {
      // Enviar mensaje a llama.cpp server con historial completo
      const response = await sendToLlamaServer(currentMessage, selectedModel, messages);

      const botResponse = {
        id: messages.length + 2,
        text: response,
        sender: "bot",
        timestamp: new Date(),
        model: selectedModel.name,
      };

      setMessages((prev) => [...prev, botResponse]);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Error enviando mensaje a llama.cpp:", error);

      const errorResponse = {
        id: messages.length + 2,
        text: `Error al conectar con ${selectedModel.name}: ${error.message}. Verifica que el modelo esté ejecutándose en el puerto ${selectedModel.port}.`,
        sender: "bot",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorResponse]);
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-ibm-gray-10">
      {/* Header */}
      <div className="bg-white border-b border-ibm-gray-20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-ibm rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ibm-gray-90">Chatbot con llama.cpp</h1>
              <p className="text-ibm-gray-70">{selectedModel ? `Modelo activo: ${selectedModel.name} (Puerto: ${selectedModel.port})` : "Selecciona un modelo para comenzar"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Clear conversation button */}
            <button
              onClick={clearConversation}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-ibm-gray-70 hover:text-ibm-gray-90 hover:bg-ibm-gray-10 rounded-lg transition-colors"
              title="Limpiar conversación"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar</span>
            </button>

            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : connectionStatus === "error" ? "bg-red-500" : "bg-yellow-500 animate-pulse"}`}></div>
              <span className="text-sm text-ibm-gray-70">{connectionStatus === "connected" ? "Conectado" : connectionStatus === "error" ? "Error de conexión" : "Conectando..."}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Context indicator */}
          {messages.length > 1 && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs">
                <Bot className="w-3 h-3" />
                <span>Conversación con memoria contextual activa ({messages.filter((m) => m.sender === "user").length} mensajes del usuario)</span>
              </div>
            </div>
          )}

          {messages.map((message) => {
            // Determinar el ancho máximo basado en el tipo de mensaje
            const maxWidth = message.sender === "user" ? "max-w-xs lg:max-w-md" : "max-w-3xl lg:max-w-4xl";
            
            return (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex ${maxWidth} w-full ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} space-x-2 gap-1`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === "user" ? "bg-primary" : "bg-gradient-ibm"}`}>
                    {message.sender === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg min-w-0 flex-1 break-words ${
                      message.sender === "user"
                        ? "bg-primary text-white mx-3"
                        : message.isError
                        ? "bg-red-50 border border-red-200 text-red-800 ml-3"
                        : "bg-white border border-ibm-gray-20 text-ibm-gray-90 ml-3"
                    }`}
                  >
                    {/* Renderizar con Markdown para mensajes del bot, texto plano para mensajes del usuario */}
                    {message.sender === "bot" && !message.isError ? (
                      <div className="text-sm prose prose-sm max-w-none overflow-hidden markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
                          components={{
                            // Estilos personalizados para elementos Markdown
                            p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                            ul: ({ children }) => (
                              <ul className="mb-4 ml-6 list-disc space-y-1 break-words">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-4 ml-6 list-decimal space-y-1 break-words">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="break-words leading-relaxed">
                                {children}
                              </li>
                            ),
                            strong: ({ children }) => <strong className="font-semibold break-words">{children}</strong>,
                            em: ({ children }) => <em className="italic break-words">{children}</em>,
                            code: ({ inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const language = match ? match[1].toLowerCase() : 'text';
                              
                              if (!inline && match) {
                                return (
                                  <div className="my-4 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                                    <div className="bg-gray-100 text-gray-700 px-4 py-2 text-xs font-medium border-b border-gray-300 flex items-center justify-between">
                                      <span className="uppercase tracking-wide">{language}</span>
                                      <span className="text-gray-500">código</span>
                                    </div>
                                    <Highlight
                                      theme={themes.github}
                                      code={String(children).replace(/\n$/, '')}
                                      language={language}
                                    >
                                      {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                        <pre 
                                          className={`${className} p-0 overflow-x-auto text-sm bg-white`} 
                                          style={{...style, backgroundColor: '#ffffff'}}
                                        >
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
                                <code 
                                  className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono break-all inline-block max-w-full text-gray-800"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            h1: ({ children }) => (
                              <h1 className="text-2xl font-bold mb-4 mt-6 pb-2 border-b border-gray-200 text-gray-900 break-words first:mt-0">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 break-words">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900 break-words">
                                {children}
                              </h3>
                            ),
                            h4: ({ children }) => (
                              <h4 className="text-base font-semibold mb-2 mt-3 text-gray-800 break-words">
                                {children}
                              </h4>
                            ),
                            h5: ({ children }) => (
                              <h5 className="text-sm font-semibold mb-1 mt-2 text-gray-800 break-words">
                                {children}
                              </h5>
                            ),
                            h6: ({ children }) => (
                              <h6 className="text-sm font-medium mb-1 mt-2 text-gray-700 break-words">
                                {children}
                              </h6>
                            ),
                            // Estilos para tablas mejoradas y más legibles
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-6 rounded-lg border border-gray-300 shadow-sm bg-white">
                                <table className="min-w-full table-auto">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead>
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody>
                                {children}
                              </tbody>
                            ),
                            tr: ({ children, ...props }) => {
                              const isHeader = props.isHeader;
                              return (
                                <tr className={`border-b border-gray-200 ${isHeader ? 'bg-gray-100' : 'hover:bg-gray-50'} transition-colors`}>
                                  {children}
                                </tr>
                              );
                            },
                            th: ({ children }) => (
                              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 bg-gray-100 border-b-2 border-gray-300 break-words">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-6 py-4 text-sm text-gray-700 break-words border-b border-gray-200">
                                <div className="max-w-xs overflow-hidden">
                                  {children}
                                </div>
                              </td>
                            ),
                            // Estilos para listas de tareas
                            input: ({ checked, ...props }) => (
                              <input
                                type="checkbox"
                                checked={checked}
                                readOnly
                                className="mr-2 rounded"
                                {...props}
                              />
                            ),
                            // Estilos para enlaces
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all"
                              >
                                {children}
                              </a>
                            ),
                            // Estilos para texto tachado
                            del: ({ children }) => (
                              <del className="line-through text-gray-500 break-words">
                                {children}
                              </del>
                            ),
                            // Estilos para blockquotes mejorados
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-blue-500 pl-4 py-3 my-4 bg-blue-50 italic break-words rounded-r-md">
                                <div className="text-gray-700">{children}</div>
                              </blockquote>
                            ),
                            // Estilos para divisores
                            hr: () => (
                              <hr className="my-6 border-gray-300" />
                            ),

                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm break-words overflow-wrap-anywhere">{message.text}</p>
                    )}
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs ${message.sender === "user" ? "text-blue-100" : message.isError ? "text-red-600" : "text-ibm-gray-60"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {message.model && (
                        <p className="text-xs text-white bg-primary ml-2 px-2 py-1 rounded">
                          {message.model}
                        </p>
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-ibm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-lg bg-white border border-ibm-gray-20 text-ibm-gray-90 ml-3 min-w-0 flex-1">
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

      {/* Input Form */}
      <div className="bg-white border-t border-ibm-gray-20 p-6 relative">
        {/* Selector de modelo fijo en la esquina inferior izquierda */}
        <div className="absolute left-0 bottom-0 mb-6 ml-6 z-10">
          <ModelSelector value={selectedModel?.name} onChange={setSelectedModel} showPort={true} hideLabel={true} />
        </div>

        {/* Warning cuando no hay modelo seleccionado */}
        {!selectedModel && (
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-20 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Selecciona un modelo para comenzar a chatear</span>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex justify-center items-end space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 h-12 px-4 border border-ibm-gray-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-ibm-gray-90 text-sm shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !selectedModel}
              className="px-6 py-3 bg-gradient-ibm text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
