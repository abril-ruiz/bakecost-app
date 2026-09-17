import { useEffect } from 'react';

// Hook personalizado para actualizar el título de la página dinámicamente.

export const useDocumentTitle = (pageTitle) => {
  useEffect(() => {
    if (pageTitle) {
      document.title = `BakeCost | ${pageTitle}`;
    } else {
      document.title = 'BakeCost | Calculadora de costos para panadería y pastelería';
    }
  }, [pageTitle]);
};