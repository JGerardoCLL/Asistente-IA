const {
    generateGeminiContent
} = require('../services/gemini.service');

async function generateContent(req, res) {
    //Recibe pregunta
    const { prompt } = req.body;

    //Checa que no este vacio
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({
            error: 'El prompt es obligatorio'
        });
    }
    
    try {
        //Llama al servico de gemini
        const response = await generateGeminiContent(prompt.trim());
        //Regresa respuesta al front
        return res.json({
            response
        });
    } catch (error) {
        console.error('Error al generar contenido:', error);

        return res.status(500).json({
            error: 'No se pudo generar la respuesta'
        });
    }
}

module.exports = {
    generateContent
};