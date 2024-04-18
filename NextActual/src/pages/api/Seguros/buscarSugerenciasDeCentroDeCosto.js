import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function buscarSugerenciasDeCentroDeCosto(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const CentroDeCostoIngresado = req.query.CentroDeCosto;
        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect(dbConfig);
            const result = await pool
                .request()
                .query(`
                    SELECT DISTINCT 
                        CASE 
                            WHEN Denominacion = 'Sistema UNO' THEN CONCAT('(', Denominacion, ') - ', CentroCoste)
                            ELSE CONCAT(CentroCoste, ' - (', Denominacion, ')')
                        END AS CentroCosteDenominacion,
                        CentroCoste,
                        CASE 
                            WHEN Denominacion = 'Sistema UNO' THEN 1
                            ELSE 0
                        END AS SortOrder
                    FROM (
                        SELECT CentroCoste, Denominacion
                        FROM Seguros_TrabajadoresExcel
                        WHERE CONCAT(CentroCoste, ' - (', Denominacion, ')') LIKE '%${CentroDeCostoIngresado}%'
                        UNION ALL
                        SELECT CentroCoste, Denominacion
                        FROM Seguros_Trabajadores
                        WHERE CONCAT(CentroCoste, ' - (', Denominacion, ')') LIKE '%${CentroDeCostoIngresado}%'
                    ) AS CombinedResults
                    ORDER BY SortOrder, CentroCosteDenominacion;
                `);
            sql.close();

            //const sugerencias = result.recordset.map((row) => row.CentroCoste);
            
            const sugerencias = result.recordset.map((row) => ({
                CentroCoste: row.CentroCoste,
                CentroCosteDenominacion: row.CentroCosteDenominacion,
            }));
            
            res.status(200).json(sugerencias);
        } catch (error) {
            console.error('Error al obtener sugerencias de CentroDeCosto:', error);
            res.status(500).json({ error: 'Error al obtener sugerencias de CentroDeCosto', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}
