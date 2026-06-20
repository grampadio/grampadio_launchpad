import {
  Address,
  beginCell,
  StateInit,
  storeStateInit,
  toNano,
} from '@ton/core';
import { JettonMaster, JettonWallet } from '@ton/ton';
import {
  GramPadSimpleSwap,
  storeDeploy,
  storeFundTon,
  storeSetMaxBuy,
  storeSetTonRate,
  storeOwnerWithdrawGram,
  storeOwnerWithdrawTon,
  storeOwnerWithdrawUsdt,
  storeSetJettonWallets,
  storeSetPaused,
  storeSetRate,
  storeSwapTonForGram,
} from '../../contracts/build/GramPadSimpleSwap_GramPadSimpleSwap.js';
import { SwapSettings } from '../types.js';
import { buildJettonTransferPayload, cellToBase64, getTonClient, parseTokenAmount } from './gramStarter.js';

export const SWAP_RATE_SCALE = 1_000_000_000n;
export const SWAP_DEPLOY_TON = '0.08';
export const SWAP_FUND_TON = '0.3';
export const SWAP_JETTON_FORWARD_TON = '0.1';
export const SWAP_JETTON_TRANSFER_TON = '0.1';
const SWAP_PAYLOAD_MARKER = 0x53574150;
const TON_DECIMALS = 9;

export const formatUnits = (
  value: bigint | number | string,
  decimals: number,
  maxFraction = 4
) => {
  const amount = BigInt(value);
  const unit = 10n ** BigInt(decimals);
  const whole = amount / unit;
  const fraction = amount % unit;

  if (fraction === 0n || maxFraction <= 0) return whole.toString();

  const fractionText = fraction
    .toString()
    .padStart(decimals, '0')
    .slice(0, maxFraction)
    .replace(/0+$/, '');

  return fractionText ? `${whole}.${fractionText}` : whole.toString();
};

export const parseSwapAmount = (value: string | number, decimals: number) =>
  parseTokenAmount(value, decimals);

export const rateScaledFromLabel = (value: string | number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error('Swap rate must be a positive number.');
  }
  return BigInt(Math.round(numeric * Number(SWAP_RATE_SCALE)));
};

export const maxBuyRawFromLabel = (value: string | number, usdtDecimals: number) => {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized === '0') return 0n;
  return parseTokenAmount(normalized, usdtDecimals);
};

export const buildSwapForwardPayload = (route: 0 | 1, minOut: bigint = 0n) =>
  beginCell()
    .storeUint(SWAP_PAYLOAD_MARKER, 32)
    .storeUint(route, 8)
    .storeUint(minOut, 128);

export const getSimpleSwapContract = (address: string) =>
  GramPadSimpleSwap.fromAddress(Address.parse(address));

export async function getUserJettonWalletAddress(
  ownerAddress: string,
  masterAddress: string
) {
  const client = getTonClient();
  const master = client.open(JettonMaster.create(Address.parse(masterAddress)));
  return master.getWalletAddress(Address.parse(ownerAddress));
}

export async function getUserJettonBalance(
  ownerAddress: string,
  masterAddress: string
) {
  const walletAddress = await getUserJettonWalletAddress(ownerAddress, masterAddress);
  const client = getTonClient();
  return client.open(JettonWallet.create(walletAddress)).getBalance();
}

export async function getUserTonBalance(ownerAddress: string) {
  const client = getTonClient();
  return client.getBalance(Address.parse(ownerAddress));
}

export async function getSwapContractDetails(address: string) {
  const client = getTonClient();
  const contract = client.open(getSimpleSwapContract(address));
  const [version, details] = await Promise.all([
    contract.getGetContractVersion(),
    contract.getGetContractDetails(),
  ]);

  return {
    contractVersion: Number(version),
    details,
  };
}

export const waitForSwapDeployment = async (
  contract: GramPadSimpleSwap,
  timeoutMs = 60_000
) => {
  const client = getTonClient();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const state = await client.getContractState(contract.address);

    if (state.state === 'active') {
      const opened = client.open(contract);
      const version = await opened.getGetContractVersion();
      if (version !== 1n && version !== 2n) {
        throw new Error(`Unexpected swap contract version ${version.toString()}.`);
      }
      return;
    }

    if (state.lastTransaction) {
      throw new Error(
        `The deployment transaction reached ${contract.address.toString()}, but the account did not become active.`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 3_000));
  }

  throw new Error(
    `No deployment transaction reached ${contract.address.toString()}. The wallet accepted the request locally but did not broadcast it.`
  );
};

export const quoteGramOut = (
  usdtAmount: bigint,
  rateScaled: bigint,
  gramDecimals: number,
  usdtDecimals: number
) =>
  (usdtAmount * rateScaled * 10n ** BigInt(gramDecimals)) /
  (SWAP_RATE_SCALE * 10n ** BigInt(usdtDecimals));

export const quoteUsdtOut = (
  gramAmount: bigint,
  rateScaled: bigint,
  gramDecimals: number,
  usdtDecimals: number
) =>
  (gramAmount * SWAP_RATE_SCALE * 10n ** BigInt(usdtDecimals)) /
  (rateScaled * 10n ** BigInt(gramDecimals));

export const quoteGramOutFromTon = (
  tonAmount: bigint,
  tonRateScaled: bigint,
  gramDecimals: number
) =>
  (tonAmount * tonRateScaled * 10n ** BigInt(gramDecimals)) /
  (SWAP_RATE_SCALE * 10n ** BigInt(TON_DECIMALS));

