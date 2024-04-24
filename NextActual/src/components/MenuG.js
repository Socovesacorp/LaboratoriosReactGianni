import React, { useState, useEffect , useCallback , useRef } from 'react';
import { Navbar, Nav, NavDropdown }   from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MenuG.css';
import { SignOutButton } from "./SignOutButton";
import { useMsal } from "@azure/msal-react"; //Esto lo utilizo en una opción de menú que permita cerrar sesion desde un Celular...

function MenuG( {textoNick , CorreoUsuario}) {

  const [MenuSeleccionado, setMenuSeleccionado] = useState(false);
  const [Menus, setMenus] = useState([]);
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [Perfil, setPerfil] = useState("");
  const [CodPerfil, setCodPerfil] = useState("");
  const [NomSistema, setNomSistema] = useState([""]);
  const [AnchoPantalla,setAnchoPantalla] = useState(window.innerWidth)
  const [AltoPantalla, setAltoPantalla] = useState(window.innerHeight);
  const [AltoMenu, setAltoMenu] = useState(0);
  const { instance } = useMsal();
  const menuRef = useRef(null); // Esto es la referencia para el menú
  const [EstaMenuAbierto, setEstaMenuAbierto] = useState(false);
  
  //const components = Menus.filter(menu => menu.TipoCod === '7').reduce((acc, menu) => {
  //  return { ...acc, [menu.ObjetoNom]: require('../components/' + menu.ObjetoNom).default };
  //}, {});
  function getUrlPermisos() {
    if (typeof window !== 'undefined') {
      const { hostname } = window.location;
      if (hostname === 'ucp-cobranzas-qa.brazilsouth.cloudapp.azure.com') {
        return 'https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetPermisosAzure';
      } else if (hostname === 'ucp-cobranzas.brazilsouth.cloudapp.azure.com') {
        return 'https://wservicescorp.brazilsouth.cloudapp.azure.com/rest/WsRetPermisosAzure';
      } else{
        return 'https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetPermisosAzure';
      }
    }      
    return '';
  }

  const components = Menus.filter(menu => menu.TipoCod === '7').reduce((acc, menu) => {
    let component;
    try {
      // Intenta cargar desde la primera ruta
      component = require('../components/' + menu.ObjetoNom).default;
    } catch (error) {
      // Si falla, intenta cargar desde la segunda ruta
      try {
        component = require('../components/ModuloSeguros/' + menu.ObjetoNom).default;
      }
      catch (error2) {
        // Si falla, intenta cargar desde la tercera ruta
        component = require('../components/ModuloFondosPorRendir/' + menu.ObjetoNom).default;
      }
    }
    return { ...acc, [menu.ObjetoNom]: component };
  }, {});




  //Esta función la creé porque deseo que se llame únicamente cuando el tamaño del navegador sea del porte de un celular...
  //Esta función será llamada desde un punto del menú y no desde un botón... como lo hace el sistema original...
  const handleLogout = (logoutType) => {
    if (logoutType === "popup") {
      instance.logoutPopup({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/",
      });
    } else if (logoutType === "redirect") {
      instance.logoutRedirect({
        postLogoutRedirectUri: "/",
      });
    }
  };

  //Invoco al servicio web institucional de Permisos...
  const fetchData = useCallback(async () => {
    console.log('Texto Recibido es: ' + textoNick);
    if (textoNick !== '')
    {
        const response = await fetch(getUrlPermisos(),{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Key: 'kfjshf84rwkjfsdklgfw49@254325jhsdgft',
          ParametrosEntradaWs4: {
            Sistema: {
              Cod: '31'
            },
            Usuario: {
              CtaRed: {
                Dominio: 'SOCOVESA',
                NickName: textoNick
              }
            }
          }
        })
      });

      const data = await response.json();
      
      if (data.ParametrosSalidaWs4 && data.ParametrosSalidaWs4.Menus && textoNick!=='') {
        setMenus(data.ParametrosSalidaWs4.Menus);
        setNombreUsuario(data.ParametrosSalidaWs4.Usuarios[0].ActiveDirectory.Noms + ' ' + data.ParametrosSalidaWs4.Usuarios[0].ActiveDirectory.Apes)
        setPerfil(data.ParametrosSalidaWs4.Usuarios[0].Perfil.Nom)
        setCodPerfil(data.ParametrosSalidaWs4.Usuarios[0].Perfil.Cod)
        setNomSistema(data.ParametrosSalidaWs4.Sistema.Nom)
      }
    }
  }, [textoNick]); 

  //Carga el Menu...
  const CargarMenu = (eventKey) => {
    setMenuSeleccionado(eventKey);
    if (textoNick !== '') {
      fetchData();
    }
  };

  // Función que me permite actualizar las 3 variables: ANCHO x ALTO x AltoMenu...
  const ActualizarAnchosYaltos = () => {
    setAnchoPantalla(window.innerWidth);
    setAltoPantalla(window.innerHeight);
    if (menuRef.current) {
      setAltoMenu(menuRef.current.clientHeight); // Obtiene el alto del menú
    }
  };

  //Se ejecuta después del renderizado inicial del componente y luego se ejecuta nuevamente cuando alguna de sus dependencias cambia. 
  //En este caso, las dependencias son fetchData y textoNick y EstaMenuAbierto, por lo que el efecto se ejecutará nuevamente cada vez que cualquiera de ellos cambie.
  useEffect(() => {
    ActualizarAnchosYaltos();
    if (textoNick !== '')
    {
      fetchData(); // Si el valor de textoNick no está vacío, llama a la función fetchData() para obtener los datos del servidor.
    }
    //gianni ver window.addEventListener('resize', ActualizarAnchosYaltos); // Agrega un evento para escuchar cambios en el tamaño de la ventana y llama a ActualizarAnchosYaltos() cuando ocurre.
    return () => {
    //gianni ver  window.removeEventListener('resize', ActualizarAnchosYaltos); // Elimina el evento de cambio de tamaño al desmontar el componente para evitar fugas de memoria.
    };
  }, [fetchData, textoNick, EstaMenuAbierto]);

  //Al hacer clic en algún menú yo debo setear la variable EstaMenuAbierto para que el useEffect lo tome en cuenta y se de cuenta de 
  //que cambió el valor... entonces gatillará automáticamente el ActualizarAnchosYaltos...
  const HiceClicEnMenu = () => {
    //console.log("presione"+EstaMenuAbierto)
    if (EstaMenuAbierto){
      setEstaMenuAbierto(false)
    }
    if (!EstaMenuAbierto){
      setEstaMenuAbierto(true)
    }
  };

  const renderMenuItems = (menuItems) => {
    return menuItems.map(menu => {
      const submenus = Menus.filter(submenu => submenu.Padre === menu.Cod);
      const hasSubmenus = submenus.length > 0;
      const isMainMenu = menu.Padre === '0';
      
      if (hasSubmenus) {
        return (
          <NavDropdown
            title={
              <>
                {menu.Texto}
                {AnchoPantalla > 991 && !isMainMenu && <span className="icono-flecha-derecha"></span>}
              </>
            }
            id={menu.Cod}
            key={menu.Cod}
            className={AnchoPantalla <= 991 ? 'sub-menu-item-mobile' : (isMainMenu ? 'sub-menu-item-mobile' : 'sub-menu-item')}
            onClick={HiceClicEnMenu}
          >
            {renderMenuItems(submenus)}
          </NavDropdown>
        );
      } else {
        return (
          <NavDropdown.Item
            key={menu.Cod}
            eventKey={menu.ObjetoNom}
            style={{ color: 'white' }}
            onClick={HiceClicEnMenu}
          >
            {menu.Texto}
            
          </NavDropdown.Item>
        );
      }
    });
  };

  return (
    <div className="MenuG">
      <Navbar bg="dark" variant="dark"  expand="lg" ref={menuRef}>
        <Navbar.Brand href="#home">
        &nbsp;&nbsp;{NomSistema}&nbsp;&nbsp;&nbsp;&nbsp;{/*{AnchoPantalla} x {AltoPantalla} x {AltoMenu}*/}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" onEntered={ActualizarAnchosYaltos} onExited={ActualizarAnchosYaltos}>
          <Nav className="mr-auto" onSelect={CargarMenu}>
          {renderMenuItems(Menus.filter(menu => menu.Padre === '0'))}
          {AnchoPantalla <= 991 && (
              <Nav.Link onClick={() => handleLogout("redirect")} className='sub-menu-item-mobile'>Cerrar Sesión</Nav.Link>

          )}
          </Nav>
        </Navbar.Collapse>
        <Navbar.Brand href="#home">
          <div style={{ fontSize: '14px' }}>
            {AnchoPantalla>991 && (
              <table>
                <tbody>
                  <tr>
                    <td>
                      {<SignOutButton />}
                    </td>
                    <td>
                      <table>
                        <tbody>
                          <tr>
                            <td>&nbsp;&nbsp;&nbsp;{NombreUsuario}</td>
                          </tr>
                          <tr>
                            <td>&nbsp;&nbsp;&nbsp;{Perfil}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </Navbar.Brand>
      </Navbar>
      <div className="container-fluid">
        {components[MenuSeleccionado] ? (
          <div style={{ height: `${AltoPantalla - AltoMenu}px`, overflowY: 'scroll' }}>
            {/*React.createElement(components[MenuSeleccionado])*/React.createElement(components[MenuSeleccionado], { textoNick, NombreUsuario, CodPerfil ,CorreoUsuario })}
          </div>
        ) : (
          <iframe
            title="contenedor"
            id="iframe"
            src={MenuSeleccionado || ""}
            style={{ width: "100%", height: "90vh", border: "none" }}
          ></iframe>
        )}
      </div>      


   </div>
  );
}

export default MenuG;

