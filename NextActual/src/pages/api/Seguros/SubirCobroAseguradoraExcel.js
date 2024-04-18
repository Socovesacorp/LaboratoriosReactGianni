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
            Contratante_Principal                 , 
            RutTrabajadorSinDV                    , 
            DVTrabajador                          , 
            Periodo                               ,  
            Nombres                               , 
            ApePaterno                            ,
            ApeMaterno                            ,
            RutEmpresa                            ,
            DVEmpresa                             ,
            TipoAseg                              ,
            Total                                 ,
            TotalUF                               ,
            Exento                                ,
            Afecto                                ,
            Iva                                   
          } = record;

          nom = record.RutTrabajadorSinDV;
          //console.log('*** Rut trabajador recibido desde SubirCobroAseguradoraExcel.js :', record.RutTrabajadorSinDV);
          //console.log('                                                              Total$   :', record.Total);
          //console.log('                                                              TOTALUF  :', record.TotalUF);
          //console.log('                                                              ExentoUF :', record.Exento);
          //console.log('                                                              AfectoUF :', record.Afecto);
          //console.log('                                                              IvaUF :'   , record.Iva);
          if (record.RutTrabajadorSinDV>999999) {
            // Realizar la inserción
            const insertQuery = `
              INSERT INTO Seguros_CobroAseguradoraExcel (
                ContratantePrincipal,
                Rut_Asegurado,
                DV_Asegurado,
                NIF_Asegurado,
                Periodo,
                Nombres,
                [Ape.Paterno],
                [Ape.Materno],
                RutEmpresa,
                DVEmpresa,
                TipoAseg,
                Total,
                Exento,
                Afecto,
                Iva
              )
              VALUES (
              @Contratante_Principal,
              @RutTrabajadorSinDV,
              @DVTrabajador,
              CASE 
                WHEN LEN(@RutTrabajadorSinDV) = 7 THEN STUFF(STUFF(FORMAT(@RutTrabajadorSinDV, '00000000'), 6, 0, '.'), 3, 0, '.') + '-' + @DVTrabajador
                WHEN LEN(@RutTrabajadorSinDV) = 8 THEN STUFF(STUFF(FORMAT(@RutTrabajadorSinDV, '00000000'), 6, 0, '.'), 3, 0, '.') + '-' + @DVTrabajador
                WHEN LEN(@RutTrabajadorSinDV) = 9 THEN STUFF(STUFF(FORMAT(@RutTrabajadorSinDV, '000000000'), 7, 0, '.'), 4, 0, '.') + '-' + @DVTrabajador
              END,
              @Periodo,
              @Nombres,
              @ApePaterno,
              @ApeMaterno,
              @RutEmpresa,
              @DVEmpresa,
              @TipoAseg,
              @Total,

              --Calculo EXENTO...
              CASE 
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) > 0 THEN @Total - Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Iva,8),0) - Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Afecto,8),0)
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) = 0 THEN @Total
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) > 0 THEN @Total - Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Iva,8),0)
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) = 0 THEN @Total - Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Afecto,8),0)

                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) = 0 THEN 0
                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) > 0 THEN 0
                
                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) > 0 THEN 0
              END,

              --Calculo AFECTO...
              CASE 
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) > 0 THEN Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Afecto,8),0)
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) = 0 THEN 0
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) > 0 THEN 0
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) = 0 THEN Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Afecto,8),0)

                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) = 0 THEN @Total
                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) > 0 THEN @Total - Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Iva,8),0) 
                
                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) > 0 THEN 0
              END,

              --Calculo IVA...
              CASE 
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) > 0 THEN Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Iva,8),0) 
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) = 0 THEN 0
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) > 0 THEN Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Iva,8),0)
                WHEN Round(@Exento,8) > 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) = 0 THEN 0

                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) = 0 THEN 0
                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) > 0 and Round(@Iva,8) > 0 THEN Round((Round(@Total,8)/Round(@TotalUF,8))*Round(@Iva,8),0)
                
                WHEN Round(@Exento,8) = 0 AND Round(@Afecto,8) = 0 and Round(@Iva,8) > 0 THEN @Total
              END
              );
            `;
          
            await transaction.request()
              .input('Contratante_Principal'        ,sql.VarChar(200),        Contratante_Principal       )
              .input('RutTrabajadorSinDV'           ,sql.Numeric(18,0),       RutTrabajadorSinDV          )
              .input('DVTrabajador'                 ,sql.VarChar(1),          DVTrabajador                )
              .input('Periodo'                      ,sql.VarChar(6),          Periodo                     )
              .input('Nombres'                      ,sql.VarChar(200),        Nombres                     )
              .input('ApePaterno'                   ,sql.VarChar(200),        ApePaterno                  )
              .input('ApeMaterno'                   ,sql.VarChar(200),        ApeMaterno                  )
              .input('RutEmpresa'                   ,sql.Numeric(18,0),       RutEmpresa                  )
              .input('DVEmpresa'                    ,sql.VarChar(1),          DVEmpresa                   )
              .input('TipoAseg'                     ,sql.VarChar(20),         TipoAseg                    )
              .input('Total'                        ,sql.Decimal(18,0),       Total                       )
              .input('TotalUF'                      ,sql.Decimal(18,8),       TotalUF                     )
              .input('Exento'                       ,sql.Decimal(18,8),       Exento                      )
              .input('Afecto'                       ,sql.Decimal(18,8),       Afecto                      )
              .input('Iva'                          ,sql.Decimal(18,8),       Iva                         )
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
        console.error('Error al insertar registros CobroAseguradora Excel: '/*+nom*/ , error);
        res.status(500).json({ error: 'al insertar registros CobroAseguradora Excel* '+nom , details: error.message });
      }
    } catch (error) {
      console.error('33Error al insertar registros CobroAseguradora: '+nom , error);
      res.status(500).json({ error: '44Error al insertar registros CobroAseguradora: ' +nom , details: error.message });
    }
  } else {
    console.error('se encontró un error')
    res.status(405).end();
  }
}

