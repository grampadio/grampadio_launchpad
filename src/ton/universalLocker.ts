import {
  Address,
  beginCell,
  StateInit,
  storeStateInit,
  toNano,
} from '@ton/core';
import { JettonMaster, JettonWallet } from '@ton/ton';
import {
  GramPadUniversalLocker,
  storeConfigureLock,
  storeDeploy,
  storeEmergencyWithdrawTon,
  storeWithdrawLock,
} from '../../contracts/build/GramPadUniversalLocker_GramPadUniversalLocker.js';
import {
  buildJettonTransferPayload,
  cellToBase64,
  getTonClient,
  parseTokenAmount,
} from './gramStarter.js';
import { runtimeEnv, runtimeEnvNumber } from '../config/runtimeEnv.js';

export const UNIVERSAL_LOCKER_ADDRESS = String(
  runtimeEnv('VITE_UNIVERSAL_LOCKER_ADDRESS')
);

export const DEFAULT_JETTON_DECIMALS = Number(
  runtimeEnvNumber('VITE_LOCKER_DEFAULT_DECIMALS', 9)
);

export const getUniversalLockerContract = (
  address = UNIVERSAL_LOCKER_ADDRESS
) => GramPadUniversalLocker.fromAddress(Address.parse(address));

export const parseLockerTokenAmount = (
  value: string | number,
  decimals = DEFAULT_JETTON_DECIMALS
) => parseTokenAmount(value, decimals);

export const formatLockerTokenAmount = (
  value: bigint | number | string,
  decimals = DEFAULT_JETTON_DECIMALS,
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

export const getUserJettonWalletAddress = async (
  userAddress: string,
  jettonMasterAddress: string
) => {
  const client = getTonClient();
  const master = client.open(
    JettonMaster.create(Address.parse(jettonMasterAddress))
  );

  return master.getWalletAddress(Address.parse(userAddress));
};

export const getUserJettonBalance = async (
  userAddress: string,
  jettonMasterAddress: string
) => {
  const client = getTonClient();
  const walletAddress = await getUserJettonWalletAddress(
    userAddress,
    jettonMasterAddress
  );

  return client.open(JettonWallet.create(walletAddress)).getBalance();
};

export const buildConfigureLockPayload = (unlockTime: bigint) =>
  cellToBase64(
    beginCell()
      .store(
        storeConfigureLock({
          $$type: 'ConfigureLock',
          unlockTime,
        })
      )
      .endCell()
  );

export const buildWithdrawLockPayload = (lockId: bigint | number | string) =>
  cellToBase64(
    beginCell()
      .store(
        storeWithdrawLock({
          $$type: 'WithdrawLock',
          lockId: BigInt(lockId),
        })
      )
      .endCell()
  );

export const buildEmergencyWithdrawLockerTonPayload = (
  amount: bigint,
  destination: string
) =>
  cellToBase64(
    beginCell()
      .store(
        storeEmergencyWithdrawTon({
          $$type: 'EmergencyWithdrawTon',
          amount,
          destination: Address.parse(destination),
        })
      )
      .endCell()
  );

export const buildLockJettonPayload = (
  amount: bigint,
  lockerAddress = UNIVERSAL_LOCKER_ADDRESS,
  responseAddress: string
) =>
  buildJettonTransferPayload(
    amount,
    Address.parse(lockerAddress),
    Address.parse(responseAddress),
    toNano('0.08')
  );

export const getLockerDetails = async (
  address = UNIVERSAL_LOCKER_ADDRESS
) => {
  if (!address) throw new Error('Universal locker address is not configured.');

  try {
    const contract = getTonClient().open(getUniversalLockerContract(address));
    const details = await contract.getGetContractDetails();

    return {
      owner: details.owner.toString(),
      paused: details.paused,
      totalLockedPositions: details.totalLockedPositions,
      activeLockPositions: details.activeLockPositions,
      totalWithdrawnPositions: details.totalWithdrawnPositions,
      nextLockId: details.nextLockId,
    };
  } catch (err) {
    console.warn('getLockerDetails contract getter call failed:', err);
    return null;
  }
};

export const getUserLockerDetails = async (
  userAddress: string,
  address = UNIVERSAL_LOCKER_ADDRESS
) => {
  if (!address) throw new Error('Universal locker address is not configured.');

  const user = Address.parse(userAddress);

  try {
    const contract = getTonClient().open(getUniversalLockerContract(address));
    const summary = await contract.getGetUserSummary(user);
    const totalLocks = Number(summary.totalLocks || 0n);

    if (totalLocks === 0) {
      return {
        user: user.toString(),
        totalLocks: 0n,
        activeLocks: 0n,
        lockIds: [],
        locks: [],
        activeLockItems: [],
        closedLockItems: [],
      };
    }

    const rawLockIds = await Promise.all(
      Array.from({ length: totalLocks }, (_, index) =>
        contract.getGetUserLockIdByIndex(user, BigInt(index)).catch(() => null)
      )
    );
    const lockIds = rawLockIds.filter((id): id is bigint => id !== null);

    const rawLocks = await Promise.all(
      lockIds.map(lockId => contract.getGetLockDetails(lockId).catch(() => null))
    );
    const locks = rawLocks.filter((l): l is NonNullable<typeof l> => l !== null);

    const formattedLocks = locks.map(lock => ({
      lockId: lock.lockId,
      owner: lock.owner.toString(),
      jettonWallet: lock.jettonWallet.toString(),
      amount: lock.amount,
      lockedAt: lock.lockedAt,
      unlockTime: lock.unlockTime,
      withdrawn: lock.withdrawn,
      active: !lock.withdrawn,
    }));

    return {
      user: summary.user.toString(),
      totalLocks: summary.totalLocks,
      activeLocks: summary.activeLocks,
      lockIds,
      locks: formattedLocks,
      activeLockItems: formattedLocks.filter(lock => !lock.withdrawn),
      closedLockItems: formattedLocks.filter(lock => lock.withdrawn),
    };
  } catch (err) {
    console.warn('getUserLockerDetails contract getter call failed:', err);
    return {
      user: user.toString(),
      totalLocks: 0n,
      activeLocks: 0n,
      lockIds: [],
      locks: [],
      activeLockItems: [],
      closedLockItems: [],
    };
  }
};

export const prepareUniversalLockerDeployment = async (ownerAddress: string) => {
  const owner = Address.parse(ownerAddress);
  const deploymentId = BigInt(Date.now());

  const contract = await GramPadUniversalLocker.fromInit(owner,deploymentId);

  if (!contract.init) {
    throw new Error('Failed to construct universal locker state.');
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
      amount: toNano('0.25').toString(),
      stateInit: cellToBase64(stateInitCell),
      payload: cellToBase64(deployPayload),
    },
  };
};


