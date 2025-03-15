"use server";

/**
 * Deriva una clave criptográfica AES-GCM usando PBKDF2.
 *
 * @param {string} password - La contraseña ingresada por el usuario
 * @param {Uint8Array} salt - Bytes aleatorios para PBKDF2
 * @returns {CryptoKey} - Clave criptográfica para cifrar/descifrar con AES-GCM
 */

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passBuffer = encoder.encode(password);

  // 1. Importa la password como clave "raw"
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // 2. Aplica PBKDF2 para derivar la key AES-GCM
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // Ajusta las iteraciones (cuanto mayor, más seguro pero más lento)
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false, // no es exportable
    ["encrypt", "decrypt"]
  );

  return key;
}

export async function encryptData(
  password: string,
  plaintext: string
): Promise<{ salt: string; iv: string; ciphertext: string }> {
  // Generar un salt aleatorio para PBKDF2 (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derivar la clave
  const key = await deriveKey(password, salt);

  // Crear un IV (nonce) aleatorio para AES-GCM (12 bytes recomendado)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Cifrar
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  // Retornar salt, iv y datos cifrados en formato base64 o hex
  return {
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(new Uint8Array(ciphertextBuffer)),
  };
}

// Función auxiliar para convertir ArrayBuffer a base64 (o hex)
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export async function decryptData(
  password: string,
  { salt, iv, ciphertext }: { salt: string; iv: string; ciphertext: string }
): Promise<string> {
  // Decodificar base64 a ArrayBuffer
  const saltBytes = base64ToArrayBuffer(salt);
  const ivBytes = base64ToArrayBuffer(iv);
  const ciphertextBytes = base64ToArrayBuffer(ciphertext);

  // Derivar la misma clave
  const key = await deriveKey(password, saltBytes);

  // Descifrar
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes,
    },
    key,
    ciphertextBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
