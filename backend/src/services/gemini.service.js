const { GoogleGenAI } = require('@google/genai');
const { SYSTEM_PROMPT } = require('../prompts/systemPrompt');

const ai = new GoogleGenAI({ 
//Comunicacion directa con gemini, key en .env
apiKey: process.env.GEMINI_API_KEY });

// Envia el historial de la conversacion al modelo y devuelve el texto generado
async function generateGeminiContent(messages) {
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        // Reglas del asistente
        config: { systemInstruction: SYSTEM_PROMPT },
        
        // Historial convertido al formato de Gemini
        contents: messages.map(message => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }]
        }))
    });

    return response.text;  
}

module.exports = {
    generateGeminiContent
};