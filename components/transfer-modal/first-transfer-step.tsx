"use client";

import { useState } from "react";
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
export const TransferModalFirstStep = ({
  transferForm,
  setUserContact,
  userContact,
  handleTransferFormSubmit,
  inputError,
  userBalance,
  setInputError,
}: TransferModalFirstStepProps) => {
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const supabase = createClient();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setInputError(null);

    if (e.target.value.length === 0) {
      setSearchResults([]);
    }
  };

  const search = async () => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", `%${query}%`)
      .limit(10);

    if (error) {
      console.error("Error al obtener el usuario", error);
      return;
    }

    if (!data || data.length === 0) {
      console.log("No se encontraron usuarios con ese email.");
      setSearchResults([]);
      return;
    }

    setSearchResults(data);
    console.log("searchResults:", data);
  };

  useDebounce(search, 500, query);

  return (
    <Form {...transferForm}>
      <form
        className="space-y-4"
        onSubmit={transferForm.handleSubmit(handleTransferFormSubmit)}
      >
        <FormField
          control={transferForm.control}
          name="email"
          render={({ field }) => (
            <div className="h-28">
              <FormItem
                className={`${userContact && "hidden"} h-full space-y-0`}
              >
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    onFocus={() => setIsSearching(true)}
                    placeholder="Correo del destinatario"
                    value={userContact?.email || field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      handleSearch(e);
                    }}
                    className={inputError ? "border-red-600" : ""}
                  />
                </FormControl>
                <FormDescription>
                  {!inputError ? (
                    "Ingresa el email de la cuenta a la que quieres transferir."
                  ) : (
                    <span className="text-red-600">{inputError?.message}</span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>

              {userContact && (
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      transferForm.setValue("email", "");
                      setUserContact(null);
                    }}
                    className="flex justify-between bg-neutral-800 w-full h-fit px-3 py-1 hover:bg-neutral-700"
                  >
                    <div className="flex flex-col text-start items-start">
                      <span className="text-lg text-blue-50 font-bold">
                        {userContact.first_name} {userContact.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {userContact.email}
                      </span>
                    </div>
                    <XIcon className="w-4 h-4 text-muted-foreground" />
                  </Button>

                  {inputError ? (
                    <span className="text-red-400 px-2">
                      {inputError?.message}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm px-3">
                      (*) Asegúrate de que sea el destinatario correcto
                    </span>
                  )}
                </div>
              )}

              {query && !userContact && searchResults.length > 0 && (
                <div
                  className={`absolute mt-2 border border-neutral-700 rounded-lg bg-neutral-800 w-full top-28 ${
                    isSearching ? "block" : "hidden"
                  }`}
                >
                  {searchResults.map((user) => (
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
                        <span className="font-semibold">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {user.email}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        />
        <FormField
          control={transferForm.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad que deseas transferir</FormLabel>
              <div className="m-0 h-24 bg-neutral-700 rounded-lg flex flex-col justify-between py-2 px-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Saldo disponible:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {userBalance}
                    </span>
                    <span className="text-muted-foreground text-sm">ETH</span>
                  </div>
                </div>
                <FormControl>
                  <div className="flex text-3xl gap-1">
                    $
                    <Input
                      placeholder="Cantidad de ETH"
                      className="border-none h-fit p-0 !text-3xl focus:outline-none focus:ring-0 bg-transparent appearance-none [::-webkit-outer-spin-button]:appearance-none [::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      type="number"
                      step="any"
                      {...field}
                    />
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Siguiente
        </Button>
      </form>
    </Form>
  );
};
