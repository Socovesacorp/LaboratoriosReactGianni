import React, { useState, useEffect , useCallback , useRef } from 'react';
import { Navbar, Nav, NavDropdown }   from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MenuG.css';
/*import MantenedorProyectos            from '../components/MantenedorProyectos';
import ContadorClics                  from '../components/ContadorClics';*/
import { SignOutButton } from "./SignOutButton";
import { useMsal } from "@azure/msal-react"; //Esto lo utilizo en una opción de menú que permita cerrar sesion desde un Celular...

function MenuG( {textoNick}) {

  const [MenuSeleccionado, setMenuSeleccionado] = useState(false); // Nuevo estado para el componente "MantenedorProyectos"
  const [Menus, setMenus] = useState([]);
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [Perfil, setPerfil] = useState("");
  const [NomSistema, setNomSistema] = useState([""]);
  const [AnchoPantalla,setAnchoPantalla] = useState(window.innerWidth)
  const [AltoPantalla, setAltoPantalla] = useState(window.innerHeight);
  const [AltoMenu, setAltoMenu] = useState(0);
  const { instance } = useMsal();
  const menuRef = useRef(null); // Esto es la referencia para el menú
  const [EstaMenuAbierto, setEstaMenuAbierto] = useState(false);
  
  const components = Menus.filter(menu => menu.TipoCod === '7').reduce((acc, menu) => {
    return { ...acc, [menu.ObjetoNom]: require('../components/' + menu.ObjetoNom).default };
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
        //const response = await fetch('http://wservicesdes.brazilsouth.cloudapp.azure.com/rest/WsRetPermisosAzure', {
          const response = await fetch('https://wservicesqa.brazilsouth.cloudapp.azure.com/rest/WsRetPermisosAzure', {
        //const response = await fetch('https://wservicescorp.brazilsouth.cloudapp.azure.com/rest/WsRetPermisosAzure',{
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
    window.addEventListener('resize', ActualizarAnchosYaltos); // Agrega un evento para escuchar cambios en el tamaño de la ventana y llama a ActualizarAnchosYaltos() cuando ocurre.
    return () => {
      window.removeEventListener('resize', ActualizarAnchosYaltos); // Elimina el evento de cambio de tamaño al desmontar el componente para evitar fugas de memoria.
    };
  }, [fetchData, textoNick, EstaMenuAbierto]);

  //Al hacer clic en algún menú yo debo setear la variable EstaMenuAbierto para que el useEffect lo tome en cuenta y se de cuenta de 
  //que cambió el valor... entonces gatillará automáticamente el ActualizarAnchosYaltos...
  const HiceClicEnMenu = () => {
    setEstaMenuAbierto(prevEstaMenuAbierto => !prevEstaMenuAbierto);
  };

  return (
    <div className="MenuG">
      <Navbar bg="dark" variant="dark"  expand="lg" ref={menuRef}>
        <Navbar.Brand href="#home">
        &nbsp;&nbsp;{NomSistema}&nbsp;&nbsp;&nbsp;&nbsp;{AnchoPantalla} x {AltoPantalla} x {AltoMenu}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" onEntered={ActualizarAnchosYaltos} onExited={ActualizarAnchosYaltos}>
          <Nav className="mr-auto" onSelect={CargarMenu}>
            {Menus.filter(menu => menu.Padre === '0').map(menu => {
              const submenus = Menus.filter(submenu => submenu.Padre === menu.Cod);
              if (submenus.length > 0) {
                return (
                  <NavDropdown title={menu.Texto} id={menu.Cod} key={menu.Cod} onClick={HiceClicEnMenu}>
                    {submenus.map(submenu => {
                      const submenusHijos = Menus.filter(sub => sub.Padre === submenu.Cod);
                      if (submenusHijos.length > 0) {
                        return (
                          <NavDropdown title={<>{submenu.Texto}{AnchoPantalla > 991 && <span className="icono-flecha-derecha"></span>}</>} id={submenu.Cod} key={submenu.Cod} className={AnchoPantalla <= 991 ? 'sub-menu-item-mobile' : 'sub-menu-item'} >
                            {submenusHijos.map(submenuHijo => (
                              <NavDropdown.Item key={submenuHijo.Cod} eventKey={submenuHijo.ObjetoNom} style={{color:'white'}}>
                                {submenuHijo.Texto }
                              </NavDropdown.Item>
                            ))}
                          </NavDropdown>
                        );
                      } else {
                        return (
                          <NavDropdown.Item key={submenu.Cod} eventKey={submenu.ObjetoNom} style={{color:'white'}}>
                            {submenu.Texto}
                          </NavDropdown.Item>
                        );
                      }
                    })}
                  </NavDropdown>
                );
              } else {
                return (
                  <NavDropdown.Item key={menu.Cod} eventKey={menu.ObjetoNom} style={{ backgroundColor: "black", color: 'white' }}>
                    {menu.Texto}
                  </NavDropdown.Item>
                );
              }
            })}
            {AnchoPantalla <= 991 && (
              <Nav.Link onClick={() => handleLogout("redirect")}>Cerrar Sesión</Nav.Link>
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
            {React.createElement(components[MenuSeleccionado])}
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