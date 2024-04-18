import React, { useState, useEffect , useCallback , useRef }               from 'react';
import TextField                                    from '@mui/material/TextField';
import { Button, Snackbar , Box}                    from '@mui/material';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';
import filtroFunctions from '../ManejarDatosApis/filtroFunctions'; 

const ABM_SOCIEDAD = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, Accion, Sociedad_Id , Sociedad_Cod , Sociedad_RazonSocial , Sociedad_Rut , Sociedad_Dv} = props;
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" }); 
    const [Rut, setSociedad_Rut] = useState(Sociedad_Rut);
    const [Dv, setSociedad_Dv] = useState(Sociedad_Dv);
    const [Sociedad, setSociedad_Cod] = useState(Sociedad_Cod);
    const [RazonSocial, setSociedad_RazonSocial] = useState(Sociedad_RazonSocial);
    const [Titulo, setTitulo] = useState('');
    const [Id, setId] = useState(Sociedad_Id);

    const cargarDatos = async (puedo) => {
        
    };

    const getTitulo = () => {
        switch (Accion) {
            case 1:
                return 'Agregar Sociedad';
            case 2:
                return 'Editar Sociedad';
            case 3:
                return 'Eliminar Sociedad';
            default:
                return 'Título predeterminado';
        }
    };

    useEffect(() => {
        cargarDatos();
        setTitulo(getTitulo());
    }, []);

    const GrabarAccion = async () => {
        
        if ((!Sociedad || !RazonSocial || !Rut || !Dv) && (Accion !==3)){
            setOpenAlertaError({
                open: true,
                message: "Por favor complete todos los campos antes de confirmar.",
            });
            return;
        }
        const token = await LlamadosApis.ObtenerToken();
        try {
            const CodigoRetornoGuardarSociedad = await LlamadosApis.ABM_SOCIEDAD( token , props.Accion , Id, Sociedad , RazonSocial , Rut , Dv );
            if(CodigoRetornoGuardarSociedad.resultado === 1){
                props.closePopup(props.Accion);
            }
            if(CodigoRetornoGuardarSociedad.resultado === 2){
                setOpenAlertaError({
                    open: true,
                    message: "La Sociedad digitada YA EXISTE. Favor verificar.",
                });
            }
            if(CodigoRetornoGuardarSociedad.resultado === 3){
                setOpenAlertaError({
                    open: true,
                    message: "La Sociedad a Eliminar NO EXISTE. Favor verificar.",
                });
            }
        } catch (error) {
            setOpenAlertaError({
                open: true,
                message: "*1***Error en Api. Consultar a T.I.",
            });
        }
   
        cargarDatos();
    };
    const handleChange = (e) => {
        const inputValue = e.target.value;
        const onlyNumbers = /^\d+$/;
        if (onlyNumbers.test(inputValue) || inputValue === '') {
            setSociedad_Rut(inputValue);
        }
    };
    const handleChange2 = (e) => {
        const inputValue = e.target.value.toUpperCase(); // Convertir a mayúsculas
        // Validar que solo sean letras en mayúsculas, números y espacios
        const onlyUppercaseLettersAndNumbers = /^[A-Z0-9\s]+$/;
        if (onlyUppercaseLettersAndNumbers.test(inputValue) || inputValue === '') {
            setSociedad_RazonSocial(inputValue);
        }
    };

    const handleChange3 = (e) => {
        const value = e.target.value.toUpperCase(); // Convertir a mayúsculas
        // Validar que sea un único carácter que puede ser número o letra en mayúscula
        const isValidInput = /^[0-9A-Z]$/;
        if (isValidInput.test(value) || value === '') {
            setSociedad_Dv(value);
        }
    };

    return (
        <div style={{ marginLeft: '15px' }}>
            <h1 style={{ marginTop: '5px', marginBottom: '40px' }}>{Titulo}</h1>
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Código"
                    onChange={(e) => setSociedad_Cod(e.target.value)}
                    value={Sociedad}
                    style={{ width: '120px', marginBottom: '10px'}}
                    InputProps={{
                        readOnly: Accion === 3 ? true : false,
                        style: { color: '#1976d2' } // Personaliza el color aquí
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
                <TextField
                    label="Razón Social"
                    onChange={handleChange2}
                    value={RazonSocial}
                    style={{ width: '400px', marginBottom: '10px' , marginLeft: '50px'}}
                    InputProps={{
                        readOnly: Accion === 3 ? true : false,
                        style: { color: '#1976d2' } // Personaliza el color aquí
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
                <TextField
                    label="Rut"
                    onChange={handleChange}
                    value={Rut}
                    style={{ width: '200px', marginBottom: '10px' , marginLeft: '50px'}}
                    InputProps={{
                        readOnly: Accion === 3 ? true : false,
                        style: { color: '#1976d2' , textAlign: 'center'},
                        inputProps: { pattern: '[0-9]*' }
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
                <span style={{ fontSize: '1.5em', margin: '0 5px', marginLeft: '10px', color: '#1976d2' }}>_</span>
                <TextField
                    label="Dv"
                    onChange={handleChange3}
                    value={Dv}
                    style={{ width: '50px', marginBottom: '10px' , marginLeft: '10px'}}
                    InputProps={{
                        readOnly: Accion === 3 ? true : false,
                        style: { color: '#1976d2' , textAlign: 'center'},
                        maxLength: 1
                    }}
                    InputLabelProps={{ 
                        style: { color: '#1976d2' }
                    }}
                    autoComplete="off"
                />
            </div>

            
            <Box
                display="flex"
                justifyContent="space-between" // Alinea los elementos a los lados
                alignItems="center"
                marginTop="40px"
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

export default ABM_SOCIEDAD;