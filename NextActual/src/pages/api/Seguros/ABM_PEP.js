import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function ABM_PEP(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const Accion = req.query.Accion;
        const Proyecto_Id = req.query.Proyecto_Id;
        const Proyecto_PEP = req.query.PEP;
        const Sociedad_Cod = req.query.Sociedad_Cod;
        const Proyecto_Nombre = req.query.Proyecto_Nombre;

        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect(dbConfig);

            let resultado = 1;

            const sociedadIdResult = await pool
                .request()
                .query(`
                    SELECT TOP 1 Sociedad_Id FROM Sociedades WHERE Sociedad_Cod = '${Sociedad_Cod}'
                `);

            const sociedadId = sociedadIdResult.recordset[0]?.Sociedad_Id;

            if (sociedadId === undefined) {
                resultado = 2
            }

            if (Accion == 1 && resultado == 1) {
                await pool
                    .request()
                    .query(`
                        INSERT INTO Proyectos (Sociedad_Id, Proyecto_PEP, Proyecto_Nombre)
                        VALUES ('${sociedadId}', '${Proyecto_PEP}', '${Proyecto_Nombre}')
                    `);
            }

            if (Accion == 2 && resultado == 1) {
                await pool
                    .request()
                    .query(`
                        Update Proyectos Set
                        Sociedad_Id = (SELECT Top 1 Sociedad_Id from Sociedades where Sociedad_Cod = '${Sociedad_Cod}'),
                        Proyecto_Pep = '${Proyecto_PEP}',
                        Proyecto_Nombre = '${Proyecto_Nombre}'
                        WHERE Proyecto_Id = '${Proyecto_Id}'
                    `);
            }

            if (Accion == 3) {
                await pool
                    .request()
                    .query(`
                        DELETE FROM PROYECTOS WHERE Proyecto_Id = '${Proyecto_Id}'
                    `);
            }

            await sql.close();

            res.status(200).json({ resultado });
        } catch (error) {
            console.error('Error en el ABM del PEP:', error);
            res.status(500).json({ error: 'Error en el ABM del PEP:', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}