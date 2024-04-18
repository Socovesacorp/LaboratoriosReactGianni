import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function ObtenerEmpresaYnombreDadoIDexcel(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const IdIngresado = req.query.ID;
        const Descuento1oAporte2 = req.query.Descuento1oAporte2;
        let ResultadoBusqueda = '';
        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect(dbConfig);

            if (Descuento1oAporte2==1) {
                const result = await pool
                    .request()
                    .query(`
                        SELECT Apellido_Nombre , NombreEmpresa , Sociedad
                        FROM Seguros_DescuentosAlPersonalExcel
                        WHERE DescuentosAlPersonalExcel_ID = ${IdIngresado}
                    `);
                sql.close();

                //const sugerencias = result.recordset.map((row) => row.CentroCoste);
                
                ResultadoBusqueda = result.recordset.map((row) => ({
                    Apellido_Nombre: row.Apellido_Nombre,
                    NombreEmpresa: row.NombreEmpresa,
                    Sociedad: row.Sociedad
                }));


            }
            if (Descuento1oAporte2==2) {
                const result = await pool
                    .request()
                    .query(`
                        SELECT ([Ape.Paterno] + ' ' + Nombres) as Apellido_Nombre , ContratantePrincipal as NombreEmpresa , (Select Sociedades.Sociedad_Cod From Sociedades Where Sociedades.Sociedad_Rut =Seguros_CobroAseguradoraExcel.RutEmpresa ) as Sociedad
                        FROM Seguros_CobroAseguradoraExcel
                        WHERE CobroAseguradoraExcel_ID = ${IdIngresado}
                    `);
                sql.close();

                //const sugerencias = result.recordset.map((row) => row.CentroCoste);
                
                ResultadoBusqueda = result.recordset.map((row) => ({
                    Apellido_Nombre: row.Apellido_Nombre,
                    NombreEmpresa: row.NombreEmpresa,
                    Sociedad: row.Sociedad
                }));
            }



            
            
            res.status(200).json(ResultadoBusqueda);
        } catch (error) {
            console.error('Error al obtener ResultadoBusqueda de un ID de ObtenerEmpresaYnombreDadoIDexcel:', error);
            res.status(500).json({ error: 'Error ResultadoBusqueda de un ID de ObtenerEmpresaYnombreDadoIDexcel', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}
