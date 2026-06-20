import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ConfigureLock = {
    $$type: 'ConfigureLock';
    unlockTime: bigint;
}

export function storeConfigureLock(src: ConfigureLock) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4011149208, 32);
        b_0.storeUint(src.unlockTime, 32);
    };
}

export function loadConfigureLock(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4011149208) { throw Error('Invalid prefix'); }
    const _unlockTime = sc_0.loadUintBig(32);
    return { $$type: 'ConfigureLock' as const, unlockTime: _unlockTime };
}

export function loadTupleConfigureLock(source: TupleReader) {
    const _unlockTime = source.readBigNumber();
    return { $$type: 'ConfigureLock' as const, unlockTime: _unlockTime };
}

export function loadGetterTupleConfigureLock(source: TupleReader) {
    const _unlockTime = source.readBigNumber();
    return { $$type: 'ConfigureLock' as const, unlockTime: _unlockTime };
}

export function storeTupleConfigureLock(source: ConfigureLock) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.unlockTime);
    return builder.build();
}

export function dictValueParserConfigureLock(): DictionaryValue<ConfigureLock> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfigureLock(src)).endCell());
        },
        parse: (src) => {
            return loadConfigureLock(src.loadRef().beginParse());
        }
    }
}

export type SetPaused = {
    $$type: 'SetPaused';
    paused: boolean;
}

export function storeSetPaused(src: SetPaused) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(157817343, 32);
        b_0.storeBit(src.paused);
    };
}

export function loadSetPaused(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 157817343) { throw Error('Invalid prefix'); }
    const _paused = sc_0.loadBit();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function loadTupleSetPaused(source: TupleReader) {
    const _paused = source.readBoolean();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function loadGetterTupleSetPaused(source: TupleReader) {
    const _paused = source.readBoolean();
    return { $$type: 'SetPaused' as const, paused: _paused };
}

export function storeTupleSetPaused(source: SetPaused) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.paused);
    return builder.build();
}

export function dictValueParserSetPaused(): DictionaryValue<SetPaused> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPaused(src)).endCell());
        },
        parse: (src) => {
            return loadSetPaused(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(256331011, 32);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 256331011) { throw Error('Invalid prefix'); }
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type WithdrawLock = {
    $$type: 'WithdrawLock';
    lockId: bigint;
}

export function storeWithdrawLock(src: WithdrawLock) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1786648362, 32);
        b_0.storeUint(src.lockId, 64);
    };
}

export function loadWithdrawLock(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1786648362) { throw Error('Invalid prefix'); }
    const _lockId = sc_0.loadUintBig(64);
    return { $$type: 'WithdrawLock' as const, lockId: _lockId };
}

export function loadTupleWithdrawLock(source: TupleReader) {
    const _lockId = source.readBigNumber();
    return { $$type: 'WithdrawLock' as const, lockId: _lockId };
}

export function loadGetterTupleWithdrawLock(source: TupleReader) {
    const _lockId = source.readBigNumber();
    return { $$type: 'WithdrawLock' as const, lockId: _lockId };
}

export function storeTupleWithdrawLock(source: WithdrawLock) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.lockId);
    return builder.build();
}

export function dictValueParserWithdrawLock(): DictionaryValue<WithdrawLock> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawLock(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawLock(src.loadRef().beginParse());
        }
    }
}

export type EmergencyWithdrawTon = {
    $$type: 'EmergencyWithdrawTon';
    amount: bigint;
    destination: Address;
}

export function storeEmergencyWithdrawTon(src: EmergencyWithdrawTon) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4057420251, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadEmergencyWithdrawTon(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4057420251) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'EmergencyWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function loadTupleEmergencyWithdrawTon(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'EmergencyWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function loadGetterTupleEmergencyWithdrawTon(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'EmergencyWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function storeTupleEmergencyWithdrawTon(source: EmergencyWithdrawTon) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserEmergencyWithdrawTon(): DictionaryValue<EmergencyWithdrawTon> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEmergencyWithdrawTon(src)).endCell());
        },
        parse: (src) => {
            return loadEmergencyWithdrawTon(src.loadRef().beginParse());
        }
    }
}

export type JettonTransferNotification = {
    $$type: 'JettonTransferNotification';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    forwardPayload: Slice;
}

