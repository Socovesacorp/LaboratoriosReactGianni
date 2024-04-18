import React, { useState , useEffect }            from 'react';
import * as XLSX                                  from 'xlsx';
import { DataGrid }                               from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box }           from '@mui/material';
import LlamadosApis                               from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';

const SubirTrabajadoresExcel = (props) => {
  const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
  const [openAlertaOK, setOpenAlertaOK] = useState(false);
  const [openAlertaError, setOpenAlertaError] = useState(false);

  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [CantTrabE, setCantTrabE] = useState(null);
  const [totalSinRut, setTotalSinRut] = useState(0);
  const [totalConRut, setTotalConRut] = useState(0);

  const API_URL = ''; 

  const cargarDatos = async () => {
    try {
      const token = await LlamadosApis.ObtenerToken();
      try {
        const CantidadT = await LlamadosApis.obtenerCantidadTrabajadoresExcel(token);
        setCantTrabE(CantidadT);
      } catch (errorCantidadT) {
        setOpenAlertaError({//gianni
          open: true,
          message: "Error en Api. Consultar a T.I.",
        });
      }
    } catch (errorToken) {
        setOpenAlertaError({//gianni
          open: true,
          message: "Error en Api. Consultar a T.I.",
        });
    }
  };

  useEffect(() => {
    cargarDatos();
    const totalSinRutCount = rows.filter((row) => row.NIF.trim().length < 3).length;
    setTotalSinRut(totalSinRutCount);
    const totalConRutCount = rows.filter((row) => row.NIF.trim().length > 3).length;
    setTotalConRut(totalConRutCount);
  }, [rows]);

  const columns = [
    { field: 'ID',                     headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' },
    { field: 'Estado',                 headerAlign: 'center',  headerName: 'Estado', width: 80 , align: 'center'},
    { field: 'NIF',                    headerAlign: 'center',  headerName: 'NIF', width: 100 },
    { field: 'Nombres',                headerAlign: 'left',    headerName: 'Nombres', width: 180 , align: 'left'},
    { field: 'ApellidoPaterno',        headerAlign: 'left',    headerName: 'Apellido Paterno', width: 150 , align: 'left' },
    { field: 'ApellidoMaterno',        headerAlign: 'left',    headerName: 'Apellido Materno', width: 150, align: 'left' },
    { field: 'CentroCoste',            headerAlign: 'center',  headerName: 'C. Costo', width: 150 , align: 'center' },
    { field: 'Denominacion',           headerAlign: 'left',  headerName: 'Denominación', width: 150 , align: 'left' },
    { field: 'NombreProyecto',         headerAlign: 'left',  headerName: 'Proyecto', width: 180,align: 'left' },
    { field: 'CodigoProyecto',         headerAlign: 'center',  headerName: 'Código de Proyecto', width: 180,align: 'center' },
  ];

  const getRowId = (row) => row.ID;

  //Leo Excel seleccionado por el usuario y lo muestro por pantalla...
  const handleFileUpload = (e) => {
    setProcessing(true);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
  
        // Obtener los datos desde la fila 5
        const range = XLSX.utils.decode_range(sheet['!ref']);
        //range.s.r = 4; // Fila 5
        range.s.r = 2; // Fila 3
        const dataRows = XLSX.utils.sheet_to_json(sheet, {
          range: range,
          raw: false, // Evita que los valores se interpreten como fechas
        });
        //console.log(dataRows)
        const updatedRows = dataRows.map((row, index) => ({
          ID                        : index + 1, 
          Estado                    : row['Estado del trabajador (Picklist Label)'],
          NIF                       : row['RUT'],
          Nombres                   : row['Nombres'],
          ApellidoPaterno           : row['Apellido paterno'],
          ApellidoMaterno           : row['Apellido materno'],
          Denominacion              : row['Nombre centro costo (Label)'],
          CentroCoste               : row['Codigo centro costo'],
          NombreProyecto            : row['Nombre proyecto'],
          CodigoProyecto            : row['Codigo proyecto'],
        }));
        setRows(updatedRows);
        setOpenAlertaOK({
          open: true,
          message: "Se han importado a la Grilla los datos del Excel seleccionado...",
        });
        setProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  //Llevo los datos seleccionados a la Nube...
  const handleProcesarDatos = async () => {
    try {
      if (rowSelectionModel.length === 0) {
          setOpenAlertaError({//gianni
            open: true,
            message: "Debe seleccionar al menos un registro para procesar.",
          });
        return;
      }
      setProcessing(true);
      const token = await LlamadosApis.ObtenerToken();
  
      let ResultadoEliminar;
      try {
        ResultadoEliminar = await LlamadosApis.EliminarTrabajadoresExcel(token);
      } catch (errorResultadoEliminar) {
          setOpenAlertaError({//gianni
            open: true,
            message: "Error en Api. Consultar a T.I.",
          });
      }


      if(ResultadoEliminar==='OK'){
        const recordsToInsert = [];
        const batchSize = 1000; // Tamaño del lote
    
        // Dividir los registros en lotes de a batchSize
        for (let i = 0; i < rowSelectionModel.length; i += batchSize) {
          const batchSelection = rowSelectionModel.slice(i, i + batchSize);
          const batch = batchSelection.map((selectedRowId) => {
            const selectedRow = rows.find((row) => row.ID === selectedRowId);
            return {
              //ID: selectedRow.ID,
              Estado                      : selectedRow.Estado,
              NIF                         : selectedRow.NIF,
              Nombres                     : selectedRow.Nombres,
              ApellidoPaterno             : selectedRow.ApellidoPaterno,
              ApellidoMaterno             : selectedRow.ApellidoMaterno,
              CentroCoste                 : selectedRow.CentroCoste,
              Denominacion                : selectedRow.Denominacion,
              NombreProyecto              : selectedRow.NombreProyecto,
              CodigoProyecto              : selectedRow.CodigoProyecto
            };
          });
          recordsToInsert.push(...batch);

          // Enviar el lote actual a la API
          const datosPruebaResponse = await fetch(`${API_URL}/api/Seguros/SubirTrabajadoresExcel`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(batch),
          });

          if (!datosPruebaResponse.ok) {
            setOpenAlertaError({//gianni
              open: true,
              message: "Error en Api. Consultar a T.I.",
            });
            throw new Error('Error de red al subir datos de los Trabajadores Excel');
          }
        }
      }
      //await cargarDatos();
      //setOpenAlertaImportarDatosNube(true);
      props.closePopup(1);
    } catch (error) {
        setOpenAlertaError({//gianni
          open: true,
          message: "Error en Api. Consultar a T.I.",
        });
      console.error('Error al subir datos de los Trabajadores Excel:', error);
    } finally {
      setProcessing(false); // Deshabilita el estado "processing" al final del proceso
      setRowSelectionModel([]);
    }
  };

  const handleExportarAexcel = () => {
    const selectedRowsData = rows.filter((row) =>
      rowSelectionModel.includes(row.ID)
    );
    if (rowSelectionModel.length === 0) {
      console.error('No se han seleccionado filas para exportar.');
      setOpenAlertaError({//gianni
        open: true,
        message: "No se han seleccionado filas para exportar.",
      });
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(selectedRowsData);
    //ws['!cols'] = [{ width: 10 }, { width: 20 }, { width: 100 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
    const fileName = 'ArchivoMío.xlsx';
    XLSX.writeFile(wb, fileName);
    
    setOpenAlertaOK({
      open: true,
      message: "Se han exportado los datos seleccionados a Excel...",
    });
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
    const selectedRowsData = rows.filter((row) =>
      newRowSelectionModel.includes(row.ID)
    );
  };
  
  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' , background: 'white' }}>
      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}>
        Subir información de Trabajadores
      </h1>
      <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
        {CantTrabE === null
          ? 'Actualmente no existe información de Trabajadores.'
          : `Existen ${CantTrabE.toLocaleString('en-US')} Trabajadores procesados.`}
      </h4>
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
            disabled={processing}
          >
            {rows.length === 0
              ? 'Cargar archivo'
              : `Archivo cargado: ${rows.length} filas`}
          </Button>
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
        open={openAlertaError.open}
        autoHideDuration={3000}
        onClose={() => setOpenAlertaError({ open: false, message: "" })}
        message={openAlertaError.message}
        ContentProps={{
            style: {
                backgroundColor: "red",
                color: "white",
                marginLeft: "-10px",
            },
        }}
        anchorOrigin={{
            vertical: 'center', // Centra verticalmente
            horizontal: 'center', // Centra horizontalmente
        }}
        style={{
            position: 'absolute',
            bottom: '10px',
        }}
      />
      <Snackbar
          open={openAlertaOK.open}
          autoHideDuration={3000}
          onClose={() => setOpenAlertaOK({ open: false, message: "" })}
          message={openAlertaOK.message}
          ContentProps={{
              style: {
                  marginLeft: "-10px",
              },
          }}
          anchorOrigin={{
              vertical: 'center', // Centra verticalmente
              horizontal: 'center', // Centra horizontalmente
          }}
          style={{
              position: 'absolute',
              bottom: '10px',
          }}
      />
      <div style={{ marginTop: '5px' }}>
        <div
          className="custom-data-grid-container"
          style={{ height: '350px', width: '100%' }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={handleRowSelectionModelChange}
            rowSelectionModel={rowSelectionModel}
            getRowHeight={() => 'auto'}
            resizable
            className="custom-data-grid"
            getRowId={getRowId}
            localeText={{
              noRowsLabel: 'No hay filas para mostrar',
              MuiTablePagination: {
                labelDisplayedRows: ({ from, to, count }) => {
                  const spaces1 = '\u00A0'.repeat(20); 
                  const spaces2 = '\u00A0'.repeat(40);
                  return (
                    <div>
                      <span style={{ color: '#1976D2' , textShadow: '0.25px 0 0 #1976D2, 0 0.25px 0 #1976D2, -0.25px 0 0 #1976D2, 0 -0.25px 0 #1976D2' }}>
                      Trabajadores sin Rut: {totalSinRut}
                      {spaces1}
                      Trabajadores a Procesar: {totalConRut.toLocaleString('en-US')} 
                      </span>
                      {spaces2}
                      {from} - {to} de un total de {count}
                      
                    </div>
                  );
                },
                //más configuraciones...
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 100 },
              },
            }}
            pageSizeOptions={[]}

          />
        </div>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleProcesarDatos}
        style={{ marginTop: '20px' , marginBottom: '20px' }}
        disabled={processing}

      >
      Procesar Datos
      </Button>
      
      
    </div>
  );
};

export default SubirTrabajadoresExcel;