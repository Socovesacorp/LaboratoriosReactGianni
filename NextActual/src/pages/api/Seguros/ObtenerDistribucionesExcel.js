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

      const pool = await sql.connect({
        ...dbConfig,
        requestTimeout: 300000 // 300 segundos
    });
    const transaction = pool.transaction();
    await transaction.begin();
    await transaction.request().query("SET LOCK_TIMEOUT 180000")

    const result = await transaction.request().query(`

    /*Antes sólo tenía este código:
          Select 
		        Id2 as Id,
            Sociedad_Cod,
            Sociedad_RazonSocial, 
			      CentroCoste,
			      Denominacion,
            NroTrabajadoresDescuento,
            TotalDescuentos,
            NroTrabajadoresCobroAseguradora,
            TotalCobroAseguradora,
            TotalExentoCobroAseguradora,
            TotalAfectoCobroAseguradora,
            TotalIvaCobroAseguradora,
            CostoEmpresa,
            CASE 
                WHEN CentroCoste = 'PEP NO ENCONTRADO' THEN 'No'
                WHEN CentroCoste = 'TRABAJADOR NO ENCONTRADO' THEN 'No'
                ELSE 'Si'
            END AS Existe
          From AnalisisGlobalConTotalExcel 
          Order By Id2
          el cual se sustituyó con el siguiente: */

      WITH CTE_AnalisisGlobal AS (
        SELECT 
            ROW_NUMBER() OVER (ORDER BY Sociedad_Cod, Sociedad_RazonSocial, CentroCoste, Denominacion) AS Id,
            Sociedad_Cod,
            Sociedad_RazonSocial,
            CentroCoste,
            Denominacion,
            COALESCE(Sum(NroTrabajadoresDescuento), 0) AS NroTrabajadoresDescuento,
            COALESCE(Sum(TotalDescuentos), 0) AS TotalDescuentos,
            COALESCE(Sum(NroTrabajadoresCobroAseguradora), 0) AS NroTrabajadoresCobroAseguradora,
            COALESCE(Sum(TotalCobroAseguradora), 0) AS TotalCobroAseguradora,
            COALESCE(Sum(TotalExentoCobroAseguradora), 0) AS TotalExentoCobroAseguradora,
            COALESCE(Sum(TotalAfectoCobroAseguradora), 0) AS TotalAfectoCobroAseguradora,
            COALESCE(Sum(TotalIvaCobroAseguradora), 0) AS TotalIvaCobroAseguradora,
            COALESCE(Sum(CostoEmpresa), 0) AS CostoEmpresa,
            CASE 
                WHEN CentroCoste = 'PEP NO ENCONTRADO' THEN 'No'
                WHEN CentroCoste = 'TRABAJADOR NO ENCONTRADO' THEN 'No'
                ELSE 'Si'
            END AS Existe
        FROM 
            AnalisisGlobalSinTotalExcel 
        GROUP BY 
            Sociedad_Cod, Sociedad_RazonSocial, CentroCoste, Denominacion
    ),
    CTE_Total AS (
        SELECT 
            995  /*ROW_NUMBER() OVER (ORDER BY Sociedad_Cod, Sociedad_RazonSocial) + (SELECT MAX(Id) FROM CTE_AnalisisGlobal)*/ AS Id,
            Sociedad_Cod,
            Sociedad_RazonSocial,
            'TOTAL' AS CentroCoste,
            '' AS Denominacion,
            COALESCE(Sum(NroTrabajadoresDescuento), 0) AS NroTrabajadoresDescuento,
            COALESCE(Sum(TotalDescuentos), 0) AS TotalDescuentos,
            COALESCE(Sum(NroTrabajadoresCobroAseguradora), 0) AS NroTrabajadoresCobroAseguradora,
            COALESCE(Sum(TotalCobroAseguradora), 0) AS TotalCobroAseguradora,
            COALESCE(Sum(TotalExentoCobroAseguradora), 0) AS TotalExentoCobroAseguradora,
            COALESCE(Sum(TotalAfectoCobroAseguradora), 0) AS TotalAfectoCobroAseguradora,
            COALESCE(Sum(TotalIvaCobroAseguradora), 0) AS TotalIvaCobroAseguradora,
            COALESCE(Sum(CostoEmpresa), 0) AS CostoEmpresa,
            '' AS Existe
        FROM 
            AnalisisGlobalSinTotalExcel
        GROUP BY 
            Sociedad_Cod, Sociedad_RazonSocial
    ),
    CTE_FACTURA AS (
        SELECT 
            996 /*ROW_NUMBER() OVER (ORDER BY Sociedades.Sociedad_Cod, Sociedades.Sociedad_RazonSocial) + (SELECT MAX(Id) FROM CTE_Total)*/ AS Id,
            Sociedades.Sociedad_Cod,
            Sociedades.Sociedad_RazonSocial,
            'FACTURA' AS CentroCoste,
            '' AS Denominacion,
            0 AS NroTrabajadoresDescuento,
            0 AS TotalDescuentos,
            0 AS NroTrabajadoresCobroAseguradora,
            Factura_Total AS TotalCobroAseguradora,
            Factura_Exento AS TotalExentoCobroAseguradora,
            Factura_Neto AS TotalAfectoCobroAseguradora,
            Factura_Iva AS TotalIvaCobroAseguradora,
            (SELECT Factura_Total - CTE_Total.TotalDescuentos FROM CTE_Total WHERE CTE_Total.Sociedad_Cod = Sociedades.Sociedad_Cod AND CTE_Total.CentroCoste = 'TOTAL') AS CostoEmpresa,
            '' AS Existe
        FROM 
            Seguros_FacturasExcel, Sociedades 
      Where Seguros_FacturasExcel.Sociedad_RutN = Sociedades.Sociedad_Rut
    ),
    CTE_DIFERENCIA AS (
        SELECT 
            997 /*ROW_NUMBER() OVER (ORDER BY Sociedades.Sociedad_Cod, Sociedades.Sociedad_RazonSocial) +  (SELECT MAX(Id) FROM CTE_FACTURA)*/ AS Id,
            Sociedades.Sociedad_Cod,
            Sociedades.Sociedad_RazonSocial,
            'DIFERENCIA' AS CentroCoste,
            '' AS Denominacion,
            0 AS NroTrabajadoresDescuento,
            0 AS TotalDescuentos,
            0 AS NroTrabajadoresCobroAseguradora,
            CTE_Total.TotalCobroAseguradora - Factura_Total  AS TotalCobroAseguradora,
            CTE_Total.TotalExentoCobroAseguradora - Factura_Exento AS TotalExentoCobroAseguradora,
            CTE_Total.TotalAfectoCobroAseguradora - Factura_Neto AS TotalAfectoCobroAseguradora,
            CTE_Total.TotalIvaCobroAseguradora - Factura_Iva  AS TotalIvaCobroAseguradora,
            (SELECT CTE_Total.CostoEmpresa - CTE_FACTURA.CostoEmpresa FROM CTE_FACTURA WHERE CTE_FACTURA.Sociedad_Cod = Sociedades.Sociedad_Cod AND CTE_FACTURA.CentroCoste = 'FACTURA') AS CostoEmpresa,
            '' AS Existe
        FROM 
            Seguros_FacturasExcel, Sociedades , CTE_Total
      Where Seguros_FacturasExcel.Sociedad_RutN = Sociedades.Sociedad_Rut AND
      CTE_Total.CentroCoste = 'TOTAL' AND
      CTE_Total.Sociedad_Cod = Sociedades.Sociedad_Cod 
    ),
    CTE_ConId2 AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (ORDER BY Sociedad_Cod, Sociedad_RazonSocial, Id) AS RowNumber
        FROM 
            (
                SELECT * FROM CTE_AnalisisGlobal
                UNION ALL
                SELECT * FROM CTE_Total
          UNION ALL
          SELECT * FROM CTE_FACTURA
          UNION ALL
          SELECT * FROM CTE_DIFERENCIA
            ) AS UnionData
    )
    SELECT 
      RowNumber AS Id,
        Sociedad_Cod,
        Sociedad_RazonSocial,
        CentroCoste,
        Denominacion,
        NroTrabajadoresDescuento,
        TotalDescuentos,
        NroTrabajadoresCobroAseguradora,
        TotalCobroAseguradora,
        TotalExentoCobroAseguradora,
        TotalAfectoCobroAseguradora,
        TotalIvaCobroAseguradora,
        CostoEmpresa,
        CASE 
            WHEN CentroCoste = 'PEP NO ENCONTRADO' THEN 'No'
            WHEN CentroCoste = 'TRABAJADOR NO ENCONTRADO' THEN 'No'
            ELSE 'Si'
        END AS Existe
    FROM 
        CTE_ConId2
      `);
      await transaction.commit();
            await sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSociedadesFacturadasExcel.js :', result.recordset);
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de ObtenerDistribucionesExcel:', error);
      res.status(500).json({ error: '***Error al obtener valores de ObtenerDistribucionesExcel', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
