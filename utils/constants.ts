export const INPUT_ERROR_TYPES = {
  user_not_found: {
    message: "No se encontraron usuarios con ese email",
    type: "error",
  },
  invalid_email: {
    message: "Ingresa un email válido",
    type: "error",
  },
  invalid_amount: {
    message: "Debes ingresar un número para la cantidad",
    type: "error",
  },
  insufficient_balance: {
    message: "No tienes suficiente balance para transferir",
    type: "error",
  },
  transaction_failed: {
    message: "Ocurrió un error en la transferencia",
    type: "error",
  },
  password_incorrect: {
    message: "La contraseña es incorrecta",
    type: "error",
  },
  same_account: {
    message: "No puedes transferir fondos a tu propia cuenta",
    type: "error",
  },
};
