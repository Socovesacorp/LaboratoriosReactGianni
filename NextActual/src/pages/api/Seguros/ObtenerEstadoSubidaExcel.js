import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function ObtenerEstadoSubidaTrabajadores(req, res) {
    if (req.method === 'GET') {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        let ResultadoBusqueda = '';
        try {
            const decodedToken = verifyToken(token);

            const pool = await sql.connect(dbConfig);


            const result = await pool
                .request()
                .query(`
                    select Count(1) as SubidaTrabajadores from Seguros_TrabajadoresExcel(nolock);
                    select Count(1) as SubidaDescuentosTrabajadores from DescuentosAlPersonalExcel_Existe Where Existe = 'No';
                    select Count(1) as TotalSubidasDescuentos from DescuentosAlPersonalExcel_Existe;
                    select Count(1) as SubidaCobrosError from CobroAseguradoraExcel_Existe Where Existe = 'No';
                    select Count(1) as TotalSubidasAseguradora from CobroAseguradoraExcel_Existe;

                    select Count(1) as TotalGral from AnalisisGlobalSinTotalExcel;
                    Select Count(1) as TotalTrabNoEncontrado From AnalisisGlobalSinTotalExcel where CentroCoste='TRABAJADOR NO ENCONTRADO';
                    Select Count(1) as PepNoEncontrado From AnalisisGlobalSinTotalExcel where CentroCoste='PEP NO ENCONTRADO'
                    Select Count(1) as FacturasSubidas From Seguros_FacturasExcel

                    SELECT COUNT(1) AS SociedadesDistribuidas FROM ( Select Sociedad_Cod , Sociedad_RazonSocial FROM AnalisisGlobalSinTotalExcel GROUP BY Sociedad_Cod, Sociedad_RazonSocial ) as TablaPaso 
                `);
                //console.log('SubidaCobrosAseguradoraResult:', result.recordsets[3]);
                //console.log('TotalSubidasAseguradoraResult:', result.recordsets[4]);
                //console.log('TotalGralResult:', result.recordsets[5]);
            sql.close();

            const [subidaTrabajadoresResult, subidaDescuentosResult, TotalSubidasDescuentosResult, SubidaCobrosErrorResult, TotalSubidasAseguradoraResult, TotalGralResult, TotalTrabNoEncontradoResult, PepNoEncontradoResult, FacturasSubidasResult, SociedadesDistribuidasResult] = result.recordsets;
            const response = {
                SubidaTrabajadores: subidaTrabajadoresResult[0].SubidaTrabajadores > 0 ? 1 : 0,
                SubidaDescuentosTrabajadores: subidaDescuentosResult[0].SubidaDescuentosTrabajadores === 0 && TotalSubidasDescuentosResult[0].TotalSubidasDescuentos > 0 && TotalGralResult[0].TotalGral>0 && TotalTrabNoEncontradoResult[0].TotalTrabNoEncontrado === 0 ? 1 : 0,
                SubidaCobroAseguradora: TotalSubidasAseguradoraResult[0].TotalSubidasAseguradora > 0 && SubidaCobrosErrorResult[0].SubidaCobrosError === 0 ? 1 : 0,
                FacturadoValido: FacturasSubidasResult[0].FacturasSubidas === SociedadesDistribuidasResult[0].SociedadesDistribuidas ? 1 : 0,
                DistribucionValido: TotalGralResult[0].TotalGral>0 && TotalTrabNoEncontradoResult[0].TotalTrabNoEncontrado === 0 && PepNoEncontradoResult[0].PepNoEncontrado === 0 ?  1 : 0
            };
            //console.log('response:', response);
            res.status(200).json(response);
        } catch (error) {
            console.error('Error al obtener ResultadoBusqueda de ObtenerEstadoSubidaExcel:', error);
            res.status(500).json({ error: 'Error ResultadoBusqueda de ObtenerEstadoSubidaExcel', details: error.message });
        }
    } else {
        res.status(405).end();
    }
}
