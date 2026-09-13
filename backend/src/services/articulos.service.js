const pool = require('../db/connection');

async function searchArticle(termino) {
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
        
        WHERE numero_articulo LIKE ?
           OR capitulo LIKE ?
           OR descripcion LIKE ?
           OR categoria LIKE ?
        LIMIT 10
    `;

    const parametro = `%${termino}%`;

    const [rows] = await pool.query(sql, [
        parametro,
        parametro,
        parametro,
        parametro
    ]);

    return rows;
}

module.exports = {
    searchArticle
};