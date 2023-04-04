import React, { useState, useEffect } from 'react';

function App() {
  const [Menus, setMenus] = useState([]);

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
            Cod: '30'
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
    console.log(data);
    if (data.ParametrosSalidaWs4 && data.ParametrosSalidaWs4.Menus) {
      setMenus(data.ParametrosSalidaWs4.Menus);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Lista de Menus</h1>
      <ul>
      {Menus.map((menu) => (
        <li key={menu.Cod}>
            <p><strong>Cod:</strong> {menu.Cod}</p>
            <p><strong>Texto:</strong> {menu.Texto}</p>
            <p><strong>Padre:</strong> {menu.Padre}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
