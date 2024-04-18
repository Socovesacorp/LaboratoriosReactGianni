import React, { useState , useEffect }            from 'react';
import * as XLSX                                  from 'xlsx';
import { DataGrid }                               from '@mui/x-data-grid';
import { Button, Snackbar, Input, Box }           from '@mui/material';
import LlamadosApis                               from '../ManejarDatosApis/LlamadosApis';
import ManejoDatosExcel                           from '../ManejarDatosGrilla/ManejoDatosExcel';
import '../../hojas-de-estilo/MantenedorExcels.css';

const SubirDescuentosExcel = (props) => {
  const {Seg1, Seg2, textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
  const [openAlertaOK, setOpenAlertaOK] = useState(false);
  const [openAlertaError, setOpenAlertaError] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [rowsD, setRowsD] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [CantDescE, setCantDescE] = useState(null);
  const [totalSinRut, setTotalSinRut] = useState(0);
  const [totalConRut, setTotalConRut] = useState(0);

  const API_URL = ''; 

  const cargarDatos = async () => {
    try {
      const token = await LlamadosApis.ObtenerToken();
      try {
        const CantidadD = await LlamadosApis.obtenerCantidadDescuentosExcel(token);
        setCantDescE(CantidadD);
      } catch (errorCantidadD) {
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
      console.error('Error al Obtener Token:', errorToken);
    }
  };

  useEffect(() => {
    cargarDatos();
    const totalSinRutCount = rowsD.filter((row) => row.NIF.trim().length < 3).length;
    setTotalSinRut(totalSinRutCount);
    const totalConRutCount = rowsD.filter((row) => row.NIF.trim().length > 3).length;
    setTotalConRut(totalConRutCount);
  }, [rowsD]);

  const columns = [
    { field: 'ID',                           headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' },
    { field: 'NIF',                          headerAlign: 'center',  headerName: 'NIF', width: 100 },
    { field: 'Apellido_Nombre',              headerAlign: 'left',    headerName: 'Nombre', width: 200 , align: 'left'},
    { field: 'Sociedad',    type: 'number',  headerAlign: 'center',  headerName: 'Sociedad', width: 85 , align: 'center' },
    { field: 'NombreEmpresa',                headerAlign: 'center',  headerName: 'Empresa', width: 200 , align: 'center'},
    { field: 'CentroCoste',                  headerAlign: 'center',  headerName: 'C. Costo', width: 110 , align: 'center' },
    { field: 'Denominacion',                 headerAlign: 'left',    headerName: 'Denominación', width: 170 , align: 'left' },
    { field: 'Periodo',                      headerAlign: 'center',  headerName: 'Periodo', width: 150, align: 'center' },
    { field: 'TipoSeguro',                   headerAlign: 'left',    headerName: 'Tipo de Seguro', width: 200,align: 'left' },
    { field: 'Importe',                      headerAlign: 'center',  headerName: 'Importe', width: 105,align: 'right', valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
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
        range.s.r = 0; // Fila 1
        const dataRows = XLSX.utils.sheet_to_json(sheet, {
          range: range,
          raw: false, // Evita que los valores se interpreten como fechas
        });

        // Filtrar los datos según los valores de "CC-nómina" sean igual a props.Seg1 o props.Seg2
        const filteredRows = dataRows.filter(row =>
          /*row['CC-nómina'] === '4020' || */row['CC-nómina'] === Seg1 || row['CC-nómina'] === Seg1
        );
  
        //console.log(dataRows)
        const updatedRows = filteredRows.map((row, index) => ({
          ID                        : index + 1, 
          Apellido_Nombre           : row['Apellido Nombre'],
          NIF                       : row['NIF'],
          Sociedad                  : ManejoDatosExcel.formatDecimal(row['Sociedad']),
          NombreEmpresa             : row['Nombre de la empresa'],
          CentroCoste               : row['Centro de coste'],
          Denominacion              : row['Denominación'],
          Periodo                   : row['Período para nómina'],
          TipoSeguro                : row['Texto expl.CC-nómina'],
          Importe                   : ManejoDatosExcel.formatDecimal(row['Importe']),
        }));
        setRowsD(updatedRows);
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
          message: "No se han seleccionado registros para procesar. Acción inválida.",
        });
        return;
      }
      setProcessing(true);
      const token = await LlamadosApis.ObtenerToken();
  
      let ResultadoEliminar;
      try {
        ResultadoEliminar = await LlamadosApis.EliminarDescuentosExcel(token);
      } catch (errorResultadoEliminar) {
        setOpenAlertaError({//gianni
          open: true,
          message: "Error en Api de EliminarDescuentosExcel. Consultar con T.I.",
        });
      }


      if(ResultadoEliminar==='OK'){
        const recordsToInsert = [];
        const batchSize = 1000; // Tamaño del lote
    
        // Dividir los registros en lotes de a batchSize
        for (let i = 0; i < rowSelectionModel.length; i += batchSize) {
          const batchSelection = rowSelectionModel.slice(i, i + batchSize);
          const batch = batchSelection.map((selectedRowId) => {
            const selectedRow = rowsD.find((row) => row.ID === selectedRowId);
            return {
              //ID: selectedRow.ID,
              
              NIF                  : selectedRow.NIF,
              Apellido_Nombre      : selectedRow.Apellido_Nombre,
              Sociedad             : selectedRow.Sociedad,
              NombreEmpresa        : selectedRow.NombreEmpresa,
              CentroCoste          : selectedRow.CentroCoste,
              Denominacion         : selectedRow.Denominacion,
              Periodo              : selectedRow.Periodo,
              TipoSeguro           : selectedRow.TipoSeguro,
              Importe              : selectedRow.Importe
            };
          });
          recordsToInsert.push(...batch);

          // Enviar el lote actual a la API
          const datosPruebaResponse = await fetch(`${API_URL}/api/Seguros/SubirDescuentosExcel`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(batch),
          });


          if (!datosPruebaResponse.ok) {
            console.error('Error de red:', datosPruebaResponse.statusText);
            setOpenAlertaError({//gianni
              open: true,
              message: "Error en Api. Consultar a T.I.",
            });
            throw new Error('Error de red al subir datos de los Descuentos Excel');
          }
        }
        
      }
      props.closePopup(1);
    } catch (error) {
      setOpenAlertaError({//gianni
        open: true,
        message: "Error en Api. Consultar a T.I.",
      });
      
    } finally {
      setProcessing(false); // Deshabilita el estado "processing" al final del proceso
      setRowSelectionModel([]);
    }
  };

  const handleExportarAexcel = () => {
    const selectedRowsData = rowsD.filter((row) =>
      rowSelectionModel.includes(row.ID)
    );
    if (rowSelectionModel.length === 0) {
      setOpenAlertaError({
        open: true,
        message: "No se han seleccionado registros para exportar.",
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
      message: "Se han exportado a Excel los registros seleccionados.",
    });
  };

  const handleRowSelectionModelChange = (newRowSelectionModel) => {
    setRowSelectionModel(newRowSelectionModel);
    const selectedRowsData = rowsD.filter((row) =>
      newRowSelectionModel.includes(row.ID)
    );
  };
  
  return (
    <div style={{ marginLeft: '15px', marginRight: '15px' , background: 'white' }}>
      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}>
        Subir información de Descuentos 
      </h1>
      <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
        {CantDescE === null
          ? 'Actualmente no existe información de Descuentos a los Trabajadores.'
          : `Existen ${CantDescE.toLocaleString('en-US')} Descuentos procesados.`}
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
            {rowsD.length === 0
              ? 'Cargar archivo'
              : `Archivo cargado: ${rowsD.length} filas`}
          </Button>
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportarAexcel}
          disabled={rowsD.length === 0}
        >
          Exportar a Excel
        </Button>
      </Box>
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
      <div style={{ marginTop: '5px' }}>
        <div
          className="custom-data-grid-container"
          style={{ height: '350px', width: '100%' }}
        >
          <DataGrid
            rows={rowsD}
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
                      Descuentos a Procesar: {totalConRut.toLocaleString('en-US')} 
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

export default SubirDescuentosExcel;