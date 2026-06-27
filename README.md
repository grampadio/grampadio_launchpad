# Naughty Coin: Decentralized IDO Launchpad Smart Contracts

This project integrates a production-ready, self-contained **TON Tact Smart Contract** architecture that governs token sales, voting mechanisms, hardcap/softcap enforcement, and automated secure refunds or token distribution directly via the TON Virtual Machine (TVM).

---

## 🏗️ Smart Contract Architecture Overview

Each IDO project launched through `Gram Starter` operates its own self-contained decentralized escrow smart contract on TON. This maintains complete security isolation:
- **`GramStarterIdo.tact`**: The reference global contract template supporting incremental stages.
- **`Token_IdoContract.tact`**: Multi-state isolated project contracts with automated parameters based on creator specifications.

### Key Features
1. **Durable On-Chain State**:
   - `softCap`/`hardCap`: Hardcoded limits verified strictly by TVM execution.
   - `minBuy`/`maxBuy`: Secure bounds preventing whale manipulation or transaction gas bloat.
   - `contributions`: A secure index map referenced directly by the contributor's TON `Address`.
2. **Phase Bounds**:
   - IDO progresses sequentially through states (`vote` (0), `preparation` (1), `whitelist` (2), `sale` (3), `distribution` (4), `failed` (5)).
   - Capital (USDT/TON) is securely locked within the contract account and cannot be released unless the conditions are fully met.
3. **Automated On-Chain Refund Mechanism**:
   - If the `softCap` is not reached by the `endTime` limit, the contract transitions automatically to the custom refund stage.
   - Contributors send a `ClaimRefund` message, triggering instantaneous safe refunds from the contract balance directly to their personal TON wallets.
4. **Vesting Control**:
   - Jettons are mapped and distributed proportionally strictly when the `softCap` is achieved and the `endTime` restriction has passed.

---

## 🛠️ How to Compile Tact Contracts

TON Tact is a strongly-typed, actor-model programming language compiling directly to Fift/FunC bytecode for the TVM. Follow these steps to build and compile:

### 1. Prerequisites
Ensure you have Node.js (v18+) installed.

### 2. Install Dependencies
You can install the default TON development toolset `Blueprint` (recommended by TON Core) or run the Tact compiler independently:
```bash
# To install the Tact compiler globally or locally:
npm install -g @tact-lang/compiler
```

### 3. Setup tact.config.json
Define your compilation output targets in the root configuration file (`tact.config.json`):
```json
{
    "projects": [
        {
            "name": "GramStarterIdo",
            "path": "./contracts/GramStarterIdo.tact",
            "output": "./contracts/build"
        }
    ]
}
```

### 4. Compile the Contracts
Run the compilation command. This generates the package configuration, the `.fif` assembly, and the compiled `.boc` (Bag of Cells) payload used for on-chain deployment:
```bash
# Compile via global compiler
tact .

# Alternatively, if utilizing the Blueprint toolset:
npx blueprint build
```

The output inside the `build/` directory will include:
- `GramStarterIdo.code.boc`: Compiled bytecode ready to form the state-init code segment.
- `GramStarterIdo.headers.fc`: FunC intermediate headers.
- `GramStarterIdo.pkg`: Package manifest used during SDK programmatic deploys.

---

## 🚀 Deployment Guide & Contract Configuration

Deploy your compiled smart contracts onto TON Testnet or Mainnet using standard TypeScript scripts or the integrated frontend wallet interfaces.

### 1. Configure Initialization Parameters
When deploying an IDO sandbox contract for a new token project, specify parameters in the `init(...)` constructor:

