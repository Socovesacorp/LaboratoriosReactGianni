//Real...

import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      const decodedToken = verifyToken(token);
      const Cabecera_Id = req.query.Cabecera_Id;
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(`
          Select 
            Sociedad_Cod							                        AS Sociedad_Cod					            ,
            Sociedad_RazonSocial					                    AS Sociedad_RazonSocial			        , 
            [NroTrabajadoresDescuento],
            [TotalDescuentos],
            [NroTrabajadoresCobroAseguradora],
            [TotalCalculadoAseguradora]					              AS TotalCobroAseguradora			      ,
            [TotalCalculadoExentoAseguradora]                 AS TotalExentoCobroAseguradora		  ,
            [TotalCalculadoAfectoAseguradora]                 AS TotalAfectoCobroAseguradora		  ,
            [TotalCalculadoIvaAseguradora]                    AS TotalIvaCobroAseguradora		      ,
            [TotalCalculadoCostoEmpresa]                      AS TotalCalculadoCostoEmpresa       ,
            [TotalFactura]                                    AS TotalFactura                     ,
            [TotalExentoFactura]                              AS TotalExento                      ,
            [TotalAfectoFactura]                              AS TotalAfecto                      ,
            [TotalIvaFactura]                                 AS TotalIva                         ,
            [TotalDiferencia],
            [TotalDiferenciaExento],
            [TotalDiferenciaAfecto],
            [TotalDiferenciaIva],
            [TotalCostoEmpresaFactura],
            [TotalDiferenciaCostoEmpresa]
          From [dbo].[Seguros_DiferenciasSobreLoFacturado]
          WHERE Cabecera_Id = ${Cabecera_Id} 
          Order By Sociedad_Cod , Sociedad_RazonSocial
      `);
      sql.close();
      //console.log('***Resultado de la consulta ObtenerSociedadesFacturadasExcel.js :', result.recordset);
      console.log('ObtenerSociedadesFacturadasH.js')
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de ObtenerSociedadesFacturadasH:', error);
      res.status(500).json({ error: '***Error al obtener valores de ObtenerSociedadesFacturadasH', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
