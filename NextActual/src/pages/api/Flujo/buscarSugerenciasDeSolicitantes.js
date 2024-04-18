import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function buscarSugerenciasDeSolicitantes(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];
        //console.log('*******solicitantes');

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const nombreIngresado = req.query.nombre;

        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect(dbConfig);
            const result = await pool
                .request()
                .query(`
                    SELECT DISTINCT NOMBREAUTOMATICO_SOLICITANTE
                    FROM Solicitud
                    WHERE NOMBREAUTOMATICO_SOLICITANTE LIKE '%${nombreIngresado}%'
                `);
            sql.close();

            const sugerencias = result.recordset.map((row) => row.NOMBREAUTOMATICO_SOLICITANTE);
            
            // Registrar las sugerencias en la consola antes de enviar la respuesta
            //console.log('Sugerencias devueltas:', sugerencias);
            
            res.status(200).json(sugerencias);
        } catch (error) {
            console.error('Error al obtener sugerencias de Solicitantes:', error);
            res.status(500).json({ error: 'Error al obtener sugerencias de Solicitantes', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}
