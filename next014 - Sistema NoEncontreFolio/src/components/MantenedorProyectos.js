//Eliminar...
//Esto tiene que cargar una grilla y si se confirma llevarse la data seleccionada a la nube...
//Usando api con conjunto de datos json...

// Punto del Menú ITEM 2...


import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box } from '@mui/material';
import * as XLSX from 'xlsx';

const SubirRendicionesPendientes = (props) => {
  const {textoNick, NombreUsuario , CodPerfil} = props;
  const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
  const [OpenAlertaImportarDatosNube, setOpenAlertaImportarDatosNube] = useState(false);
  const [openAlertaCargarGrilla, setopenAlertaCargarGrilla] = useState(false);
  const [openAlertaError, setOpenAlertaError] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [token, setToken] = useState('');

  const API_URL = ''; 

  const columns = [
    { field: 'ID', headerName: 'ID', width: 100 },
    { field: 'NOMBRE', headerName: 'Nombre', flex: 1 },
    { field: 'DESCRIPCION', headerName: 'Descripción', flex: 4 },
  ];

  const getRowId = (row) => row.ID;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(sheet);
  
        // Asignar IDs autonuméricos a las filas y actualizar el estado
        const updatedRows = excelData.map((row, index) => ({
          ID: index + 1, // Comenzar desde 1 en lugar de nextId
          NOMBRE: row.NOMBRE,
          DESCRIPCION: row.DESCRIPCION,
        }));
  
        setRows(updatedRows); // Actualiza rows con los datos modificados
        setopenAlertaCargarGrilla(true);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  

  const handleProcesarDatos = async () => {
    try {


      if (rowSelectionModel.length === 0) {
        setOpenAlertaError(true);
        return;
      }

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

      const horaActual = new Date();
      horaActual.setHours(horaActual.getHours() - 3); 

      const dataToCreate = {
        "FechaSubida": horaActual,
        "NickSubida": textoNick,
        "NombreUsuarioSubida": NombreUsuario,
        "NickProcesado": "",
        "NombreUsuarioProcesado": "",
        "Procesado": 0,
        "FechaProcesado": null
      };

      const dataResponse = await fetch(`${API_URL}/api/Cabecera/CrearCabecera`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify(dataToCreate),
      });

      if (!dataResponse.ok) {
        console.error('Error de red:', dataResponse.statusText);
        throw new Error('Error de red al obtener los datos de prueba');
      }


      // Recorre las filas seleccionadas y llama a la API CrearDatosPrueba para cada una
      const recordsToInsert = [];
      for (const selectedRowId of rowSelectionModel) {
        const selectedRow = rows.find((row) => row.ID === selectedRowId);
        recordsToInsert.push({
          ID: selectedRow.ID,
          NOMBRE: selectedRow.NOMBRE,
          DESCRIPCION: selectedRow.DESCRIPCION,
        });
      }

      // Ordena los registros por ID en orden ascendente
      recordsToInsert.sort((a, b) => a.ID - b.ID);

      const datosPruebaResponse = await fetch(`${API_URL}/api/Cabecera/CrearDatosPruebaMasivo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify(recordsToInsert),
      });

      if (!datosPruebaResponse.ok) {
        console.error('Error de red:', datosPruebaResponse.statusText);
        throw new Error('Error de red al crear los datos de prueba');
      }
      
      setOpenAlertaImportarDatosNube(true);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  const handleExportarAexcel = () => {
    const selectedRowsData = rows.filter((row) =>
      rowSelectionModel.includes(row.ID)
    );

    if (rowSelectionModel.length === 0) {
      console.error('No se han seleccionado filas para procesar.');
      setOpenAlertaError(true); // Mostrar alerta de error
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(selectedRowsData);
    ws['!cols'] = [{ width: 10 }, { width: 20 }, { width: 100 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
    const fileName = 'ArchivoMío.xlsx';
    XLSX.writeFile(wb, fileName);
    setOpenAlertaExcel(true);
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
  };

  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' }}>
      <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>
        Probando Item 2
      </h1>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Input
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          id="file-upload-input" // Agrega un ID al input
          style={{ display: 'none' }} // Oculta el input
        />
        <label htmlFor="file-upload-input">
          <Button
            variant="contained"
            color="primary"
            component="span" 
          >
            {rows.length === 0
              ? 'Cargar archivo Flujo'
              : `Archivo cargado: ${rows.length} filas`}
          </Button>
          <Snackbar
            open={openAlertaCargarGrilla}
            autoHideDuration={3000}
            onClose={() => setopenAlertaCargarGrilla(false)}
            message="Se han importado a la Grilla los datos del Excel seleccionado..."
          />
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportarAexcel}
          disabled={rows.length === 0}
        >
          Exportar a Excel
        </Button>
      </Box>
      <Snackbar
        open={openAlertaExcel}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaExcel(false)}
        message="Se han exportado los datos seleccionados a Excel..."
      />
      <Snackbar
        open={openAlertaError}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaError(false)}
        message="No se han seleccionado registros. Acción inválida."
        ContentProps={{
          style: {
            backgroundColor: 'red',
            color: 'white',
          },
        }}
      />
      <div style={{ marginTop: '5px' }}>
        <div
          className="custom-data-grid-container"
          style={{ height: '300px', width: '100%' }}
        >
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
            localeText={{
              noRowsLabel: 'No hay filas para mostrar', // Aquí puedes establecer el mensaje personalizado
              // Otras cadenas de texto personalizadas si es necesario...
            }}
          />
        </div>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleProcesarDatos}
        style={{ marginTop: '20px' }}
      >
      Procesar Datos
      </Button>
      <Snackbar
        open={OpenAlertaImportarDatosNube}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaImportarDatosNube(false)}
        message="Se han exportado los datos seleccionados a la Nube..."
      />
      <Snackbar
        open={openAlertaError}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaError(false)}
        message="No se han seleccionado registros. Acción inválida."
        ContentProps={{
          style: {
            backgroundColor: 'red',
            color: 'white',
          },
        }}
      />

    </div>
  );
};

export default SubirRendicionesPendientes;