export function storeJettonTransferNotification(src: JettonTransferNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1935855772, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadJettonTransferNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1935855772) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _forwardPayload = sc_0;
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadTupleJettonTransferNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadGetterTupleJettonTransferNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function storeTupleJettonTransferNotification(source: JettonTransferNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserJettonTransferNotification(): DictionaryValue<JettonTransferNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransferNotification(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransferNotification(src.loadRef().beginParse());
        }
    }
}

export type JettonTransfer = {
    $$type: 'JettonTransfer';
    queryId: bigint;
    amount: bigint;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell | null;
    forwardTonAmount: bigint;
    forwardPayload: Slice;
}

export function storeJettonTransfer(src: JettonTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(260734629, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.responseDestination);
        if (src.customPayload !== null && src.customPayload !== undefined) { b_0.storeBit(true).storeRef(src.customPayload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forwardTonAmount);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadJettonTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 260734629) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    const _responseDestination = sc_0.loadAddress();
    const _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forwardTonAmount = sc_0.loadCoins();
    const _forwardPayload = sc_0;
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadTupleJettonTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _responseDestination = source.readAddress();
    const _customPayload = source.readCellOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadGetterTupleJettonTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _responseDestination = source.readAddress();
    const _customPayload = source.readCellOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function storeTupleJettonTransfer(source: JettonTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.responseDestination);
    builder.writeCell(source.customPayload);
    builder.writeNumber(source.forwardTonAmount);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserJettonTransfer(): DictionaryValue<JettonTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransfer(src.loadRef().beginParse());
        }
    }
}

export type LockDetails = {
    $$type: 'LockDetails';
    lockId: bigint;
    owner: Address;
    jettonWallet: Address;
    amount: bigint;
    lockedAt: bigint;
    unlockTime: bigint;
    withdrawn: boolean;
}

export function storeLockDetails(src: LockDetails) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.lockId, 257);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.jettonWallet);
        const b_1 = new Builder();
        b_1.storeInt(src.amount, 257);
        b_1.storeInt(src.lockedAt, 257);
        b_1.storeInt(src.unlockTime, 257);
        b_1.storeBit(src.withdrawn);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadLockDetails(slice: Slice) {
    const sc_0 = slice;
    const _lockId = sc_0.loadIntBig(257);
    const _owner = sc_0.loadAddress();
    const _jettonWallet = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _amount = sc_1.loadIntBig(257);
    const _lockedAt = sc_1.loadIntBig(257);
    const _unlockTime = sc_1.loadIntBig(257);
    const _withdrawn = sc_1.loadBit();
    return { $$type: 'LockDetails' as const, lockId: _lockId, owner: _owner, jettonWallet: _jettonWallet, amount: _amount, lockedAt: _lockedAt, unlockTime: _unlockTime, withdrawn: _withdrawn };
}

export function loadTupleLockDetails(source: TupleReader) {
    const _lockId = source.readBigNumber();
    const _owner = source.readAddress();
    const _jettonWallet = source.readAddress();
    const _amount = source.readBigNumber();
    const _lockedAt = source.readBigNumber();
    const _unlockTime = source.readBigNumber();
    const _withdrawn = source.readBoolean();
    return { $$type: 'LockDetails' as const, lockId: _lockId, owner: _owner, jettonWallet: _jettonWallet, amount: _amount, lockedAt: _lockedAt, unlockTime: _unlockTime, withdrawn: _withdrawn };
}

export function loadGetterTupleLockDetails(source: TupleReader) {
    const _lockId = source.readBigNumber();
    const _owner = source.readAddress();
    const _jettonWallet = source.readAddress();
    const _amount = source.readBigNumber();
    const _lockedAt = source.readBigNumber();
    const _unlockTime = source.readBigNumber();
    const _withdrawn = source.readBoolean();
    return { $$type: 'LockDetails' as const, lockId: _lockId, owner: _owner, jettonWallet: _jettonWallet, amount: _amount, lockedAt: _lockedAt, unlockTime: _unlockTime, withdrawn: _withdrawn };
}

export function storeTupleLockDetails(source: LockDetails) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.lockId);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.jettonWallet);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.lockedAt);
    builder.writeNumber(source.unlockTime);
    builder.writeBoolean(source.withdrawn);
    return builder.build();
}

export function dictValueParserLockDetails(): DictionaryValue<LockDetails> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeLockDetails(src)).endCell());
        },
        parse: (src) => {
            return loadLockDetails(src.loadRef().beginParse());
        }
    }
}

export type UserLockSummary = {
    $$type: 'UserLockSummary';
    user: Address;
    totalLocks: bigint;
    activeLocks: bigint;
}

