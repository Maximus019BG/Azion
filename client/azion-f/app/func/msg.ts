import { AES, enc } from 'crypto-ts';

const key = process.env.REACT_APP_KEY || "gaAF62h12asd@9lbASF&59"

// Encrypt
const Encrypt = (message: string) => {
    return AES.encrypt(message, key).toString();
};

// Decrypt
const Decrypt = (encryptedMsg: string) => {
    const decrypted = AES.decrypt(encryptedMsg, key);
    return decrypted.toString(enc.Utf8);
}

export { Encrypt, Decrypt };
