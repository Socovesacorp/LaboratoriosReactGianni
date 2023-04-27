import React, { useState, useEffect , useCallback } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal} from '@azure/msal-react';
import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from "./components/SignInButton";
import { SignOutButton } from "./components/SignOutButton";
import { Navbar}   from 'react-bootstrap';
import logoCSC from './imagenes/CSC8.jpg';
import { loginRequest } from './authConfig';
import MenuG from './MenuG';

export default function App() {
  const [textoNick, setTextoNick] = useState("");
  const [textoCorreo, setTextoCorreo] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false); // Variable de estado para controlar si los datos del servicio web se han cargado
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();


  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('http://wservicesdes.brazilsouth.cloudapp.azure.com/rest/WsRetActiveDirectoryAzure', {
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

      console.log('%c*** Mensaje 3 - Se llamó al Servicio RetActiveDirectory con: ' + textoCorreo , 'background-color: yellow; color:blue; font-weight: bold;');

      const responseData = await response.json();
      if (responseData.ColeccionDatosActiveDirectory && responseData.ColeccionDatosActiveDirectory.Cuentas) {
        
        setTextoNick(responseData.ColeccionDatosActiveDirectory.Cuentas[0].CuentaDeUsuario.NickName)
        console.log('%c*** Mensaje 4 - Se rescató NickName de Servicio RetActiveDirectory y es: '+ responseData.ColeccionDatosActiveDirectory.Cuentas[0].CuentaDeUsuario.NickName , 'background-color: yellow; color:blue; font-weight: bold;');
      }
      setDataLoaded(true); // Marcar que los datos del servicio web se han cargado exitosamente
    } catch (error) {
      console.error('%c*** Error al obtener datos del servicio web: RetActiveDirectory'+ error , 'background-color: yellow; color:red; font-weight: bold;');
      setDataLoaded(true); // Marcar que los datos del servicio web se han cargado, aunque haya ocurrido un error
    }
  }, [textoCorreo]); 

  useEffect(() => {
    if (isAuthenticated) {
      console.log('%c*** Mensaje 1 - Antes de rescatar correo de la persona que se ha autenticado' , 'background-color: yellow; color:blue; font-weight: bold;');
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        })
        .then((response) => {
          // Obtener el email del usuario autenticado desde el objeto account
          const userEmail = response.account.idTokenClaims.email;
          setTextoCorreo(userEmail);
        });
    }
  }, [isAuthenticated, accounts, instance ]);
  
  useEffect(() => {
    if (isAuthenticated && textoCorreo!=='') {
      // Realizar acciones con el email del usuario autenticado, como actualizar el estado, realizar otra llamada a una API, etc.
      console.log('%c*** Mensaje 2 - Se rescató correo del usuario autenticado: ' + textoCorreo, 'background-color: yellow; color:blue; font-weight: bold;');
      fetchData();
    }
  }, [textoCorreo, isAuthenticated, fetchData]);

  return (
    <div className="Prueba" >
      <Navbar bg="dark" variant="dark" className="navbarStyle">
        <Navbar.Brand href="#home">
        &nbsp;&nbsp;<img src={logoCSC} height={50} alt='Empresas Socovesa'/>&nbsp;&nbsp;Autenticación
        </Navbar.Brand>
        <div className="collapse navbar-collapse justify-content-end">
          {isAuthenticated ? <SignOutButton /> : <SignInButton />}
        </div>
      </Navbar>
      <div className="App">
        <AuthenticatedTemplate>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom:0 }}>
            {dataLoaded && textoNick !== '' ? ( // Renderizar el componente MenuG solo si los datos del servicio web se han cargado
              <MenuG textoNick={textoNick} />
            ) : (
            <p>&nbsp;</p> 
            )}
          </div>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <br></br>
          <br></br>
          <h5>
            <center> Por favor, ingrese sus credenciales para acceder al Sistema</center>
          </h5>
        </UnauthenticatedTemplate>
      </div>
    </div>
  );
}