export function storeUserLockSummary(src: UserLockSummary) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.user);
        b_0.storeInt(src.totalLocks, 257);
        b_0.storeInt(src.activeLocks, 257);
    };
}

export function loadUserLockSummary(slice: Slice) {
    const sc_0 = slice;
    const _user = sc_0.loadAddress();
    const _totalLocks = sc_0.loadIntBig(257);
    const _activeLocks = sc_0.loadIntBig(257);
    return { $$type: 'UserLockSummary' as const, user: _user, totalLocks: _totalLocks, activeLocks: _activeLocks };
}

export function loadTupleUserLockSummary(source: TupleReader) {
    const _user = source.readAddress();
    const _totalLocks = source.readBigNumber();
    const _activeLocks = source.readBigNumber();
    return { $$type: 'UserLockSummary' as const, user: _user, totalLocks: _totalLocks, activeLocks: _activeLocks };
}

export function loadGetterTupleUserLockSummary(source: TupleReader) {
    const _user = source.readAddress();
    const _totalLocks = source.readBigNumber();
    const _activeLocks = source.readBigNumber();
    return { $$type: 'UserLockSummary' as const, user: _user, totalLocks: _totalLocks, activeLocks: _activeLocks };
}

export function storeTupleUserLockSummary(source: UserLockSummary) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.user);
    builder.writeNumber(source.totalLocks);
    builder.writeNumber(source.activeLocks);
    return builder.build();
}

export function dictValueParserUserLockSummary(): DictionaryValue<UserLockSummary> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUserLockSummary(src)).endCell());
        },
        parse: (src) => {
            return loadUserLockSummary(src.loadRef().beginParse());
        }
    }
}

export type ContractDetails = {
    $$type: 'ContractDetails';
    owner: Address;
    deploymentId: bigint;
    paused: boolean;
    totalLockedPositions: bigint;
    activeLockPositions: bigint;
    totalWithdrawnPositions: bigint;
    nextLockId: bigint;
}

export function storeContractDetails(src: ContractDetails) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.deploymentId, 257);
        b_0.storeBit(src.paused);
        b_0.storeInt(src.totalLockedPositions, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.activeLockPositions, 257);
        b_1.storeInt(src.totalWithdrawnPositions, 257);
        b_1.storeInt(src.nextLockId, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractDetails(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _deploymentId = sc_0.loadIntBig(257);
    const _paused = sc_0.loadBit();
    const _totalLockedPositions = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _activeLockPositions = sc_1.loadIntBig(257);
    const _totalWithdrawnPositions = sc_1.loadIntBig(257);
    const _nextLockId = sc_1.loadIntBig(257);
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, paused: _paused, totalLockedPositions: _totalLockedPositions, activeLockPositions: _activeLockPositions, totalWithdrawnPositions: _totalWithdrawnPositions, nextLockId: _nextLockId };
}

export function loadTupleContractDetails(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _paused = source.readBoolean();
    const _totalLockedPositions = source.readBigNumber();
    const _activeLockPositions = source.readBigNumber();
    const _totalWithdrawnPositions = source.readBigNumber();
    const _nextLockId = source.readBigNumber();
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, paused: _paused, totalLockedPositions: _totalLockedPositions, activeLockPositions: _activeLockPositions, totalWithdrawnPositions: _totalWithdrawnPositions, nextLockId: _nextLockId };
}

export function loadGetterTupleContractDetails(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _paused = source.readBoolean();
    const _totalLockedPositions = source.readBigNumber();
    const _activeLockPositions = source.readBigNumber();
    const _totalWithdrawnPositions = source.readBigNumber();
    const _nextLockId = source.readBigNumber();
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, paused: _paused, totalLockedPositions: _totalLockedPositions, activeLockPositions: _activeLockPositions, totalWithdrawnPositions: _totalWithdrawnPositions, nextLockId: _nextLockId };
}

export function storeTupleContractDetails(source: ContractDetails) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.deploymentId);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.totalLockedPositions);
    builder.writeNumber(source.activeLockPositions);
    builder.writeNumber(source.totalWithdrawnPositions);
    builder.writeNumber(source.nextLockId);
    return builder.build();
}

export function dictValueParserContractDetails(): DictionaryValue<ContractDetails> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractDetails(src)).endCell());
        },
        parse: (src) => {
            return loadContractDetails(src.loadRef().beginParse());
        }
    }
}

