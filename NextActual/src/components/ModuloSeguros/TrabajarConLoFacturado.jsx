import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import AvisarAucp                                   from './AvisarAucp';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConLoFacturado = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [CorreosEncargadosUCP,setCorreosEncargadosUCP] = useState("");
    const [CorreosEncargadosSocial,setCorreosEncargadosSocial] = useState("");
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [CantTrabE, setCantTrabE] = useState(null);
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });
    const [SubidaTrabajadores , setSubidaTrabajadores]=useState(null);
    const [SubidaDescuentosTrabajadores , setSubidaDescuentosTrabajadores]=useState(null);
    const [SubidaCobroAseguradora , setSubidaCobroAseguradora]=useState(null);
    const [FacturadoValido , setFacturadoValido]=useState(null);
    const [DistribucionValido , setDistribucionValido]=useState(null);

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
                            Cod: '5',
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
                setCorreosEncargadosUCP(dataInst.ParametrosSalidaWs1.Caracteres);
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
                            Cod: '6',
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
                setCorreosEncargadosSocial(dataInst.ParametrosSalidaWs1.Caracteres);
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    });

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = (puedo) => {
        setIsPopupOpen(false);
        if (puedo === 1) {
            setOpenAlertaOK({
                open: true,
                message: "Se ha procesado la información de los Descuentos a los Trabajadores.",
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
                const data = await LlamadosApis.ObtenerSociedadesFacturadasExcel(token);
                setRows(data);
                const dataWithResta = data.map((row) => ({
                    ...row,
                    RestaCobro: row.TotalCobroAseguradora - row.TotalFactura,
                    RestaExento: row.TotalExentoCobroAseguradora - row.TotalExento,
                    RestaAfecto: row.TotalAfectoCobroAseguradora - row.TotalAfecto,
                    RestaIva: row.TotalIvaCobroAseguradora - row.TotalIva,
                    TotalCE: row.TotalFactura - row.TotalDescuentos,
                    RestaCE: row.CostoEmpresa - (row.TotalFactura - row.TotalDescuentos),
                  }));
                  
                  setRows(dataWithResta);
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

    const columns = [
        { field: 'Sociedad_Cod',                                        headerAlign: 'center',  headerName: 'Soc', width: 60 , align: 'center' },
        { field: 'Sociedad_RazonSocial',                                headerAlign: 'left',  headerName: 'Razón Social', width: 195,align: 'left'},
        { field: 'NroTrabajadoresDescuento',            type: 'number', headerAlign: 'center',    headerName: '# Desc.', width: 80 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalDescuentos',                     type: 'number', headerAlign: 'center',    headerName: '$ Desc.', width: 80 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'NroTrabajadoresCobroAseguradora',     type: 'number', headerAlign: 'center',    headerName: '# Cobros', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalCobroAseguradora',               type: 'number', headerAlign: 'center',    headerName: '$ Cobro', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, description: 'Cobro Total calculado por el Sistema.'},
        { field: 'TotalFactura',                        type: 'number', headerAlign: 'center',    headerName: '(Sura)', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'RestaCobro',                          type: 'number', headerAlign: 'center',    headerName: '', width: 65 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalExentoCobroAseguradora',         type: 'number', headerAlign: 'center',    headerName: '$ Exento', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalExento',                         type: 'number', headerAlign: 'center',    headerName: '(Sura)', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, description: 'Monto Exento que figura en la Factura.' },
        { field: 'RestaExento',                         type: 'number', headerAlign: 'center',    headerName: '', width: 65 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalAfectoCobroAseguradora',         type: 'number', headerAlign: 'center',    headerName: '$ Afecto', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalAfecto',                         type: 'number', headerAlign: 'center',    headerName: '(Sura)', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, description: 'Monto Afecto que figura en la Factura.' },
        { field: 'RestaAfecto',                         type: 'number', headerAlign: 'center',    headerName: '', width: 65 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalIvaCobroAseguradora',            type: 'number', headerAlign: 'center',    headerName: '$ Iva', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalIva',                            type: 'number', headerAlign: 'center',    headerName: '(Sura)', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, description: 'Monto del IVA que figura en la Factura.' },
        { field: 'RestaIva',                            type: 'number', headerAlign: 'center',    headerName: '', width: 65 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'CostoEmpresa',                        type: 'number', headerAlign: 'center',    headerName: '$ C. Empresa', width: 120 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TotalCE',                             type: 'number', headerAlign: 'center',    headerName: '', width: 100 , align: 'right' , valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'RestaCE',                             type: 'number', headerAlign: 'center',    headerName: '', width: 80 , align: 'right' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value.toLocaleString('en-US')}
            </div>
        ),}
    ];
  
    const getRowId = (row) => row.Sociedad_Cod;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            'Sociedad': row.Sociedad_Cod,
            'Razón Social': row.Sociedad_RazonSocial,
            'Cantidad Trabajadores Descuento': row.NroTrabajadoresDescuento,
            'Monto Descuentos': row.TotalDescuentos,
            'Cantidad de Cobros': row.NroTrabajadoresCobroAseguradora,
            'Monto Cobro Calculado': row.TotalCobroAseguradora,
            'Monto Cobro Factura': row.TotalFactura,
            'Diferencia Cobro': row.RestaCobro,
            'Monto Exento Calculado': row.TotalExentoCobroAseguradora,
            'Monto Exento Factura': row.TotalExento,
            'Diferencia Exento': row.RestaExento,
            'Monto Afecto Calculado': row.TotalAfectoCobroAseguradora,
            'Monto Afecto Factura': row.TotalAfecto,
            'Diferencia Afecto': row.RestaAfecto,
            'Monto IVA Calculado': row.TotalIvaCobroAseguradora,
            'Monto IVA Factura': row.TotalIva,
            'Diferencia IVA': row.RestaIva,
            'Costo Empresa Calculado': row.CostoEmpresa,
            'Costo Empresa según Factura': row.TotalCE,
            'Diferencia Costo Empresa': row.RestaCE,
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
        
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ marginTop: '40px', marginBottom: '40px', marginRight: '352px' }}>Revisar lo Facturado</h1>
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

            <Box
                display="flex"
                justifyContent="space-between" // Alinea los elementos a los lados
                alignItems="center"
                marginBottom="5px"
                marginLeft="0px"
                marginRight="20px"
                >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {CodPerfil === '10' || CodPerfil === '3102' ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={openPopup}
                            disabled={!isDataLoaded}
                        >
                            Avisar a UCP
                        </Button>
                    ):null}
                    {isPopupOpen && (
                        <div className="popup-background">
                            <CustomModal closeFunction={closePopup} contentComponent={<AvisarAucp closePopup={closePopup} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} CorreosEncargadosUCP={CorreosEncargadosUCP} CorreosEncargadosSocial={CorreosEncargadosSocial} />} popupWidth={1500} />
                        </div>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleExportarAexcel}
                        style={{ marginLeft: CodPerfil === '10' || CodPerfil === '3102' ? '5px' : '0', }}
                        disabled={!isDataLoaded} // Deshabilitar si rows está vacío
                    >
                        Exportar a Excel
                    </Button>
                </div>
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
                <div className="custom-data-grid-container" style={{ height: '470px', width: '100%' }}>
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            '& .NoIluminar': {
                            
                            },
                            '& .IluminarAzul': {
                            backgroundColor: '#D7E9CC',
                            //color: '#1a3e72',
                            },
                            '& .IluminarAmarillo': {
                            backgroundColor: '#FFFFCC',
                            color: '#ff0000',
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
                                const spaces = '\u00A0'.repeat(50); // Utiliza el carácter especial para espacio no rompible
                                return (
                                    <div>
                                    
                                    {spaces}
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
                            pageSizeOptions={[]}
                            getCellClassName={(params) => {
                                if (params.field === 'TotalFactura') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'RestaCobro') {
                                    return 'IluminarAmarillo';
                                }
                                if (params.field === 'TotalExento') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'RestaExento') {
                                    return 'IluminarAmarillo';
                                }
                                if (params.field === 'TotalAfecto') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'RestaAfecto') {
                                    return 'IluminarAmarillo';
                                }
                                if (params.field === 'TotalIva') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'RestaIva') {
                                    return 'IluminarAmarillo';
                                }
                                if (params.field === 'TotalCE') {
                                    return 'IluminarAzul';
                                }
                                if (params.field === 'RestaCE') {
                                    return 'IluminarAmarillo';
                                }
                                return '';
                            }}
                        />
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default TrabajarConLoFacturado;