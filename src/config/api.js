// src/config/api.js
// ─────────────────────────────────────────────────────────────
// ÚNICO lugar donde vive la URL base del backend.
// En desarrollo lee de .env.local → VITE_API_URL=http://localhost:8080
// En producción lee de .env.production → VITE_API_URL=https://tu-backend.com
// ─────────────────────────────────────────────────────────────

export const API_URL = import.meta.env.VITE_API_URL;

// Helpers opcionales para construir rutas — evitan concatenar strings a mano
export const apiUrl = (path) => `${API_URL}${path}`;