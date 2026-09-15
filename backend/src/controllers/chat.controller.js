const { generateGeminiContent } = require('../services/gemini.service');
const { searchArticle } = require('../services/articulos.service');

const UMA_DIARIA_PESOS = Number(process.env.UMA_DIARIA_PESOS || 113.14);

function convertirAPesos(umas) {
    if (umas === null || umas === undefined || !Number.isFinite(Number(umas))) {
        return null;
    }

    return Number(umas) * UMA_DIARIA_PESOS;
}

function formatearPesos(cantidad) {
    if (cantidad === null) {
        return 'No especificada';
    }

    return cantidad.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

async function generateContent(req, res) {
    // Recibe el historial de la conversacion
    const { messages } = req.body;
    // Mensaje actual del usuario
    const prompt = messages?.at(-1)?.content;

    // Construye una consulta de búsqueda a partir de los últimos mensajes del usuario
    const userMessages = (Array.isArray(messages) ? messages.filter(m => m.role === 'user').map(m => m.content) : []);
    const SEARCH_WINDOW = 3; // cuántos mensajes previos combinar
    const searchQuery = userMessages.slice(-SEARCH_WINDOW).join(' ');

    // Valida que exista al menos un mensaje con contenido
    if (!Array.isArray(messages) ||
        !messages.length ||
        !prompt ||
        typeof prompt !== 'string' ||
        !prompt.trim()
       ) {
        return res.status(400).json({
            error: 'El prompt es obligatorio'
        });
    }
    
    try {
        // Obtiene artículos usando la consulta construida del historial
        const articulos = await searchArticle((searchQuery && searchQuery.trim()) ? searchQuery.trim() : prompt.trim());
        //Construye contexto
        const contexto = articulos.length
        ? articulos.map(articulo => `
        Artículo: ${articulo.numero_articulo}
        Capítulo: ${articulo.capitulo}
        Descripción: ${articulo.descripcion}
        Multa mínima: ${articulo.multa_min_cuotas ?? 'No especificada'} UMAs (${formatearPesos(convertirAPesos(articulo.multa_min_cuotas))})
        Multa máxima: ${articulo.multa_max_cuotas ?? 'No especificada'} UMAs (${formatearPesos(convertirAPesos(articulo.multa_max_cuotas))})
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

        // Copia el historial y agrega el contexto del reglamento al ultimo mensaje
        const conversation = messages.map(message => ({
            role: message.role,
            content: message.content
        }));

        conversation[conversation.length - 1].content = promptWithContext;

        const MAX_MESSAGES = 10;
        const limitedConversation = conversation.slice(-MAX_MESSAGES);

        // Envia al modelo la conversacion limitada para conservar el contexto
        const response = await generateGeminiContent(limitedConversation);

        // Regresa la respuesta al frontend
        return res.json({
            response
        });
    } catch (error) {
        console.error('Error al generar contenido:', error);

        if (error?.status === 429) {
            return res.status(429).json({
                error: 'Se alcanzo el limite temporal de solicitudes. Intenta de nuevo mas tarde.'
            });
        }

        return res.status(500).json({
            error: 'No se pudo generar la respuesta'
        });
    }
}

module.exports = {
    generateContent
};