const pool = require('../db/connection');

async function searchArticle(termino) {
    const palabrasIgnoradas = new Set([
        'cual',
        'es',
        'la',
        'el',
        'los',
        'las',
        'de',
        'del',
        'por',
        'para',
        'con',
        'sin',
        'una',
        'uno',
        'que',
        'usar',
        'sobre',
        'dice'
    ]);

    const palabras = termino
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)
        .map(palabra => palabra.replace(/[¿?¡!,.;:]/g, ''))
        .filter(palabra => palabra.length >= 4)
        .filter(palabra => !palabrasIgnoradas.has(palabra));

    if (palabras.length === 0) {
        return [];
    }

    const condiciones = palabras
        .map(() => `
            (
                numero_articulo LIKE ?
                OR capitulo LIKE ?
                OR descripcion LIKE ?
                OR categoria LIKE ?
            )
        `)
        .join(' AND ');

    const parametros = palabras.flatMap(palabra => {
        const parametro = `%${palabra}%`;

        return [parametro, parametro, parametro, parametro];
    });

    const sql = `
        SELECT
            id,
            numero_articulo,
            capitulo,
            descripcion,
            multa_min_cuotas,
            multa_max_cuotas,
            categoria

        FROM articulos
        WHERE ${condiciones}
        LIMIT 10
    `;

    const [rows] = await pool.query(sql, parametros);

    return rows;
}

module.exports = {
    searchArticle
};