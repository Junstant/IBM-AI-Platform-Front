/**
 * 🤖 Chatbot Service - IBM AI Platform
 * Servicio para interacción con modelos LLM vía llama.cpp
 * 
 * @version 1.0.0
 * @date 2025-11-27
 */

import { APIError } from '../utils/apiClient';

/**
 * ================================
 * TYPE DEFINITIONS
 * ================================
 */

/**
 * @typedef {Object} Message
 * @property {number} id - ID del mensaje
 * @property {string} text - Texto del mensaje
 * @property {string} sender - "user" | "bot"
 * @property {Date} timestamp - Timestamp del mensaje
 * @property {string} [model] - Modelo usado (solo para bot)
 * @property {boolean} [isStreaming] - Si está en streaming
 * @property {number} [tokensPerSecond] - Tokens/s
 * @property {number} [totalTokens] - Total de tokens
 */

/**
 * @typedef {Object} Model
 * @property {string} id - ID del modelo
 * @property {string} name - Nombre del modelo
 * @property {string} port - Puerto del servicio llama.cpp
 * @property {string} description - Descripción del modelo
 */

/**
 * @typedef {Object} CompletionRequest
 * @property {string} prompt - Prompt a enviar
 * @property {number} [max_tokens] - Máximo de tokens (default: 1024)
 * @property {number} [temperature] - Temperatura (default: 0.6)
 * @property {number} [top_k] - Top K (default: 50)
 * @property {number} [top_p] - Top P (default: 0.95)
 * @property {number} [presence_penalty] - Presencia (default: 1.1)
 * @property {number} [frequency_penalty] - Frecuencia (default: 0.8)
 * @property {Array<string>} [stop] - Stop tokens
 * @property {boolean} [stream] - Streaming (default: true)
 */

/**
 * @typedef {function} StreamCallback
 * @param {string} text - Texto acumulado
 * @param {number} tokensPerSecond - Tokens por segundo
 * @param {number} totalTokens - Total de tokens
 */

/**
 * ================================
 * CHATBOT SERVICE API
 * ================================
 */

