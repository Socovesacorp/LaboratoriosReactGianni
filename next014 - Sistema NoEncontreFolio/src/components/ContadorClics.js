//Eliminar...
import '../hojas-de-estilo/ContadorClics.css';

import Boton from './Boton';
//import freeCodeCampLogo from '../imagenes/freecodecamp-logo.jpg';
import Contador from './Contador'
import { useState } from 'react';

function ContadorClics() {

  const [numClics,setNumClics] = useState(0);

  const manejarClic = () => {
    //console.log("Clic")
    setNumClics(numClics + 1);
  }

  const reiniciarContador = () => {
    //console.log("Reiniciar")
    setNumClics(0);
  }

  return (
    <div className="App">
        <div className="freecodecamp-logo-contenedor">
          
        </div>
        <div className='contenedor-principal'>
          <Contador numClics={numClics}/>
          <Boton 
            texto = 'Clic'
            esBotonDeClic={true}
            manejarClic={manejarClic}
          />
          <Boton 
            texto = 'Reiniciar'
            esBotonDeClic={false}
            manejarClic={reiniciarContador}
          />

        </div>
    </div>
  );
}

/*3:34:51*/
export default ContadorClics;
