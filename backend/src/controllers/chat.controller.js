const { generateGeminiContent } = require('../services/gemini.service');
const { searchArticle } = require('../services/articulos.service');

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
        //Obtiene articulos
        const articulos = await searchArticle(prompt.trim());
        //Construye contexto
        const contexto = articulos.length
        ? articulos.map(articulo => `
        Artículo: ${articulo.numero_articulo}
        Capítulo: ${articulo.capitulo}
        Descripción: ${articulo.descripcion}
        Multa mínima: ${articulo.multa_min_cuotas ?? 'No especificada'}
        Multa máxima: ${articulo.multa_max_cuotas ?? 'No especificada'}
        Categoría: ${articulo.categoria}
        `).join('\n')
        :'No se encontraron artículos relacionados en el reglamento.';

        const promptWithContext = `
        CONTEXTO DEL REGLAMENTO:
        ${contexto}

        PREGUNTA DEL USUARIO:
        ${prompt.trim()}

        INSTRUCCIÓN:
        Responde únicamente usando el contexto proporcionado.
        `;

        //Llama al servico de gemini y usa el contexto para el prompt
        const response = await generateGeminiContent(promptWithContext);
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