const chatbotService = {
  /**
   * Enviar mensaje a llama.cpp server con streaming
   * @param {string} prompt - Prompt completo a enviar
   * @param {Model} model - Modelo a usar
   * @param {StreamCallback} onStreamUpdate - Callback para updates
   * @param {CompletionRequest} [options] - Opciones adicionales
   * @returns {Promise<string>} - Respuesta completa
   * @throws {APIError}
   */
  async sendCompletion(prompt, model, onStreamUpdate, options = {}) {
    if (!model) {
      throw new Error("No se ha seleccionado un modelo");
    }

    const completionRequest = {
      model: "llama",
      prompt: prompt,
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.6,
      top_k: options.top_k || 50,
      top_p: options.top_p || 0.95,
      presence_penalty: options.presence_penalty || 1.1,
      frequency_penalty: options.frequency_penalty || 0.8,
      stop: options.stop || ["</s>", "<|user|>", "<|system|>", "Human:", "User:"],
      stream: options.stream !== false, // Default true
    };

    try {
      const response = await fetch(`/proxy/${model.port}/completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completionRequest),
      });

      if (!response.ok) {
        throw new APIError(response.status, response.statusText, null);
      }

      // Procesar el stream con medición de tokens/segundo
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let tokenCount = 0;
      const startTime = performance.now();
      let firstTokenTime = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remover "data: "
              if (jsonStr === '[DONE]') continue;
              
              const data = JSON.parse(jsonStr);
              const content = data.content || data.text || "";
              
              if (content) {
                fullText += content;
                tokenCount++;
                
                // Marcar tiempo del primer token
                if (!firstTokenTime) {
                  firstTokenTime = performance.now();
                }
                
                // Calcular tokens/segundo
                const currentTime = performance.now();
                const elapsedSeconds = (currentTime - (firstTokenTime || startTime)) / 1000;
                const tokensPerSecond = elapsedSeconds > 0 ? (tokenCount / elapsedSeconds).toFixed(1) : 0;
                
                // Llamar al callback para actualizar el UI con tokens/s
                if (onStreamUpdate) {
                  onStreamUpdate(fullText, tokensPerSecond, tokenCount);
                }
              }
            } catch {
              // Ignorar errores de parsing
            }
          }
        }
      }

      // Limpiar la respuesta de posibles tokens especiales
      fullText = fullText
        .replace(/<\|assistant\|>/g, "")
        .replace(/<\|user\|>/g, "")
        .replace(/<\|system\|>/g, "")
        .trim();

      return fullText;
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`Chatbot API Error ${error.status}:`, error.statusText);
      }
      throw error;
    }
  },

  /**
   * Construir prompt con historial de conversación
   * @param {Array<Message>} messages - Historial de mensajes
   * @param {string} newMessage - Nuevo mensaje del usuario
   * @param {boolean} [useTOON] - Usar TOON para optimización (default: auto)
   * @returns {string} - Prompt completo
   */
  buildConversationPrompt(messages, newMessage, useTOON = null) {
    const conversation = [];

    // Agregar mensajes del historial (excluyendo mensajes iniciales del bot)
    messages.forEach((msg) => {
      if (msg.sender === "user") {
        conversation.push({ role: "user", content: msg.text });
      } else if (
        msg.sender === "bot" && 
        !msg.text.includes("Soy tu asistente de IA") && 
        !msg.text.includes("Conversación reiniciada")
      ) {
        conversation.push({ role: "assistant", content: msg.text });
      }
    });

    // Agregar el nuevo mensaje del usuario
    conversation.push({ role: "user", content: newMessage });

    // Limitar el historial para evitar exceder el límite de tokens (últimos 10 intercambios)
    const maxMessages = 20;
    if (conversation.length > maxMessages) {
      conversation.splice(0, conversation.length - maxMessages);
    }

    // Auto-detectar si usar TOON (más de 3 mensajes)
    const shouldUseTOON = useTOON !== null ? useTOON : conversation.length > 3;

    if (shouldUseTOON) {
      // Usar TOON para optimizar tokens (requiere importar encode)
      try {
        // Lazy import para evitar dependencia circular
        const { encode } = require('../utils/toon');
        const toonHistory = encode({ conversation });
        
        return `Eres un asistente IA amigable. Historial en TOON (Token-Optimized Object Notation):

${toonHistory}

Responde al último mensaje coherentemente basándote en todo el contexto. Mantén el idioma del usuario.`;
      } catch (error) {
        console.warn('TOON encoding failed, falling back to ChatML:', error);
      }
    }

    // Para conversaciones cortas, usar formato ChatML tradicional
    const systemMsg = "Eres un asistente de IA amigable y útil. Responde en el mismo idioma que el usuario.";
    const prompt = [`<|system|>\n${systemMsg}`];
    
    conversation.forEach((m) => {
      if (m.role === "user") {
        prompt.push(`<|user|>\n${m.content}`);
      } else {
        prompt.push(`<|assistant|>\n${m.content}`);
      }
    });

    // Agregar el inicio de la respuesta del asistente
    return prompt.join("\n") + "\n<|assistant|>\n";
  },

  /**
   * Obtener mensaje inicial del bot
   * @param {Model} [model] - Modelo seleccionado
   * @returns {Message}
   */
  getInitialMessage(model = null) {
    const modelInfo = model 
      ? ` **${model.name}** está seleccionado por defecto y listo para chatear.`
      : '';

    return {
      id: 1,
      text: `¡Hola! Soy tu asistente de IA con memoria contextual alimentado por modelos llama.cpp. Puedo recordar nuestra conversación completa y responder de manera coherente.${modelInfo} ¡Pregúntame lo que quieras!`,
      sender: "bot",
      timestamp: new Date(),
    };
  },

  /**
   * Obtener mensaje de conversación reiniciada
   * @returns {Message}
   */
  getResetMessage() {
    return {
      id: 1,
      text: "¡Conversación reiniciada! Soy tu asistente de IA con memoria contextual. ¿En qué puedo ayudarte?",
      sender: "bot",
      timestamp: new Date(),
    };
  },

  /**
   * Formatear tokens por segundo
   * @param {number} tokensPerSecond - Tokens/s
   * @returns {string}
   */
  formatTokensPerSecond(tokensPerSecond) {
    if (!tokensPerSecond || tokensPerSecond === 0) return '0 tok/s';
    return `${tokensPerSecond} tok/s`;
  },

  /**
   * Health check de un modelo específico
   * @param {Model} model - Modelo a verificar
   * @returns {Promise<boolean>}
   */
  async checkModelHealth(model) {
    try {
      const response = await fetch(`/proxy/${model.port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      console.warn(`Model ${model.name} health check failed:`, error.message);
      return false;
    }
  },
};

export default chatbotService;
export { APIError };
