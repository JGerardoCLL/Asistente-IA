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
        'dice',
        'pasa',
        'llevo',
        'llevar',
        'puede',
        'podria',
        'ocurre',
        'multa',
        'multas',
        'infraccion',
        'infracciones',
        'reglamento',
        'articulo'
    ]);

    const palabras = termino
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)
        .map(palabra => palabra.replace(/[¿?¡!,.;:()]/g, ''))
        .filter(palabra => palabra.length >= 4)
        .filter(palabra => !palabrasIgnoradas.has(palabra));

    const palabrasUnicas = [...new Set(palabras)];

    if (palabrasUnicas.length === 0) {
        return [];
    }

    const condiciones = palabrasUnicas
        .map(() => `
            (
                numero_articulo LIKE ?
                OR capitulo LIKE ?
                OR descripcion LIKE ?
                OR categoria LIKE ?
            )
        `)
        .join(' OR ');

    const relevancia = palabrasUnicas
        .map(() => `
            CASE WHEN
                numero_articulo LIKE ?
                OR capitulo LIKE ?
                OR descripcion LIKE ?
                OR categoria LIKE ?
            THEN 1 ELSE 0 END
        `)
        .join(' + ');

    const parametrosPorPalabra = palabrasUnicas.flatMap(palabra => {
        const parametro = `%${palabra}%`;

        return [parametro, parametro, parametro, parametro];
    });

    const parametros = [
        ...parametrosPorPalabra,
        ...parametrosPorPalabra
    ];

    const sql = `
        SELECT
            id,
            numero_articulo,
            capitulo,
            descripcion,
            multa_min_cuotas,
            multa_max_cuotas,
            categoria,
            (${relevancia}) AS relevancia

        FROM articulos
        WHERE ${condiciones}
        ORDER BY relevancia DESC
        LIMIT 10
    `;

    const [rows] = await pool.query(sql, parametros);

    return rows;
}

module.exports = {
    searchArticle
};