import { toNano } from '@ton/core';
import type { NetworkProvider } from '@ton/blueprint';
import { GramPadUniversalLocker } from '../build/GramPadUniversalLocker_GramPadUniversalLocker.js';

export async function run(provider: NetworkProvider) {
  const owner = provider.sender().address;

  if (!owner) {
    throw new Error('Owner wallet is not connected.');
  }

  const locker = provider.open(
    await GramPadUniversalLocker.fromInit(owner)
  );

  await locker.send(
    provider.sender(),
    {
      value: toNano('0.25'),
    },
    {
      $$type: 'Deploy',
      queryId: BigInt(Date.now()),
    }
  );

  await provider.waitForDeploy(locker.address);

  console.log('Universal Locker deployed at:', locker.address.toString());
}