export type GramPadUniversalLocker$Data = {
    $$type: 'GramPadUniversalLocker$Data';
    owner: Address;
    deploymentId: bigint;
    paused: boolean;
    nextLockId: bigint;
    nextTransferQueryId: bigint;
    totalLockedPositions: bigint;
    activeLockPositions: bigint;
    totalWithdrawnPositions: bigint;
    pendingUnlockTime: Dictionary<Address, bigint>;
    userLockCount: Dictionary<Address, bigint>;
    userActiveLockCount: Dictionary<Address, bigint>;
    userLockIdByIndex: Dictionary<bigint, bigint>;
    lockOwner: Dictionary<bigint, Address>;
    lockJettonWallet: Dictionary<bigint, Address>;
    lockAmount: Dictionary<bigint, bigint>;
    lockCreatedAt: Dictionary<bigint, bigint>;
    lockUnlockTime: Dictionary<bigint, bigint>;
    lockWithdrawn: Dictionary<bigint, boolean>;
}

export function storeGramPadUniversalLocker$Data(src: GramPadUniversalLocker$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.deploymentId, 64);
        b_0.storeBit(src.paused);
        b_0.storeUint(src.nextLockId, 64);
        b_0.storeUint(src.nextTransferQueryId, 64);
        b_0.storeUint(src.totalLockedPositions, 64);
        b_0.storeUint(src.activeLockPositions, 64);
        b_0.storeUint(src.totalWithdrawnPositions, 64);
        b_0.storeDict(src.pendingUnlockTime, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_0.storeDict(src.userLockCount, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        const b_1 = new Builder();
        b_1.storeDict(src.userActiveLockCount, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeDict(src.userLockIdByIndex, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_1.storeDict(src.lockOwner, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        const b_2 = new Builder();
        b_2.storeDict(src.lockJettonWallet, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        b_2.storeDict(src.lockAmount, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_2.storeDict(src.lockCreatedAt, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        const b_3 = new Builder();
        b_3.storeDict(src.lockUnlockTime, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_3.storeDict(src.lockWithdrawn, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadGramPadUniversalLocker$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _deploymentId = sc_0.loadUintBig(64);
    const _paused = sc_0.loadBit();
    const _nextLockId = sc_0.loadUintBig(64);
    const _nextTransferQueryId = sc_0.loadUintBig(64);
    const _totalLockedPositions = sc_0.loadUintBig(64);
    const _activeLockPositions = sc_0.loadUintBig(64);
    const _totalWithdrawnPositions = sc_0.loadUintBig(64);
    const _pendingUnlockTime = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_0);
    const _userLockCount = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _userActiveLockCount = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _userLockIdByIndex = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_1);
    const _lockOwner = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _lockJettonWallet = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_2);
    const _lockAmount = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_2);
    const _lockCreatedAt = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_2);
    const sc_3 = sc_2.loadRef().beginParse();
    const _lockUnlockTime = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_3);
    const _lockWithdrawn = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_3);
    return { $$type: 'GramPadUniversalLocker$Data' as const, owner: _owner, deploymentId: _deploymentId, paused: _paused, nextLockId: _nextLockId, nextTransferQueryId: _nextTransferQueryId, totalLockedPositions: _totalLockedPositions, activeLockPositions: _activeLockPositions, totalWithdrawnPositions: _totalWithdrawnPositions, pendingUnlockTime: _pendingUnlockTime, userLockCount: _userLockCount, userActiveLockCount: _userActiveLockCount, userLockIdByIndex: _userLockIdByIndex, lockOwner: _lockOwner, lockJettonWallet: _lockJettonWallet, lockAmount: _lockAmount, lockCreatedAt: _lockCreatedAt, lockUnlockTime: _lockUnlockTime, lockWithdrawn: _lockWithdrawn };
}

export function loadTupleGramPadUniversalLocker$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _paused = source.readBoolean();
    const _nextLockId = source.readBigNumber();
    const _nextTransferQueryId = source.readBigNumber();
    const _totalLockedPositions = source.readBigNumber();
    const _activeLockPositions = source.readBigNumber();
    const _totalWithdrawnPositions = source.readBigNumber();
    const _pendingUnlockTime = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userLockCount = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userActiveLockCount = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userLockIdByIndex = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockOwner = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _lockJettonWallet = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    source = source.readTuple();
    const _lockAmount = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockCreatedAt = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockUnlockTime = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockWithdrawn = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'GramPadUniversalLocker$Data' as const, owner: _owner, deploymentId: _deploymentId, paused: _paused, nextLockId: _nextLockId, nextTransferQueryId: _nextTransferQueryId, totalLockedPositions: _totalLockedPositions, activeLockPositions: _activeLockPositions, totalWithdrawnPositions: _totalWithdrawnPositions, pendingUnlockTime: _pendingUnlockTime, userLockCount: _userLockCount, userActiveLockCount: _userActiveLockCount, userLockIdByIndex: _userLockIdByIndex, lockOwner: _lockOwner, lockJettonWallet: _lockJettonWallet, lockAmount: _lockAmount, lockCreatedAt: _lockCreatedAt, lockUnlockTime: _lockUnlockTime, lockWithdrawn: _lockWithdrawn };
}

