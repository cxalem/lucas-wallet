---

# Additional Application Overview

This application demonstrates a simple flow for creating Ethereum wallets, signing up new users, encrypting/decrypting private keys, and transferring balances between users. It uses [Next.js server actions](https://nextjs.org/docs/app/api-reference/file-conventions/route.ts) alongside [Supabase](https://supabase.com/) for data persistence and user management.

## Key Features

1. **User Signup & Wallet Generation**  
   - When a new user signs up, the app automatically creates an Ethereum wallet for them.  
   - The mnemonic and private key are encrypted using the user's password.  

2. **Encryption & Decryption**  
   - The app uses AES-GCM for symmetric encryption of sensitive wallet data (private key and mnemonic).  
   - Encryption/Decryption is performed in the `app/security/encrypt.ts` file.  

3. **Transaction Flow**  
   - Users can initiate ETH transfers by entering a recipient's email and the amount to send.  
   - The app decrypts the sender's private key once they confirm with their password, then completes the on-chain transaction.  

## Folder & File Overview

### 1. `app/create-wallet/actions.ts`

- **Key Functions**: `signup`  
- **Dependencies**:  
  - `createWallet` from `utils.ts`  
  - `encryptData` from `app/security/encrypt.ts`  
  - Supabase for user authentication and data storage  

### 2. `app/create-wallet/utils.ts`
