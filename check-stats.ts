import { getUserStakingDetails } from "./src/ton/staking.js";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const userWalletAddress =
    "UQBXO7kv4sQOKUiHpMpyjaDiGSU8Onh-fNZnKhnDI8VXUWZd";

  const poolContractAddress =
    "EQBO823esFVZkBCTyXcaFsABJk0241ZXOMuE0sXK5yHbGOj3";

  console.log(`Fetching staking details for user: ${userWalletAddress} ...`);

  try {
    const userStats = await getUserStakingDetails(
      userWalletAddress,
      poolContractAddress
    );

    console.log("\n--- User Staking Summary ---");
    console.log("Total Positions:", userStats.totalStakePositions);
    console.log("Active Positions:", userStats.activeStakePositions);
    console.log("Has Active Stake?:", userStats.hasActiveStake);

    console.log("\n--- Detailed Stakes ---");
    console.log(
      JSON.stringify(
        userStats.stakes,
        (_, value) => typeof value === "bigint" ? value.toString() : value,
        2
      )
    );

  } catch (error) {
    console.error("Error fetching user stats:");
    console.error(error);
  }
}

main();