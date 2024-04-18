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
            Estado               , 
            NIF                  , 
            Nombres              , 
            ApellidoPaterno      , 
            ApellidoMaterno      ,  
            CentroCoste          , 
            Denominacion         ,
            NombreProyecto       ,
            CodigoProyecto  
          } = record;

          nom = record.Nombres;
          ape = record.ApellidoPaterno;
          // Si Denominacion es "Sistema UNO", establecer CentroCoste como NombreProyecto
          const adjustedCentroCoste = Denominacion === "Sistema UNO" ? NombreProyecto : CentroCoste;
          //console.log('*** Registro Recibido desde SubirSolicitudes.js :', record.CENTRO_DE_COSTO);
          if (record.NIF.trim() !== "") {
            // Realizar la inserción
            const insertQuery = `
              INSERT INTO Seguros_TrabajadoresExcel (
              Estado,
              Rut,
              DV,
              NIF,
              Nombres,
              ApellidoPaterno,
              ApellidoMaterno,
              CentroCoste,
              Denominacion,
              NombreProyecto,
              CodigoProyecto
              )
              VALUES (
              @Estado,
              (SUBSTRING(REPLACE(REPLACE(@NIF, '.', ''), '-', ''),1,len(REPLACE(REPLACE(@NIF, '.', ''), '-', ''))-1)),
              (SUBSTRING(@NIF, LEN(@NIF), 1)),
              @NIF,
              @Nombres,
              @ApellidoPaterno,
              @ApellidoMaterno,
              @CentroCoste,
              @Denominacion,
              @NombreProyecto,
              @CodigoProyecto
              );
            `;
          
            await transaction.request()
              .input('Estado'                    ,sql.VarChar(20),         Estado                  )
              .input('NIF'                       ,sql.VarChar(20),         NIF                     )
              .input('Nombres'                   ,sql.VarChar(200),        Nombres                 )
              .input('ApellidoPaterno'           ,sql.VarChar(200),        ApellidoPaterno         )
              .input('ApellidoMaterno'           ,sql.VarChar(200),        ApellidoMaterno         )
              .input('CentroCoste'               ,sql.VarChar(200),        adjustedCentroCoste     )
              .input('Denominacion'              ,sql.VarChar(200),        Denominacion            )
              .input('NombreProyecto'            ,sql.VarChar(200),        NombreProyecto          )
              .input('CodigoProyecto'            ,sql.VarChar(20),         CodigoProyecto          )

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
        console.error('Error al insertar registros Trabajadores Excel:'+nom + ape, error);
        res.status(500).json({ error: 'al insertar registros Trabajadores Excel*'+nom + ape, details: error.message });
      }
    } catch (error) {
      console.error('33Error al insertar registros:'+nom + ape, error);
      res.status(500).json({ error: '44Error al insertar registros'+nom + ape, details: error.message });
    }
  } else {
    console.error('se encontró un error')
    res.status(405).end();
  }
}

