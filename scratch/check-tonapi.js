async function main() {
  try {
    const res = await fetch('https://tonapi.io/v2/blockchain/accounts/EQBO823esFVZkBCTyXcaFsABJk0241ZXOMuE0sXK5yHbGOj3/methods/get_contract_details');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
main();
