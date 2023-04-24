import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown }   from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MenuG.css';
import MantenedorProyectos            from './components/MantenedorProyectos';
import ContadorClics                  from './components/ContadorClics';


function MenuG() {
  const [MenuSeleccionado, setMenuSeleccionado] = useState(false); // Nuevo estado para el componente "MantenedorProyectos"
  const [Menus, setMenus] = useState([]);
  const [NombreUsuario, setNombreUsuario] = useState("");
  const [Perfil, setPerfil] = useState("");

  //const components = {
  //  MantenedorProyectos:  MantenedorProyectos,
  //  ContadorClics:        ContadorClics,
 // };

 const components = Menus.filter(menu => menu.TipoCod === '7').reduce((acc, menu) => {
  return { ...acc, [menu.ObjetoNom]: require('./components/' + menu.ObjetoNom).default };
 }, {});

  const fetchData = async () => {
    const response = await fetch('http://wservicesdes.brazilsouth.cloudapp.azure.com/rest/WsRetPermisosAzure', {
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
              NickName: 'gpalmieri'
            }
          }
        }
      })
    });

    const data = await response.json();
    //console.log(data.ParametrosSalidaWs4.Usuarios[0].ActiveDirectory.Noms + ' ' + data.ParametrosSalidaWs4.Usuarios[0].ActiveDirectory.Apes);
    if (data.ParametrosSalidaWs4 && data.ParametrosSalidaWs4.Menus) {
      setMenus(data.ParametrosSalidaWs4.Menus);
      setNombreUsuario(data.ParametrosSalidaWs4.Usuarios[0].ActiveDirectory.Noms + ' ' + data.ParametrosSalidaWs4.Usuarios[0].ActiveDirectory.Apes)
      setPerfil(data.ParametrosSalidaWs4.Usuarios[0].Perfil.Nom)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMenuClick = (eventKey) => {
    setMenuSeleccionado(eventKey);
    //console.log(MenuSeleccionado);
    fetchData();
  };

  return (
    <div className="MenuG" >
      <Navbar bg="dark" variant="dark"  expand="lg">
        <Navbar.Brand href="#home">
          &nbsp;&nbsp;Sistema Corporativo Control de Proyectos
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" >
          <Nav className="mr-auto" onSelect={handleMenuClick}>
            <Nav.Link href="http://localhost:3000/">Home</Nav.Link>
            {Menus.filter(menu => menu.Padre === '0').map(menu => {
              const submenus = Menus.filter(submenu => submenu.Padre === menu.Cod);
              if (submenus.length > 0) {
                return (
                  <NavDropdown title={menu.Texto} id={menu.Cod} key={menu.Cod} >
                    {submenus.map(submenu => {
                      const submenusHijos = Menus.filter(sub => sub.Padre === submenu.Cod);
                      if (submenusHijos.length > 0) {
                        return (
                          <NavDropdown title={submenu.Texto} id={submenu.Cod} key={submenu.Cod} className='sub-menu-item' >
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
          </Nav>
        </Navbar.Collapse>
        <Navbar.Brand href="#home">
          <div style={{ fontSize: '14px' }}>
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
          </div>
        </Navbar.Brand>
      </Navbar>
      <div className="container-fluid">
        {components[MenuSeleccionado] ? (
          <div className="container-mantenedor">
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