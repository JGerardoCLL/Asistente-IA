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

        //Llama al servico de gemini y usa el contexto para el prompt
        const response = await generateGeminiContent(promptWithContext);
        //Regresa respuesta al front
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