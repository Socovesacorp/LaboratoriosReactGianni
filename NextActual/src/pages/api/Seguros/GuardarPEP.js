import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function GuardarPEP(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const PEP = req.query.PEP;
        const Sociedad_Cod = req.query.Sociedad_Cod;
        const Proyecto_Nombre = req.query.Proyecto_Nombre;

        //console.log('CentroDeCostoIngresado:', CentroDeCostoIngresado);
        //console.log('IdExcel:', IdExcel);
        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect(dbConfig);

            let resultado = 1; 

      
            await pool
            .request()
            .query(`
                INSERT INTO Proyectos (Sociedad_Id, Proyecto_Pep, Proyecto_Nombre)
                SELECT Sociedad_Id , '${PEP}' AS Proyecto_Pep , '${Proyecto_Nombre}' AS Proyecto_Nombre FROM Sociedades(nolock) where Sociedad_Cod = '${Sociedad_Cod}'
            `);
               
            await sql.close();

            res.status(200).json({ resultado });
        } catch (error) {
            console.error('Error al crear un PEP:', error);
            res.status(500).json({ error: 'Error al crear a un PEP: **', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}
