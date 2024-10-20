import React, { useState, useEffect , useCallback}  from 'react';
import { DataGrid }                                 from '@mui/x-data-grid';
import { Button, Snackbar , Box}                    from '@mui/material';
import * as XLSX                                    from 'xlsx';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import SubirFacturas                                from './SubirFacturas';
import '../../hojas-de-estilo/MantenedorExcels.css';

const TrabajarConFacturas = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario} = props;
    const [rowSelectionModel1, setRowSelectionModel1] = useState([]);
    const [rows, setRows] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" });
    const [openAlertaOK, setOpenAlertaOK] = useState({ open: false, message: "" });
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [CantFacts, setCantFacts] = useState(null);
    const [SubidaTrabajadores , setSubidaTrabajadores]=useState(null);
    const [SubidaDescuentosTrabajadores , setSubidaDescuentosTrabajadores]=useState(null);
    const [SubidaCobroAseguradora , setSubidaCobroAseguradora]=useState(null);
    const [FacturadoValido , setFacturadoValido]=useState(null);
    const [DistribucionValido , setDistribucionValido]=useState(null);

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
                            color: '#333',
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

                const Cantidad = await LlamadosApis.obtenerCantidadFacturasExcel(token);
                setCantFacts(Cantidad);
                const data = await LlamadosApis.ObtenerDatosFacturasExcel(token);
                setRows(data);
                setIsDataLoaded(true);
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
        cargarDatos();
    }, []);

    const columns = [
        { field: 'FacturasExcel_Id',            headerAlign: 'center',  headerName: 'Id.', width: 80 , align: 'center' , renderCell: (params) => (
            <div style={{ height: 50, display: 'flex',  alignItems: 'center' }}>
                {params.value.toLocaleString('en-US')}
            </div>
        ),},
        { field: 'Sociedad_RazonSocial',        headerAlign: 'center',  headerName: 'Empresa', width: 380 , align: 'left'},
        { field: 'Sociedad_Rut',                headerAlign: 'center',  headerName: 'Rut', width: 100 , align: 'CENTER'},
        { field: 'Factura_Nro',                 headerAlign: 'center',  headerName: 'Factura', width: 100 , align: 'center' },
        { field: 'Factura_Exento',        type: 'number',      headerAlign: 'right',  headerName: 'Exento', width: 100 ,    align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
        { field: 'Factura_Neto',          type: 'number',      headerAlign: 'right',  headerName: 'Neto', width: 100 ,      align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
        { field: 'Factura_Iva',           type: 'number',      headerAlign: 'right',  headerName: 'Iva', width: 100 ,       align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
        { field: 'Factura_Total',         type: 'number',      headerAlign: 'right',  headerName: 'Total', width: 104 ,     align: 'right' , valueFormatter: (params) => {   if (params.value !== null && params.value !== undefined) { return params.value.toLocaleString('en-US');   } else {  return 0; } }, },
      ];
  
    const getRowId = (row) => row.FacturasExcel_Id;

    const handleExportarAexcel = () => {
        const adjustedRowsData = rows.map((row) => ({
            Id: row.FacturasExcel_Id,
            Empresa: row.Sociedad_RazonSocial,
            Rut: row.Sociedad_Rut,
            Factura: row.Factura_Nro,
            Exento: row.Factura_Exento,
            Neto: row.Factura_Neto,
            Iva: row.Factura_Iva,
            Total: row.Factura_Total,
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
            <h1 style={{ marginTop: '40px', marginBottom: '40px', marginRight: '450px' }}>Facturas</h1>
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
            {CantFacts === null
            ? 'Actualmente no existe información de Facturas Recibidas.'
            : `Existen ${CantFacts.toLocaleString('en-US')} Facturas Recibidas.`}
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
                        Subir Facturas
                    </Button>
                ):null}
                {isPopupOpen && (
                    <div className="popup-background">
                        <CustomModal closeFunction={closePopup} contentComponent={<SubirFacturas closePopup={closePopup} textoNick={textoNick} NombreUsuario={NombreUsuario} CodPerfil={CodPerfil} CorreoUsuario={CorreoUsuario} />} popupWidth={1160} />
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
            <div className="custom-data-grid-container" style={{ height: '450px', width: '1100px' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                //checkboxSelection
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
                pageSizeOptions={[]}
            />
            </div>
        </div>

    </div>
    );
};

export default TrabajarConFacturas;