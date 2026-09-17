// Capa de acceso a localStorage.
// Proporciona funciones de lectura, escritura y eliminación con manejo de errores y valores por defecto.

export const KEYS = {
  INGREDIENTS: "bakecost_ingredients",
  RECIPES: "bakecost_recipes",
  SETTINGS: "bakecost_settings",
};

/**
 * Lee y parsea un valor de localStorage.
 * Devuelve `defaultValue` si la clave no existe o el JSON está corrupto.
 */
export function storageRead(key, defaultValue = null) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storageEngine] Error al leer clave "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Serializa y guarda un valor en localStorage.
 * Lanza un error descriptivo si falla (ej. cuota excedida).
 */
export function storageWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storageEngine] Error al escribir clave "${key}":`, error);
    throw new Error(
      "No se pudo guardar la información. El almacenamiento local puede estar lleno.",
    );
  }
}

// Elimina una clave completa de localStorage.
export function storageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storageEngine] Error al eliminar clave "${key}":`, error);
  }
}