export function loadGetterTupleGramPadUniversalLocker$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _paused = source.readBoolean();
    const _nextLockId = source.readBigNumber();
    const _nextTransferQueryId = source.readBigNumber();
    const _totalLockedPositions = source.readBigNumber();
    const _activeLockPositions = source.readBigNumber();
    const _totalWithdrawnPositions = source.readBigNumber();
    const _pendingUnlockTime = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userLockCount = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userActiveLockCount = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userLockIdByIndex = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockOwner = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _lockJettonWallet = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _lockAmount = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockCreatedAt = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockUnlockTime = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _lockWithdrawn = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'GramPadUniversalLocker$Data' as const, owner: _owner, deploymentId: _deploymentId, paused: _paused, nextLockId: _nextLockId, nextTransferQueryId: _nextTransferQueryId, totalLockedPositions: _totalLockedPositions, activeLockPositions: _activeLockPositions, totalWithdrawnPositions: _totalWithdrawnPositions, pendingUnlockTime: _pendingUnlockTime, userLockCount: _userLockCount, userActiveLockCount: _userActiveLockCount, userLockIdByIndex: _userLockIdByIndex, lockOwner: _lockOwner, lockJettonWallet: _lockJettonWallet, lockAmount: _lockAmount, lockCreatedAt: _lockCreatedAt, lockUnlockTime: _lockUnlockTime, lockWithdrawn: _lockWithdrawn };
}

