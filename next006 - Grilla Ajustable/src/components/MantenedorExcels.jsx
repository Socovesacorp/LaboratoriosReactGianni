import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const MantenedorExcels = () => {
  const rowData = [
    { Columna1: 'Elemento 1', 
      Columna2: 'Este es un ejemplo de una celda con mucho texto...',
      Columna3: 'Texto un poro más corto que el anterior pero ñldak palabra1 palabra2 palabra3 palabra4 ',
    },
    {
      Columna1: 'Elemento 2',
      Columna2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur accumsan euismod neque, in convallis tortor egestas non. Fusce nec scelerisque augue. Duis nec erat varius, posuere turpis nec, vulputate tortor. Proin efficitur odio vel vestibulum. Phasellus sit amet mi vel nulla vehicula congue. Nam malesuada, sapien nec ultrices sollicitudin, orci sapien egestas purus, eu aliquet orci tortor quis eros.',
      Columna3: 'Texto un poro más corto que el anterior'
    },
    {
      Columna1: 'Elemento 2',
      Columna2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur accumsan euismod neque, in convallis tortor egestas non. Fusce nec scelerisque augue. Duis nec erat varius, posuere turpis nec, vulputate tortor. Proin efficitur odio vel vestibulum. Phasellus sit amet mi vel nulla vehicula congue. Nam malesuada, sapien nec ultrices sollicitudin, orci sapien egestas purus, eu aliquet orci tortor quis eros.',
      Columna3: 'Texto un poro más corto que el anterior'
    },
    {
      Columna1: 'Elemento 2',
      Columna2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur accumsan euismod neque, in convallis tortor egestas non. Fusce nec scelerisque augue. Duis nec erat varius, posuere turpis nec, vulputate tortor. Proin efficitur odio vel vestibulum. Phasellus sit amet mi vel nulla vehicula congue. Nam malesuada, sapien nec ultrices sollicitudin, orci sapien egestas purus, eu aliquet orci tortor quis eros.',
      Columna3: 'Texto un poro más corto que el anterior'
    },
    {
      Columna1: 'Elemento 2',
      Columna2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur accumsan euismod neque, in convallis tortor egestas non. Fusce nec scelerisque augue. Duis nec erat varius, posuere turpis nec, vulputate tortor. Proin efficitur odio vel vestibulum. Phasellus sit amet mi vel nulla vehicula congue. Nam malesuada, sapien nec ultrices sollicitudin, orci sapien egestas purus, eu aliquet orci tortor quis eros.',
      Columna3: 'Texto un poro más corto que el anterior'
    },
    {
      Columna1: 'Elemento 2',
      Columna2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur accumsan euismod neque, in convallis tortor egestas non. Fusce nec scelerisque augue. Duis nec erat varius, posuere turpis nec, vulputate tortor. Proin efficitur odio vel vestibulum. Phasellus sit amet mi vel nulla vehicula congue. Nam malesuada, sapien nec ultrices sollicitudin, orci sapien egestas purus, eu aliquet orci tortor quis eros.',
      Columna3: 'Texto un poro más corto que el anterior'
    },
    {
      Columna1: 'Elemento 2',
      Columna2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur accumsan euismod neque, in convallis tortor egestas non. Fusce nec scelerisque augue. Duis nec erat varius, posuere turpis nec, vulputate tortor. Proin efficitur odio vel vestibulum. Phasellus sit amet mi vel nulla vehicula congue. Nam malesuada, sapien nec ultrices sollicitudin, orci sapien egestas purus, eu aliquet orci tortor quis eros.',
      Columna3: 'Texto un poro más corto que el anterior'
    },
    {
      Columna1: 'Elemento 2',
      Columna2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur accumsan euismod neque, in convallis tortor egestas non. Fusce nec scelerisque augue. Duis nec erat varius, posuere turpis nec, vulputate tortor. Proin efficitur odio vel vestibulum. Phasellus sit amet mi vel nulla vehicula congue. Nam malesuada, sapien nec ultrices sollicitudin, orci sapien egestas purus, eu aliquet orci tortor quis eros.',
      Columna3: 'Texto un poro más corto que el anterior'
    },
  ];

  const PorcentajeAnchoColumna1 = 15;
  const PorcentajeAnchoColumna2 = 50;
  const PorcentajeAnchoColumna3 = 20;
  const PorcentajeAnchoColumna4 = 15;



  const DefaultAnchoColumna2 = Math.ceil(window.innerWidth*PorcentajeAnchoColumna2/100);
  const [AnchoColumna2, setAnchoColumna2] = useState(DefaultAnchoColumna2);
  
  const DefaultAnchoColumna3 = Math.ceil(window.innerWidth*PorcentajeAnchoColumna3/100);
  const [AnchoColumna3, setAnchoColumna3] = useState(DefaultAnchoColumna3);

  const getRowHeight = params => {
    const alturaColumna2 = calculateAltura(params.data.Columna2, AnchoColumna2);
    const alturaColumna3 = calculateAltura(params.data.Columna3, AnchoColumna3);
    return Math.max(alturaColumna2,alturaColumna3);
  };

  const calculateAltura = (cellContent, columnWidth) => {
    const cellContentLength = cellContent.length;
    const availableWidth = columnWidth - 10;
    const charactersPerLine = Math.ceil(availableWidth / 8);
    const renglones = Math.ceil(cellContentLength / charactersPerLine);
    const altura = renglones * 18;
    return altura;
  };

  const columnDefs = [
    { headerName: 'Código', field: 'Columna1', sortable: true, filter: true, cellStyle: { whiteSpace: 'pre-wrap', lineHeight: '1.2' }, minWidth: 120, flex: PorcentajeAnchoColumna1 },
    { headerName: 'Descripción', field: 'Columna2', sortable: true, filter: true, cellStyle: { whiteSpace: 'pre-wrap', lineHeight: '1.2' }, minWidth: DefaultAnchoColumna2, flex: PorcentajeAnchoColumna2},
    { headerName: 'Observación', field: 'Columna3', sortable: true, filter: true, cellStyle: { whiteSpace: 'pre-wrap', lineHeight: '1.2' }, minWidth: DefaultAnchoColumna3, flex: PorcentajeAnchoColumna3 },
    { headerName: 'Ancho', valueGetter: () => Math.floor(AnchoColumna2), minWidth: 120, cellStyle: { whiteSpace: 'pre-wrap', lineHeight: '1.2' }, flex: PorcentajeAnchoColumna4  }
    
  ];

  return (
    <div>
      <h1>Probando Grilla AG-GRID</h1>
      
      
      <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          onColumnResized={(event) => {
            if (event.column && event.column.colId === 'Columna2') {
              setAnchoColumna2(event.column.actualWidth);
            }
            if (event.column && event.column.colId === 'Columna3') {
              setAnchoColumna3(event.column.actualWidth);
            }
          }}
          getRowHeight={getRowHeight}
        />
      </div>
    </div>
  );
};

export default MantenedorExcels;
