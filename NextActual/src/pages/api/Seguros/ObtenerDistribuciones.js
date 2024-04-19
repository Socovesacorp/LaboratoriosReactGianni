//Real...

import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];
    const Cabecera_Id = req.query.Cabecera_Id;
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
      const decodedToken = verifyToken(token);

      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(`
      Select 
		        [LoDistribuido_Id] as Id,
            Sociedad_Cod,
            Sociedad_RazonSocial, 
			      CentroCoste,
			      Denominacion,
            NroTrabajadoresDescuento,
            TotalDescuentos,
            NroTrabajadoresCobroAseguradora,
            [TotalAseguradora] AS TotalCobroAseguradora,
            [TotalExentoAseguradora] AS TotalExentoCobroAseguradora,
            [TotalAfectoAseguradora] AS TotalAfectoCobroAseguradora,
            [TotalIvaAseguradora] AS TotalIvaCobroAseguradora,
            [TotalCostoEmpresa] AS CostoEmpresa,
            CASE 
                WHEN CentroCoste = 'PEP NO ENCONTRADO' THEN 'No'
                WHEN CentroCoste = 'TRABAJADOR NO ENCONTRADO' THEN 'No'
                ELSE 'Si'
            END AS Existe
          From [Seguros_DiferenciasSobreLoDistribuido]
WHERE Cabecera_Id = ${Cabecera_Id} 
          Order By LoDistribuido_Id
      `);
      sql.close();
      // Imprimir los datos en la consola del servidor
      //console.log('***Resultado de la consulta ObtenerSociedadesFacturadasExcel.js :', result.recordset);
      console.log('ObtenerDistribuciones.js')
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error('Error al obtener valores de ObtenerDistribuciones:', error);
      res.status(500).json({ error: '***Error al obtener valores de ObtenerDistribuciones', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
