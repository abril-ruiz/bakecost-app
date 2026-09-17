// Servicio para la gestión de configuraciones de la aplicación.
import { settingsStorage } from "./storage";

export const configService = {
  // Devuelve el valor de la hora de mano de obra.
  getLaborCost() {
    return Promise.resolve(settingsStorage.getLaborCostPerHour());
  },

  /**
   * Actualiza el valor de la hora de mano de obra.
   * Rechaza si el valor es negativo o no es un número.
   */
  setLaborCost(value) {
    try {
      const updated = settingsStorage.setLaborCostPerHour(value);
      return Promise.resolve(updated.laborCostPerHour);
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
