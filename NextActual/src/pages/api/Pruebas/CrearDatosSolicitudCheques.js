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
      
        for (const record of recordsToInsert) {
          const { 
            Cabecera_ID, 
            SolCheq_Sociedad, 
            SolCheq_NroSolicitud, 
            SolCheq_FechaAprobacion , 
            SolCheq_FechaDicitacion , 
            SolCheq_Solicitante , 
            SolCheq_TipoFondo ,
            SolCheq_Proveedor,
            SolCheq_Rut,
            SelCheq_Monto
          } = record;
      
          // Supongamos que SolCheq_FechaAprobacion es una cadena en formato "dd/mm/yyyy"
          const fechaAprobacionTexto = SolCheq_FechaAprobacion;
          const fechaDicitacionTexto = SolCheq_FechaDicitacion;
          const MontoTexto = SelCheq_Monto;

          // Convertir la fecha de texto a un formato SQL válido (YYYY-MM-DD)
          const fechaAprobacionSQL = convertirFechaASQL(fechaAprobacionTexto);
          const fechaDicitacionSQL = convertirFechaASQL(fechaDicitacionTexto);
          const MontoSQL = limpiarMonto(MontoTexto);

          const query = `
            INSERT INTO SolicitudCheque (
                Cabecera_ID,
                SolCheq_Sociedad,
                SolCheq_NroSolicitud,
                SolCheq_FechaAprobacion,
                SolCheq_FechaDicitacion,
                SolCheq_Solicitante,
                SolCheq_TipoFondo,
                [SolCheq_Proveedor],
                [SolCheq_Rut],
                [SelCheq_Monto]
            )
            VALUES (
              @Cabecera_ID,
              @SolCheq_Sociedad,
              @SolCheq_NroSolicitud,
              @SolCheq_FechaAprobacion,
              @SolCheq_FechaDicitacion,
              @SolCheq_Solicitante,
              @SolCheq_TipoFondo,
              @SolCheq_Proveedor,
              @SolCheq_Rut,
              @SelCheq_Monto
            );
          `;
          //console.log('Registro a insertar:', record); 
          await transaction.request()
            .input('Cabecera_ID', sql.Decimal, Cabecera_ID)
            .input('SolCheq_Sociedad', sql.Decimal, SolCheq_Sociedad)
            .input('SolCheq_NroSolicitud', sql.Decimal, SolCheq_NroSolicitud)
            .input('SolCheq_FechaAprobacion', sql.Date, fechaAprobacionSQL)
            .input('SolCheq_FechaDicitacion', sql.Date, fechaDicitacionSQL)
            .input('SolCheq_Solicitante', sql.NChar, SolCheq_Solicitante)
            .input('SolCheq_TipoFondo', sql.NChar, SolCheq_TipoFondo)
            .input('SolCheq_Proveedor', sql.NChar, SolCheq_Proveedor)
            .input('SolCheq_Rut', sql.NChar, SolCheq_Rut)
            .input('SelCheq_Monto', sql.Decimal, MontoSQL)
            .query(query);
        }
      
        // Hacer commit de la transacción
        await transaction.commit();
      
        sql.close();

        res.status(201).json({ message: 'Registros insertados correctamente' });
      } catch (error) {
        // Si hay un error, hacer rollback de la transacción
        await transaction.rollback();
        console.error('Error al insertar registros:', error);
        res.status(500).json({ error: 'Error al insertar registros', details: error.message });
      }
    } catch (error) {
      console.error('Error al insertar registros:', error);
      res.status(500).json({ error: 'Error al insertar registros', details: error.message });
    }
  } else {
    res.status(405).end();
  }
}
// Función para convertir la fecha en formato SQL válido (YYYY-MM-DD)
function convertirFechaASQL(fechaTexto) {
  const [dia, mes, anio] = fechaTexto.split('/');
  const fechaSQL = `${anio}-${mes}-${dia}`;
  return fechaSQL;
}

function limpiarMonto(montoTexto) {
  // Remueve todos los caracteres que no son dígitos
  const montoLimpio = montoTexto.replace(/\D/g, '');
  return montoLimpio;
}