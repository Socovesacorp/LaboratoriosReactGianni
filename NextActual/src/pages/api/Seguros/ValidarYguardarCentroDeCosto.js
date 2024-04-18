import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function ValidarYguardarCentroDeCosto(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const CentroDeCostoIngresado = req.query.CentroDeCosto;
        const IdExcel = req.query.IdExcel;
        const Descuento1oAporte2 = req.query.Descuento1oAporte2;

        //console.log('CentroDeCostoIngresado:', CentroDeCostoIngresado);
        //console.log('IdExcel:', IdExcel);
        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect(dbConfig);

            let resultado = 0; // Inicializamos el resultado en 0

            const result = await pool
                .request()
                .query(`
                    SELECT 
                        CASE 
                            WHEN COUNT(*) > 0 THEN 1
                            ELSE 999
                        END AS Resultado
                    FROM (
                        SELECT CentroCoste, Denominacion
                        FROM Seguros_TrabajadoresExcel
                        WHERE CentroCoste = '${CentroDeCostoIngresado}'
                        UNION ALL
                        SELECT CentroCoste, Denominacion
                        FROM Seguros_Trabajadores
                        WHERE CentroCoste = '${CentroDeCostoIngresado}'
                    ) AS CombinedResults;
                `);
            

            //const sugerencias = result.recordset.map((row) => row.CentroCoste);
            
            resultado = result.recordset[0].Resultado;
            
            if (resultado === 1) {

                if (Descuento1oAporte2==1){
                    await pool
                    .request()
                    .query(`
                        Insert Into Seguros_TrabajadoresExcel (Estado,Rut,DV,NIF,Nombres,ApellidoPaterno,ApellidoMaterno,CentroCoste,Denominacion,NombreProyecto,CodigoProyecto)
                        Select 'Activo',s.Rut,s.DV,s.NIF,s.Apellido_Nombre,'','','${CentroDeCostoIngresado}',
                            CASE 
                                WHEN (
                                    SELECT TOP 1 a.Denominacion 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                ) IS NULL THEN (
                                    SELECT TOP 1 b.Denominacion
                                    FROM Seguros_Trabajadores AS b 
                                    WHERE b.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                                ELSE (
                                    SELECT TOP 1 a.Denominacion 
                                FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                            END AS Denominacion,
                            CASE 
                                WHEN (
                                    SELECT TOP 1 a.NombreProyecto 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                ) IS NULL THEN (
                                    SELECT TOP 1 b.NombreProyecto
                                    FROM Seguros_Trabajadores AS b 
                                    WHERE b.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                                ELSE (
                                    SELECT TOP 1 a.NombreProyecto 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                            END AS NombreProyecto,
                            CASE 
                                WHEN (
                                    SELECT TOP 1 a.CodigoProyecto 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                ) IS NULL THEN (
                                    SELECT TOP 1 b.CodigoProyecto
                                    FROM Seguros_Trabajadores AS b 
                                    WHERE b.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                                ELSE (
                                    SELECT TOP 1 a.CodigoProyecto 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                            END AS CodigoProyecto

                        from Seguros_DescuentosAlPersonalExcel(nolock) as s where s.DescuentosAlPersonalExcel_ID = ${IdExcel}
                            
                    `);
                }
                if (Descuento1oAporte2==2){
                    await pool
                    .request()
                    .query(`
                        Insert Into Seguros_TrabajadoresExcel (Estado,Rut,DV,NIF,Nombres,ApellidoPaterno,ApellidoMaterno,CentroCoste,Denominacion,NombreProyecto,CodigoProyecto)
                        Select 'Activo',s.Rut_Asegurado,s.DV_Asegurado,s.NIF_Asegurado,(s.[Ape.Paterno] + ' ' + s.Nombres),'','','${CentroDeCostoIngresado}',
                            CASE 
                                WHEN (
                                    SELECT TOP 1 a.Denominacion 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                ) IS NULL THEN (
                                    SELECT TOP 1 b.Denominacion
                                    FROM Seguros_Trabajadores AS b 
                                    WHERE b.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                                ELSE (
                                    SELECT TOP 1 a.Denominacion 
                                FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                            END AS Denominacion,
                            CASE 
                                WHEN (
                                    SELECT TOP 1 a.NombreProyecto 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                ) IS NULL THEN (
                                    SELECT TOP 1 b.NombreProyecto
                                    FROM Seguros_Trabajadores AS b 
                                    WHERE b.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                                ELSE (
                                    SELECT TOP 1 a.NombreProyecto 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                            END AS NombreProyecto,
                            CASE 
                                WHEN (
                                    SELECT TOP 1 a.CodigoProyecto 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                ) IS NULL THEN (
                                    SELECT TOP 1 b.CodigoProyecto
                                    FROM Seguros_Trabajadores AS b 
                                    WHERE b.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                                ELSE (
                                    SELECT TOP 1 a.CodigoProyecto 
                                    FROM Seguros_TrabajadoresExcel(nolock) AS a 
                                    WHERE a.CentroCoste = '${CentroDeCostoIngresado}'
                                )
                            END AS CodigoProyecto

                        from [Seguros_CobroAseguradoraExcel](nolock) as s where s.[CobroAseguradoraExcel_ID] = ${IdExcel}
                            
                    `);
                }
            }
            await sql.close();

            res.status(200).json({ resultado });
        } catch (error) {
            console.error('Error al crear a un trabajador un CentroDeCosto:', error);
            res.status(500).json({ error: 'Error al crear a un trabajador un CentroDeCosto', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}
