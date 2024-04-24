import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import CerrarProceso                                from './CerrarProceso';
import DigitarPEP                                   from './DigitarPEP';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConLaDistribucion = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [CorreoGerente,setCorreoGerente] = useState("");
    const [CorreoSupervisor,setCorreoSupervisor] = useState("");
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isPopupOpenCerrar, setIsPopupOpenCerrar] = useState(false);
    const [CantTrabE, setCantTrabE] = useState(null);
    const [TodoAlDia, setTodoAlDia] = useState(null);
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });
    const [SubidaTrabajadores , setSubidaTrabajadores]=useState(null);
    const [SubidaDescuentosTrabajadores , setSubidaDescuentosTrabajadores]=useState(null);
    const [SubidaCobroAseguradora , setSubidaCobroAseguradora]=useState(null);
    const [FacturadoValido , setFacturadoValido]=useState(null);
    const [DistribucionValido , setDistribucionValido]=useState(null);
    const [popupParams, setPopupParams] = useState({
        textoNick: null,
        NombreUsuario: null,
        CodPerfil: null,
        CorreoUsuario: null,
        Sociedad_Cod: null,
        Razon_Social: null,
        Proyecto_Nombre: null,
    });

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

    const openPopup = (textoNick, NombreUsuario, CodPerfil, CorreoUsuario, Sociedad_Cod, Razon_Social, Proyecto_Nombre) => {
        setIsPopupOpen(true);
        setPopupParams({ textoNick, NombreUsuario, CodPerfil, CorreoUsuario, Sociedad_Cod, Razon_Social, Proyecto_Nombre });
    };

    const closePopup = (puedo) => {
        setIsPopupOpen(false);
        if (puedo === 1) {
            setOpenAlertaOK({
                open: true,
                message: "Se ha asignado el PEP correctamente.",
            });
            setRowSelectionModel([]);
        }
        cargarDatos(); 
    };

    const closePopupCerrar = (puedo) => {
        setIsPopupOpenCerrar(false);
        if (puedo === 1) {
            setOpenAlertaOK({
                open: true,
                message: "Se ha Cerrado el Proceso correctamente.",
            });
            setRowSelectionModel([]);
        }
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

                const dataEstadoSubidaExcel = await LlamadosApis.ObtenerEstadoSubidaExcel(token);
                const { SubidaTrabajadores, SubidaDescuentosTrabajadores, SubidaCobroAseguradora, FacturadoValido, DistribucionValido } = dataEstadoSubidaExcel;
                setSubidaTrabajadores(SubidaTrabajadores)
                setSubidaDescuentosTrabajadores(SubidaDescuentosTrabajadores)
                setSubidaCobroAseguradora(SubidaCobroAseguradora)
                setFacturadoValido(FacturadoValido)
                setDistribucionValido(DistribucionValido)

                const CantidadT = await LlamadosApis.ObtenerCantidadSociedadesFacturadas(token);
                setCantTrabE(CantidadT);
                const data = await LlamadosApis.ObtenerDistribucionesExcel(token);
                setRows(data);
                setIsDataLoaded(true);
            } catch (errorObtenerDatos) {
                setOpenAlertaError({
                    open: true,
                    message: "Error en API. Consultar a T.I.",
                });
                console.error('Error al obtener Datos de los Trabajadores:', errorObtenerDatos);
            }
        } catch (errorToken) {
            setOpenAlertaError({
                open: true,
                message: "Error en API. Consultar a T.I.",
            });
            console.error('Error al Obtener Token:', errorToken);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleAsignarPEP = (textoNick, NombreUsuario, CodPerfil, CorreoUsuario, Sociedad_Cod, Razon_Social, Proyecto_Nombre) => {
        //console.log(`Row ID: ${Sociedad_Cod}`)
        openPopup(textoNick, NombreUsuario, CodPerfil, CorreoUsuario, Sociedad_Cod, Razon_Social, Proyecto_Nombre);
    };

    const columns = [
        { field: 'Id',                                                  headerAlign: 'center',  headerName: 'Id', width: 50 , align: 'center' },
        { field: 'Sociedad_Cod',                                        headerAlign: 'center',  headerName: 'Sociedad', width: 100 , align: 'center' },
        { field: 'Sociedad_RazonSocial',                                headerAlign: 'left',  headerName: 'Razón Social', width: 195,align: 'left'},
        { field: 'CentroCoste',                                         headerAlign: 'center',  headerName: 'Centro', width: 115,align: 'left'},
        { field: 'Denominacion',                                        headerAlign: 'left',  headerName: 'Denominación', width: 195,align: 'left'},
        { field: 'NroTrabajadoresDescuento',            type: 'number', headerAlign: 'center',    headerName: '# Desc.', width: 90 , align: 'center' , valueFormatter: (params) => {
            if (params.value === 0) {
              return ' '; // Espacio en blanco
            }
            return params.value.toLocaleString('en-US');
        },},
        { field: 'TotalDescuentos',                     type: 'number', headerAlign: 'center',    headerName: '$ Desc.', width: 90 , align: 'right' , valueFormatter: (params) => {
            if (params.value === 0) {
              return ' '; // Espacio en blanco
            }
            return params.value.toLocaleString('en-US');
        },},
        { field: 'NroTrabajadoresCobroAseguradora',     type: 'number', headerAlign: 'center',    headerName: '# Cob.', width: 90 , align: 'center' , valueFormatter: (params) => {
            if (params.value === 0) {
              return ' '; // Espacio en blanco
            }
            return params.value.toLocaleString('en-US');
        },},
        { field: 'TotalCobroAseguradora',               type: 'number', headerAlign: 'center',    headerName: '$ Cob.', width: 90 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalExentoCobroAseguradora',         type: 'number', headerAlign: 'center',    headerName: '$ Exento', width: 90 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalAfectoCobroAseguradora',         type: 'number', headerAlign: 'center',    headerName: '$ Afecto', width: 90 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalIvaCobroAseguradora',            type: 'number', headerAlign: 'center',    headerName: '$ Iva', width: 90 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'CostoEmpresa',                        type: 'number', headerAlign: 'center',    headerName: '$ Costo Empresa', width: 140 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'Existe',                                              headerAlign: 'center',    headerName: '¿Existe?', width: 180 , align: 'center' ,
        renderCell: (params) => {
            if (params.row.CentroCoste === 'PEP NO ENCONTRADO') {
                return (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAsignarPEP(
                            props.textoNick, props.NombreUsuario, props.CodPerfil, props.CorreoUsuario, params.row.Sociedad_Cod, params.row.Sociedad_RazonSocial, params.row.Denominacion
                        )}
                    >
                        ASIGNAR PEP
                    </Button>
                );
            } else {
                return (
                    <div style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        Si
                    </div>
                );
            }
        },
    },

    ];
  
    const getRowId = (row) => row.Id;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            Id: row.Id,
            'Sociedad': row.Sociedad_Cod,
            'Razón Social': row.Sociedad_RazonSocial,
            'Centro': row.CentroCoste,
            'Denominación': row.Denominacion,
            'Cantidad Descuentos': row.NroTrabajadoresDescuento,
            'Monto Descuento': row.TotalDescuentos,
            'Cantidad Cobranzas': row.NroTrabajadoresCobroAseguradora,
            'Monto Cobranza': row.TotalCobroAseguradora,
            'Exento': row.TotalExentoCobroAseguradora,
            'Afecto': row.TotalAfectoCobroAseguradora,
            'IVA': row.TotalIvaCobroAseguradora,
            'Costo Empresa': row.CostoEmpresa,
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(adjustedRowsData); // Exporta todas las filas
        XLSX.utils.book_append_sheet(wb, ws, 'Datos Seleccionados');
        const fileName = 'ArchivoMío.xlsx';
        XLSX.writeFile(wb, fileName);
        setOpenAlertaOK({
            open: true,
            message: "Se han exportado todos los registros al Excel.",
        });
    };

    const handleCloseAlertaOK = () => {
        setOpenAlertaOK({
            open: false,
            message: "",
        });
    };

    const handleRowSelectionModelChange = (newRowSelectionModel) => {
        setRowSelectionModel(newRowSelectionModel);
    }
    return (
        <div style={{ marginLeft: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ marginTop: '40px', marginBottom: '40px', marginRight: '905px' }}>Distribuido</h1>
                <table style={{ borderCollapse: 'collapse' }}>
                    <tr>
                        <td style={{ padding: '8px' , textAlign: 'center'}}>
                            {SubidaTrabajadores === 1 ?
                                <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                                <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                        </td>
                        <td style={{ padding: '8px' , textAlign: 'center'}}>
                            {SubidaDescuentosTrabajadores === 1 ?
                                <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                                <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                        </td>
                        <td style={{ padding: '8px' , textAlign: 'center'}}>
                            {SubidaCobroAseguradora === 1 ?
                                <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                                <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                        </td>
                        <td style={{ padding: '8px' , textAlign: 'center'}}>
                            {FacturadoValido === 1 ?
                                <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                                <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                        </td>
                        <td style={{ padding: '8px' , textAlign: 'center'}}>
                            {DistribucionValido === 1 ?
                                <img src="/images/EstadoUNO.jpg" width={50} height={50} alt='Estado UNO'/> :
                                <img src="/images/EstadoCERO.jpg" width={50} height={50} alt='Estado CERO'/>}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px', color: SubidaTrabajadores === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                            Trabajadores
                        </td>
                        <td style={{ padding: '8px', color: SubidaDescuentosTrabajadores === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                            Descuentos
                        </td>
                        <td style={{ padding: '8px', color: SubidaCobroAseguradora === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                            Aseguradora
                        </td>
                        <td style={{ padding: '8px', color: FacturadoValido === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                            Facturas
                        </td>
                        <td style={{ padding: '8px', color: DistribucionValido === 1 ? 'green' : '#CC0000', fontWeight: 'bold' }}>
                            Distribuido
                        </td>
                    </tr>
                </table>
            </div>

            <h4 style={{ marginTop: '0px', marginBottom: '40px' }}>
                {CantTrabE === null
                ? 'Actualmente no existe información de Sociedades a Facturar (Información Aseguradora).'
                : `Existen ${CantTrabE.toLocaleString('en-US')} Sociedades a Facturar (Información Aseguradora).`}
            </h4>
        
            <div style={{ display: 'flex', alignItems: 'center' }}> 
                {isPopupOpen && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopup} contentComponent={<DigitarPEP closePopup={closePopup} {...popupParams} />} popupWidth={1220} />
                    </div>
                )}
                {CodPerfil === '10' || CodPerfil === '3101' ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            const TodoAlDia = SubidaTrabajadores === 1 && SubidaDescuentosTrabajadores === 1 && SubidaCobroAseguradora === 1 && FacturadoValido === 1 && DistribucionValido === 1 ? 1 : 0;
                            setIsPopupOpenCerrar(true);
                            setTodoAlDia(TodoAlDia);
                            setTodoAlDia(1);
                        }}
                        disabled={!isDataLoaded}
                    >
                        Finalizar Proceso
                    </Button>
                ):null}
                {isPopupOpenCerrar && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopupCerrar} contentComponent={<CerrarProceso closePopupCerrar={closePopupCerrar} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} TodoAlDia={TodoAlDia} />} popupWidth={800} />
                    </div>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExportarAexcel}
                    disabled={!isDataLoaded} // Deshabilitar si rows está vacío
                    style={{ marginLeft: CodPerfil === '10' || CodPerfil === '3101' ? '5px' : '0', }}
                >
                    Exportar a Excel
                </Button>
            </div>

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
            />
            <Snackbar
                open={openAlertaOK.open}
                autoHideDuration={3000}
                onClose={handleCloseAlertaOK}
                message={openAlertaOK.message}
                ContentProps={{
                    style: {
                    marginLeft: '-10px'
                    },
                }}
            />
            <div style={{ marginTop: '5px' }}>
                <div className="custom-data-grid-container" style={{ height: '500px', width: '1609px' }}>
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            '& .NoIluminar': {
                            
                            },
                            '& .Iluminar': {
                            backgroundColor: '#B8E5F6',
                            color: '#1a3e72',
                            fontWeight: 'bold'
                            },
                            '& .IluminarAmarilloError': {
                            backgroundColor: '#FFFFCC',
                            color: '#ff0000',
                            },
                            '& .IluminarVerde': {
                                backgroundColor: '#D7E9CC',
                            },
                            
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            //checkboxSelection
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
                                return (
                                    <div>
                                        {from} - {to} de un total de {count}
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
                            pageSizeOptions={[]}getCellClassName={(params) => {
                                if (params.row.CentroCoste === 'TOTAL' ) {
                                    return 'Iluminar'; // Clase para toda la fila
                                }
                                if (params.row.CentroCoste === 'FACTURA' && params.row.NroTrabajadoresDescuento === 0) {
                                    return 'IluminarVerde'; // Clase para la celda con espacio en blanco
                                }
                                if (params.row.CentroCoste === 'DIFERENCIA' ) {
                                    return 'IluminarAmarilloError'; // Clase para toda la fila
                                }
                                if (params.field === 'CentroCoste' && params.row.CentroCoste.substring(0, 1).match(/\d/) && params.row.CentroCoste.substring(0, 4) !== params.row.Sociedad_Cod.toString().substring(0, 4)) {
                                    return 'IluminarAmarilloError'; 
                                }
                                return 'NoIluminar'; // Sin clase para la fila
                            }}
                        />
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default TrabajarConLaDistribucion;