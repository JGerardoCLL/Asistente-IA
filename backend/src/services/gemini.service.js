const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ 
//Comunicacion directa con gemini, key en .env
apiKey: process.env.GEMINI_API_KEY });

//enviar prompts al modelo Gemini y devolver el texto generado
async function generateGeminiContent(prompt) {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
    });

    return response.text;  
}

module.exports = {
    generateGeminiContent
};