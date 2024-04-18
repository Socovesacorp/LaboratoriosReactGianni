//Eliminar...
//Esto tiene que cargar una grilla con los datos de la nube...

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Snackbar } from '@mui/material';
import * as XLSX from 'xlsx';
import '../hojas-de-estilo/MantenedorExcels.css';

const MantenedorExcels = () => {
  const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [token, setToken] = useState('');

  const API_URL = ''; // Reemplaza con la URL correcta de tu API

  const columns = [
    { field: 'ID', headerName: 'ID', width: 100 },
    { field: 'NOMBRE', headerName: 'Nombre', flex: 1 },
    { field: 'DESCRIPCION', headerName: 'Descripción', flex: 4 },
  ];

  useEffect(() => {
    const obtenerTokenYDatos = async () => {
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

        const dataResponse = await fetch(`${API_URL}/api/prueba`, {
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        });

        if (!dataResponse.ok) {
          console.error('Error de red:', dataResponse.statusText);
          throw new Error('Error de red al obtener los datos de prueba');
        }

        const data = await dataResponse.json();
        setRows(data);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    obtenerTokenYDatos();
  }, []);

  const getRowId = (row) => row.ID;

  const handleExportarAexcel = () => {
    const selectedRowsData = rows.filter((row) => rowSelectionModel.includes(row.ID));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(selectedRowsData);

    ws['!cols'] = [{ width: 10 }, { width: 20 }, { width: 100 }];
      
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
    const fileName = 'ArchivoMío.xlsx';
    XLSX.writeFile(wb, fileName);
    handleOpenAlertaExcel();
  };

  const handleOpenAlertaExcel = () => {
    setOpenAlertaExcel(true);
  };

  const handleCloseAlertaExcel = () => {
    setOpenAlertaExcel(false);
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
  };

  return (
    <div style={{ marginLeft: '15px' }}>
      <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>Material-UI / Componente DataGrid / jsonwebtoken</h1>
      
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
      {<br />}
      <Button
        variant="contained"
        color="primary"
        onClick={handleExportarAexcel}
      >
        Exportar a Excel
      </Button>
      <Snackbar
        open={openAlertaExcel}
        autoHideDuration={3000}
        onClose={handleCloseAlertaExcel}
        message="Se han exportado los registros seleccionados a Excel..."
      />
      <div style={{ marginTop: '5px' }}>
        <div className="custom-data-grid-container" style={{ height: '300px', width: '99%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={handleRowSelectionModelChange}
            rowSelectionModel={rowSelectionModel}
            getRowHeight={() => 'auto'}
            pagination={false} // Desactivar paginación
            pageSize={10000} // Mostrar todos los registros en una página
            hideFooterPagination
            resizable
            className="custom-data-grid"
            getRowId={getRowId}
          />
        </div>
      </div>
    </div>
  );
};

export default MantenedorExcels;