```tact
// Constructor Arguments matching the launchpad project
init(
    owner: Address,            // Project creator who offtakes raised funds
    jettonAddress: Address,    // Jetton Master Address of the pre-minted rewards
    softCap: Int,              // Softcap target (e.g., 20000000000 nanocoins / USDT)
    hardCap: Int,              // Hardcap ceiling limits (e.g., 100000000000 nanocoins / USDT)
    minBuy: Int,               // Minimum purchase size allowed per TX
    maxBuy: Int                // Maximum individual limit
) {
    self.owner = owner;
    self.jettonAddress = jettonAddress;
    self.softCap = softCap;
    self.hardCap = hardCap;
    self.minBuy = minBuy;
    self.maxBuy = maxBuy;
    self.raised = 0;
    self.idoStage = 0;         // Initializes at "Vote" Stage
    self.nextPhaseTime = 0;    // Sets the phase timeline limit
}
```

### 2. Example JS/TS Deployment Script
Use the `@ton/ton` and `@ton/core` SDKs to programmatically spin up custom contracts:

```typescript
import { Address, Cell, StateInit, beginCell, contractAddress, toNano } from "@ton/core";
import { TonClient, WalletContractV4 } from "@ton/ton";

async function deployIDO() {
    const client = new TonClient({
        endpoint: "https://toncenter.com/api/v2/jsonRPC", // Switch to testnet.toncenter.com for sandboxing
        apiKey: "YOUR_TONCENTER_API_KEY"
    });

    // Load compiled .boc and code cell configurations
    const contractCode = Cell.fromBoc(Buffer.from("YOUR_HEX_CODE", "hex"))[0];

    // Build the Contract initialization data cell
    const ownerAddress = Address.parse("EQD..."); // Creator Wallet
    const jettonAddress = Address.parse("EQ..."); // Jetton Master Address
    
    const initData = beginCell()
        .storeAddress(ownerAddress)
        .storeAddress(jettonAddress)
        .storeCoins(toNano("1000"))   // Soft Cap (1,000 TON/USDT)
        .storeCoins(toNano("10000"))  // Hard Cap (10,000 TON/USDT)
        .storeCoins(toNano("50"))     // Min Buy (50 TON/USDT)
        .storeCoins(toNano("500"))    // Max Buy (500 TON/USDT)
        .storeCoins(0)                // Starts with 0 raised funds
        .storeUint(0, 8)              // Stage = Vote (0)
        .storeUint(0, 32)             // Time limit = 0
        .endCell();

    const stateInit: StateInit = {
        code: contractCode,
        data: initData
    };

    const targetAddress = contractAddress(0, stateInit);
    console.log("🚀 Programmatic IDO Smart Contract Address:", targetAddress.toString());

    // Send the initialization transaction with TON gas...
}
deployIDO();
```

---

## 🔒 Security Measures & Standard Procedures

### Standard Code Audit Checklist of TVM Registers
1. **Re-entrancy Protection**: All storage writes (such as updating `contributions` state variables) occur **BEFORE** dispatching standard outbound messages to prevent transfer double-claims.
2. **Access Control**: Handlers like `Receive(msg: AdvanceStage)` are armed with rigorous `require(sender() == self.owner, "Access Denied")` checks, locking configuration rights onto the creator.
3. **Over-allocation Safeguard**: Cumulative updates are measured inside the state block using mapping lookups to enforce individual limits strictly:
   ```tact
   let currentCont: Int = 0;
   let existing: Int? = self.contributions.get(sender());
   if (existing != null) { currentCont = existing!; }
   require(currentCont + msg.amount <= self.maxBuy, "Allocation holds exceeded");
   ```

---

## 🔮 Simulating TVM On-Chain Interactions
Want to test the contract logic safely inside the browser preview? 
1. Navigate to any active project listed inside the application.
2. Click on the newly integrated **"On-Chain Smart Contract"** section tab.
3. Open the **"Interactive Playpen & TVM Debugger"** sub-panel.
4. Launch simulated transactions (`Contribute`, `ClaimRefund`, and `ClaimTokens`) to track real-time gas consumption, VM logs, map index state updates, and storage modifications instantly!

#generate admin password
http://localhost:3233/api/admin/hash?password=admin