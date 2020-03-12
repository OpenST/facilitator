import axios from 'axios';

export default class Faucet {
  public static async fundAccounts(accounts: any[], chain: number): Promise<void> {
    accounts.map(async (account: any): Promise<void> => {
      await this.fundFromFaucet(account.address, chain);
    });
  }

  private static async fundFromFaucet(beneficiary: string, chain: number): Promise<void> {
    try {
      console.log(`Funding ${beneficiary} for chain ${chain}`);
      const FAUCET_URL = 'https://faucet.mosaicdao.org';

      const response = await axios.post(
        FAUCET_URL,
        {
          beneficiary: `${beneficiary}@${chain}`,
        },
      );
      console.log(`Transaction hash is ${response.data.txHash}`);
    } catch (error) {
      console.log(error.message);
    }
  }
}
