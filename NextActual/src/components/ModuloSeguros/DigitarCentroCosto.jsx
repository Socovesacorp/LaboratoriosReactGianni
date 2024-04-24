import React, { useState, useEffect , useCallback , useRef }               from 'react';
import TextField                                    from '@mui/material/TextField';
import { Button, Snackbar , Box}                    from '@mui/material';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';
import filtroFunctions from '../ManejarDatosApis/filtroFunctions'; 

const DigitarCentroCosto = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, PasoCabeceraId , Descuento1oAporte2} = props;
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" }); //aquiiiiii
    const [Apellido_Nombre, setApellido_Nombre] = useState('');
    const [NombreEmpresa, setNombreEmpresa] = useState('');
    const [Sociedad, setSociedad] = useState('');
    
    //Filtros...
    const [CentroDeCostoFiltro, setCentroDeCostoFiltro] = useState('');

    //Sugerencias...
    const [sugerenciasCentroDeCosto, setSugerenciasCentroDeCosto] = useState([]);
    const [mostrarSugerenciasCentroDeCosto, setMostrarSugerenciasCentroDeCosto] = useState(false);
    const CentroDeCostoInputRef = useRef(null);

    //Si se hace click fuera de la lista de sugerencias que se desaparezca...
    const handleDocumentClick = (event) => {
        //console.log('Clicked outside');
        if ( CentroDeCostoInputRef.current && !CentroDeCostoInputRef.current.contains(event.target) ){
            //console.log('Hiding suggestions');
            setMostrarSugerenciasCentroDeCosto(false);
        }
    };

    const handleCentroDeCostoClick = () => {
        handleCentroDeCostoChange({ target: { value: CentroDeCostoFiltro } });
    };

    const cargarDatos = async (puedo) => {
        try {
            const token = await LlamadosApis.ObtenerToken();
            try {
                const data = await LlamadosApis.ObtenerEmpresaYnombreDadoIDexcel(token,props.PasoCabeceraId,props.Descuento1oAporte2);
                const { Apellido_Nombre, NombreEmpresa, Sociedad } = data[0];
                setApellido_Nombre(Apellido_Nombre)
                setNombreEmpresa(NombreEmpresa)
                setSociedad(Sociedad)

            } catch (errorApi) {
                setOpenAlertaError({
                    open: true,
                    message: "*2***Error en Api. Consultar a T.I.",
                });
            }
        } catch (errorToken) {
            setOpenAlertaError({
                open: true,
                message: "*3***Error en Api. Consultar a T.I.",
            });
        }
    };

    useEffect(() => {
        cargarDatos();
        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const handleSugerenciaSeleccionada = (tipo, sugerencia) => {
        switch (tipo) {
          case "CentroDeCosto":
            setSugerenciasCentroDeCosto([]); 
            setMostrarSugerenciasCentroDeCosto(false); 
            setCentroDeCostoFiltro(sugerencia.CentroCoste);
            break;
          default:
            break;
        }
    };
    const handleCentroDeCostoChange = (event) => {
        filtroFunctions.SugerirCentroDeCosto(event, setCentroDeCostoFiltro, setMostrarSugerenciasCentroDeCosto, setSugerenciasCentroDeCosto);
    };

    const GrabarAccion = async () => {
        const token = await LlamadosApis.ObtenerToken();
        try {
            const CodigoRetornoValidarYguardar = await LlamadosApis.ValidarYguardarCentroDeCosto(token, CentroDeCostoFiltro,props.PasoCabeceraId,props.Descuento1oAporte2);
            if(CodigoRetornoValidarYguardar.resultado === 999){
                setOpenAlertaError({
                    open: true,
                    message: "El Centro de Costo digitado no existe. Favor verifique.",
                });
            } else if (CodigoRetornoValidarYguardar.resultado === 1) {
                setOpenAlertaError({
                    open: true,
                    message: "todo cambió perfecto!!!",
                });
                props.closePopup(1);
            }
        } catch (error) {
            setOpenAlertaError({
                open: true,
                message: "*1***Error en Api. Consultar a T.I.",
            });
        }
   
        cargarDatos();
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>Asignar Centro de Costo al Trabajador</h1>
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Trabajador"
                    value={Apellido_Nombre}
                    style={{ width: '500px', marginBottom: '10px'}}
                    InputProps={{
                        readOnly: true,
                        style: { color: '#1976d2' } // Personaliza el color aquí
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
                <TextField
                    label="Empresa"
                    value={NombreEmpresa}
                    style={{ width: '500px', marginBottom: '10px' , marginLeft: '50px'}}
                    InputProps={{
                        readOnly: true,
                        style: { color: '#1976d2' } // Personaliza el color aquí
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
                <TextField
                    label="Sociedad"
                    value={Sociedad}
                    style={{ width: '100px', marginBottom: '10px' , marginLeft: '50px'}}
                    InputProps={{
                        readOnly: true,
                        style: { color: '#1976d2' , textAlign: 'center'} // Personaliza el color aquí
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
            </div>

            <div style={{ display: 'flex' }}>
                <div>
                    <div style={{ marginRight: '10px' }}>
                        
                        <TextField
                            label="Centro de Costo"
                            value={CentroDeCostoFiltro}
                            onChange={handleCentroDeCostoChange}
                            onClick={handleCentroDeCostoClick}
                            style={{ width: '500px' }}
                            autoComplete="off"
                            inputRef={CentroDeCostoInputRef}
                        />
                    </div>
                    {/* Mostrar sugerencias mientras escribes */}
                    <ul className={mostrarSugerenciasCentroDeCosto ? 'suggestions-list-CentroDeCosto' : 'suggestions-list-CentroDeCosto hidden'}>
                        {sugerenciasCentroDeCosto.map((sugerencia, index) => (
                            <li key={index} onClick={() => handleSugerenciaSeleccionada("CentroDeCosto", sugerencia)}>
                            {sugerencia.CentroCosteDenominacion}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <Box
                display="flex"
                justifyContent="space-between" // Alinea los elementos a los lados
                alignItems="center"
                marginTop="190px"
                marginBottom="10px"
                marginLeft="-5px"
                marginRight="20px"
                >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={GrabarAccion}
                        
                        style={{ marginLeft: '5px' }}
                    >
                        Confirmar
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
                anchorOrigin={{
                    vertical: 'center', // Centra verticalmente
                    horizontal: 'center', // Centra horizontalmente
                }}
                style={{
                    position: 'absolute',
                    bottom: '10px',
                }}
            />
        </div>
    );
};

export default DigitarCentroCosto;