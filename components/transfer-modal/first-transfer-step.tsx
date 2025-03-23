"use client";

import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { INPUT_ERROR_TYPES } from "@/utils/constants";
import { transferFormSchema } from "@/utils/schemas";
import { Contact } from "@/types";
import { XIcon } from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import { formatUsdcBalance } from "@/lib/utils";
import { useI18n } from "@/locales/client";

type TransferModalFirstStepProps = {
  transferForm: UseFormReturn<z.infer<typeof transferFormSchema>>;
  userContact: Contact | null;
  setUserContact: (contact: Contact | null) => void;
  handleTransferFormSubmit: (
    values: z.infer<typeof transferFormSchema>
  ) => void;
  inputError: (typeof INPUT_ERROR_TYPES)[keyof typeof INPUT_ERROR_TYPES] | null;
  userBalance: string | null;
  setInputError: (
    error: (typeof INPUT_ERROR_TYPES)[keyof typeof INPUT_ERROR_TYPES] | null
  ) => void;
};

/**
 * TransferModalFirstStep
 *
 * This component is the first step in a multi-step transfer modal.
 * It handles:
 * - Searching and selecting a recipient by email.
 * - Displaying the user's USDC balance.
 * - Accepting the transfer amount.
 */
export const TransferModalFirstStep = ({
  transferForm,
  setUserContact,
  userContact,
  handleTransferFormSubmit,
  inputError,
  userBalance,
  setInputError,
}: TransferModalFirstStepProps) => {
  const t = useI18n();
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const supabase = createClient();

  /**
   * Handles the input change event for the email search field.
   */
  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setInputError(null);
      // Update form value immediately
      transferForm.setValue("email", value);
      if (value.length === 0) {
        setSearchResults([]);
      }
    },
    [setInputError, transferForm]
  );

  /**
   * Executes a debounced search against the profiles table.
   */
  const performSearch = useCallback(async () => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`email.ilike.%${query}%,user_name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error(t("transfer.search.error"), error);
      return;
    }

    if (!data || data.length === 0) {
      console.log(t("transfer.search.noResults"));
      setSearchResults([]);
      return;
    }

    setSearchResults(data);
  }, [query, supabase, t]);

  // Debounce the search function with a delay of 500ms
  useDebounce(performSearch, 500, query);

  /**
   * Renders the email input field for the transfer form.
   */
  const renderEmailInput = () => (
    <FormItem className="flex flex-col gap-2 space-y-0 justify-between mt-6">
      <FormLabel>{t("transfer.email.label")}</FormLabel>
      <FormControl>
        <Input
          autoComplete="off"
          onFocus={() => setIsSearching(true)}
          placeholder={t("transfer.email.placeholder")}
          value={query}
          onChange={handleSearchInput}
          className={inputError ? "border-red-600" : ""}
        />
      </FormControl>
      <FormDescription>
        {!inputError ? (
          t("transfer.email.description")
        ) : (
          <span className="text-red-600">
            {t("transfer.email.error", { message: inputError?.message })}
          </span>
        )}
      </FormDescription>
      <FormMessage />
    </FormItem>
  );

  /**
   * Renders the selected contact information with an option to clear the selection.
   */
  const renderSelectedContact = () => (
    <div className="flex flex-col gap-2 mt-6">
      <Button
        onClick={() => {
          transferForm.setValue("email", "");
          setUserContact(null);
          setQuery("");
        }}
        className="flex justify-between bg-neutral-800 w-full h-fit px-3 py-1 hover:bg-neutral-700"
      >
        <div className="flex flex-col text-start items-start">
          <span className="text-lg text-blue-50 font-bold">
            {userContact?.first_name || `@${userContact?.user_name}`}
          </span>
          <span className="text-sm text-muted-foreground">
            {userContact?.email}
          </span>
        </div>
        <XIcon className="w-4 h-4 text-muted-foreground" />
      </Button>
      {inputError ? (
        <span className="text-red-400 px-2">{inputError?.message}</span>
      ) : (
        <span className="text-muted-foreground text-sm">
          {t("transfer.recipient.warning")}
        </span>
      )}
    </div>
  );

  /**
   * Renders the dropdown with search results.
   */
  const renderSearchResults = () => (
    <div
      className={`absolute mt-2 border border-neutral-700 rounded-lg bg-neutral-800 w-full top-16 ${
        isSearching ? "block" : "hidden"
      }`}
    >
      {searchResults.map((user) => {
        const fullName =
          user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : null;
        const displayName = fullName || `@${user.user_name}`;

        return (
          <button
            key={user.id}
            type="button"
            onClick={() => {
              transferForm.setValue("email", user.email);
              setUserContact(user);
              setQuery(user.email);
              setSearchResults([]);
              setIsSearching(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-700 duration-150"
          >
            <div className="flex flex-col items-start gap-2">
              <span className="font-semibold">{displayName}</span>
              <span className="text-muted-foreground text-sm">
                {user.email}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <Form {...transferForm}>
      <form
        className="space-y-4"
        onSubmit={transferForm.handleSubmit(handleTransferFormSubmit)}
      >
        <FormField
          control={transferForm.control}
          name="email"
          render={() => (
            <div className="relative h-28">
              {userContact ? renderSelectedContact() : renderEmailInput()}
              {query &&
                !userContact &&
                searchResults.length > 0 &&
                renderSearchResults()}
            </div>
          )}
        />
        <FormField
          control={transferForm.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1 !m-0">
              <FormLabel>{t("transfer.amount.label")}</FormLabel>
              <div className="m-0 h-24 bg-neutral-700 rounded-lg flex flex-col justify-between py-2 px-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    {t("transfer.amount.balance")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {formatUsdcBalance(Number(userBalance))}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {t("wallet.crypto")}
                    </span>
                  </div>
                </div>
                <FormControl>
                  <div className="flex text-3xl gap-1">
                    $
                    <Input
                      placeholder="13.37"
                      className="border-none h-fit p-0 !text-3xl focus:outline-none focus:ring-0 bg-transparent appearance-none [::-webkit-outer-spin-button]:appearance-none [::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      type="number"
                      step="any"
                      onChange={(e) => {
                        field.onChange(e);
                        setInputError(null);
                      }}
                    />
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {t("transfer.button.next")}
        </Button>
      </form>
    </Form>
  );
};
