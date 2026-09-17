// Persistencia de la configuración de la aplicación (costo por hora de mano de obra, etc.)
import { storageRead, storageWrite, KEYS } from "./storageEngine";

const DEFAULTS = {
  laborCostPerHour: 0,
};

export const settingsStorage = {
  // Devuelve la configuración completa. Usa defaults si no hay datos.
  get() {
    const saved = storageRead(KEYS.SETTINGS, {});
    return { ...DEFAULTS, ...saved };
  },

  // Actualiza el costo por hora de mano de obra.
  setLaborCostPerHour(value) {
    const parsed = Number(value);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error(
        "El valor de la hora de trabajo debe ser un número mayor o igual a 0.",
      );
    }
    const current = this.get();
    const updated = { ...current, laborCostPerHour: parsed };
    storageWrite(KEYS.SETTINGS, updated);
    return updated;
  },

  // Devuelve solo el costo por hora.
  getLaborCostPerHour() {
    return this.get().laborCostPerHour;
  },
};
