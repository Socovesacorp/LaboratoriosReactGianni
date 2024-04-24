import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import ManejoDatosGrillaMaterialUi                  from '../ManejarDatosGrilla/ManejoDatosGrillaMaterialUi';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import SubirSolicitudesSap                          from './SubirSolicitudesSap';
import '../../hojas-de-estilo/MantenedorExcels.css';
import TrabajarConEnvios from './TrabajarConEnvios';

const TrabajarConCorreos = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [CorreoGerente,setCorreoGerente] = useState("");
    const [CorreoSupervisor,setCorreoSupervisor] = useState("");
    const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [fechaMaximaFlujo, setFechaMaximaFlujo] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [openAlertaError2, setOpenAlertaError2] = useState({ open: false, message: "" });
    const [openAlertaErrorApi, setOpenAlertaErrorApi] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isPopupOpenCGenerados, setIsPopupOpenCGenerados] = useState(false);


    function getUrlGuia() {
        if (typeof window !== 'undefined') {
          const { hostname } = window.location;
          if (hostname === 'ucp-cobranzas-qa.brazilsouth.cloudapp.azure.com') {
            return 'https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure';
          } else if (hostname === 'ucp-cobranzas.brazilsouth.cloudapp.azure.com') {
            return 'https://wservicescorp.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure';
          } else{
            return 'https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure';
          }
        }      
        return '';
    }

    //Invoco al servicio web institucional de Guía de Procesos para obtener dperry@socovesa y aherrera@socovesa...
    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(getUrlGuia(), {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Key: 'kfjshf84rwkjfsdklgfw49@254325jhsdgft',
                    ParametrosEntradaWs1: {
                        Guia: {
                            Cod: '1',
                            Estado: {
                                Cod: '1',
                                Grupo: {
                                    Cod: '1'
                                }
                            }
                        },
                        Sistema: {
                            Cod: '31',
                            Estado: {
                                Cod: '1',
                                Grupo: {
                                    Cod: '1'
                                }
                            }
                        }
                    }
                })
            });

            const dataInst = await response.json();
            //console.log('Datos recibidos:', JSON.stringify(dataInst, null, 2)); // Mostrar datos en la consola
            if (dataInst.ParametrosSalidaWs1) {
                setCorreoGerente(dataInst.ParametrosSalidaWs1.Caracteres);
            }
        } catch (error) {
            console.error('Error de red:', error);
            // Maneja el error de red, muestra un mensaje de error o realiza otras acciones necesarias.
        }
        try {
            const response = await fetch(getUrlGuia(), {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Key: 'kfjshf84rwkjfsdklgfw49@254325jhsdgft',
                    ParametrosEntradaWs1: {
                        Guia: {
                            Cod: '2',
                            Estado: {
                                Cod: '1',
                                Grupo: {
                                    Cod: '1'
                                }
                            }
                        },
                        Sistema: {
                            Cod: '31',
                            Estado: {
                                Cod: '1',
                                Grupo: {
                                    Cod: '1'
                                }
                            }
                        }
                    }
                })
            });

            const dataInst = await response.json();

            if (dataInst.ParametrosSalidaWs1) {
                setCorreoSupervisor(dataInst.ParametrosSalidaWs1.Caracteres);
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    });

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        cargarDatos(); 
    };

    const openPopupCGenerados = () => {
        if (rowSelectionModel.length === 0) {
            // Mostrar Snackbar si no se han seleccionado registros
            setOpenAlertaError2({
                open: true,
                message: "No se ha seleccionado un registro. Acción inválida.",
            });
        } else if (rowSelectionModel.length > 1) {
            // Mostrar Snackbar si se han seleccionado más de un registro
            setOpenAlertaError2({
                open: true,
                message: "Solo puedes seleccionar un registro a la vez para visualizar los correos generados.",
            });
        } else {
            setIsPopupOpenCGenerados(true);
        }
    };

    const closePopupCGenerados = () => {
        setIsPopupOpenCGenerados(false);
        cargarDatos(); 
    };

    const CustomModal = ({ closeFunction, contentComponent, popupWidth }) => {
        
        return (
            <div className="custom-modal" style={{ background: 'white', width: `${popupWidth}px` }}>
                <div className="modal-content">
                    {/* Aquí puedes agregar el contenido personalizado */}
                    {/*<h2>Título del Popup</h2>*/}
                    {/*<p>Contenido personalizado</p>*/}
                    <button
                        onClick={closeFunction}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 1,
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            color: '#333',// Color del ícono de cierre
                        }}
                    >
                        &#x2716; {/* Este es el símbolo de la equis (X) como ícono de cierre */}
                    </button>
                    <div style={{ width: '100%' }}>
                        {contentComponent}
                    </div>
                </div>
            </div>
        );
    };

    const cargarDatos = async () => {
        fetchData();
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const fechaMaxima = await LlamadosApis.obtenerFechaMaxima(token);
                setFechaMaximaFlujo(fechaMaxima)
                const data = await LlamadosApis.ObtenerDatosCabeceras(token);
                setRows(data);
                setIsDataLoaded(true);
            } catch (errorFechaMaxima) {
                setOpenAlertaErrorApi(true);
                console.error('Error al obtener la Fecha Máxima:', errorFechaMaxima);
            }
        } catch (errorToken) {
            setOpenAlertaErrorApi(true);
            console.error('Error al Obtener Token:', errorToken);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const columns = [
        { field: 'Cabecera_ID',                                             headerAlign: 'center',  headerName: 'Id.', width: 60 , align: 'center' },
        { field: 'Cabecera_FechaSubida',             type: 'dateTime',      headerAlign: 'center',  headerName: 'Fecha Creación', width: 200,align: 'center', valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Cabecera_NombreUsuarioSubida',                            headerAlign: 'left',  headerName: 'Usuario Creador', width: 180 , align: 'left'},
        { field: 'Cantidad_Correos',                 type: 'number',        headerAlign: 'center',  headerName: 'Correos Totales', width: 200 , align: 'center'},
        { field: 'MontoTotal_Correos',               type: 'number',        headerAlign: 'center',  headerName: 'Monto Total Correos', width: 200 , align: 'center', valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
        { field: 'Cantidad_Enviados',                type: 'number',        headerAlign: 'center',  headerName: 'Correos Enviados', width: 190 , align: 'center'},
        //{ field: 'Cabecera_FechaProcesado',          type: 'dateTime',      headerAlign: 'center',  headerName: 'Fecha Procesado', width: 150,align: 'center', valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        //{ field: 'Cabecera_NombreUsuarioProcesado',                         headerAlign: 'left',    headerName: 'Usuario que Procesó', width: 210 , align: 'left'},
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={openPopup}
                    disabled={!isDataLoaded}
                >
                    Subir Solicitudes SAP
                </Button>
                {isPopupOpen && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopup} contentComponent={<SubirSolicitudesSap textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} CorreoSupervisor={CorreoSupervisor} />} popupWidth={1500} />
                    </div>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={openPopupCGenerados}
                    disabled={!isDataLoaded}
                    style={{ marginLeft: '5px' }}
                >
                    Correos Generados
                </Button>
                {isPopupOpenCGenerados && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopupCGenerados} contentComponent={<TrabajarConEnvios textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} PasoCabeceraId={rowSelectionModel.length > 0 ? rows.find((row) => row.Cabecera_ID === rowSelectionModel[0]).Cabecera_ID : null} />} popupWidth={1363} />
                    </div>
                )}
            </div>
                        
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
            open={openAlertaError2.open}
            autoHideDuration={3000}
            onClose={() => setOpenAlertaError2({ open: false, message: "" })}
            message={openAlertaError2.message}
            ContentProps={{
                style: {
                    backgroundColor: "red",
                    color: "white",
                    marginLeft: "-10px",
                },
            }}
        />
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

export default TrabajarConCorreos;