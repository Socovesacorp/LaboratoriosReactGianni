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

      try {
      // Ordena los registros por ID antes de la inserción
      recordsToInsert.sort((a, b) => a.ID - b.ID);

        // Iniciar una transacción
        const transaction = pool.transaction();
        await transaction.begin();

        for (const record of recordsToInsert) {
          const { ID, NOMBRE, DESCRIPCION } = record;

          const query = `
            INSERT INTO PRUEBA (
                ID,
                NOMBRE,
                DESCRIPCION
            )
            VALUES (
              @ID,
              @NOMBRE,
              @DESCRIPCION
            );
          `;

          await transaction.request()
            .input('ID', sql.Decimal, ID)
            .input('NOMBRE', sql.NChar, NOMBRE)
            .input('DESCRIPCION', sql.NChar, DESCRIPCION)
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