export async function getJettonMetadata(jettonMaster: string) {
  const address = jettonMaster.trim();

  if (!address) {
    throw new Error('Jetton master address is required.');
  }

  const TONCENTER_ENDPOINT = runtimeEnv('VITE_TONCENTER_ENDPOINT');

  const isTestnet = TONCENTER_ENDPOINT.includes('testnet');

  const tonApiBase = isTestnet
    ? 'https://testnet.tonapi.io'
    : 'https://tonapi.io';

  const url = `${tonApiBase}/v2/jettons/${encodeURIComponent(address)}`;

  console.log('Metadata URL:', url);

  const response = await fetch(url);

  console.log('Metadata response ok:', response.ok);

  if (!response.ok) {
    // If the input address was a Jetton Wallet address (which returns 404 on /v2/jettons/<addr>),
    // execute on-chain get_wallet_data getter to extract the true Jetton Master address!
    try {
      const client = await getTonClient();
      const parsedAddr = Address.parse(address);
      const res = await client.runMethod(parsedAddr, 'get_wallet_data');
      if (res && res.stack) {
        res.stack.readBigNumber(); // balance
        res.stack.readAddress(); // owner
        const masterAddr = res.stack.readAddress().toString();

        if (masterAddr) {
          const masterUrl = `${tonApiBase}/v2/jettons/${encodeURIComponent(masterAddr)}`;
          const masterResponse = await fetch(masterUrl);
          if (masterResponse.ok) {
            const masterData = await masterResponse.json();
            const decimals = Number(
              masterData?.metadata?.decimals ??
                masterData?.decimals ??
                DEFAULT_JETTON_DECIMALS
            );
            return {
              symbol: String(masterData?.metadata?.symbol || masterData?.symbol || 'TOKEN'),
              name: String(masterData?.metadata?.name || masterData?.name || ''),
              decimals,
              totalSupply: 0,
              image: String(masterData?.metadata?.image || masterData?.image || ''),
              masterAddress: masterAddr,
            };
          }
        }
      }
    } catch (fallbackErr) {
      console.warn('Jetton wallet fallback lookup failed:', fallbackErr);
    }

    const errorText = await response.text();
    console.log('Metadata error:', errorText);
    throw new Error('Failed to fetch Jetton metadata.');
  }

  const data = await response.json();
  const decimals = Number(
    data?.metadata?.decimals ??
      data?.decimals ??
      DEFAULT_JETTON_DECIMALS
  );
  const rawSupply = String(data?.total_supply ?? data?.totalSupply ?? '0');
  const supplyUnit = 10n ** BigInt(decimals);
  const supplyBaseUnits = /^\d+$/.test(rawSupply) ? BigInt(rawSupply) : 0n;
  const wholeSupply = supplyBaseUnits / supplyUnit;
  const fractionalSupply = (supplyBaseUnits % supplyUnit)
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '');

  return {
    symbol: String(data?.metadata?.symbol || data?.symbol || 'TOKEN'),
    name: String(data?.metadata?.name || data?.name || ''),
    decimals,
    totalSupply: Number(
      fractionalSupply ? `${wholeSupply}.${fractionalSupply}` : wholeSupply.toString()
    ),
    image: String(data?.metadata?.image || data?.image || ''),
  };
}