export const quoteTonOut = (
  gramAmount: bigint,
  tonRateScaled: bigint,
  gramDecimals: number
) =>
  (gramAmount * SWAP_RATE_SCALE * 10n ** BigInt(TON_DECIMALS)) /
  (tonRateScaled * 10n ** BigInt(gramDecimals));

export async function deriveSwapWallets(
  contractAddress: string,
  gramMasterAddress: string,
  usdtMasterAddress: string
) {
  const [gramWalletAddress, usdtWalletAddress] = await Promise.all([
    getUserJettonWalletAddress(contractAddress, gramMasterAddress),
    getUserJettonWalletAddress(contractAddress, usdtMasterAddress),
  ]);

  return { gramWalletAddress, usdtWalletAddress };
}

export async function buildSwapDeployment(
  settings: Pick<
    SwapSettings,
    'ownerAddress' | 'gramMasterAddress' | 'gramDecimals' | 'usdtMasterAddress' | 'usdtDecimals'
  > & { rateScaled: bigint; tonRateScaled: bigint; maxBuyRaw: bigint }
) {
  const deploymentId = BigInt(Date.now());
  const contract = await GramPadSimpleSwap.fromInit(
    Address.parse(settings.ownerAddress),
    Address.parse(settings.gramMasterAddress),
    BigInt(settings.gramDecimals),
    Address.parse(settings.usdtMasterAddress),
    BigInt(settings.usdtDecimals),
    settings.rateScaled,
    settings.tonRateScaled,
    settings.maxBuyRaw,
    deploymentId
  );

  if (!contract.init) {
    throw new Error('Failed to construct swap contract state.');
  }

  const stateInit: StateInit = contract.init;
  const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();
  const deployPayload = beginCell()
    .store(storeDeploy({ $$type: 'Deploy', queryId: deploymentId }))
    .endCell();

  return {
    contract,
    deploymentId,
    deploymentMessage: {
      address: contract.address.toString(),
      amount: toNano(SWAP_DEPLOY_TON).toString(),
      stateInit: cellToBase64(stateInitCell),
      payload: cellToBase64(deployPayload),
    },
  };
}

export const buildFundSwapTonPayload = () =>
  cellToBase64(
    beginCell()
      .store(storeFundTon({ $$type: 'FundTon' }))
      .endCell()
  );

export const buildConfigureSwapJettonWalletsPayload = (
  gramJettonWallet: Address,
  usdtJettonWallet: Address
) =>
  cellToBase64(
    beginCell()
      .store(storeSetJettonWallets({
        $$type: 'SetJettonWallets',
        gramJettonWallet,
        usdtJettonWallet,
      }))
      .endCell()
  );

export const buildSetSwapPausedPayload = (paused: boolean) =>
  cellToBase64(
    beginCell()
      .store(storeSetPaused({ $$type: 'SetPaused', paused }))
      .endCell()
  );

export const buildSetSwapRatePayload = (rateScaled: bigint) =>
  cellToBase64(
    beginCell()
      .store(storeSetRate({ $$type: 'SetRate', rateScaled }))
      .endCell()
  );

export const buildSetSwapTonRatePayload = (tonRateScaled: bigint) =>
  cellToBase64(
    beginCell()
      .store(storeSetTonRate({ $$type: 'SetTonRate', tonRateScaled }))
      .endCell()
  );

export const buildSetSwapMaxBuyPayload = (maxBuy: bigint) =>
  cellToBase64(
    beginCell()
      .store(storeSetMaxBuy({ $$type: 'SetMaxBuy', maxBuy }))
      .endCell()
  );

export const buildSwapOwnerWithdrawTonPayload = (amount: bigint, destination: string) =>
  cellToBase64(
    beginCell()
      .store(storeOwnerWithdrawTon({
        $$type: 'OwnerWithdrawTon',
        amount,
        destination: Address.parse(destination),
      }))
      .endCell()
  );

export const buildSwapOwnerWithdrawGramPayload = (amount: bigint, destination: string) =>
  cellToBase64(
    beginCell()
      .store(storeOwnerWithdrawGram({
        $$type: 'OwnerWithdrawGram',
        amount,
        destination: Address.parse(destination),
      }))
      .endCell()
  );

export const buildSwapOwnerWithdrawUsdtPayload = (amount: bigint, destination: string) =>
  cellToBase64(
    beginCell()
      .store(storeOwnerWithdrawUsdt({
        $$type: 'OwnerWithdrawUsdt',
        amount,
        destination: Address.parse(destination),
      }))
      .endCell()
  );

export const buildSwapJettonTransferPayload = (
  amount: bigint,
  contractAddress: string,
  responseAddress: string,
  route: 0 | 1,
  minOut: bigint = 0n
) =>
  buildJettonTransferPayload(
    amount,
    Address.parse(contractAddress),
    Address.parse(responseAddress),
    toNano(SWAP_JETTON_FORWARD_TON),
    buildSwapForwardPayload(route, minOut)
  );

export const buildSwapTonToGramPayload = (minOut: bigint = 0n) =>
  cellToBase64(
    beginCell()
      .store(storeSwapTonForGram({ $$type: 'SwapTonForGram', minOut }))
      .endCell()
  );

export const buildSwapReserveTopUpPayload = (
  amount: bigint,
  contractAddress: string,
  responseAddress: string
) =>
  buildJettonTransferPayload(
    amount,
    Address.parse(contractAddress),
    Address.parse(responseAddress),
    toNano(SWAP_JETTON_FORWARD_TON)
  );
