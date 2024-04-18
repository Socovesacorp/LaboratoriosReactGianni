import React, { useState, useEffect , useRef }      from 'react';
import * as XLSX                                    from 'xlsx';
import TextField                                    from '@mui/material/TextField';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import ManejoDatosGrillaMaterialUi                  from '../ManejarDatosGrilla/ManejoDatosGrillaMaterialUi';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import SubirSolicitudesFlujo                        from './SubirSolicitudesFlujo';
import '../../hojas-de-estilo/MantenedorExcels.css';
import filtroFunctions from '../ManejarDatosApis/filtroFunctions'; // Asegúrate de proporcionar la ruta correcta hacia el archivo filtros.js

const TrabajarConSolicitudes = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [openAlertaExcel, setOpenAlertaExcel] = useState(false);
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [fechaMaximaFlujo, setFechaMaximaFlujo] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Agrega un estado para controlar la carga de datos
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [openAlertaErrorApi, setOpenAlertaErrorApi] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [showFilterSnackbar, setShowFilterSnackbar] = useState(false);

    //Filtros...
    const [nombreSolicitanteFiltro, setNombreSolicitanteFiltro] = useState('');
    const [folioFiltro, setFolioFiltro] = useState('');
    const [tareaFiltro, setTareaFiltro] = useState('');
    const [nombreBeneficiarioFiltro, setNombreBeneficiarioFiltro] = useState('');

    //Sugerencias...
    const [sugerenciasSolicitantes, setSugerenciasSolicitantes] = useState([]);
    const [sugerenciasTareas, setSugerenciasTareas] = useState([]);
    const [sugerenciasBeneficiarios, setSugerenciasBeneficiarios] = useState([]);
    const [mostrarSugerenciasSolicitante, setMostrarSugerenciasSolicitante] = useState(false);
    const [mostrarSugerenciasTarea, setMostrarSugerenciasTarea] = useState(false);
    const [mostrarSugerenciasBeneficiario, setMostrarSugerenciasBeneficiario] = useState(false);
    const nombreSolicitanteInputRef = useRef(null);
    const nombreBeneficiarioInputRef = useRef(null);
    const tareaInputRef = useRef(null);

    const API_URL = ''; // Reemplaza con la URL correcta de tu API
  
    //Si se hace click fuera de la lista de sugerencias que se desaparezca...
    const handleDocumentClick = (event) => {
        if ( nombreSolicitanteInputRef.current && !nombreSolicitanteInputRef.current.contains(event.target) ){
          setMostrarSugerenciasSolicitante(false);
        }
        if ( tareaInputRef.current && !tareaInputRef.current.contains(event.target) ){
          setMostrarSugerenciasTarea(false);
        }
        if ( nombreBeneficiarioInputRef.current && !nombreBeneficiarioInputRef.current.contains(event.target) ){
          setMostrarSugerenciasBeneficiario(false);
        }
    };
    
    const handleSolicitantesChange = (event) => {
        filtroFunctions.SugerirSolicitantes(event, setNombreSolicitanteFiltro, setMostrarSugerenciasSolicitante, setSugerenciasSolicitantes);
    };

    const handleBeneficiariosChange = (event) => {
        filtroFunctions.SugerirBeneficiarios(event, setNombreBeneficiarioFiltro, setMostrarSugerenciasBeneficiario, setSugerenciasBeneficiarios);
    };

    const handleTareasChange = (event) => {
        filtroFunctions.SugerirTareas(event, setTareaFiltro, setMostrarSugerenciasTarea, setSugerenciasTareas);
    };

    const handleSugerenciaSeleccionada = (tipo, sugerencia) => {
        switch (tipo) {
          case "nombreSolicitante":
            setSugerenciasSolicitantes([]); setMostrarSugerenciasSolicitante(false); setNombreSolicitanteFiltro(sugerencia);
            break;
          case "nombreBeneficiario":
            setSugerenciasBeneficiarios([]); setMostrarSugerenciasBeneficiario(false); setNombreBeneficiarioFiltro(sugerencia);
            break;
          case "tarea":
            setSugerenciasTareas([]); setMostrarSugerenciasTarea(false); setTareaFiltro(sugerencia);
            break;
          default:
            break;
        }
    };

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        cargarDatos();
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
                        <SubirSolicitudesFlujo
                            textoNick={textoNick}
                            NombreUsuario={NombreUsuario}
                            CodPerfil={CodPerfil}
                            CorreoUsuario={CorreoUsuario}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const PresionarBuscar = () => {
        if (!folioFiltro && folioFiltro!==0 && !nombreSolicitanteFiltro && !tareaFiltro && !nombreBeneficiarioFiltro) {
            setShowFilterSnackbar(true);
            return;
        }else{
            cargarDatos()
        }
    }

    const cargarDatos = async () => {
        setRows([]);
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const fechaMaxima = await LlamadosApis.obtenerFechaMaxima(token);
                setFechaMaximaFlujo(fechaMaxima);
                const data = await LlamadosApis.ObtenerDatosSolicitudes(token,folioFiltro,nombreSolicitanteFiltro,tareaFiltro,nombreBeneficiarioFiltro);
                if (data && data.length > 0) {
                    setRows(data);
                    setIsDataLoaded(true);
                } else {
                    setIsDataLoaded(false);
                }
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
        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const columns = [
        { field: 'SolicitudId',                                                     headerAlign: 'center',  headerName: 'Id.',                              width: 80 , align: 'center' },
        { field: 'FOLIO',                                                           headerAlign: 'center',  headerName: 'Folio',                            width: 80 , align: 'center'},
        { field: 'NOMBREAUTOMATICO_SOLICITANTE',                                    headerAlign: 'left',    headerName: 'Solicitante',                      width: 300 , align: 'left'},
        { field: 'TAREA',                                                                                   headerName: 'Tarea',                            width: 150 },
        { field: 'ESTADO',                                                                                  headerName: 'Estado',                           width: 100 },
        { field: 'NOMBRE_BENEFICIARIO',                                             headerAlign: 'left',    headerName: 'Beneficiario',                     width: 200 , align: 'left'},
        { field: 'MONTO_SOLICITADO',                              type: 'number',   headerAlign: 'right',   headerName: 'Monto Solicitado',                 width: 200 , align: 'right' ,   valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'FECHA_INGRESO',                                 type: 'date',     headerAlign: 'center',  headerName: 'Fecha Ingreso',                    width: 150 , align: 'center',   valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDate(params.value),},
        { field: 'FECHA_INICIO',                                  type: 'date',     headerAlign: 'center',  headerName: 'Fecha Inicio',                     width: 150 , align: 'center',   valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDate(params.value),},
        { field: 'FECHA_TERMINO',                                 type: 'date',     headerAlign: 'center',  headerName: 'Fecha Término',                    width: 150 , align: 'center',   valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDate(params.value),},
        { field: 'Aprobador_Recepcion',                           type: 'dateTime', headerAlign: 'center',  headerName: 'Aprobador Recepcionó',             width: 200,align: 'center',     valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Aprobador_Aprobacion',                          type: 'dateTime', headerAlign: 'center',  headerName: 'Aprobador Aprobó',                 width: 200,align: 'center',     valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Enviado_a_Tesoreria_Recepcion',                 type: 'dateTime', headerAlign: 'center',  headerName: 'Tesorería Recepcionó',             width: 200,align: 'center',     valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Enviado_a_Tesoreria_Aprobacion',                type: 'dateTime', headerAlign: 'center',  headerName: 'Tesorería Aprobó',                 width: 200,align: 'center',     valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Pendiente_de_Rendicion_Recepcion',              type: 'dateTime', headerAlign: 'center',  headerName: 'Pendiente Rendición Recepción',    width: 250,align: 'center',     valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Pendiente_de_Rendicion_Aprobacion',             type: 'dateTime', headerAlign: 'center',  headerName: 'Pendiente Rendición Aprobación',   width: 280,align: 'center',     valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Cerrado_Recepcion',                             type: 'dateTime', headerAlign: 'center',  headerName: 'Cerrado Recepción',                width: 200,align: 'center',     valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'Cerrado_Aprobacion',                            type: 'dateTime', headerAlign: 'center',  headerName: 'Cerrado Aprobación',               width: 200,align: 'center',     valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDateAndTime(params.value),},
        { field: 'APROBADOR',                                                       headerAlign: 'left',    headerName: 'Aprobador',                        width: 300 , align: 'left'},
        { field: 'RUTAUTOMATICO_SOLICITANTE',                                       headerAlign: 'center',  headerName: 'Rut Automático Solicitante',       width: 250 , align: 'center'},
        { field: 'CARGOAUTOMATICO_SOLICITANTE',                                     headerAlign: 'left',    headerName: 'Cargo Automático Solicitante',     width: 300 , align: 'left'},
        { field: 'EMAILAUTOMATICO_SOLICITANTE',                                     headerAlign: 'left',    headerName: 'Correo Automático Solicitante',    width: 300 , align: 'left'},
        { field: 'ANEXOAUTOMATICO_SOLICITANTE',                                     headerAlign: 'center',  headerName: 'Anexo Automático Solicitante',     width: 300 , align: 'center'},
        { field: 'TIPO_DE_SOLICITUD',                                               headerAlign: 'left',    headerName: 'Tipo Solicitud',                   width: 150 , align: 'left'},
        { field: 'TIPO_MONEDA',                                                     headerAlign: 'center',  headerName: 'Tipo Moneda',                      width: 150 , align: 'center'},
        { field: 'MOTIVO_DE_SOLICITUD',                                             headerAlign: 'left',    headerName: 'Motivo Solicitud',                 width: 600 , align: 'left'},
        { field: 'FECHA_DE_RENDICION',                            type: 'date',     headerAlign: 'center',  headerName: 'Fecha Rendición',                  width: 150, align: 'center',    valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDate(params.value),},
        { field: 'TIPO_DE_RESPALDO',                                                headerAlign: 'left',    headerName: 'Tipo Respaldo',                    width: 200 , align: 'left'},
        { field: 'RESPALDO',                                                        headerAlign: 'left',    headerName: 'Respaldo',                         width: 200 , align: 'left'},
        { field: 'RUT_BEN',                                                         headerAlign: 'center',  headerName: 'Rut Beneficiario',                 width: 150 , align: 'center'},
        { field: 'TIPO_DE_CUENTA',                                                  headerAlign: 'left',    headerName: 'Tipo Cuenta',                      width: 150 , align: 'left'},
        { field: 'N_CUENTA',                                                        headerAlign: 'left',    headerName: 'Número Cuenta',                    width: 200 , align: 'left'},
        { field: 'BANCO',                                                           headerAlign: 'left',    headerName: 'Banco',                            width: 200 , align: 'left'},
        { field: 'EMAIL_BENEFICIARIO',                                              headerAlign: 'left',    headerName: 'Correo Beneficiario',              width: 200 , align: 'left'},
        { field: 'FECHA_PAGO',                                    type: 'date',     headerAlign: 'center',  headerName: 'Fecha Pago',                       width: 150, align: 'center',    valueGetter: (params) => ManejoDatosGrillaMaterialUi.parseDate(params.value),},
        { field: 'EMPRESA',                                                         headerAlign: 'left',    headerName: 'Empresa',                          width: 400 , align: 'left'},
        { field: 'CENTRO_DE_COSTO',                                                 headerAlign: 'left',    headerName: 'Centro Costo',                     width: 200 , align: 'left'},
    ];
  
    const getRowId = (row) => row.SolicitudId;

    const handleExportarAexcel = () => {
        const selectedRowsData = rows.filter((row) => rowSelectionModel.includes(row.SolicitudId));
        if (rowSelectionModel.length === 0) {
            console.error('No se han seleccionado filas para procesar.');
            setOpenAlertaError(true);
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
            <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>Trabajar con Solicitudes</h1>
            <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
                {fechaMaximaFlujo === '1753-01-01'
                    ? 'No hay datos cargados en las tablas.'
                    : `Los datos se encuentran actualizados al ${fechaMaximaFlujo}`}
            </h4>
            <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '10px' , marginBottom: '10px'}}>
                    <TextField
                        label="Folio"
                        type="number"
                        value={folioFiltro}
                        onChange={(event) => setFolioFiltro(event.target.value)}
                        style={{ width: '120px' }}
                    />
                </div>
                <div>
                    <div style={{ marginRight: '10px' }}>
                        <TextField
                            label="Nombre del Solicitante"
                            value={nombreSolicitanteFiltro}
                            onChange={handleSolicitantesChange}
                            style={{ width: '500px' }}
                            autoComplete="off"
                            inputRef={nombreSolicitanteInputRef}
                        />
                    </div>
                    {/* Mostrar sugerencias mientras escribes */}
                    <ul className={mostrarSugerenciasSolicitante ? 'suggestions-list-Solicitantes' : 'suggestions-list-Solicitantes hidden'}>
                        {sugerenciasSolicitantes.map((sugerenciaSolicitante, index) => (
                            <li key={index} onClick={() => handleSugerenciaSeleccionada("nombreSolicitante", sugerenciaSolicitante)}>
                            {sugerenciaSolicitante}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div style={{ marginRight: '10px' }}>
                        <TextField
                            label="Tarea"
                            value={tareaFiltro}
                            onChange={handleTareasChange}
                            style={{ width: '250px' }}
                            autoComplete="off"
                            inputRef={nombreBeneficiarioInputRef}
                        />
                    </div>
                    {/* Mostrar sugerencias mientras escribes */}
                    <ul className={mostrarSugerenciasTarea ? 'suggestions-list-Tareas' : 'suggestions-list-Tareas hidden'}>
                        {sugerenciasTareas.map((sugerenciaTarea, index) => (
                            <li key={index} onClick={() => handleSugerenciaSeleccionada("tarea", sugerenciaTarea)}>
                            {sugerenciaTarea}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div style={{ marginRight: '10px' }}>
                        <TextField
                            label="Nombre del Beneficiario"
                            value={nombreBeneficiarioFiltro}
                            onChange={handleBeneficiariosChange}
                            style={{ width: '500px' }}
                            autoComplete="off"
                            inputRef={nombreBeneficiarioInputRef}
                        />
                    </div>
                    {/* Mostrar sugerencias mientras escribes */}
                    <ul className={mostrarSugerenciasBeneficiario ? 'suggestions-list-Beneficiarios' : 'suggestions-list-Beneficiarios hidden'}>
                        {sugerenciasBeneficiarios.map((sugerenciaBeneficiario, index) => (
                            <li key={index} onClick={() => handleSugerenciaSeleccionada("nombreBeneficiario", sugerenciaBeneficiario)}>
                            {sugerenciaBeneficiario}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <div style={{ marginRight: '10px' , marginTop: '18px'}}>
                        <Button 
                            variant="contained"
                            color="primary"
                            onClick={PresionarBuscar}>
                            Buscar
                        </Button>
                        <Snackbar
                            open={showFilterSnackbar}
                            autoHideDuration={3000}
                            onClose={() => setShowFilterSnackbar(false)}
                            message="Debe especificar algún filtro para realizar su búsqueda."
                            ContentProps={{
                                style: {
                                    backgroundColor: 'red',
                                    color: 'white',
                                    marginLeft: '-10px',
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
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
                    //disabled={!isDataLoaded}
                >
                    Subir Formularios Solicitudes
                </Button>
                {isPopupOpen && ( 
                    <div className="popup-background">
                        <CustomModal />
                    </div>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExportarAexcel}
                    disabled={!isDataLoaded} // Deshabilitar si rows está vacío
                >
                    Exportar a Excel
                </Button>
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
            <div style={{ marginTop: '5px' }}>
                <div className="custom-data-grid-container" style={{ height: '500px', width: '99%' }}>
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
                                    {spaces} {from} - {to} de un total de {count}
                                </div>
                            );
                            },
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