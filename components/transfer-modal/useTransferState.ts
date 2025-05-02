import { useReducer } from 'react';
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';
import { transferFormSchema } from '@/utils/schemas';

export const TransferStates = {
  Idle: 'idle',
  Validating: 'validating',
  Pending: 'pending', // Awaiting password confirmation
  Sending: 'sending',
  Success: 'success',
  Error: 'error',
} as const;

export type TransferState = (typeof TransferStates)[keyof typeof TransferStates];

export type RecipientInfo = {
  wallet_address: PublicKey;
  first_name: string;
  user_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
};

export type TransferStateData = {
  state: TransferState;
  formData: z.infer<typeof transferFormSchema> | null;
  recipient: RecipientInfo | null;
  transactionHash: string | null;
  errorMessage: string | null;
};

export type Action =
  | { type: 'START_VALIDATION'; payload: { formData: z.infer<typeof transferFormSchema>, recipient: RecipientInfo } }
  | { type: 'VALIDATION_SUCCESS' } // Moves from Validating to Pending
  | { type: 'START_SENDING' }
  | { type: 'SEND_SUCCESS'; payload: { transactionHash: string } }
  | { type: 'SET_ERROR'; payload: { message: string } }
  | { type: 'RETRY' } // Typically moves from Error back to Pending
  | { type: 'RESET' }
  | { type: 'GO_BACK_TO_IDLE' } // From Validating back to Idle
  | { type: 'GO_BACK_TO_VALIDATING' }; // From Pending back to Validating

const initialState: TransferStateData = {
  state: TransferStates.Idle,
  formData: null,
  recipient: null,
  transactionHash: null,
  errorMessage: null,
};

function transferReducer(state: TransferStateData, action: Action): TransferStateData {
  switch (action.type) {
    case 'START_VALIDATION':
      return {
        ...initialState, // Reset most fields on new validation start
        state: TransferStates.Validating,
        formData: action.payload.formData,
        recipient: action.payload.recipient,
      };
    case 'VALIDATION_SUCCESS':
      if (state.state !== TransferStates.Validating) return state; // Guard
      return {
        ...state,
        state: TransferStates.Pending,
        errorMessage: null,
      };
    case 'START_SENDING':
      if (state.state !== TransferStates.Pending) return state; // Guard
      return {
        ...state,
        state: TransferStates.Sending,
        errorMessage: null,
      };
    case 'SEND_SUCCESS':
      return {
        ...state,
        state: TransferStates.Success,
        transactionHash: action.payload.transactionHash,
        errorMessage: null,
      };
    case 'SET_ERROR':
       // Keep existing form data and recipient when an error occurs during send/validation
      return {
        ...state,
        state: TransferStates.Error,
        errorMessage: action.payload.message,
        transactionHash: null, // Clear any previous hash on new error
      };
    case 'RETRY':
       // Allow retry only from Error state, going back to Pending (password entry)
      if (state.state !== TransferStates.Error) return state;
      return {
          ...state,
          state: TransferStates.Pending,
          errorMessage: null, // Clear error on retry
      };
    case 'RESET':
      return initialState;
    case 'GO_BACK_TO_IDLE':
      // Only allow going back to Idle from Validating step
      if (state.state !== TransferStates.Validating) return state;
       return {
        ...initialState // Fully reset
       };
    case 'GO_BACK_TO_VALIDATING':
       // Only allow going back to Validating from Pending step
       if (state.state !== TransferStates.Pending) return state;
       return {
         ...state,
         state: TransferStates.Validating,
         errorMessage: null, // Clear potential password error
       };
    default:
      return state;
  }
}

export function useTransferState() {
  const [state, dispatch] = useReducer(transferReducer, initialState);
  return { state, dispatch };
} 