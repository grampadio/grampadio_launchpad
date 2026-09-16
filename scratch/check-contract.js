import { TonClient, Address } from '@ton/ton';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.VITE_TONCENTER_API_KEY,
  });
  
  const address = Address.parse('EQBO823esFVZkBCTyXcaFsABJk0241ZXOMuE0sXK5yHbGOj3');
  try {
    const res = await client.getContractState(address);
    console.log(JSON.stringify({
       balance: res.balance.toString(),
       state: res.state,
    }, null, 2));
    
    // Also try to get dashboard
    const contract = client.open(
       // just run method
       // wait, let's just run get_contract_details
       null
    );
    const result = await client.runMethod(address, 'get_contract_details');
    console.log("get_contract_details:", result.stack.readBigNumber().toString());
  } catch (e) {
    console.log("Error:", e.message);
  }
}

main();
