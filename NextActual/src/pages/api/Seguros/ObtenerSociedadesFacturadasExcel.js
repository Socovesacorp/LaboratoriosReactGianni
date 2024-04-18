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

      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(`
          Select 
            s.Sociedad_Cod							                      AS Sociedad_Cod					            ,
            s.Sociedad_RazonSocial					                  AS Sociedad_RazonSocial			        , 
            COALESCE(Sum(NroTrabajadoresDescuento),0)			    AS NroTrabajadoresDescuento		      ,
            COALESCE(Sum(TotalDescuentos),0)					        AS TotalDescuentos					        ,
            COALESCE(Sum(NroTrabajadoresCobroAseguradora),0)	AS NroTrabajadoresCobroAseguradora	,
            COALESCE(Sum(TotalCobroAseguradora),0)					  AS TotalCobroAseguradora			      ,
            COALESCE(Sum(TotalExentoCobroAseguradora),0)			AS TotalExentoCobroAseguradora		  ,
            COALESCE(Sum(TotalAfectoCobroAseguradora),0)			AS TotalAfectoCobroAseguradora		  ,
            COALESCE(Sum(TotalIvaCobroAseguradora),0)				  AS TotalIvaCobroAseguradora		      ,
            COALESCE(Sum(CostoEmpresa),0)	 						        AS CostoEmpresa                     ,
            COALESCE((select Factura_Total from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)                                               AS TotalFactura,
            COALESCE((select Factura_Exento from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)                                               AS TotalExento,
            COALESCE((select Factura_Neto from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)                                               AS TotalAfecto,
            COALESCE((select Factura_Iva from Seguros_FacturasExcel , SOCIEDADES where Sociedad_RutN = Sociedades.Sociedad_Rut AND SOCIEDAD_COD = s.Sociedad_Cod  ),0)                                               AS TotalIva
          From AnalisisGlobalSinTotalExcel as s
          Group By s.Sociedad_Cod , s.Sociedad_RazonSocial 
          Order By s.Sociedad_Cod , s.Sociedad_RazonSocial
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSociedadesFacturadasExcel.js :', result.recordset);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de ObtenerSociedadesFacturadasExcel:', error);
      res.status(500).json({ error: '***Error al obtener valores de ObtenerSociedadesFacturadasExcel', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
