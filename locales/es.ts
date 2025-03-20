export default {
  // Homepage content
  "home.title": "Enviar y Recibir Dinero",
  "home.subtitle": "Cuando quieras, donde quieras",
  "home.balance.label": "Saldo disponible",
  "home.balance.amount": "$23.877",
  "home.balance.crypto": "USDT 23.867",
  "home.cta.button": "Comenzar ahora",
  "home.cta.description":
    "Necesitas acceder a tu cuenta para empezar a recibir dinero.",

  // Login page content
  "login.noAccount": "No tienes una cuenta?",
  "login.createAccount": "Crea una cuenta",
  "login.form.email-or-username.label": "Email o Nombre de usuario:",
  "login.form.email-or-username.placeholder": "Ingresa tu email o nombre de usuario",
  "login.form.error.email-or-username": "Ingresa un email o nombre de usuario válido",
  "login.form.error.required": "Este campo es requerido",
  "login.form.error.usernameNotFound": "Nombre de usuario no encontrado",

  // Create wallet page content
  "createWallet.title": "Lucas Wallet",
  "createWallet.description":
    "Crea tu cuenta para empezar a recibir y enviar dinero.",
  "createWallet.email.label": "Email:",
  "createWallet.email.placeholder": "Ingresa tu email",
  "createWallet.password.label": "Contraseña:",
  "createWallet.password.placeholder": "Ingresa tu contraseña",
  "createWallet.firstName.label": "Nombre:",
  "createWallet.firstName.placeholder": "Ingresa tu nombre",
  "createWallet.lastName.label": "Apellido:",
  "createWallet.lastName.placeholder": "Ingresa tu apellido",
  "createWallet.button": "Crear cuenta",
  "createWallet.haveAccount": "¿Ya tienes una cuenta?",
  "createWallet.login": "Iniciar sesión",
  "createWallet.username.label": "Nombre de usuario:",
  "createWallet.username.placeholder": "Ingresa tu nombre de usuario",

  // Wallet page content
  "wallet.welcome": "¡Bienvenido, {name}!",
  "wallet.balanceDescription": "Este es tu saldo",
  "wallet.balanceLabel": "Saldo",
  "wallet.currency": "USD",
  "wallet.crypto": "USDC",

  // Add Contact component
  "contacts.add": "Añadir Contacto",
  "contacts.dialog.title": "¿Estás completamente seguro?",
  "contacts.dialog.description":
    "Esta acción no se puede deshacer. Eliminará permanentemente tu cuenta y borrará tus datos de nuestros servidores.",

  // Contact Card Content component
  "contacts.search.placeholder": "Buscar un contacto específico",
  "contacts.empty.title": "No se encontraron contactos",
  "contacts.empty.description":
    "No tienes contactos o transacciones recientes para mostrar",

  // Contact Card component
  "contacts.card.altText": "{user_name}",

  // Contacts List component
  "contacts.list.title": "Transfiere fondos a tus contactos",
  "contacts.list.description":
    "Últimos contactos a los que has transferido fondos",
  "contacts.error.noUser": "Usuario no encontrado",

  // Transfer Modal First Step component
  "transfer.email.label": "Email",
  "transfer.email.placeholder": "Correo del destinatario",
  "transfer.email.description":
    "Añade el email de la cuenta a la que quieres transferir.",
  "transfer.email.error": "{message} aquí",
  "transfer.recipient.warning":
    "(*) Asegúrate de que sea el destinatario correcto",
  "transfer.amount.label": "Cantidad a transferir",
  "transfer.amount.balance": "Saldo disponible:",
  "transfer.amount.placeholder": "Cantidad de ETH",
  "transfer.button.next": "Siguiente",
  "transfer.search.noResults": "No se encontraron usuarios con ese email.",
  "transfer.search.error": "Error al obtener usuario",

  // Transfer Modal Second Step component
  "transfer.to.label": "Para:",
  "transfer.amount.label2": "Cantidad:",
  "transfer.button.back": "Atrás",
  "transfer.button.transfer": "Transferir",

  // Transfer Success component
  "transfer.success.sent": "Has enviado",
  "transfer.success.to": "Para:",
  "transfer.success.hash": "Hash de transacción:",
  "transfer.success.close": "Cerrar",
  "transfer.success.addContact": "Añadir a contactos",

  // Transfer Modal Third Step component
  "transfer.password.label": "Contraseña",
  "transfer.password.placeholder": "Escribe tu contraseña",
  "transfer.password.description":
    "Ingresa tu contraseña para confirmar la transferencia.",
  "transfer.button.confirming": "Confirmando...",
  "transfer.button.confirm": "Confirmar",

  // Copy Hash component
  "copy.error": "Error al copiar el hash:",

  // Login Button component
  "login.button.loading": "Cargando...",
  "login.button.login": "Inicia sesión",
  "login.button.sendMoney": "Envía dinero",

  // Login Form component
  "login.form.title": "Lucas Wallet",
  "login.form.error": "Error al iniciar sesión, por favor intenta de nuevo",
  "login.form.description": "Inicia sesión para ver tu Lucas",
  "login.form.email.label": "Email:",
  "login.form.email.placeholder": "Email",
  "login.form.password.label": "Contraseña:",
  "login.form.password.placeholder": "Contraseña",
  "login.form.validation.email": "Ingresa un email válido.",
  "login.form.validation.password":
    "La contraseña debe tener al menos 8 caracteres.",
  "login.form.error.email": "No pudimos encontrar un usuario con ese email.",
  "login.form.error.password": "La contraseña es incorrecta.",

  // Sign Out Button component
  "signOut.button": "Cerrar sesión",
} as const;
