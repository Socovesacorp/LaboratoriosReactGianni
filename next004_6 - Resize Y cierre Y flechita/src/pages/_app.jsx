import React, { useState, useEffect , useCallback } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../components/authConfig';
import { Navbar, Nav, NavDropdown }   from 'react-bootstrap';
import { Button} from 'react-bootstrap';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal} from '@azure/msal-react';
import MenuG from '../components/MenuG';

import Image from 'next/image';

const msalInstance = new PublicClientApplication(msalConfig);

function MyApp({ Component, pageProps }) {
  const [textoNick, setTextoNick] = useState("");
  const [textoCorreo, setTextoCorreo] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false); // Variable de estado para controlar si los datos del servicio web se han cargado

  const fetchData = useCallback(async () => {
    try {
        //const response = await fetch('http://wservicesdes.brazilsouth.cloudapp.azure.com/rest/WsRetActiveDirectoryAzure', {
        const response = await fetch('https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetActiveDirectoryAzure', {
        //const response = await fetch('https://wservicescorp.brazilsouth.cloudapp.azure.com/rest/WsRetActiveDirectoryAzure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Clave: 'kfjshf84rwkjfsdklgfw49@254325jhsdgft',
          EntradaWs3: {
            BuscarPorDominioYusuario: {
              NickName: '',
              Dominio: ''
            },
            BuscarPorMail: {
              Mail: textoCorreo.trim()
            },
            BuscarPorNombre: {
              Nombre: ''
            }
          }
        })
      });

      console.log('*** Mensaje 2 - Se llamó al Servicio RetActiveDirectory con: ' + textoCorreo );

      const responseData = await response.json();
      if (responseData.ColeccionDatosActiveDirectory && responseData.ColeccionDatosActiveDirectory.Cuentas) {
        setTextoNick(responseData.ColeccionDatosActiveDirectory.Cuentas[0].CuentaDeUsuario.NickName)
        console.log('*** Mensaje 3 - Se rescató NickName de Servicio RetActiveDirectory y es: '+ responseData.ColeccionDatosActiveDirectory.Cuentas[0].CuentaDeUsuario.NickName );
      }
      setDataLoaded(true); // Marcar que los datos del servicio web se han cargado exitosamente
    } catch (error) {
      console.error('*** Error al obtener datos del servicio web: RetActiveDirectory'+ error );
      setDataLoaded(true); // Marcar que los datos del servicio web se han cargado, aunque haya ocurrido un error
    }
  }, [textoCorreo]); 

  useEffect(() => {
    if (textoCorreo !== '') {
      fetchData();
    }
  }, [fetchData, textoCorreo]);

  const handleLogin = () => {
    msalInstance.loginPopup(loginRequest).then((response) => {
      // Los datos del Active Directory están disponibles en response.account
      console.log(response.account);
      setTextoCorreo(response.account.idTokenClaims.email);
      console.log('*****Mensaje1: ' + response.account.idTokenClaims.email )
    });
  };

  return (
    <MsalProvider instance={msalInstance}>
        <AuthenticatedTemplate>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom:0 }}>
            {textoCorreo!==''?(
              <MenuG textoNick={textoNick} />
              ) : (
                <p>&nbsp;</p> 
              )}
          </div>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Navbar bg="dark" variant="dark" className="navbarStyle">
            <Navbar.Brand href="#home">
              &nbsp;&nbsp;<Image src="/images/CSC8.jpg" width={160} height={50} alt='Empresas Socovesa'/>&nbsp;&nbsp;Autenticación...
            </Navbar.Brand>
            <div className="collapse navbar-collapse justify-content-end">
            <Button variant="secondary" onClick={handleLogin}>Iniciar Sesión</Button>
            </div>
          </Navbar>
          <br></br>
          <br></br>
          <h5>
            <center> Por favor, ingrese sus credenciales para acceder al Sistema</center>
          </h5>
        </UnauthenticatedTemplate>
    </MsalProvider>
  );
}

export default MyApp;
