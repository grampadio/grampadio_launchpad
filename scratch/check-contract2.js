import { TonClient, Address } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

async function main() {
  const endpoint = await getHttpEndpoint();
  const client = new TonClient({ endpoint });
  
  const address = Address.parse('EQBO823esFVZkBCTyXcaFsABJk0241ZXOMuE0sXK5yHbGOj3');
  try {
    const res = await client.getContractState(address);
    console.log(JSON.stringify({
       balance: res.balance.toString(),
       state: res.state,
    }, null, 2));
    
    // try get_contract_details
    const result = await client.runMethod(address, 'get_contract_details');
    console.log("get_contract_details returned!");
    const stack = result.stack;
    while(stack.remaining > 0) {
      const peek = stack.peek();
      console.log(peek.type);
      if (peek.type === 'int') {
         console.log(stack.readBigNumber().toString());
      } else if (peek.type === 'cell') {
         console.log(stack.readCell().toBoc().toString('base64'));
      } else if (peek.type === 'slice') {
         console.log(stack.readCell().toBoc().toString('base64'));
      } else {
         stack.pop();
      }
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}

main();
