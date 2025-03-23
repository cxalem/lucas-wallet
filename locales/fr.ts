export default {
  // Homepage content
  "home.title": "Envoyer et Recevoir de l'Argent",
  "home.subtitle": "Quand vous voulez, où vous voulez",
  "home.balance.label": "Solde disponible",
  "home.balance.amount": "23,877 €",
  "home.balance.crypto": "23,867 USDT",
  "home.cta.button": "Commencer maintenant",
  "home.cta.description":
    "Vous devez vous connecter à votre compte pour commencer à recevoir de l'argent.",

  // Login page content
  "login.noAccount": "Vous n'avez pas de compte ?",
  "login.createAccount": "Créer un compte",
  "login.form.email-or-username.label": "Email ou Nom d'utilisateur :",
  "login.form.email-or-username.placeholder":
    "Entrez votre email ou nom d'utilisateur",
  "login.form.error.email-or-username":
    "Entrez un email ou nom d'utilisateur valide",
  "login.form.error.required": "Ce champ est requis",
  "login.form.error.usernameNotFound": "Nom d'utilisateur non trouvé",

  // Create wallet page content
  "createWallet.title": "Portefeuille Lucas",
  "createWallet.description":
    "Créez votre compte pour commencer à recevoir et envoyer de l'argent.",
  "createWallet.email.label": "Email :",
  "createWallet.email.placeholder": "Entrez votre email",
  "createWallet.password.label": "Mot de passe :",
  "createWallet.password.placeholder": "Entrez votre mot de passe",
  "createWallet.firstName.label": "Prénom :",
  "createWallet.firstName.placeholder": "Entrez votre prénom",
  "createWallet.lastName.label": "Nom :",
  "createWallet.lastName.placeholder": "Entrez votre nom",
  "createWallet.button": "Créer un compte",
  "createWallet.haveAccount": "Vous avez déjà un compte ?",
  "createWallet.login": "Connexion",
  "createWallet.username.label": "Nom d'utilisateur :",
  "createWallet.username.placeholder": "Entrez votre nom d'utilisateur",

  // Wallet page content
  "wallet.welcome": "Bienvenue, {name} !",
  "wallet.balanceDescription": "Voici votre solde",
  "wallet.balanceLabel": "Solde",
  "wallet.currency": "EUR",
  "wallet.crypto": "USDC",

  // Add Contact component
  "contacts.add": "Ajouter un contact",
  "contacts.dialog.title": "Êtes-vous absolument sûr ?",
  "contacts.dialog.description":
    "Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et retirera vos données de nos serveurs.",

  // Contact Card Content component
  "contacts.search.placeholder": "Rechercher un contact spécifique",
  "contacts.empty.title": "Aucun contact trouvé",
  "contacts.empty.description":
    "Vous n'avez aucun contact ou transaction récente à afficher",

  // Contact Card component
  "contacts.card.altText": "{user_name}",

  // Contacts List component
  "contacts.list.title": "Transférer des fonds à vos contacts",
  "contacts.list.description":
    "Derniers contacts à qui vous avez transféré des fonds",
  "contacts.error.noUser": "Aucun utilisateur trouvé",

  // Transfer Modal First Step component
  "transfer.email.label": "Email, Username ou Wallet Address",
  "transfer.email.placeholder": "Email du destinataire, username ou wallet address",
  "transfer.email.description":
    "Ajoutez les informations du compte vers lequel vous souhaitez effectuer un transfert.",
  "transfer.invalidAddressError": "Adresse de wallet invalide",
  "transfer.email.error": "{message} ici",
  "transfer.recipient.warning":
    "(*) Assurez-vous que c'est le bon destinataire",
  "transfer.amount.label": "Montant à transférer",
  "transfer.amount.balance": "Solde disponible :",
  "transfer.amount.placeholder": "Montant en ETH",
  "transfer.button.next": "Suivant",
  "transfer.search.noResults": "Aucun utilisateur trouvé avec cet email.",
  "transfer.search.error": "Erreur lors de la recherche de l'utilisateur",

  // Transfer Modal Second Step component
  "transfer.to.label": "À :",
  "transfer.amount.label2": "Montant :",
  "transfer.button.back": "Retour",
  "transfer.button.transfer": "Transférer",

  // Transfer Success component
  "transfer.success.sent": "Vous avez envoyé",
  "transfer.success.to": "À :",
  "transfer.success.hash": "Hash de transaction :",
  "transfer.success.close": "Fermer",
  "transfer.success.addContact": "Ajouter aux contacts",

  // Transfer Modal Third Step component
  "transfer.password.label": "Mot de passe",
  "transfer.password.placeholder": "Entrez votre mot de passe",
  "transfer.password.description":
    "Entrez votre mot de passe pour confirmer le transfert.",
  "transfer.button.confirming": "Confirmation en cours...",
  "transfer.button.confirm": "Confirmer",

  // Copy Hash component
  "copy.error": "Échec de la copie du hash :",

  // Login Button component
  "login.button.loading": "Chargement...",
  "login.button.login": "Connexion",
  "login.button.sendMoney": "Envoyer de l'argent",

  // Login Form component
  "login.form.title": "Portefeuille Lucas",
  "login.form.error": "Erreur de connexion, veuillez réessayer",
  "login.form.description": "Connectez-vous pour voir votre Lucas",
  "login.form.email.label": "Email :",
  "login.form.email.placeholder": "Email",
  "login.form.password.label": "Mot de passe :",
  "login.form.password.placeholder": "Mot de passe",
  "login.form.validation.email": "Entrez un email valide.",
  "login.form.validation.password":
    "Le mot de passe doit comporter au moins 8 caractères.",
  "login.form.error.email":
    "Nous n'avons pas trouvé d'utilisateur avec cet email.",
  "login.form.error.password": "Le mot de passe est incorrect.",

  // Sign Out Button component
  "signOut.button": "Déconnexion",
} as const;
