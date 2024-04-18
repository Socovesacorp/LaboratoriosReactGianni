//Real...

import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function handler(req, res) {
  let nom = null;
  let ape = null;
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
            NIF                  , 
            Apellido_Nombre      , 
            Sociedad             , 
            NombreEmpresa        ,  
            CentroCoste          , 
            Denominacion         ,
            Periodo              ,
            TipoSeguro           ,
            Importe  
          } = record;

          nom = record.Apellido_Nombre;
          //console.log('*** Registro Recibido desde SubirSolicitudes.js :', record.CENTRO_DE_COSTO);
          if (record.NIF.trim() !== "") {
            // Realizar la inserción
            const insertQuery = `
              INSERT INTO Seguros_DescuentosAlPersonalExcel (
              Rut,
              DV,
              NIF,
              Apellido_Nombre,
              Sociedad,
              NombreEmpresa,
              CentroCoste,
              Denominacion,
              Periodo,
              TipoSeguro,
              Importe
              )
              VALUES (
              (SUBSTRING(REPLACE(REPLACE(@NIF, '.', ''), '-', ''),1,len(REPLACE(REPLACE(@NIF, '.', ''), '-', ''))-1)),
              (SUBSTRING(@NIF, LEN(@NIF), 1)),
              @NIF,
              @Apellido_Nombre,
              @Sociedad,
              @NombreEmpresa,
              @CentroCoste,
              @Denominacion,
              @Periodo,
              @TipoSeguro,
              @Importe
              );
            `;
          
            await transaction.request()
              .input('NIF'                       ,sql.VarChar(20),         NIF                     )
              .input('Apellido_Nombre'           ,sql.VarChar(200),        Apellido_Nombre         )
              .input('Sociedad'                  ,sql.Numeric(18,0),       Sociedad                )
              .input('NombreEmpresa'             ,sql.VarChar(200),        NombreEmpresa           )
              .input('CentroCoste'               ,sql.VarChar(40),         CentroCoste             )
              .input('Denominacion'              ,sql.VarChar(200),        Denominacion            )
              .input('Periodo'                   ,sql.VarChar(6),          Periodo                 )
              .input('TipoSeguro'                ,sql.VarChar(200),        TipoSeguro              )
              .input('Importe'                   ,sql.Decimal(18,0),       Importe                 )
              .query(insertQuery);
            }
          }
      
          // Hacer commit de la transacción
          await transaction.commit();
          //console.log('Se han subido de a 100 registros como tope a la vez.')
          sql.close();

          res.status(201).json({ message: 'Registros insertados correctamente' });
      } catch (error) {
        // Si hay un error, hacer rollback de la transacción
        await transaction.rollback();
        console.error('Error al insertar registros Descuentos Excel: '+nom , error);
        res.status(500).json({ error: 'al insertar registros Descuentos Excel* '+nom , details: error.message });
      }
    } catch (error) {
      console.error('33Error al insertar registros: '+nom , error);
      res.status(500).json({ error: '44Error al insertar registros: ' +nom , details: error.message });
    }
  } else {
    console.error('se encontró un error')
    res.status(405).end();
  }
}

