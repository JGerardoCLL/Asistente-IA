const { GoogleGenAI } = require('@google/genai');
const { SYSTEM_PROMPT } = require('../prompts/systemPrompt');

const ai = new GoogleGenAI({ 
//Comunicacion directa con gemini, key en .env
apiKey: process.env.GEMINI_API_KEY });

//enviar prompts al modelo Gemini y devolver el texto generado
async function generateGeminiContent(prompt) {
    const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
                //Reglas del asistente
        config: { systemInstruction: SYSTEM_PROMPT },
        //pregunta del usuario
        contents: prompt
    });

    return response.text;  
}

module.exports = {
    generateGeminiContent
};