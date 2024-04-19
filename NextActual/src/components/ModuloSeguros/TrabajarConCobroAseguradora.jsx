import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import SubirCobroAseguradoraExcel                   from './SubirCobroAseguradoraExcel';
import TrabajarConTrabajadores                      from './TrabajarConTrabajadores';
import '../../hojas-de-estilo/MantenedorExcels.css';
import DigitarCentroCosto from './DigitarCentroCosto';

const TrabajarConCobroAseguradora = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [CodigoSeguroCompSal,setCodigoSeguroCompSal] = useState("");
    const [CodigoSeguroCata,setCodigoSeguroCata] = useState("");
    const [rowSelectionModel1, setRowSelectionModel1] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" });
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isPopupOpenCGenerados, setIsPopupOpenCGenerados] = useState(false);
    const [CantDescA, setCantDescA] = useState(null);
    const [totalSi, setTotalSi] = useState(0);
    const [totalNo, setTotalNo] = useState(0);
    const [shouldUpdate, setShouldUpdate] = useState(true);

    const [SubidaTrabajadores , setSubidaTrabajadores]=useState(null);
    const [SubidaDescuentosTrabajadores , setSubidaDescuentosTrabajadores]=useState(null);
    const [SubidaCobroAseguradora , setSubidaCobroAseguradora]=useState(null);
    const [FacturadoValido , setFacturadoValido]=useState(null);
    const [DistribucionValido , setDistribucionValido]=useState(null);

    let refresco = 0;

    const openPopupCGenerados = () => {
        if (rowSelectionModel1.length === 0) {
            setOpenAlertaError({
                open: true,
                message: "No se ha seleccionado un registro. Acción inválida.",
            });
        } else if (rowSelectionModel1.length > 1) {
            setOpenAlertaError({
                open: true,
                message: "Solo puedes seleccionar un registro a la vez para para asignarle un Centro de Costo.",
            });
        } else if (rows.find((row) => row.CobroAseguradoraExcel_ID === rowSelectionModel1[0]).Existe !== 'No') {
            setOpenAlertaError({
                open: true,
                message: "Solo puedes seleccionar un registro con 'Existe' igual a 'No' para asignarle un Centro de Costo.",
            });
        } else {
            setIsPopupOpenCGenerados(true);
        }
    };

    const closePopupCGenerados = (puedo) => {
        setIsPopupOpenCGenerados(false);
        if (puedo === 1) {
            setOpenAlertaOK({
                open: true,
                message: "Se ha asignado un Centro de Costo al Trabajador.",
            });
            setRowSelectionModel1([]);
        }
        
        cargarDatos(); 
    };

    //Invoco al servicio web institucional de Guía de Procesos para obtener dperry@socovesa y aherrera@socovesa...
    const fetchData = useCallback(async () => {
        //Obtengo los códigos del sistema UNO referentes a los seguros complementario y catastróficos
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
                            Cod: '3',
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
                setCodigoSeguroCompSal(dataInst.ParametrosSalidaWs1.Entero);
            }
        } catch (error) {
            console.error('Error de red:', error);
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
                            Cod: '4',
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
                setCodigoSeguroCata(dataInst.ParametrosSalidaWs1.Entero);
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
                message: "Se ha procesado la información de los Cobros de la Aseguradora.",
            });
            setRowSelectionModel1([]);
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

                refresco = refresco + 1;
                const CantidadA = await LlamadosApis.obtenerCantidadCobroAseguradoraExcel(token);
                setCantDescA(CantidadA);
                const data = await LlamadosApis.ObtenerDatosCobroAseguradoraExcel_Existe(token);
                setRows(data);
                setIsDataLoaded(true);

                setShouldUpdate(false);
            } catch (errorObtenerDatos) {
                setOpenAlertaError({
                    open: true,
                    message: "Error en Api. Consultar a T.I.",
                });
                console.error('Error al obtener Datos de los Descuentos Excel:', errorObtenerDatos);
            }
        } catch (errorToken) {
            setOpenAlertaError({
                open: true,
                message: "Error en Api. Consultar a T.I.",
            });
            console.error('Error al Obtener Token:', errorToken);
        }
    };

    useEffect(() => {
        if (shouldUpdate) {
            cargarDatos();
        }
        const totalSiCount = rows.filter((row) => row.Existe === "Si").length;
        const totalNoCount = rows.filter((row) => row.Existe === "No").length;
        setTotalSi(totalSiCount);
        setTotalNo(totalNoCount);
    }, [shouldUpdate,rows]);

    const columns = [
        { field: 'Existe',                              headerAlign: 'center',  headerName: '¿Existe?', width: 150 , align: 'center'},
        { field: 'CobroAseguradoraExcel_ID',        headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' },
        { field: 'Apellido_Nombre',                     headerAlign: 'left',    headerName: 'Nombre', width: 220,align: 'left'},
        { field: 'NIF',                                 headerAlign: 'center',  headerName: 'NIF', width: 100 , align: 'center'},
        { field: 'NombreEmpresa',                       headerAlign: 'left',    headerName: 'Empresa', width: 220 , align: 'left'},
        { field: 'CentroCoste',                         headerAlign: 'left',    headerName: 'C. Costo', width: 200 , align: 'left'},
        { field: 'Denominacion',                        headerAlign: 'left',    headerName: 'Denominación', width: 185 , align: 'left'},
        { field: 'Periodo',                             headerAlign: 'center',  headerName: 'Periodo', width: 80 , align: 'center'},       
        
        { field: 'Importe',        type: 'number',      headerAlign: 'right',  headerName: 'Importe', width: 98 , align: 'right', valueFormatter: (params) => {   return params.value.toLocaleString('en-US'); }, },
        { field: 'TipoSeguro',                          headerAlign: 'center',    headerName: 'Tipo Asegurado', width: 148 , align: 'center'},
    ];
  
    const getRowId = (row) => row.CobroAseguradoraExcel_ID;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            '¿Existe?': row.Existe,
            'Id.': row.CobroAseguradoraExcel_ID,
            'Nombre': row.Apellido_Nombre,
            'NIF': row.NIF,
            'Empresa': row.NombreEmpresa,
            'C. Costo': row.CentroCoste,
            'Denominación': row.Denominacion,
            'Periodo': row.Periodo,
            'Importe': row.Importe,
            'Tipo Asegurado': row.TipoSeguro,
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

    const handleRowSelectionModelChange1 = (newRowSelectionModel1) => {
        setRowSelectionModel1(newRowSelectionModel1);
    };

    return (
        <div style={{ marginLeft: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ marginTop: '40px', marginBottom: '40px', marginRight: '388px' }}>Cobros por parte de la Aseguradora</h1>
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
            {CantDescA === null
            ? 'Actualmente no existe información de Cobros por parte de la Aseguradora.'
            : `Existen ${CantDescA.toLocaleString('en-US')} Cobros de la Aseguradora procesados.`}
        </h4>
        <Box
            display="flex"
            justifyContent="space-between" // Alinea los elementos a los lados
            alignItems="center"
            marginBottom="10px"
            marginLeft="0px"
            marginRight="20px"
            width="1533px"
            >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {CodPerfil === '10' || CodPerfil === '3102' ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={openPopup}
                        disabled={!isDataLoaded}
                    >
                        Subir Cobros
                    </Button>
                ):null}
                {isPopupOpen && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopup} contentComponent={<SubirCobroAseguradoraExcel closePopup={closePopup} Seg1={CodigoSeguroCompSal} Seg2={CodigoSeguroCata} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} popupWidth={1500} />
                    </div>
                )}
                {CodPerfil === '10' || CodPerfil === '3102' ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={openPopupCGenerados}
                        disabled={!isDataLoaded}
                        style={{ marginLeft: '5px' }}
                    >
                        Asignar Centro de Costo
                    </Button>
                ):null}
                {isPopupOpenCGenerados && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopupCGenerados} contentComponent={<DigitarCentroCosto closePopup={closePopupCGenerados} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} PasoCabeceraId={rowSelectionModel1.length > 0 ? rows.find((row) => row.CobroAseguradoraExcel_ID === rowSelectionModel1[0]).CobroAseguradoraExcel_ID : null} Descuento1oAporte2={2} />} popupWidth={1238} />
                    </div>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExportarAexcel}
                    disabled={!isDataLoaded} // Deshabilitar si rows está vacío
                    style={{ marginLeft: CodPerfil === '10' || CodPerfil === '3102' ? '5px' : '0', }}
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
            <div className="custom-data-grid-container" style={{ height: '450px', width: '1543px' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={handleRowSelectionModelChange1}
                rowSelectionModel={rowSelectionModel1}
                getRowHeight={() => 'auto'}
                resizable
                className="custom-data-grid"
                getRowId={getRowId}
                localeText={{
                noRowsLabel: 'No hay filas para mostrar',
                MuiTablePagination: {
                    labelDisplayedRows: ({ from, to, count }) => {
                    const spaces = '\u00A0'.repeat(80);
                    return (
                        <div>
                            <span style={{ color: '#1976D2' , textShadow: '0.25px 0 0 #1976D2, 0 0.25px 0 #1976D2, -0.25px 0 0 #1976D2, 0 -0.25px 0 #1976D2' }}>
                                Encontrados: {totalSi} / NO Encontrados: {totalNo}
                            </span>
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
            />
            </div>
        </div>

    </div>
    );
};

export default TrabajarConCobroAseguradora;