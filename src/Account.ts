import Web3 from 'web3';
import { EncryptedKeystoreV3Json } from 'web3-eth-accounts';

export class Account {

    /**
     * @param address Public address of the account.
     * @param encryptedKeyStore Encrypted keystore data for the account.
     */
    constructor(
        readonly address: string,
        readonly encryptedKeyStore: EncryptedKeystoreV3Json
    ) { }

    /**
     * Unlocks this account and keeps it in memory unlocked.
     * @param web3 The web3 instance that this account uses.
     * @param password The password required to unlock the account.
     */
    public unlock(web3: Web3, password: string): boolean {
        // Unlocking the account and adding it to the local web3 instance so that everything is signed
        // locally when using web3.eth.send
        return false;
    }
}
