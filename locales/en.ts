export default {
  // Homepage content
  "home.title": "Send and Receive Money",
  "home.subtitle": "When you want, where you want",
  "home.balance.label": "Available balance",
  "home.balance.amount": "$23.877",
  "home.balance.crypto": "USDT 23.867",
  "home.cta.button": "Start now",
  "home.cta.description":
    "You need to enter your account to start receiving money.",

  // Login page content
  "login.noAccount": "Don't have an account?",
  "login.createAccount": "Create an account",
  "login.form.email-or-username.label": "Email or Username:",
  "login.form.email-or-username.placeholder": "Enter your email or username",
  "login.form.error.email-or-username":
    "Please enter a valid email or username",
  "login.form.error.required": "This field is required",
  "login.form.error.usernameNotFound": "Username not found",

  // Create wallet page content
  "createWallet.title": "Lucas Wallet",
  "createWallet.description":
    "Create your account to start receiving and sending money.",
  "createWallet.email.label": "Email:",
  "createWallet.email.placeholder": "Enter your email",
  "createWallet.password.label": "Password:",
  "createWallet.password.placeholder": "Enter your password",
  "createWallet.firstName.label": "First Name:",
  "createWallet.firstName.placeholder": "Enter your first name",
  "createWallet.lastName.label": "Last Name:",
  "createWallet.lastName.placeholder": "Enter your last name",
  "createWallet.button": "Create account",
  "createWallet.haveAccount": "Already have an account?",
  "createWallet.login": "Login",
  "createWallet.username.label": "Username:",
  "createWallet.username.placeholder": "Enter your username",

  // Wallet page content
  "wallet.welcome": "Welcome, {name}!",
  "wallet.balanceDescription": "This is your balance",
  "wallet.balanceLabel": "Balance",
  "wallet.currency": "USD",
  "wallet.crypto": "USDC",

  // Add Contact component
  "contacts.add": "Add Contact",
  "contacts.dialog.title": "Are you absolutely sure?",
  "contacts.dialog.description":
    "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",

  // Contact Card Content component
  "contacts.search.placeholder": "Search for a specific contact",
  "contacts.empty.title": "No contacts found",
  "contacts.empty.description":
    "You have no contacts or recent transactions to display",

  // Contact Card component
  "contacts.card.altText": "{user_name}",

  // Contacts List component
  "contacts.list.title": "Transfer funds to your contacts",
  "contacts.list.description": "Last contacts you've transferred funds to",
  "contacts.error.noUser": "No user found",

  // Transfer Modal First Step component
  "transfer.email.label": "Email",
  "transfer.email.placeholder": "Recipient's email",
  "transfer.email.description":
    "Add the email of the account you want to transfer to.",
  "transfer.email.error": "{message} here",
  "transfer.recipient.warning": "(*) Make sure it is the correct recipient",
  "transfer.amount.label": "Amount to transfer",
  "transfer.amount.balance": "Available balance:",
  "transfer.amount.placeholder": "Amount of ETH",
  "transfer.button.next": "Next",
  "transfer.search.noResults": "No users found with that email.",
  "transfer.search.error": "Error getting user",

  // Transfer Modal Second Step component
  "transfer.to.label": "To:",
  "transfer.amount.label2": "Amount:",
  "transfer.button.back": "Back",
  "transfer.button.transfer": "Transfer",

  // Transfer Success component
  "transfer.success.sent": "You've sent",
  "transfer.success.to": "To:",
  "transfer.success.hash": "Transaction hash:",
  "transfer.success.close": "Close",
  "transfer.success.addContact": "Add to contacts",

  // Transfer Modal Third Step component
  "transfer.password.label": "Password",
  "transfer.password.placeholder": "Enter your password",
  "transfer.password.description":
    "Enter your password to confirm the transfer.",
  "transfer.button.confirming": "Confirming...",
  "transfer.button.confirm": "Confirm",

  // Copy Hash component
  "copy.error": "Failed to copy hash:",

  // Login Button component
  "login.button.loading": "Loading...",
  "login.button.login": "Login",
  "login.button.sendMoney": "Send money",

  // Login Form component
  "login.form.title": "Lucas Wallet",
  "login.form.error": "Error logging in, please try again",
  "login.form.description": "Login to see your Lucas",
  "login.form.email.label": "Email:",
  "login.form.email.placeholder": "Email",
  "login.form.password.label": "Password:",
  "login.form.password.placeholder": "Password",
  "login.form.validation.email": "Enter a valid email.",
  "login.form.validation.password":
    "The password must be at least 8 characters long.",
  "login.form.error.email": "We couldn't find a user with that email.",
  "login.form.error.password": "The password is incorrect.",

  // Sign Out Button component
  "signOut.button": "Sign out",
} as const;
