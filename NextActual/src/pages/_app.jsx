import React, { useState, useEffect , useCallback } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../components/authConfig'

import { Navbar, Nav, NavDropdown }   from 'react-bootstrap';
import { Button} from 'react-bootstrap';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal} from '@azure/msal-react';
import MenuG from '../components/MenuG';

import Image from 'next/image';
import Head from 'next/head';

const msalInstance = new PublicClientApplication(msalConfig);

function getTitleByEnvironment() {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    // Lógica para seleccionar el favicon según el entorno
    let faviconPath = ''; // Favicon por defecto

    if (hostname === 'localhost') {
      //deseo el default...
    } else if (hostname === 'ucp-cobranzas-qa.brazilsouth.cloudapp.azure.com') {
      faviconPath = '/images/favicon-qa.ico';
    } else if (hostname === 'ucp-cobranzas.brazilsouth.cloudapp.azure.com') {
      faviconPath = '/images/favicon-prod.ico';
    }

    // Agregar el elemento link para el favicon en el Head
    const faviconElement = document.querySelector(`link[rel='icon']`);
    if (faviconElement) {
      faviconElement.href = faviconPath;
    } else {
      document.head.insertAdjacentHTML('beforeend', `<link rel="icon" href="${faviconPath}" />`);
    }

    // Título de la aplicación según el entorno
    if (hostname === 'localhost') {
      return '**local** Cobranzas de UCP';
    } else if (hostname === 'ucp-cobranzas-qa.brazilsouth.cloudapp.azure.com') {
      return '**QA** Cobranzas de UCP';
    } else if (hostname === 'ucp-cobranzas.brazilsouth.cloudapp.azure.com') {
      return 'Cobranzas de UCP';
    }
  }

  return ''; // Título por defecto
}

function MyApp({ Component, pageProps }) {
  const [textoNick, setTextoNick] = useState("");
  const [textoCorreo, setTextoCorreo] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false); // Variable de estado para controlar si los datos del servicio web se han cargado

  function getUrlActiveDirectory() {
    if (typeof window !== 'undefined') {
      const { hostname } = window.location;
      if (hostname === 'ucp-cobranzas-qa.brazilsouth.cloudapp.azure.com') {
        return 'https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetActiveDirectoryAzure';
      } else if (hostname === 'ucp-cobranzas.brazilsouth.cloudapp.azure.com') {
        return 'https://wservicescorp.brazilsouth.cloudapp.azure.com/rest/WsRetActiveDirectoryAzure';
      } else{
        return 'https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetActiveDirectoryAzure';
      }
    }      
    return '';
  }




  const fetchData = useCallback(async () => {
    try {
        const response = await fetch(getUrlActiveDirectory(), {
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

      //console.log('*** Mensaje 2 - Se llamó al Servicio RetActiveDirectory con: ' + textoCorreo );

      const responseData = await response.json();
      if (responseData.ColeccionDatosActiveDirectory && responseData.ColeccionDatosActiveDirectory.Cuentas) {
        setTextoNick(responseData.ColeccionDatosActiveDirectory.Cuentas[0].CuentaDeUsuario.NickName)
        //console.log('*** Mensaje 3 - Se rescató NickName de Servicio RetActiveDirectory y es: '+ responseData.ColeccionDatosActiveDirectory.Cuentas[0].CuentaDeUsuario.NickName );
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
      //console.log(response.account);
      setTextoCorreo(response.account.idTokenClaims.email);
      //console.log('*****Mensaje1: ' + response.account.idTokenClaims.email )
    });
  };

  return (
    <div>
      <Head>
      <title>{getTitleByEnvironment()}</title>
      </Head>
      <div>
        <MsalProvider instance={msalInstance}>
            <AuthenticatedTemplate>
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom:0 }}>
                {textoCorreo!==''?(
                  <MenuG textoNick={textoNick} CorreoUsuario={textoCorreo} />
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
                <Button variant="secondary" onClick={handleLogin}>Iniciar Sesión</Button>&nbsp;&nbsp;&nbsp;
                </div>
              </Navbar>
              <br></br>
              <br></br>
              <h5>
                <center> Por favor, ingrese sus credenciales para acceder al Sistema</center>
              </h5>
            </UnauthenticatedTemplate>
        </MsalProvider>
      </div>
    </div>
  );
}

export default MyApp;
