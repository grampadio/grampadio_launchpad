import { Cell } from '@ton/core';

const bytes2 = "te6cckEBAQEAJAAAQ4AVb+UnzkLxagG2FY4CbpP+kyG6bg/8VZTdOV3gdn2lUHBd3riH";
const cell2 = Cell.fromBoc(Buffer.from(bytes2, 'base64'))[0];
const slice2 = cell2.beginParse();
const addr2 = slice2.loadAddress();
console.log("JETTON MASTER ADDRESS:", addr2.toString({ urlSafe: true, bounceable: true }));
