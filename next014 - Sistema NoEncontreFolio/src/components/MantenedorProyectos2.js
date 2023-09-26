//Eliminar...
//Esto tiene como cargar un excel y mostrarlo por pantalla perfecto...

import React, { useState, useEffect } from 'react';
import { Button, Snackbar } from '@mui/material';
import * as XLSX from 'xlsx';
import '../hojas-de-estilo/MantenedorExcels.css';

const MantenedorProyectos2 = () => {
  const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [token, setToken] = useState('');
  const [excelData, setExcelData] = useState([]);

  const API_URL = 'http://localhost:3000'; // Reemplaza con la URL correcta de tu API

  useEffect(() => {
    const obtenerToken = async () => {
      try {
        const tokenResponse = await fetch(`${API_URL}/api/ObtenerToken`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'User_UCP',
            password: 'Cobranz@s_UCP.2023',
          }),
        });

        if (!tokenResponse.ok) {
          console.error('Error de red:', tokenResponse.statusText);
          throw new Error('Error de red al obtener el token');
        }

        const tokenData = await tokenResponse.json();
        setToken(tokenData.token);
      } catch (error) {
        console.error('Error al obtener el token:', error);
      }
    };
    obtenerToken();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // Use the code from your second component to read the Excel file
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Output the data to the console
      console.log(jsonData);

      // Set the Excel data to state for rendering or further processing
      setExcelData(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUploadExcel = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${API_URL}/api/Cabecera/CrearSolicitudCheque`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`, // Agrega el token de autorización a los encabezados
          },
          body: formData,
        });

        if (!response.ok) {
          console.error('Error al cargar el archivo Excel:', response.statusText);
          throw new Error('Error al cargar el archivo Excel');
        }

        // Manejar la respuesta de la API en la nube aquí
        const responseData = await response.json();
        console.log('Datos cargados con éxito en la nube:', responseData);

        setOpenAlertaExcel(true);
      } catch (error) {
        console.error('Error al cargar el archivo Excel:', error);
      }
    }
  };

  const handleCloseAlertaExcel = () => {
    setOpenAlertaExcel(false);
  };

  return (
    <div style={{ marginLeft: '15px' }}>
      <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>Material-UI / jsonwebtoken</h1>

      {token && (
        <table style={{ borderCollapse: 'collapse', border: '1px solid #ccc', width: '99%' }}>
          <tbody>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <td style={{ border: '1px solid #ccc', padding: '8px', width: '8.5%' }}>Token:</td>
              <td style={{ border: '1px solid #ccc', padding: '8px', width: '91.5%' }}>{token}</td>
            </tr>
          </tbody>
        </table>
      )}
      <br />
      <input type="file" onChange={handleFileChange} />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUploadExcel}
        disabled={!selectedFile}
      >
        Cargar Excel a la Nube
      </Button>
      <Snackbar
        open={openAlertaExcel}
        autoHideDuration={3000}
        onClose={handleCloseAlertaExcel}
        message="Archivo cargado con éxito."
      />

      {/* Display Excel data here */}
      <div>
        <h2>Registros de Excel:</h2>
        <ul>
          {excelData.map((row, rowIndex) => (
            <li key={rowIndex}>{JSON.stringify(row)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MantenedorProyectos2;

