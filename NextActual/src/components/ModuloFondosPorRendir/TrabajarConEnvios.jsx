import React, { useState, useEffect , useCallback}               from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import ManejoDatosGrillaMaterialUi                  from '../ManejarDatosGrilla/ManejoDatosGrillaMaterialUi';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import VisualizarCorreo                          from './VisualizarCorreo';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConEnvios = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, PasoCabeceraId} = props;
    const [CorreoGerente,setCorreoGerente] = useState("");
    const [CorreoSupervisor,setCorreoSupervisor] = useState("");
    const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
    const [openAlertaConfirmar, setOpenAlertaConfirmar] = useState(false);
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [fechaMaximaFlujo, setFechaMaximaFlujo] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [openAvisoGerente, setOpenAvisoGerente] = useState(false);
    const [openAlertaError2, setOpenAlertaError2] = useState({ open: false, message: "" });
    const [openAlertaErrorApi, setOpenAlertaErrorApi] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    //Invoco al servicio web institucional de Guía de Procesos para obtener dperry@socovesa y aherrera@socovesa...
    const fetchData = useCallback(async () => {
        try {
            //const response = await fetch('http://wservicesdes.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure', {
            const response = await fetch('https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure', {
            //const response = await fetch('https://wservicescorp.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure', {
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
            //const response = await fetch('http://wservicesdes.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure', {
            const response = await fetch('https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure', {
            //const response = await fetch('https://wservicescorp.brazilsouth.cloudapp.azure.com/rest/WsRetGuiaProcesosAzure', {
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
        if (rowSelectionModel.length === 0) {
            setOpenAlertaError2({
                open: true,
                message: "No se ha seleccionado un registro. Acción inválida.",
            });
        } else if (rowSelectionModel.length > 1) {
            setOpenAlertaError2({
                open: true,
                message: "Solo puedes seleccionar un registro a la vez.",
            });
        } else {
            setIsPopupOpen(true);
        }
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        cargarDatos(); // Llama a cargarDatos para recargar los datos
    };

    const ValidarCorreos = async () => {
        
        if (rowSelectionModel.length === 0) {
            setOpenAlertaError2({
                open: true,
                message: "No se han seleccionado registros. Acción inválida.",
            });
        } else {
            
            setProcessing(true);
            const token = await LlamadosApis.ObtenerToken();
            const promises = [];
                for (let i = 0; i < rowSelectionModel.length; i += 1) {
                    const correoId = rowSelectionModel[i];
                    const promise = LlamadosApis.EnviarCorreoValidado(token, correoId, 0);
                    promises.push(promise);
            }              
            Promise.all(promises)
                .then((results) => {
                // Todas las llamadas a la API se han completado
                cargarDatos(1);
            })
        }
    };

    const CustomModal = ({ parametroVarchar }) => {
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
                            top: '0px',
                            right: '0px',
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
                    <div style={{ width: '830px' }}>
                        <VisualizarCorreo
                            IdCorreo={parametroVarchar}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const cargarDatos = async (puedo) => {
        fetchData();
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const fechaMaxima = await LlamadosApis.obtenerFechaMaxima(token);
                setFechaMaximaFlujo(fechaMaxima)
                const data = await LlamadosApis.ObtenerDatosCorreosParaCabecera(token,props.PasoCabeceraId);
                setRows(data);
                setIsDataLoaded(true);
                if(puedo==1){
                    setOpenAlertaConfirmar(true);
                    setRowSelectionModel([]);
                }
                setProcessing(false);
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
        { field: 'Correo_ID',                                               headerAlign: 'center',  headerName: 'Id.', width: 60 , align: 'center' },
        { field: 'Correo_Nombre_Destinatario',                              headerAlign: 'left',  headerName: 'Destinatario', width: 180 , align: 'left' },
        { field: 'Correo_to',                                               headerAlign: 'left',  headerName: 'Correo', width: 180 , align: 'left' },
        { field: 'Correo_gerente',                                          headerAlign: 'left',  headerName: 'Copia a Gerente', width: 180 , align: 'left' },
        { field: 'Correo_asunto',                                           headerAlign: 'left',  headerName: 'Asunto', width: 140 , align: 'left' },
        { field: 'Sap_Cantidad_Documentos',       type: 'number',           headerAlign: 'center',  headerName: 'Documentos', width: 110 , align: 'center'},
        { field: 'Sap_Monto_total',               type: 'number',           headerAlign: 'right',  headerName: 'Monto', width: 100 , align: 'right', valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
        { field: 'Correo_fecha_creacion',         type: 'dateTime',         headerAlign: 'center',  headerName: 'Fecha Creación', width: 150,align: 'center', valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Correo_estado',                                           headerAlign: 'left',    headerName: 'Estado', width: 180 , align: 'left'},
        { field: 'Correo_fecha_envio',            type: 'dateTime',         headerAlign: 'center',  headerName: 'Fecha de Envío', width: 177,align: 'center', valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
    ];
  
    const getRowId = (row) => row.Correo_ID;

    const handleExportarAexcel = () => {
        const selectedRowsData = rows.filter((row) => rowSelectionModel.includes(row.Correo_ID));
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

    const AvisarAgerente = async () => {
        const selectedRowsData = rows.filter((row) => rowSelectionModel.includes(row.Correo_ID));
        if (rowSelectionModel.length === 0) {
            console.error('No se han seleccionado filas para procesar.');
            setOpenAlertaError(true); // Mostrar alerta de error
            return;
        }

        const token = await LlamadosApis.ObtenerToken();

        for (let i = 0; i < rowSelectionModel.length; i++) {
            const correoId = rowSelectionModel[i];
            const dataToUpdateGerente = {
                "Correo_ID":        correoId,
                "Correo_gerente":   CorreoGerente
            };

            try {
                const CodigoRetornoAvisarGerente = await LlamadosApis.CrearAvisoAgerente(token, dataToUpdateGerente);
                if(CodigoRetornoAvisarGerente!== 1){
                  setOpenAlertaErrorApi(true);
                  console.error('Error al intentar avisar a Gerente:', CodigoRetornoAvisarGerente);
                }
            } catch (error) {
                setOpenAlertaErrorApi(true);
                console.error('gianniError al intentar avisar a Gerente:', error);
            }
        }
        cargarDatos();
        setOpenAvisoGerente(true);
    };

    const handleCloseAlertaGerente = () => {
        setOpenAvisoGerente(false);
    };

    const handleOpenAlertaExcel = () => {
        setOpenAlertaExcel(true);
    };

    const handleCloseAlertaExcel = () => {
        setOpenAlertaExcel(false);
    };

    const handleCloseAlertaConfirmar = () => {
        setOpenAlertaConfirmar(false);
    };
    const handleRowSelectionModelChange = (newRowSelectionModel) => {
        setRowSelectionModel(newRowSelectionModel);
    };

    return (
        <div style={{ marginLeft: '15px' }}>
        <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>Trabajar con Envíos de la Cabecera N°{PasoCabeceraId}</h1>
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
                    Visualizar Correo
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={AvisarAgerente}
                    disabled={!isDataLoaded}
                    style={{ marginLeft: '5px' }}
                >
                    Avisar a Gerente
                </Button>
                {/* ... */}
                {isPopupOpen && ( 
                    <div className="popup-background">
                        <CustomModal parametroVarchar={rowSelectionModel.length > 0 ? rows.find((row) => row.Correo_ID === rowSelectionModel[0]).Correo_ID : null} />
                    </div>
                )}
            </div>
            <div style={{ width: '176px' }}>
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
            anchorOrigin={{
                vertical: 'center', // Centra verticalmente
                horizontal: 'center', // Centra horizontalmente
            }}
            ContentProps={{
                style: {
                marginLeft: '-10px'
                },
            }}
        />
        <Snackbar
            open={openAvisoGerente}
            autoHideDuration={3000}
            onClose={handleCloseAlertaGerente}
            message="Se han copiado los correos seleccionados al Gerente..."
            anchorOrigin={{
                vertical: 'center', // Centra verticalmente
                horizontal: 'center', // Centra horizontalmente
            }}
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
            anchorOrigin={{
                vertical: 'center', // Centra verticalmente
                horizontal: 'center', // Centra horizontalmente
            }}
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
            anchorOrigin={{
                vertical: 'center', // Centra verticalmente
                horizontal: 'center', // Centra horizontalmente
            }}
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
            anchorOrigin={{
                vertical: 'center', // Centra verticalmente
                horizontal: 'center', // Centra horizontalmente
            }}
            ContentProps={{
            style: {
                backgroundColor: 'red',
                color: 'white',
                marginLeft: '-10px'
            },
            }}
        />
        <Snackbar
            open={openAlertaError2.open}
            autoHideDuration={3000}
            onClose={() => setOpenAlertaError2({ open: false, message: "" })}
            message={openAlertaError2.message}
            anchorOrigin={{
                vertical: 'center', // Centra verticalmente
                horizontal: 'center', // Centra horizontalmente
            }}
            ContentProps={{
                style: {
                    backgroundColor: "red",
                    color: "white",
                    marginLeft: "-10px",
                },
            }}
        />
        <div style={{ marginTop: '5px' }}>
            <div className="custom-data-grid-container" style={{ height: '500px', width: '1330px' }}>

                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            '& .NoIluminar': {
                            
                            },
                            '& .Iluminar': {
                            backgroundColor: '#A9D5E6',
                            color: '#1a3e72',
                            },
                        }}
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
                        pageSizeOptions={[]}getCellClassName={(params) => {
                            if (params.value == null) {
                            return '';
                            }
                            return (params.value === 'No Validado' || params.value === 'Error. Consultar a T.I.') ? 'Iluminar' : 'NoIluminar';
                        }}
                    />
                </Box>
            </div>
            <div style={{ marginTop: '5px', marginBottom: '10px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={ValidarCorreos}
                    disabled={processing}
                >
                    Validar Correos
                </Button>
                <Snackbar
                    open={openAlertaConfirmar}
                    autoHideDuration={3000}
                    onClose={handleCloseAlertaConfirmar}
                    message="Se han validado los correos seleccionados..."
                    anchorOrigin={{
                        vertical: 'center', // Centra verticalmente
                        horizontal: 'center', // Centra horizontalmente
                    }}
                    ContentProps={{
                        style: {
                        marginLeft: '-10px'
                        },
                    }}
                />
            </div>
        </div>
        </div>
    );
};

export default TrabajarConEnvios;