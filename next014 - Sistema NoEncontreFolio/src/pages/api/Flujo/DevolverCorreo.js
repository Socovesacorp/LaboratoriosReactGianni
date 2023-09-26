import dbConfig from '../../../components/dbConfig';
import sql from 'mssql';
import { verifyToken } from '../auth';

export default async function handler(req, res) {
  let pool; // Declarar la conexión fuera del bloque try-catch

  if (req.method === 'POST') {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }

      const decodedToken = verifyToken(token);

      let emailSolicitante = '';
      let { FOLIO } = req.body;
      FOLIO = FOLIO.trim();
      //console.log('FOLIO recibido: '+FOLIO)
      if (/^\d+$/.test(FOLIO)) {
        // El folio solo tiene números...

        // Crear la conexión a la base de datos
        pool = await sql.connect(dbConfig);

        // Consultar el campo EMAILAUTOMATICO_SOLICITANTE para el FOLIO dado
        const query = `
          SELECT EMAILAUTOMATICO_SOLICITANTE
          FROM Solicitud WITH (NOLOCK)
          WHERE FOLIO = @FOLIO;
        `;

        const result = await pool
          .request()
          .input('FOLIO', sql.Numeric(18, 0), FOLIO)
          .query(query);

        // Comprobar si se encontró un registro con el FOLIO dado
        if (result.recordset.length !== 0) {
          emailSolicitante = result.recordset[0].EMAILAUTOMATICO_SOLICITANTE;
        }
      }

      //console.log('Para FOLIO: ' + FOLIO + ' se retorna:' + emailSolicitante);

      // Cerrar la conexión a la base de datos
      await pool.close(); // Asegúrate de esperar la operación de cierre

      res.status(200).json({ correo: emailSolicitante });
    } catch (error) {
      
      console.error('Error al consultar el EMAILAUTOMATICO_SOLICITANTE', error);

      // Cerrar la conexión a la base de datos en caso de error
      if (pool) {
        await pool.close(); // Asegúrate de esperar la operación de cierre
      }

      res
        .status(500)
        .json({ error: 'Error al consultar el EMAILAUTOMATICO_SOLICITANTE', details: error.message });
    }
  } else {
    console.error('Se encontró un error');
    res.status(405).end();
  }
}
