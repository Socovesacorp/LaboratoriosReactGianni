import React, { useState, useEffect , useCallback , useRef }               from 'react';
import TextField                                    from '@mui/material/TextField';
import { Button, Snackbar , Box}                    from '@mui/material';
import LlamadosApis                                 from '../ManejarDatosApis/LlamadosApis';
import '../../hojas-de-estilo/MantenedorExcels.css';

const DigitarPEP = (props) => {
    const {textoNick, NombreUsuario , CodPerfil, CorreoUsuario, Sociedad_Cod , Razon_Social , Proyecto_Nombre} = props;
    const [openAlertaError, setOpenAlertaError] = useState({ open: false, message: "" }); 
    const [PEP, setPEP] = useState('');

    const cargarDatos = async (puedo) => {
        
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const GrabarAccion = async () => {
        const token = await LlamadosApis.ObtenerToken();
        try {
            const CodigoRetornoGuardarPEP = await LlamadosApis.GuardarPEP( token , PEP , props.Sociedad_Cod , props.Proyecto_Nombre );
            if(CodigoRetornoGuardarPEP.resultado === 1){
                  setOpenAlertaError({
                    open: true,
                    message: "Se asignó PEP correctamente al Proyecto.",
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
            <h1 style={{ marginTop: '40px', marginBottom: '40px' }}>Asignar PEP a un Proyecto </h1>
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Sociedad"
                    value={Sociedad_Cod}
                    style={{ width: '80px', marginBottom: '10px'}}
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
                    label="Razón Social"
                    value={Razon_Social}
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
                    label="Proyecto"
                    value={Proyecto_Nombre}
                    style={{ width: '500px', marginBottom: '10px' , marginLeft: '50px'}}
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
                            label="PEP"
                            onChange={(e) => setPEP(e.target.value)}
                            style={{ width: '630px' }}
                            autoComplete="off"
                            //inputRef={PEP}
                        />
                    </div>
                </div>
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

export default DigitarPEP;