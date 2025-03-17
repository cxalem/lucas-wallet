export const INPUT_ERROR_TYPES = {
  user_not_found: {
    message: "We couldn't find a user with that email.",
    type: "error",
  },
  invalid_email: {
    message: "Enter a valid email.",
    type: "error",
  },
  invalid_amount: {
    message: "Enter a number for the amount.",
    type: "error",
  },
  insufficient_balance: {
    message: "You don't have enough balance to transfer.",
    type: "error",
  },
  transaction_failed: {
    message: "An error occurred during the transfer.",
    type: "error",
  },
  password_incorrect: {
    message: "The password is incorrect.",
    type: "error",
  },
  same_account: {
    message: "You can't transfer funds to your own account.",
    type: "error",
  },
};

export const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

