//REAL...Esto tiene que cargar una grilla con los datos de la nube...

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Snackbar , Box} from '@mui/material';
import * as XLSX from 'xlsx';
import '../hojas-de-estilo/MantenedorExcels.css';
import SubirSolicitudesSap from './SubirSolicitudesSap'; // Asegúrate de que la ruta sea correcta


const TrabajarConSolicitudes = (props) => {
    const {textoNick, NombreUsuario , CodPerfil} = props;
    const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [token, setToken] = useState('');
    const [fechaMaximaFlujo, setFechaMaximaFlujo] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Agrega un estado para controlar la carga de datos
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [openAlertaErrorApi, setOpenAlertaErrorApi] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const API_URL = ''; // Reemplaza con la URL correcta de tu API
  
    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        cargarDatos(); // Llama a cargarDatos para recargar los datos
    };

    const CustomModal = () => {
        return (
            <div className="custom-modal" style={{ background: 'white' }}>
                {/* Contenido del modal */}
                <div className="modal-content">
                    {/* Aquí puedes agregar el contenido personalizado */}
                    {/*<h2>Título del Popup</h2>*/}
                    {/*<p>Contenido personalizado</p>*/}
                    <button
                        onClick={closePopup}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 1,
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            color: '#333', // Color del ícono de cierre
                        }}
                    >
                    &#x2716; {/* Este es el símbolo de la equis (X) como ícono de cierre */}
                    </button>
                    <div style={{ width: '1500px' }}>
                        <SubirSolicitudesSap
                            textoNick={textoNick}
                            NombreUsuario={NombreUsuario}
                            CodPerfil={CodPerfil}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Función para parsear una cadena de fecha en formato 'dd/mm/yyyy' a un objeto Date
    function parseDate(value) {
        if (value) {
        const parts = value.split('/');
        if (parts.length === 3) {
            const year = parseInt(parts[2]);
            const fullYear = (year < 1000) ? (2000 + year) : year;
            const month = parseInt(parts[1]) - 1;
            const day = parseInt(parts[0]);
            return new Date(fullYear, month, day);
        }
        }
        return null;
    }

    // Función para parsear una cadena de fecha y hora en un objeto Date
    function parseDateAndTime(value) {
        //console.log(value)
        if (value) {
        const dateTimeParts = value.split(' ');
        if (dateTimeParts.length === 2) {
            const dateParts = dateTimeParts[0].split('/');
            const timePart = dateTimeParts[1];
            if (dateParts.length === 3 && timePart) {
            const year = parseInt(dateParts[2]);
            const fullYear = year < 1000 ? 2000 + year : year;
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[0]);
            const timeParts = timePart.split(':');
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
            return new Date(fullYear, month, day, hours, minutes, seconds);
            }
        }
        }
        return null;
    }

    const ObtenerToken = async () => {
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
            setOpenAlertaErrorApi(true);
            console.error('Error de red:', tokenResponse.statusText);
            throw new Error('Error de red al obtener el token');
        }

        const tokenData = await tokenResponse.json();
        return tokenData.token;
        } catch (error) {
        setOpenAlertaErrorApi(true);
        console.error('Error al obtener el token:', error);
        throw error;
        }
    };

    const ObtenerDatos = async (token) => {
        try {
        const dataResponse = await fetch(`${API_URL}/api/Sap/ObtenerCabeceras`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (!dataResponse.ok) {
            setOpenAlertaErrorApi(true);
            console.error('Error de red:', dataResponse.statusText);
            throw new Error('Error de red al obtener los datos de prueba');
        }

        const data = await dataResponse.json();
        return data;
        } catch (error) {
        setOpenAlertaErrorApi(true);
        console.error('Error al obtener datos:', error);
        throw error;
        }
    };

    const obtenerFechaMaxima = async (token) => {
        try {
        const response = await fetch(`${API_URL}/api/Flujo/ObtenerMaximaFecha`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            // Verifica que 'maxFechaInicio' esté presente en la respuesta
            if (data.maxFechaInicio) {
            setFechaMaximaFlujo(data.maxFechaInicio);
            } else {
            setOpenAlertaErrorApi(true);
            console.error('La respuesta de la API no contiene maxFechaInicio:', data);
            }
        } else {
            setOpenAlertaErrorApi(true);
            console.error('Error al obtener la fecha máxima:', response.statusText);
        }
        } catch (error) {
        setOpenAlertaErrorApi(true);
        console.error('Error al obtener la fecha máxima:', error);
        }
    };

    const cargarDatos = async () => {
        try {
        const token = await ObtenerToken();
        setToken(token);
        
        await obtenerFechaMaxima(token);
        const data = await ObtenerDatos(token);
        
        setRows(data);
        setIsDataLoaded(true); // Marcar los datos como cargados
        } catch (error) {
        setOpenAlertaErrorApi(true);
        console.error('Error al cargar datos:', error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);



    const columns = [
        { field: 'Cabecera_ID',                                             headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' },
        { field: 'Cabecera_FechaSubida',             type: 'dateTime',      headerAlign: 'center',  headerName: 'Fecha Creación', width: 200,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
        { field: 'Cabecera_NombreUsuarioSubida',                            headerAlign: 'left',    headerName: 'Usuario Creador', width: 250 , align: 'left'},
        { field: 'Cabecera_FechaProcesado',          type: 'dateTime',      headerAlign: 'center',  headerName: 'Fecha Procesado', width: 200,align: 'center', valueGetter: (params) => parseDateAndTime(params.value),},
        { field: 'Cabecera_NombreUsuarioProcesado',                         headerAlign: 'left',    headerName: 'Usuario que Procesó', width: 300 , align: 'left'},
    ];

  
    const getRowId = (row) => row.Cabecera_ID;

    const handleExportarAexcel = () => {
        const selectedRowsData = rows.filter((row) => rowSelectionModel.includes(row.Cabecera_ID));
        if (rowSelectionModel.length === 0) {
            console.error('No se han seleccionado filas para procesar.');
            setOpenAlertaError(true); // Mostrar alerta de error
            return;
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(selectedRowsData);

        //ws['!cols'] = [{ width: 10 }, { width: 20 }, { width: 100 }];
        
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
        <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>Trabajar con Correos</h1>
        <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
            {fechaMaximaFlujo === '1753-01-01'
                ? 'No hay datos cargados en las tablas.'
                : `Los datos se encuentran actualizados al ${fechaMaximaFlujo}`}
            </h4>

        <Box
            display="flex"
            justifyContent="space-between" // Alinea los elementos a los lados
            alignItems="center"
            marginBottom="10px"
            marginLeft="0px"
            marginRight="20px"
            >
            <Button
                variant="contained"
                color="primary"
                onClick={openPopup}
                disabled={!isDataLoaded}
            >
                Subir Solicitudes
            </Button>
            {/* ... */}
            {isPopupOpen && ( 
                <div className="popup-background">
                    <CustomModal />
                </div>
            )}
            <div style={{ width: '960px' }}>
            <Button
                variant="contained"
                color="primary"
                onClick={handleExportarAexcel}
                disabled={!isDataLoaded} // Deshabilitar si rows está vacío
            >
                Exportar a Excel
            </Button>
            </div>
        </Box>
        <Snackbar
            open={openAlertaExcel}
            autoHideDuration={3000}
            onClose={handleCloseAlertaExcel}
            message="Se han exportado los registros seleccionados a Excel..."
            ContentProps={{
                style: {
                marginLeft: '-10px'
                },
            }}
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
                marginLeft: '-10px'
            },
            }}
        />
        <Snackbar
            open={openAlertaErrorApi}
            autoHideDuration={3000}
            onClose={() => setOpenAlertaErrorApi(false)}
            message="Error en Api. Consultar a T.I."
            ContentProps={{
            style: {
                backgroundColor: 'red',
                color: 'white',
                marginLeft: '-10px'
            },
            }}
        />
        <Snackbar
            open={openAlertaErrorApi}
            autoHideDuration={3000}
            onClose={() => setOpenAlertaErrorApi(false)}
            message="Error en Api. Consultar a T.I."
            ContentProps={{
            style: {
                backgroundColor: 'red',
                color: 'white',
                marginLeft: '-10px'
            },
            }}
        />
        <div style={{ marginTop: '5px' }}>
            <div className="custom-data-grid-container" style={{ height: '500px', width: '1083px' }}>
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
                    const spaces = '\u00A0'.repeat(50); // Utiliza el carácter especial para espacio no rompible
                    return (
                        <div>
                        
                        {spaces}
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
        </div>
    );
};

export default TrabajarConSolicitudes;
