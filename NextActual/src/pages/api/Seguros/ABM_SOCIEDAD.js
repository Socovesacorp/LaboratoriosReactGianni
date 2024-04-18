import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function ABM_SOCIEDAD(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const Accion = req.query.Accion;
        const Sociedad_Id = req.query.Sociedad_Id;
        const Sociedad_Cod = req.query.Sociedad_Cod;
        const Sociedad_RazonSocial = req.query.Sociedad_RazonSocial;
        const Sociedad_Rut = req.query.Sociedad_Rut;
        const Sociedad_Dv = req.query.Sociedad_Dv;
        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect(dbConfig);

            let resultado = 1;

            const sociedadIdResult = await pool
                .request()
                .query(`
                    IF ('1' = '${Accion}') BEGIN
                        SELECT TOP 1 Sociedad_Id FROM Sociedades WHERE Sociedad_Cod = '${Sociedad_Cod}'
                    END
                    IF (2 = '${Accion}') BEGIN
                        SELECT TOP 1 Sociedad_Id FROM Sociedades WHERE Sociedad_Cod = '${Sociedad_Cod}' AND Sociedad_Id <> '${Sociedad_Id}' 
                    END
                    IF (3 = '${Accion}') BEGIN
                        SELECT TOP 1 Sociedad_Id FROM Sociedades WHERE Sociedad_Cod = '${Sociedad_Cod}' AND Sociedad_Id = '${Sociedad_Id}' 
                    END
                `);

            const sociedadId = sociedadIdResult.recordset[0]?.Sociedad_Id;

            if (( (Accion == 1) || (Accion == 2)) && sociedadId !== undefined) {
                resultado = 2
            }

            if (Accion == 3 && sociedadId == undefined) {
                resultado = 3
            }

            if (Accion == 1 ) {
                await pool
                    .request()
                    .query(`
                        INSERT INTO Sociedades (Sociedad_Cod, Sociedad_RazonSocial, Sociedad_Rut, Sociedad_Dv)
                        VALUES ('${Sociedad_Cod}','${Sociedad_RazonSocial}','${Sociedad_Rut}','${Sociedad_Dv}')
                    `);
            }

            if (Accion == 2 && resultado == 1) {
                await pool
                    .request()
                    .query(`
                        Update Sociedades Set
                        Sociedad_Cod = '${Sociedad_Cod}',
                        Sociedad_RazonSocial = '${Sociedad_RazonSocial}',
                        Sociedad_Rut = '${Sociedad_Rut}',
                        Sociedad_Dv = '${Sociedad_Dv}'
                        WHERE Sociedad_Id = '${Sociedad_Id}'
                    `);
            }

            if (Accion == 3 && resultado == 1) {
                await pool
                    .request()
                    .query(`
                        DELETE FROM SOCIEDADES WHERE Sociedad_ID = '${Sociedad_Id}'
                    `);
            }

            await sql.close();

            res.status(200).json({ resultado });
        } catch (error) {
            console.error('Error en el ABM de las Sociedades:', error);
            res.status(500).json({ error: 'Error en el ABM de las Sociedades:', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}