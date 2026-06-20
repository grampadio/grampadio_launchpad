import { Address } from '@ton/core';

// Getter arguments must use the same @ton/core instance as the generated wrapper.
export const parseContractGetterAddress = (value: string) => Address.parse(value);
