import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import './App.css';
import MantenedorProyectos from './components/MantenedorProyectos';
import ContadorClics from './components/ContadorClics';

function App() {
  const [iframeSrc, setIframeSrc] = useState('');
  const [MenuSeleccionado, setMenuSeleccionado] = useState(false); // Nuevo estado para el componente "MantenedorProyectos"
  const USUARIO = 'Juan Pérez Bustamante';
  const PERFIL = 'Administrador del Sistema';

  const handleMenuClick = (eventKey) => {
    if (eventKey === 'mantenedorProyectos' || eventKey === 'mantenedorRecursos' ) { // Si se selecciona "Mantenedor de Proyectos", mostramos el nuevo componente
      setMenuSeleccionado(eventKey)
      setIframeSrc(''); // Limpiamos la URL del iframe
    } else {
      setMenuSeleccionado(eventKey)
      setIframeSrc(eventKey); // Actualizamos la URL del iframe
    }
  };

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#home">
          &nbsp;&nbsp;Sistema Corporativo Control de Proyectos

        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto" onSelect={handleMenuClick}>
            <Navbar.Brand href="#home">
            <div style={{ width: '100px' }}>
              
          </div>
        </Navbar.Brand>
        <Nav.Link href="http://localhost:3000/" >Home</Nav.Link>
            
            <NavDropdown title="Mantenedores" id="basic-nav-dropdown">
              <NavDropdown.Item eventKey="https://es.wix.com/sitiowebgratis/hiker-crea?utm_source=google&gclid=CjwKCAjw_YShBhAiEiwAMomsEN6QVUnLBe5xnU97-Bqb1DfgIC10EXCxl_p83oL_EDmAZeyfSRKnGxoCq0QQAvD_BwE&utm_campaign=217341955%5E10468223515&experiment_id=%2Bsitio+%2Bweb%5Eb%5E60343509475%5E&utm_medium=cpc">Mantenedor de Usuarios</NavDropdown.Item>
              <NavDropdown.Item eventKey="mantenedorProyectos">Mantenedor de Proyectos</NavDropdown.Item>
              <NavDropdown.Item eventKey="mantenedorRecursos">Mantenedor de Recursos</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item eventKey="mantenedorPrecios">Mantenedor de Precios</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Informes" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/1.1">Informe de Recursos</NavDropdown.Item>
              <NavDropdown.Item href="#action/1.2">Informe de Traspasos</NavDropdown.Item>
              <NavDropdown.Item href="#action/1.3">Informe de Mano de Obra</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/1.4">Informe General</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Brand href="#home">
            <div style={{ fontSize: '14px' }}>
              <table>
                <tr>
                  <td>&nbsp;&nbsp;&nbsp;{USUARIO}</td>
                </tr>
                <tr>
                  <td>&nbsp;&nbsp;&nbsp;{PERFIL}</td>
                </tr> 
              </table>
          </div>
        </Navbar.Brand>
      </Navbar>
      
      <div className="container-fluid">
        {MenuSeleccionado === "mantenedorProyectos" ? (
          <MantenedorProyectos />
        ) : MenuSeleccionado === "mantenedorRecursos" ? (
          <ContadorClics />
        ) : (
          <iframe
            title="contenedor"
            id="iframe"
            src={iframeSrc}
            style={{ width: "100%", height: "90vh", border: "none" }}
          ></iframe>
        )}
      </div>

   </div>
  );
}

export default App;
