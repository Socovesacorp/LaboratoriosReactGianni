import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function buscarSugerenciasDeBeneficiarios(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];
        //console.log('*******beneficiarios');

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
                    SELECT DISTINCT NOMBRE_BENEFICIARIO
                    FROM Solicitud
                    WHERE NOMBRE_BENEFICIARIO LIKE '%${nombreIngresado}%'
                `);
            sql.close();

            const sugerencias = result.recordset.map((row) => row.NOMBRE_BENEFICIARIO);
            
            // Registrar las sugerencias en la consola antes de enviar la respuesta
            //console.log('Sugerencias devueltas:', sugerencias);
            
            res.status(200).json(sugerencias);
        } catch (error) {
            console.error('Error al obtener sugerencias de Beneficiarios:', error);
            res.status(500).json({ error: 'Error al obtener sugerencias de Beneficiarios', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}
