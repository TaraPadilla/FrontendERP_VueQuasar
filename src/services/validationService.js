export const reglasProducto  = {
  nombre: { requerido: true, tipo: "string", min: 5 },
  descripcion: { requerido: true, tipo: "string", min: 5 },
  categoria: { requerido: true, tipo: "string" },
  proveedor: { requerido: true, tipo: "string" },
  articulo: { requerido: true, tipo: "string" },
  color: { requerido: false, tipo: "string" },
  tallaje: { requerido: false, tipo: "string" },
  marca: { requerido: false, tipo: "string" },
  precioCompra: { requerido: true, tipo: "numero", min: 1 },
  porcentajeVenta: { requerido: true, tipo: "numero", min: 0 },
  precioVenta: { requerido: true, tipo: "numero", min: 1 },
  ganancia: { requerido: true, tipo: "numero", min: 0 },
  stock: { requerido: true, tipo: "numero", min: 0 }
};

export const reglasCliente = {
  nombre_completo: { requerido: true, tipo: "string", min: 5 },
  tipo_documento: { requerido: true, tipo: "string" },
  numero_documento: { requerido: true, tipo: "string" },
  telefono: { requerido: true, tipo: "string" },
  direccion: { requerido: true, tipo: "string" },
  municipio: { requerido: true, tipo: "string" },
  departamento: { requerido: true, tipo: "string" }
};

// Reglas para proveedores
export const reglasProveedor = {
  nombre_completo: { requerido: true, tipo: "string", min: 5 },
  telefono: { requerido: true, tipo: "string" },
  email: { requerido: true, tipo: "string" },
  direccion: { requerido: true, tipo: "string" },
  municipio: { requerido: true, tipo: "string" },
  departamento: { requerido: true, tipo: "string" }
};

// Función para validar un objeto basado en sus reglas
export function validarCampos(datos, reglas) {
  const errores = {};

  Object.keys(reglas).forEach(campo => {
    const regla = reglas[campo];
    const valor = datos[campo];

    if (regla.requerido && (!valor || valor.toString().trim() === "")) {
      errores[campo] = "Este campo es obligatorio.";
    } else if (regla.tipo === "numero" && isNaN(valor)) {
      errores[campo] = "Debe ser un número válido.";
    } else if (regla.min !== undefined && valor < regla.min) {
      errores[campo] = `Debe ser mayor o igual a ${regla.min}.`;
    }
  });

  console.log(errores);
  return errores;
}