export function storeTupleGramPadUniversalLocker$Data(source: GramPadUniversalLocker$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.deploymentId);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.nextLockId);
    builder.writeNumber(source.nextTransferQueryId);
    builder.writeNumber(source.totalLockedPositions);
    builder.writeNumber(source.activeLockPositions);
    builder.writeNumber(source.totalWithdrawnPositions);
    builder.writeCell(source.pendingUnlockTime.size > 0 ? beginCell().storeDictDirect(source.pendingUnlockTime, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.userLockCount.size > 0 ? beginCell().storeDictDirect(source.userLockCount, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.userActiveLockCount.size > 0 ? beginCell().storeDictDirect(source.userActiveLockCount, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.userLockIdByIndex.size > 0 ? beginCell().storeDictDirect(source.userLockIdByIndex, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.lockOwner.size > 0 ? beginCell().storeDictDirect(source.lockOwner, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.lockJettonWallet.size > 0 ? beginCell().storeDictDirect(source.lockJettonWallet, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.lockAmount.size > 0 ? beginCell().storeDictDirect(source.lockAmount, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.lockCreatedAt.size > 0 ? beginCell().storeDictDirect(source.lockCreatedAt, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.lockUnlockTime.size > 0 ? beginCell().storeDictDirect(source.lockUnlockTime, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.lockWithdrawn.size > 0 ? beginCell().storeDictDirect(source.lockWithdrawn, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

export function dictValueParserGramPadUniversalLocker$Data(): DictionaryValue<GramPadUniversalLocker$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGramPadUniversalLocker$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGramPadUniversalLocker$Data(src.loadRef().beginParse());
        }
    }
}

 type GramPadUniversalLocker_init_args = {
    $$type: 'GramPadUniversalLocker_init_args';
    owner: Address;
    deploymentId: bigint;
}

function initGramPadUniversalLocker_init_args(src: GramPadUniversalLocker_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.deploymentId, 257);
    };
}

async function GramPadUniversalLocker_init(owner: Address, deploymentId: bigint) {
    const __code = Cell.fromHex('b5ee9c7241023401000c82000114ff00f4a413f4bcf2c80b010201620215048cd001d072d721d200d200fa4021103450666f04f86102f862db3c1113945f0f5f04e01111d70d1ff2e082218210946a98b6bae302218210096819ffbae3022182100f474d03ba3103040500ba5b0f11110f0e11100e10df551cc87f01ca0011121111111055e0011111011112ce1fcb3f1dca001bcb3f19cb3f17cb3f15cb3f13cb3ff40001c8f40012f40012f40002c8f40013f40013f40003c8f40014f40014f400cd12cdcdc9ed54029631d200301110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411124130db3c3f813bc8f8416f24135f038208989680bef2f41110111111100f11100f550d071304b68f4631fa40301110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411124130db3c5711813bc8f8416f24135f038208989680bef2f40f11100f550ee0218210f1d751dbbae302218210ef154798ba0713060802d831fa00fa4030011112011113db3c813bc8f8416f24135f038208989680bef2f48200a85f5613c200f2f482008438f8276f10f8416f24135f03a15614bef2f40111130111127070036d4313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb000f11110f0e11100e551d0713001882008aabf8425613c705f2f404fc8ee531d31f30820097f42fb3f2f4813bc8f8416f24135f038208989680bef2f4815cd4f8235220bcf2f481010bf842103a58810101216e955b59f4593098c801cf004133f441e20f11110f0e11100e10df10ce10bd10ac109b108a091068105710461035443012e02182107362d09cbae3020182106a7e172abae3025f0f13090e1402f831d33f31fa00fa4030820097f45610b3f2f48142a622c200f2f4f8422a81010b238101014133f40a6fa19401d70030925b6de28200bf79216eb3f2f4522c81010bf459305610a41111111411111110111311100f11120f0e0d11130d0c11120c0b0a11130a5098071113075065041113045a0111150111165615db3c2d0a02fe1111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209111208070655405616db3c271110111311100f11120f0e11110e0d11130d0c11120c0b11110b0a11130a0911120908111108071113070611120605111105041113040311120302111102011113011112810101111256192e0b02ec5616db3c375612031114030211130217561901216e955b59f45a3098c801cf004133f442e281010b1114a4102701111401561801810101216e955b59f4593098c801cf004133f441e281010b1112a4102501111201561701810101216e955b59f4593098c801cf004133f441e2810101015615011117280c01de206e953059f45a30944133f414e212810101015614011117206e953059f45a30944133f414e281010120103412561402111401216e955b59f45a3098c801cf004133f442e2810101f82321103f561459216e955b59f45a3098c801cf004133f442e281010120103d125613021112010d018e216e955b59f45a3098c801cf004133f442e21a8101010111117071216e955b59f45a3098c801cf004133f442e203a402a40811110807111007106f105e104d4c1b46a8054444031303fed33f30813bc8f8416f24135f03821008f0d180bef2f4f8421110111111100f11110f0e11110e0d11110d0c11110c0b11110b0a11110a091111090811110807111107061111060511110504111104031111030211110201111101111281261a11145612db3c01111501f2f48200a83611145612db3c5614c70501111501f2f41c1d0f03fc8164d211145612db3cb301111501f2f4817ad3f8231111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209081112080711120706111206051112050411120403111203021112020111120111155613db3c01111601be01111201f2f40f11110f0e11100e10df551c1113561324231004fedb3c82009ebc21c200f2f41111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209111208070655405614db3c0181010156167f71216e955b59f45a3098c801cf004133f442e281010170211047102302111802216e955b59f45a3098c801cf004133f442e20311145613db3c20201f2e1102b8c2008e2081010b01a51029561501810101216e955b59f4593098c801cf004133f441e2079130e20ba50aa41111111411111110111311100f11120f0e11110e0d11100d10cf10ae0d109c108b107a106910581047103645044013db3c121300b25610a4821007270e007ff8286d820898968070c8ca00c9d0061117065e34c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9127050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb0000a0c87f01ca0011121111111055e0011111011112ce1fcb3f1dca001bcb3f19cb3f17cb3f15cb3f13cb3ff40001c8f40012f40012f40002c8f40013f40013f40003c8f40014f40014f400cd12cdcdc9ed54000a5f04f2c082020120162a02014817190215b5081b679b678d9ced88f031180016561156115611547fed56140201201a260239b11bb6cf04444444844444440444444403c44403d543b6cf1b39db11e0311b03f21110111211105e3e0d11110d0c11120c0b11110b0a11120a091111090811120807111107061112060511110504111204031111030211120201111101111281261a11125613db3c01111301f2f41110111111100f11100f550e5612db3c1111111211111110111211100f11120f0e11120e0d11120d0c11120c1c1d1e0020810101270259f40c6fa192306ddf6eb3002c810101270259f40c6fa192306ddf81261a216eb3f2f404fa0b11120b0a11120a09111209111208070655405613db3c1111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209111208070655405614db3c1111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209111208070655405615db3c1f202122002c810101260259f40c6fa192306ddf8178b0216eb3f2f40038810101530550334133f40c6fa19401d70030925b6de2206e923070e00038810101530450334133f40c6fa19401d70030925b6de2206e923070e003fc1111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209111208070655405616db3c1111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209111208070655405617db3c0611180605111705041116040311150302111402011113012324250038810101530350334133f40c6fa19401d70030925b6de2206e923070e000368101012202714133f40c6fa19401d70030925b6de2206e923070e000601112111811121111111711111110111611100f11150f0e11140e0d11130d0c11120c0b11110b0a11100a109f108e107d0245b38f36cf04444444c44444440444844403c44443c3844403954776cf15c417c3db0860312703f21111111311115e3f0e11120e0d11130d0c11120c0b11130b0a11120a09111309081112080711130706111206051113050411120403111303021112020111130111125613db3c5613c2ff94561301b9923070e2f2e4952611148101011114db3c561303111503021114024133f40c6fa19401d70030925b6de22d28290012c858cf16cb3fc9f900005e8200f6e7216eb3f2f41110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046103544300201202b300239bb0b2db3c1111111211111110111111100f11100f550edb3c6cf36c338312c03f41111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209111208070655405612db3c1111111211111110111211100f11120f0e11120e0d11120d0c11120c0b11120b0a11120a09111209111208070655405613db3c02111402011113011112111411121111111311112d2e2f003a81010b2a028101014133f40a6fa19401d70030925b6de2206e923070e0003a81010b29028101014133f40a6fa19401d70030925b6de2206e923070e000481110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610350219bb25ddb3cdb3c57105f0f6c218313301f6ed44d0d200018e54fa40d33fd200d33fd33fd33fd33fd33ff404d401d0f404f404f404d430d0f404f404f404d430d0f404f404f40430091112090911110909111009109f109e109d109c109b109a57121110111111100f11100f550e8e1dfa40810101d7005902d1016d6d6d6d6d6d6d6d6d6d7071207053005595320002e200027252b89fbf');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initGramPadUniversalLocker_init_args({ $$type: 'GramPadUniversalLocker_init_args', owner, deploymentId })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const GramPadUniversalLocker_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    1173: { message: "Invalid index" },
    9754: { message: "Lock not found" },
    15304: { message: "Not enough TON" },
    17062: { message: "Invalid amount" },
    23764: { message: "Unlock time must be future" },
    25810: { message: "Already withdrawn" },
    30896: { message: "Jetton wallet not found" },
    31443: { message: "Still locked" },
    33848: { message: "Withdrawal exceeds TON balance" },
    35499: { message: "Only owner" },
    38900: { message: "Locker paused" },
    40636: { message: "Nothing to withdraw" },
    43062: { message: "Not lock owner" },
    43103: { message: "Invalid withdrawal amount" },
    49017: { message: "Lock not configured" },
    63207: { message: "Lock index not found" },
} as const

export const GramPadUniversalLocker_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Invalid index": 1173,
    "Lock not found": 9754,
    "Not enough TON": 15304,
    "Invalid amount": 17062,
    "Unlock time must be future": 23764,
    "Already withdrawn": 25810,
    "Jetton wallet not found": 30896,
    "Still locked": 31443,
    "Withdrawal exceeds TON balance": 33848,
    "Only owner": 35499,
    "Locker paused": 38900,
    "Nothing to withdraw": 40636,
    "Not lock owner": 43062,
    "Invalid withdrawal amount": 43103,
    "Lock not configured": 49017,
    "Lock index not found": 63207,
} as const

const GramPadUniversalLocker_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ConfigureLock","header":4011149208,"fields":[{"name":"unlockTime","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"SetPaused","header":157817343,"fields":[{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ChangeOwner","header":256331011,"fields":[{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"WithdrawLock","header":1786648362,"fields":[{"name":"lockId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"EmergencyWithdrawTon","header":4057420251,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonTransferNotification","header":1935855772,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonTransfer","header":260734629,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"LockDetails","header":null,"fields":[{"name":"lockId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"lockedAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"unlockTime","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"withdrawn","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"UserLockSummary","header":null,"fields":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalLocks","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"activeLocks","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"ContractDetails","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"deploymentId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"totalLockedPositions","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"activeLockPositions","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalWithdrawnPositions","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nextLockId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"GramPadUniversalLocker$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"deploymentId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"nextLockId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nextTransferQueryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"totalLockedPositions","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"activeLockPositions","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"totalWithdrawnPositions","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"pendingUnlockTime","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userLockCount","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userActiveLockCount","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userLockIdByIndex","type":{"kind":"dict","key":"int","value":"int"}},{"name":"lockOwner","type":{"kind":"dict","key":"int","value":"address"}},{"name":"lockJettonWallet","type":{"kind":"dict","key":"int","value":"address"}},{"name":"lockAmount","type":{"kind":"dict","key":"int","value":"int"}},{"name":"lockCreatedAt","type":{"kind":"dict","key":"int","value":"int"}},{"name":"lockUnlockTime","type":{"kind":"dict","key":"int","value":"int"}},{"name":"lockWithdrawn","type":{"kind":"dict","key":"int","value":"bool"}}]},
]

const GramPadUniversalLocker_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ConfigureLock": 4011149208,
    "SetPaused": 157817343,
    "ChangeOwner": 256331011,
    "WithdrawLock": 1786648362,
    "EmergencyWithdrawTon": 4057420251,
    "JettonTransferNotification": 1935855772,
    "JettonTransfer": 260734629,
}

const GramPadUniversalLocker_getters: ABIGetter[] = [
    {"name":"get_contract_version","methodId":127581,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_contract_details","methodId":67648,"arguments":[],"returnType":{"kind":"simple","type":"ContractDetails","optional":false}},
    {"name":"get_user_summary","methodId":110770,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"UserLockSummary","optional":false}},
    {"name":"get_user_lock_id_by_index","methodId":81468,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"index","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_lock_details","methodId":74862,"arguments":[{"name":"lockId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"LockDetails","optional":false}},
]

export const GramPadUniversalLocker_getterMapping: { [key: string]: string } = {
    'get_contract_version': 'getGetContractVersion',
    'get_contract_details': 'getGetContractDetails',
    'get_user_summary': 'getGetUserSummary',
    'get_user_lock_id_by_index': 'getGetUserLockIdByIndex',
    'get_lock_details': 'getGetLockDetails',
}

const GramPadUniversalLocker_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPaused"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
    {"receiver":"internal","message":{"kind":"typed","type":"EmergencyWithdrawTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ConfigureLock"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonTransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawLock"}},
]


export class GramPadUniversalLocker implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = GramPadUniversalLocker_errors_backward;
    public static readonly opcodes = GramPadUniversalLocker_opcodes;
    
    static async init(owner: Address, deploymentId: bigint) {
        return await GramPadUniversalLocker_init(owner, deploymentId);
    }
    
    static async fromInit(owner: Address, deploymentId: bigint) {
        const __gen_init = await GramPadUniversalLocker_init(owner, deploymentId);
        const address = contractAddress(0, __gen_init);
        return new GramPadUniversalLocker(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new GramPadUniversalLocker(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  GramPadUniversalLocker_types,
        getters: GramPadUniversalLocker_getters,
        receivers: GramPadUniversalLocker_receivers,
        errors: GramPadUniversalLocker_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: Deploy | SetPaused | ChangeOwner | EmergencyWithdrawTon | ConfigureLock | JettonTransferNotification | WithdrawLock) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPaused') {
            body = beginCell().store(storeSetPaused(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeOwner') {
            body = beginCell().store(storeChangeOwner(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'EmergencyWithdrawTon') {
            body = beginCell().store(storeEmergencyWithdrawTon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ConfigureLock') {
            body = beginCell().store(storeConfigureLock(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonTransferNotification') {
            body = beginCell().store(storeJettonTransferNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawLock') {
            body = beginCell().store(storeWithdrawLock(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetContractVersion(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_contract_version', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetContractDetails(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_contract_details', builder.build())).stack;
        const result = loadGetterTupleContractDetails(source);
        return result;
    }
    
    async getGetUserSummary(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_summary', builder.build())).stack;
        const result = loadGetterTupleUserLockSummary(source);
        return result;
    }
    
    async getGetUserLockIdByIndex(provider: ContractProvider, user: Address, index: bigint) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        builder.writeNumber(index);
        const source = (await provider.get('get_user_lock_id_by_index', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetLockDetails(provider: ContractProvider, lockId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(lockId);
        const source = (await provider.get('get_lock_details', builder.build())).stack;
        const result = loadGetterTupleLockDetails(source);
        return result;
    }
    
}