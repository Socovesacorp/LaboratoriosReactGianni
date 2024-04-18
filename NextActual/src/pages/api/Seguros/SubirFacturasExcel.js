//Real...

import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function handler(req, res) {

  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }

      const decodedToken = verifyToken(token);

      const recordsToInsert = req.body; // Recibe una colección de registros

      const pool = await sql.connect(dbConfig);

      // Declarar la variable transaction fuera del bloque try
      const transaction = pool.transaction();

      try {
        // Iniciar la transacción
        await transaction.begin();
        await transaction.request().query("SET LOCK_TIMEOUT 180000")
      
        for (const record of recordsToInsert) {
          const { 
            Rut,
            Empresa,
            RutN,  
            DVc,
            Factura,
            ExentoN,
            NetoN,
            IvaN,
            TotalN
          } = record;

          //console.log('*** Registro Recibido desde SubirFacturasExcel.js :', record.Rut);
          //console.log('*** Registro Recibido desde SubirFacturasExcel.js :', record.TotalN);
          if (record.TotalN > 0 && record.RutN > 0) {
            //console.log('*** pase!!!!! :', record.Rut);
            // Realizar la inserción
            const insertQuery = `
              INSERT INTO Seguros_FacturasExcel (
              Sociedad_Rut,
              Sociedad_RazonSocial,
              Sociedad_RutN,
              Sociedad_Dv,
              Factura_Nro,
              Factura_Exento,
              Factura_Neto,
              Factura_Iva,
              Factura_Total,
              Sociedad_Id
              )
              VALUES (
              @Rut,
              @Empresa,
              @RutN,
              @DVc,
              @Factura,
              @ExentoN,
              @NetoN,
              @IvaN,
              @TotalN,
              (SELECT Sociedad_Id FROM Sociedades WHERE Sociedad_Rut = @RutN)
              );
            `;
          
            await transaction.request()
              .input('Rut'                    ,sql.VarChar(20),          Rut         )
              .input('Empresa'                ,sql.VarChar(100),         Empresa     )
              .input('RutN'                   ,sql.Numeric(18,0),        RutN        )
              .input('DVc'                    ,sql.VarChar(1),           DVc         )
              .input('Factura'                ,sql.Numeric(18,0),        Factura     )
              .input('ExentoN'                ,sql.Numeric(18,0),        ExentoN     )
              .input('NetoN'                  ,sql.Numeric(18,0),        NetoN       )
              .input('IvaN'                   ,sql.Numeric(18,0),        IvaN        )
              .input('TotalN'                 ,sql.Numeric(18,0),        TotalN      )

              .query(insertQuery);
            }
          }
      
          // Hacer commit de la transacción
          await transaction.commit();
          //console.log('Se han subido de a 100 registros como tope a la vez.')
          sql.close();

          res.status(201).json({ message: 'Registros insertados o actualizados correctamente' });
      } catch (error) {
        // Si hay un error, hacer rollback de la transacción
        await transaction.rollback();
        console.error('Error al insertar registros Facturas Excel: ', error);
        res.status(500).json({ error: 'al insertar registros Facturas Excel* ', details: error.message });
      }
    } catch (error) {
      console.error('33Error al insertar registros:', error);
      res.status(500).json({ error: '44Error al insertar registros ', details: error.message });
    }
  } else {
    console.error('se encontró un error')
    res.status(405).end();
  }
}

