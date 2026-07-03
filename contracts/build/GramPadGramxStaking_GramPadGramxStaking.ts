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

export type ConfigureStake = {
    $$type: 'ConfigureStake';
    stakeKind: bigint;
    durationSeconds: bigint;
}

export function storeConfigureStake(src: ConfigureStake) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3695446447, 32);
        b_0.storeUint(src.stakeKind, 8);
        b_0.storeUint(src.durationSeconds, 32);
    };
}

export function loadConfigureStake(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3695446447) { throw Error('Invalid prefix'); }
    const _stakeKind = sc_0.loadUintBig(8);
    const _durationSeconds = sc_0.loadUintBig(32);
    return { $$type: 'ConfigureStake' as const, stakeKind: _stakeKind, durationSeconds: _durationSeconds };
}

export function loadTupleConfigureStake(source: TupleReader) {
    const _stakeKind = source.readBigNumber();
    const _durationSeconds = source.readBigNumber();
    return { $$type: 'ConfigureStake' as const, stakeKind: _stakeKind, durationSeconds: _durationSeconds };
}

export function loadGetterTupleConfigureStake(source: TupleReader) {
    const _stakeKind = source.readBigNumber();
    const _durationSeconds = source.readBigNumber();
    return { $$type: 'ConfigureStake' as const, stakeKind: _stakeKind, durationSeconds: _durationSeconds };
}

export function storeTupleConfigureStake(source: ConfigureStake) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.stakeKind);
    builder.writeNumber(source.durationSeconds);
    return builder.build();
}

export function dictValueParserConfigureStake(): DictionaryValue<ConfigureStake> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeConfigureStake(src)).endCell());
        },
        parse: (src) => {
            return loadConfigureStake(src.loadRef().beginParse());
        }
    }
}

export type SetGramxJettonWallet = {
    $$type: 'SetGramxJettonWallet';
    gramxJettonWallet: Address;
}

export function storeSetGramxJettonWallet(src: SetGramxJettonWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1947494201, 32);
        b_0.storeAddress(src.gramxJettonWallet);
    };
}

export function loadSetGramxJettonWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1947494201) { throw Error('Invalid prefix'); }
    const _gramxJettonWallet = sc_0.loadAddress();
    return { $$type: 'SetGramxJettonWallet' as const, gramxJettonWallet: _gramxJettonWallet };
}

export function loadTupleSetGramxJettonWallet(source: TupleReader) {
    const _gramxJettonWallet = source.readAddress();
    return { $$type: 'SetGramxJettonWallet' as const, gramxJettonWallet: _gramxJettonWallet };
}

export function loadGetterTupleSetGramxJettonWallet(source: TupleReader) {
    const _gramxJettonWallet = source.readAddress();
    return { $$type: 'SetGramxJettonWallet' as const, gramxJettonWallet: _gramxJettonWallet };
}

export function storeTupleSetGramxJettonWallet(source: SetGramxJettonWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.gramxJettonWallet);
    return builder.build();
}

export function dictValueParserSetGramxJettonWallet(): DictionaryValue<SetGramxJettonWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetGramxJettonWallet(src)).endCell());
        },
        parse: (src) => {
            return loadSetGramxJettonWallet(src.loadRef().beginParse());
        }
    }
}

export type SetAnnualRoi = {
    $$type: 'SetAnnualRoi';
    annualRoiBasisPoints: bigint;
}

export function storeSetAnnualRoi(src: SetAnnualRoi) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1212961359, 32);
        b_0.storeUint(src.annualRoiBasisPoints, 16);
    };
}

export function loadSetAnnualRoi(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1212961359) { throw Error('Invalid prefix'); }
    const _annualRoiBasisPoints = sc_0.loadUintBig(16);
    return { $$type: 'SetAnnualRoi' as const, annualRoiBasisPoints: _annualRoiBasisPoints };
}

export function loadTupleSetAnnualRoi(source: TupleReader) {
    const _annualRoiBasisPoints = source.readBigNumber();
    return { $$type: 'SetAnnualRoi' as const, annualRoiBasisPoints: _annualRoiBasisPoints };
}

export function loadGetterTupleSetAnnualRoi(source: TupleReader) {
    const _annualRoiBasisPoints = source.readBigNumber();
    return { $$type: 'SetAnnualRoi' as const, annualRoiBasisPoints: _annualRoiBasisPoints };
}

export function storeTupleSetAnnualRoi(source: SetAnnualRoi) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.annualRoiBasisPoints);
    return builder.build();
}

export function dictValueParserSetAnnualRoi(): DictionaryValue<SetAnnualRoi> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetAnnualRoi(src)).endCell());
        },
        parse: (src) => {
            return loadSetAnnualRoi(src.loadRef().beginParse());
        }
    }
}

export type SetDurationRoi = {
    $$type: 'SetDurationRoi';
    durationDays: bigint;
    annualRoiBasisPoints: bigint;
}

export function storeSetDurationRoi(src: SetDurationRoi) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3357303449, 32);
        b_0.storeUint(src.durationDays, 16);
        b_0.storeUint(src.annualRoiBasisPoints, 16);
    };
}

export function loadSetDurationRoi(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3357303449) { throw Error('Invalid prefix'); }
    const _durationDays = sc_0.loadUintBig(16);
    const _annualRoiBasisPoints = sc_0.loadUintBig(16);
    return { $$type: 'SetDurationRoi' as const, durationDays: _durationDays, annualRoiBasisPoints: _annualRoiBasisPoints };
}

export function loadTupleSetDurationRoi(source: TupleReader) {
    const _durationDays = source.readBigNumber();
    const _annualRoiBasisPoints = source.readBigNumber();
    return { $$type: 'SetDurationRoi' as const, durationDays: _durationDays, annualRoiBasisPoints: _annualRoiBasisPoints };
}

export function loadGetterTupleSetDurationRoi(source: TupleReader) {
    const _durationDays = source.readBigNumber();
    const _annualRoiBasisPoints = source.readBigNumber();
    return { $$type: 'SetDurationRoi' as const, durationDays: _durationDays, annualRoiBasisPoints: _annualRoiBasisPoints };
}

export function storeTupleSetDurationRoi(source: SetDurationRoi) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.durationDays);
    builder.writeNumber(source.annualRoiBasisPoints);
    return builder.build();
}

export function dictValueParserSetDurationRoi(): DictionaryValue<SetDurationRoi> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetDurationRoi(src)).endCell());
        },
        parse: (src) => {
            return loadSetDurationRoi(src.loadRef().beginParse());
        }
    }
}

export type SetFlexUnstakeFee = {
    $$type: 'SetFlexUnstakeFee';
    flexUnstakeFeeBasisPoints: bigint;
}

export function storeSetFlexUnstakeFee(src: SetFlexUnstakeFee) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4287318778, 32);
        b_0.storeUint(src.flexUnstakeFeeBasisPoints, 16);
    };
}

export function loadSetFlexUnstakeFee(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4287318778) { throw Error('Invalid prefix'); }
    const _flexUnstakeFeeBasisPoints = sc_0.loadUintBig(16);
    return { $$type: 'SetFlexUnstakeFee' as const, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints };
}

export function loadTupleSetFlexUnstakeFee(source: TupleReader) {
    const _flexUnstakeFeeBasisPoints = source.readBigNumber();
    return { $$type: 'SetFlexUnstakeFee' as const, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints };
}

export function loadGetterTupleSetFlexUnstakeFee(source: TupleReader) {
    const _flexUnstakeFeeBasisPoints = source.readBigNumber();
    return { $$type: 'SetFlexUnstakeFee' as const, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints };
}

export function storeTupleSetFlexUnstakeFee(source: SetFlexUnstakeFee) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.flexUnstakeFeeBasisPoints);
    return builder.build();
}

export function dictValueParserSetFlexUnstakeFee(): DictionaryValue<SetFlexUnstakeFee> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetFlexUnstakeFee(src)).endCell());
        },
        parse: (src) => {
            return loadSetFlexUnstakeFee(src.loadRef().beginParse());
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

export type ClaimRewards = {
    $$type: 'ClaimRewards';
    stakeId: bigint;
}

export function storeClaimRewards(src: ClaimRewards) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(225359749, 32);
        b_0.storeUint(src.stakeId, 64);
    };
}

export function loadClaimRewards(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 225359749) { throw Error('Invalid prefix'); }
    const _stakeId = sc_0.loadUintBig(64);
    return { $$type: 'ClaimRewards' as const, stakeId: _stakeId };
}

export function loadTupleClaimRewards(source: TupleReader) {
    const _stakeId = source.readBigNumber();
    return { $$type: 'ClaimRewards' as const, stakeId: _stakeId };
}

export function loadGetterTupleClaimRewards(source: TupleReader) {
    const _stakeId = source.readBigNumber();
    return { $$type: 'ClaimRewards' as const, stakeId: _stakeId };
}

export function storeTupleClaimRewards(source: ClaimRewards) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.stakeId);
    return builder.build();
}

export function dictValueParserClaimRewards(): DictionaryValue<ClaimRewards> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimRewards(src)).endCell());
        },
        parse: (src) => {
            return loadClaimRewards(src.loadRef().beginParse());
        }
    }
}

export type Unstake = {
    $$type: 'Unstake';
    stakeId: bigint;
}

export function storeUnstake(src: Unstake) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4021853582, 32);
        b_0.storeUint(src.stakeId, 64);
    };
}

export function loadUnstake(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4021853582) { throw Error('Invalid prefix'); }
    const _stakeId = sc_0.loadUintBig(64);
    return { $$type: 'Unstake' as const, stakeId: _stakeId };
}

export function loadTupleUnstake(source: TupleReader) {
    const _stakeId = source.readBigNumber();
    return { $$type: 'Unstake' as const, stakeId: _stakeId };
}

export function loadGetterTupleUnstake(source: TupleReader) {
    const _stakeId = source.readBigNumber();
    return { $$type: 'Unstake' as const, stakeId: _stakeId };
}

export function storeTupleUnstake(source: Unstake) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.stakeId);
    return builder.build();
}

export function dictValueParserUnstake(): DictionaryValue<Unstake> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUnstake(src)).endCell());
        },
        parse: (src) => {
            return loadUnstake(src.loadRef().beginParse());
        }
    }
}

export type FundContractTon = {
    $$type: 'FundContractTon';
}

export function storeFundContractTon(src: FundContractTon) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1879568762, 32);
    };
}

export function loadFundContractTon(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1879568762) { throw Error('Invalid prefix'); }
    return { $$type: 'FundContractTon' as const };
}

export function loadTupleFundContractTon(source: TupleReader) {
    return { $$type: 'FundContractTon' as const };
}

export function loadGetterTupleFundContractTon(source: TupleReader) {
    return { $$type: 'FundContractTon' as const };
}

export function storeTupleFundContractTon(source: FundContractTon) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserFundContractTon(): DictionaryValue<FundContractTon> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFundContractTon(src)).endCell());
        },
        parse: (src) => {
            return loadFundContractTon(src.loadRef().beginParse());
        }
    }
}

export type OwnerWithdrawTon = {
    $$type: 'OwnerWithdrawTon';
    amount: bigint;
    destination: Address;
}

export function storeOwnerWithdrawTon(src: OwnerWithdrawTon) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(826339878, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadOwnerWithdrawTon(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 826339878) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'OwnerWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function loadTupleOwnerWithdrawTon(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function loadGetterTupleOwnerWithdrawTon(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function storeTupleOwnerWithdrawTon(source: OwnerWithdrawTon) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserOwnerWithdrawTon(): DictionaryValue<OwnerWithdrawTon> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOwnerWithdrawTon(src)).endCell());
        },
        parse: (src) => {
            return loadOwnerWithdrawTon(src.loadRef().beginParse());
        }
    }
}

export type OwnerWithdrawGramx = {
    $$type: 'OwnerWithdrawGramx';
    amount: bigint;
    destination: Address;
}

export function storeOwnerWithdrawGramx(src: OwnerWithdrawGramx) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3202764597, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadOwnerWithdrawGramx(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3202764597) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'OwnerWithdrawGramx' as const, amount: _amount, destination: _destination };
}

export function loadTupleOwnerWithdrawGramx(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawGramx' as const, amount: _amount, destination: _destination };
}

export function loadGetterTupleOwnerWithdrawGramx(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawGramx' as const, amount: _amount, destination: _destination };
}

export function storeTupleOwnerWithdrawGramx(source: OwnerWithdrawGramx) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserOwnerWithdrawGramx(): DictionaryValue<OwnerWithdrawGramx> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOwnerWithdrawGramx(src)).endCell());
        },
        parse: (src) => {
            return loadOwnerWithdrawGramx(src.loadRef().beginParse());
        }
    }
}

export type OwnerWithdrawAnyJetton = {
    $$type: 'OwnerWithdrawAnyJetton';
    jettonWallet: Address;
    amount: bigint;
    destination: Address;
}

export function storeOwnerWithdrawAnyJetton(src: OwnerWithdrawAnyJetton) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3745576558, 32);
        b_0.storeAddress(src.jettonWallet);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadOwnerWithdrawAnyJetton(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3745576558) { throw Error('Invalid prefix'); }
    const _jettonWallet = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'OwnerWithdrawAnyJetton' as const, jettonWallet: _jettonWallet, amount: _amount, destination: _destination };
}

export function loadTupleOwnerWithdrawAnyJetton(source: TupleReader) {
    const _jettonWallet = source.readAddress();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawAnyJetton' as const, jettonWallet: _jettonWallet, amount: _amount, destination: _destination };
}

export function loadGetterTupleOwnerWithdrawAnyJetton(source: TupleReader) {
    const _jettonWallet = source.readAddress();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawAnyJetton' as const, jettonWallet: _jettonWallet, amount: _amount, destination: _destination };
}

export function storeTupleOwnerWithdrawAnyJetton(source: OwnerWithdrawAnyJetton) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jettonWallet);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserOwnerWithdrawAnyJetton(): DictionaryValue<OwnerWithdrawAnyJetton> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOwnerWithdrawAnyJetton(src)).endCell());
        },
        parse: (src) => {
            return loadOwnerWithdrawAnyJetton(src.loadRef().beginParse());
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

export type JettonExcesses = {
    $$type: 'JettonExcesses';
    queryId: bigint;
}

export function storeJettonExcesses(src: JettonExcesses) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3576854235, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadJettonExcesses(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3576854235) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'JettonExcesses' as const, queryId: _queryId };
}

export function loadTupleJettonExcesses(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'JettonExcesses' as const, queryId: _queryId };
}

export function loadGetterTupleJettonExcesses(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'JettonExcesses' as const, queryId: _queryId };
}

export function storeTupleJettonExcesses(source: JettonExcesses) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserJettonExcesses(): DictionaryValue<JettonExcesses> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonExcesses(src)).endCell());
        },
        parse: (src) => {
            return loadJettonExcesses(src.loadRef().beginParse());
        }
    }
}

export type ContractDetails = {
    $$type: 'ContractDetails';
    owner: Address;
    deploymentId: bigint;
    gramxJettonMaster: Address;
    gramxJettonWallet: Address;
    jettonWalletConfigured: boolean;
    annualRoiBasisPoints: bigint;
    flexUnstakeFeeBasisPoints: bigint;
    minStake: bigint;
    paused: boolean;
    totalStaked: bigint;
    rewardReserve: bigint;
    totalRewardsPaid: bigint;
    totalFeesCollected: bigint;
    activeStakerCount: bigint;
    totalStakePositions: bigint;
    nextStakeId: bigint;
}

export function storeContractDetails(src: ContractDetails) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.deploymentId, 257);
        b_0.storeAddress(src.gramxJettonMaster);
        const b_1 = new Builder();
        b_1.storeAddress(src.gramxJettonWallet);
        b_1.storeBit(src.jettonWalletConfigured);
        b_1.storeInt(src.annualRoiBasisPoints, 257);
        b_1.storeInt(src.flexUnstakeFeeBasisPoints, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.minStake, 257);
        b_2.storeBit(src.paused);
        b_2.storeInt(src.totalStaked, 257);
        b_2.storeInt(src.rewardReserve, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.totalRewardsPaid, 257);
        b_3.storeInt(src.totalFeesCollected, 257);
        b_3.storeInt(src.activeStakerCount, 257);
        const b_4 = new Builder();
        b_4.storeInt(src.totalStakePositions, 257);
        b_4.storeInt(src.nextStakeId, 257);
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractDetails(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _deploymentId = sc_0.loadIntBig(257);
    const _gramxJettonMaster = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _gramxJettonWallet = sc_1.loadAddress();
    const _jettonWalletConfigured = sc_1.loadBit();
    const _annualRoiBasisPoints = sc_1.loadIntBig(257);
    const _flexUnstakeFeeBasisPoints = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _minStake = sc_2.loadIntBig(257);
    const _paused = sc_2.loadBit();
    const _totalStaked = sc_2.loadIntBig(257);
    const _rewardReserve = sc_2.loadIntBig(257);
    const sc_3 = sc_2.loadRef().beginParse();
    const _totalRewardsPaid = sc_3.loadIntBig(257);
    const _totalFeesCollected = sc_3.loadIntBig(257);
    const _activeStakerCount = sc_3.loadIntBig(257);
    const sc_4 = sc_3.loadRef().beginParse();
    const _totalStakePositions = sc_4.loadIntBig(257);
    const _nextStakeId = sc_4.loadIntBig(257);
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, totalStakePositions: _totalStakePositions, nextStakeId: _nextStakeId };
}

export function loadTupleContractDetails(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _gramxJettonMaster = source.readAddress();
    const _gramxJettonWallet = source.readAddress();
    const _jettonWalletConfigured = source.readBoolean();
    const _annualRoiBasisPoints = source.readBigNumber();
    const _flexUnstakeFeeBasisPoints = source.readBigNumber();
    const _minStake = source.readBigNumber();
    const _paused = source.readBoolean();
    const _totalStaked = source.readBigNumber();
    const _rewardReserve = source.readBigNumber();
    const _totalRewardsPaid = source.readBigNumber();
    const _totalFeesCollected = source.readBigNumber();
    const _activeStakerCount = source.readBigNumber();
    source = source.readTuple();
    const _totalStakePositions = source.readBigNumber();
    const _nextStakeId = source.readBigNumber();
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, totalStakePositions: _totalStakePositions, nextStakeId: _nextStakeId };
}

export function loadGetterTupleContractDetails(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _gramxJettonMaster = source.readAddress();
    const _gramxJettonWallet = source.readAddress();
    const _jettonWalletConfigured = source.readBoolean();
    const _annualRoiBasisPoints = source.readBigNumber();
    const _flexUnstakeFeeBasisPoints = source.readBigNumber();
    const _minStake = source.readBigNumber();
    const _paused = source.readBoolean();
    const _totalStaked = source.readBigNumber();
    const _rewardReserve = source.readBigNumber();
    const _totalRewardsPaid = source.readBigNumber();
    const _totalFeesCollected = source.readBigNumber();
    const _activeStakerCount = source.readBigNumber();
    const _totalStakePositions = source.readBigNumber();
    const _nextStakeId = source.readBigNumber();
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, totalStakePositions: _totalStakePositions, nextStakeId: _nextStakeId };
}

export function storeTupleContractDetails(source: ContractDetails) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.deploymentId);
    builder.writeAddress(source.gramxJettonMaster);
    builder.writeAddress(source.gramxJettonWallet);
    builder.writeBoolean(source.jettonWalletConfigured);
    builder.writeNumber(source.annualRoiBasisPoints);
    builder.writeNumber(source.flexUnstakeFeeBasisPoints);
    builder.writeNumber(source.minStake);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.totalStaked);
    builder.writeNumber(source.rewardReserve);
    builder.writeNumber(source.totalRewardsPaid);
    builder.writeNumber(source.totalFeesCollected);
    builder.writeNumber(source.activeStakerCount);
    builder.writeNumber(source.totalStakePositions);
    builder.writeNumber(source.nextStakeId);
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

export type StakingPlans = {
    $$type: 'StakingPlans';
    sevenDaysRoiBasisPoints: bigint;
    thirtyDaysRoiBasisPoints: bigint;
    threeMonthsRoiBasisPoints: bigint;
    nineMonthsRoiBasisPoints: bigint;
    twelveMonthsRoiBasisPoints: bigint;
}

export function storeStakingPlans(src: StakingPlans) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.sevenDaysRoiBasisPoints, 257);
        b_0.storeInt(src.thirtyDaysRoiBasisPoints, 257);
        b_0.storeInt(src.threeMonthsRoiBasisPoints, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.nineMonthsRoiBasisPoints, 257);
        b_1.storeInt(src.twelveMonthsRoiBasisPoints, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadStakingPlans(slice: Slice) {
    const sc_0 = slice;
    const _sevenDaysRoiBasisPoints = sc_0.loadIntBig(257);
    const _thirtyDaysRoiBasisPoints = sc_0.loadIntBig(257);
    const _threeMonthsRoiBasisPoints = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _nineMonthsRoiBasisPoints = sc_1.loadIntBig(257);
    const _twelveMonthsRoiBasisPoints = sc_1.loadIntBig(257);
    return { $$type: 'StakingPlans' as const, sevenDaysRoiBasisPoints: _sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints: _thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints: _threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints: _nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints: _twelveMonthsRoiBasisPoints };
}

export function loadTupleStakingPlans(source: TupleReader) {
    const _sevenDaysRoiBasisPoints = source.readBigNumber();
    const _thirtyDaysRoiBasisPoints = source.readBigNumber();
    const _threeMonthsRoiBasisPoints = source.readBigNumber();
    const _nineMonthsRoiBasisPoints = source.readBigNumber();
    const _twelveMonthsRoiBasisPoints = source.readBigNumber();
    return { $$type: 'StakingPlans' as const, sevenDaysRoiBasisPoints: _sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints: _thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints: _threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints: _nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints: _twelveMonthsRoiBasisPoints };
}

export function loadGetterTupleStakingPlans(source: TupleReader) {
    const _sevenDaysRoiBasisPoints = source.readBigNumber();
    const _thirtyDaysRoiBasisPoints = source.readBigNumber();
    const _threeMonthsRoiBasisPoints = source.readBigNumber();
    const _nineMonthsRoiBasisPoints = source.readBigNumber();
    const _twelveMonthsRoiBasisPoints = source.readBigNumber();
    return { $$type: 'StakingPlans' as const, sevenDaysRoiBasisPoints: _sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints: _thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints: _threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints: _nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints: _twelveMonthsRoiBasisPoints };
}

export function storeTupleStakingPlans(source: StakingPlans) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.sevenDaysRoiBasisPoints);
    builder.writeNumber(source.thirtyDaysRoiBasisPoints);
    builder.writeNumber(source.threeMonthsRoiBasisPoints);
    builder.writeNumber(source.nineMonthsRoiBasisPoints);
    builder.writeNumber(source.twelveMonthsRoiBasisPoints);
    return builder.build();
}

export function dictValueParserStakingPlans(): DictionaryValue<StakingPlans> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStakingPlans(src)).endCell());
        },
        parse: (src) => {
            return loadStakingPlans(src.loadRef().beginParse());
        }
    }
}

export type UserSummary = {
    $$type: 'UserSummary';
    user: Address;
    totalStakePositions: bigint;
    activeStakePositions: bigint;
}

export function storeUserSummary(src: UserSummary) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.user);
        b_0.storeInt(src.totalStakePositions, 257);
        b_0.storeInt(src.activeStakePositions, 257);
    };
}

export function loadUserSummary(slice: Slice) {
    const sc_0 = slice;
    const _user = sc_0.loadAddress();
    const _totalStakePositions = sc_0.loadIntBig(257);
    const _activeStakePositions = sc_0.loadIntBig(257);
    return { $$type: 'UserSummary' as const, user: _user, totalStakePositions: _totalStakePositions, activeStakePositions: _activeStakePositions };
}

export function loadTupleUserSummary(source: TupleReader) {
    const _user = source.readAddress();
    const _totalStakePositions = source.readBigNumber();
    const _activeStakePositions = source.readBigNumber();
    return { $$type: 'UserSummary' as const, user: _user, totalStakePositions: _totalStakePositions, activeStakePositions: _activeStakePositions };
}

export function loadGetterTupleUserSummary(source: TupleReader) {
    const _user = source.readAddress();
    const _totalStakePositions = source.readBigNumber();
    const _activeStakePositions = source.readBigNumber();
    return { $$type: 'UserSummary' as const, user: _user, totalStakePositions: _totalStakePositions, activeStakePositions: _activeStakePositions };
}

export function storeTupleUserSummary(source: UserSummary) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.user);
    builder.writeNumber(source.totalStakePositions);
    builder.writeNumber(source.activeStakePositions);
    return builder.build();
}

export function dictValueParserUserSummary(): DictionaryValue<UserSummary> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUserSummary(src)).endCell());
        },
        parse: (src) => {
            return loadUserSummary(src.loadRef().beginParse());
        }
    }
}

export type StakeDetails = {
    $$type: 'StakeDetails';
    stakeId: bigint;
    owner: Address;
    active: boolean;
    amount: bigint;
    pendingReward: bigint;
    roiBasisPoints: bigint;
    stakeKind: bigint;
    startedAt: bigint;
    duration: bigint;
    maturityAt: bigint;
    claimedRewards: bigint;
}

export function storeStakeDetails(src: StakeDetails) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.stakeId, 257);
        b_0.storeAddress(src.owner);
        b_0.storeBit(src.active);
        b_0.storeInt(src.amount, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.pendingReward, 257);
        b_1.storeInt(src.roiBasisPoints, 257);
        b_1.storeInt(src.stakeKind, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.startedAt, 257);
        b_2.storeInt(src.duration, 257);
        b_2.storeInt(src.maturityAt, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.claimedRewards, 257);
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadStakeDetails(slice: Slice) {
    const sc_0 = slice;
    const _stakeId = sc_0.loadIntBig(257);
    const _owner = sc_0.loadAddress();
    const _active = sc_0.loadBit();
    const _amount = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _pendingReward = sc_1.loadIntBig(257);
    const _roiBasisPoints = sc_1.loadIntBig(257);
    const _stakeKind = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _startedAt = sc_2.loadIntBig(257);
    const _duration = sc_2.loadIntBig(257);
    const _maturityAt = sc_2.loadIntBig(257);
    const sc_3 = sc_2.loadRef().beginParse();
    const _claimedRewards = sc_3.loadIntBig(257);
    return { $$type: 'StakeDetails' as const, stakeId: _stakeId, owner: _owner, active: _active, amount: _amount, pendingReward: _pendingReward, roiBasisPoints: _roiBasisPoints, stakeKind: _stakeKind, startedAt: _startedAt, duration: _duration, maturityAt: _maturityAt, claimedRewards: _claimedRewards };
}

export function loadTupleStakeDetails(source: TupleReader) {
    const _stakeId = source.readBigNumber();
    const _owner = source.readAddress();
    const _active = source.readBoolean();
    const _amount = source.readBigNumber();
    const _pendingReward = source.readBigNumber();
    const _roiBasisPoints = source.readBigNumber();
    const _stakeKind = source.readBigNumber();
    const _startedAt = source.readBigNumber();
    const _duration = source.readBigNumber();
    const _maturityAt = source.readBigNumber();
    const _claimedRewards = source.readBigNumber();
    return { $$type: 'StakeDetails' as const, stakeId: _stakeId, owner: _owner, active: _active, amount: _amount, pendingReward: _pendingReward, roiBasisPoints: _roiBasisPoints, stakeKind: _stakeKind, startedAt: _startedAt, duration: _duration, maturityAt: _maturityAt, claimedRewards: _claimedRewards };
}

export function loadGetterTupleStakeDetails(source: TupleReader) {
    const _stakeId = source.readBigNumber();
    const _owner = source.readAddress();
    const _active = source.readBoolean();
    const _amount = source.readBigNumber();
    const _pendingReward = source.readBigNumber();
    const _roiBasisPoints = source.readBigNumber();
    const _stakeKind = source.readBigNumber();
    const _startedAt = source.readBigNumber();
    const _duration = source.readBigNumber();
    const _maturityAt = source.readBigNumber();
    const _claimedRewards = source.readBigNumber();
    return { $$type: 'StakeDetails' as const, stakeId: _stakeId, owner: _owner, active: _active, amount: _amount, pendingReward: _pendingReward, roiBasisPoints: _roiBasisPoints, stakeKind: _stakeKind, startedAt: _startedAt, duration: _duration, maturityAt: _maturityAt, claimedRewards: _claimedRewards };
}

export function storeTupleStakeDetails(source: StakeDetails) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.stakeId);
    builder.writeAddress(source.owner);
    builder.writeBoolean(source.active);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.pendingReward);
    builder.writeNumber(source.roiBasisPoints);
    builder.writeNumber(source.stakeKind);
    builder.writeNumber(source.startedAt);
    builder.writeNumber(source.duration);
    builder.writeNumber(source.maturityAt);
    builder.writeNumber(source.claimedRewards);
    return builder.build();
}

export function dictValueParserStakeDetails(): DictionaryValue<StakeDetails> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStakeDetails(src)).endCell());
        },
        parse: (src) => {
            return loadStakeDetails(src.loadRef().beginParse());
        }
    }
}

export type StakingDashboard = {
    $$type: 'StakingDashboard';
    contractDetails: ContractDetails;
    stakingPlans: StakingPlans;
    userSummary: UserSummary;
    offset: bigint;
    nextOffset: bigint;
    hasMore: boolean;
    positions: Dictionary<bigint, StakeDetails>;
}

export function storeStakingDashboard(src: StakingDashboard) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.store(storeContractDetails(src.contractDetails));
        const b_1 = new Builder();
        b_1.store(storeStakingPlans(src.stakingPlans));
        const b_2 = new Builder();
        b_2.store(storeUserSummary(src.userSummary));
        const b_3 = new Builder();
        b_3.storeInt(src.offset, 257);
        b_3.storeInt(src.nextOffset, 257);
        b_3.storeBit(src.hasMore);
        b_3.storeDict(src.positions, Dictionary.Keys.BigInt(257), dictValueParserStakeDetails());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadStakingDashboard(slice: Slice) {
    const sc_0 = slice;
    const _contractDetails = loadContractDetails(sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _stakingPlans = loadStakingPlans(sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _userSummary = loadUserSummary(sc_2);
    const sc_3 = sc_2.loadRef().beginParse();
    const _offset = sc_3.loadIntBig(257);
    const _nextOffset = sc_3.loadIntBig(257);
    const _hasMore = sc_3.loadBit();
    const _positions = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserStakeDetails(), sc_3);
    return { $$type: 'StakingDashboard' as const, contractDetails: _contractDetails, stakingPlans: _stakingPlans, userSummary: _userSummary, offset: _offset, nextOffset: _nextOffset, hasMore: _hasMore, positions: _positions };
}

export function loadTupleStakingDashboard(source: TupleReader) {
    const _contractDetails = loadTupleContractDetails(source);
    const _stakingPlans = loadTupleStakingPlans(source);
    const _userSummary = loadTupleUserSummary(source);
    const _offset = source.readBigNumber();
    const _nextOffset = source.readBigNumber();
    const _hasMore = source.readBoolean();
    const _positions = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserStakeDetails(), source.readCellOpt());
    return { $$type: 'StakingDashboard' as const, contractDetails: _contractDetails, stakingPlans: _stakingPlans, userSummary: _userSummary, offset: _offset, nextOffset: _nextOffset, hasMore: _hasMore, positions: _positions };
}

export function loadGetterTupleStakingDashboard(source: TupleReader) {
    const _contractDetails = loadGetterTupleContractDetails(source);
    const _stakingPlans = loadGetterTupleStakingPlans(source);
    const _userSummary = loadGetterTupleUserSummary(source);
    const _offset = source.readBigNumber();
    const _nextOffset = source.readBigNumber();
    const _hasMore = source.readBoolean();
    const _positions = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserStakeDetails(), source.readCellOpt());
    return { $$type: 'StakingDashboard' as const, contractDetails: _contractDetails, stakingPlans: _stakingPlans, userSummary: _userSummary, offset: _offset, nextOffset: _nextOffset, hasMore: _hasMore, positions: _positions };
}

export function storeTupleStakingDashboard(source: StakingDashboard) {
    const builder = new TupleBuilder();
    builder.writeTuple(storeTupleContractDetails(source.contractDetails));
    builder.writeTuple(storeTupleStakingPlans(source.stakingPlans));
    builder.writeTuple(storeTupleUserSummary(source.userSummary));
    builder.writeNumber(source.offset);
    builder.writeNumber(source.nextOffset);
    builder.writeBoolean(source.hasMore);
    builder.writeCell(source.positions.size > 0 ? beginCell().storeDictDirect(source.positions, Dictionary.Keys.BigInt(257), dictValueParserStakeDetails()).endCell() : null);
    return builder.build();
}

export function dictValueParserStakingDashboard(): DictionaryValue<StakingDashboard> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStakingDashboard(src)).endCell());
        },
        parse: (src) => {
            return loadStakingDashboard(src.loadRef().beginParse());
        }
    }
}

export type GramPadGramxStaking$Data = {
    $$type: 'GramPadGramxStaking$Data';
    owner: Address;
    deploymentId: bigint;
    gramxJettonMaster: Address;
    gramxJettonWallet: Address;
    jettonWalletConfigured: boolean;
    annualRoiBasisPoints: bigint;
    sevenDaysRoiBasisPoints: bigint;
    thirtyDaysRoiBasisPoints: bigint;
    threeMonthsRoiBasisPoints: bigint;
    nineMonthsRoiBasisPoints: bigint;
    twelveMonthsRoiBasisPoints: bigint;
    flexUnstakeFeeBasisPoints: bigint;
    minStake: bigint;
    paused: boolean;
    totalStaked: bigint;
    rewardReserve: bigint;
    totalRewardsPaid: bigint;
    totalFeesCollected: bigint;
    activeStakerCount: bigint;
    nextTransferQueryId: bigint;
    nextStakeId: bigint;
    pendingStakeKind: Dictionary<Address, bigint>;
    pendingStakeDuration: Dictionary<Address, bigint>;
    userStakeCount: Dictionary<Address, bigint>;
    userActiveStakeCount: Dictionary<Address, bigint>;
    userStakeIdByIndex: Dictionary<bigint, bigint>;
    stakeOwner: Dictionary<bigint, Address>;
    stakeAmount: Dictionary<bigint, bigint>;
    stakeRoiBasisPoints: Dictionary<bigint, bigint>;
    stakeKind: Dictionary<bigint, bigint>;
    stakeStartedAt: Dictionary<bigint, bigint>;
    stakeDuration: Dictionary<bigint, bigint>;
    stakeClaimedRewards: Dictionary<bigint, bigint>;
    stakeActive: Dictionary<bigint, boolean>;
}

export function storeGramPadGramxStaking$Data(src: GramPadGramxStaking$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.deploymentId, 64);
        b_0.storeAddress(src.gramxJettonMaster);
        b_0.storeAddress(src.gramxJettonWallet);
        b_0.storeBit(src.jettonWalletConfigured);
        b_0.storeUint(src.annualRoiBasisPoints, 16);
        b_0.storeUint(src.sevenDaysRoiBasisPoints, 16);
        b_0.storeUint(src.thirtyDaysRoiBasisPoints, 16);
        b_0.storeUint(src.threeMonthsRoiBasisPoints, 16);
        b_0.storeUint(src.nineMonthsRoiBasisPoints, 16);
        b_0.storeUint(src.twelveMonthsRoiBasisPoints, 16);
        b_0.storeUint(src.flexUnstakeFeeBasisPoints, 16);
        const b_1 = new Builder();
        b_1.storeCoins(src.minStake);
        b_1.storeBit(src.paused);
        b_1.storeCoins(src.totalStaked);
        b_1.storeCoins(src.rewardReserve);
        b_1.storeCoins(src.totalRewardsPaid);
        b_1.storeCoins(src.totalFeesCollected);
        b_1.storeUint(src.activeStakerCount, 32);
        b_1.storeUint(src.nextTransferQueryId, 64);
        b_1.storeUint(src.nextStakeId, 64);
        b_1.storeDict(src.pendingStakeKind, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeDict(src.pendingStakeDuration, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeDict(src.userStakeCount, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        const b_2 = new Builder();
        b_2.storeDict(src.userActiveStakeCount, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_2.storeDict(src.userStakeIdByIndex, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_2.storeDict(src.stakeOwner, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        const b_3 = new Builder();
        b_3.storeDict(src.stakeAmount, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_3.storeDict(src.stakeRoiBasisPoints, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_3.storeDict(src.stakeKind, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        const b_4 = new Builder();
        b_4.storeDict(src.stakeStartedAt, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_4.storeDict(src.stakeDuration, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_4.storeDict(src.stakeClaimedRewards, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_4.storeDict(src.stakeActive, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadGramPadGramxStaking$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _deploymentId = sc_0.loadUintBig(64);
    const _gramxJettonMaster = sc_0.loadAddress();
    const _gramxJettonWallet = sc_0.loadAddress();
    const _jettonWalletConfigured = sc_0.loadBit();
    const _annualRoiBasisPoints = sc_0.loadUintBig(16);
    const _sevenDaysRoiBasisPoints = sc_0.loadUintBig(16);
    const _thirtyDaysRoiBasisPoints = sc_0.loadUintBig(16);
    const _threeMonthsRoiBasisPoints = sc_0.loadUintBig(16);
    const _nineMonthsRoiBasisPoints = sc_0.loadUintBig(16);
    const _twelveMonthsRoiBasisPoints = sc_0.loadUintBig(16);
    const _flexUnstakeFeeBasisPoints = sc_0.loadUintBig(16);
    const sc_1 = sc_0.loadRef().beginParse();
    const _minStake = sc_1.loadCoins();
    const _paused = sc_1.loadBit();
    const _totalStaked = sc_1.loadCoins();
    const _rewardReserve = sc_1.loadCoins();
    const _totalRewardsPaid = sc_1.loadCoins();
    const _totalFeesCollected = sc_1.loadCoins();
    const _activeStakerCount = sc_1.loadUintBig(32);
    const _nextTransferQueryId = sc_1.loadUintBig(64);
    const _nextStakeId = sc_1.loadUintBig(64);
    const _pendingStakeKind = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _pendingStakeDuration = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _userStakeCount = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const sc_2 = sc_1.loadRef().beginParse();
    const _userActiveStakeCount = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_2);
    const _userStakeIdByIndex = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_2);
    const _stakeOwner = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_2);
    const sc_3 = sc_2.loadRef().beginParse();
    const _stakeAmount = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_3);
    const _stakeRoiBasisPoints = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_3);
    const _stakeKind = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_3);
    const sc_4 = sc_3.loadRef().beginParse();
    const _stakeStartedAt = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_4);
    const _stakeDuration = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_4);
    const _stakeClaimedRewards = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_4);
    const _stakeActive = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_4);
    return { $$type: 'GramPadGramxStaking$Data' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, sevenDaysRoiBasisPoints: _sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints: _thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints: _threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints: _nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints: _twelveMonthsRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, nextTransferQueryId: _nextTransferQueryId, nextStakeId: _nextStakeId, pendingStakeKind: _pendingStakeKind, pendingStakeDuration: _pendingStakeDuration, userStakeCount: _userStakeCount, userActiveStakeCount: _userActiveStakeCount, userStakeIdByIndex: _userStakeIdByIndex, stakeOwner: _stakeOwner, stakeAmount: _stakeAmount, stakeRoiBasisPoints: _stakeRoiBasisPoints, stakeKind: _stakeKind, stakeStartedAt: _stakeStartedAt, stakeDuration: _stakeDuration, stakeClaimedRewards: _stakeClaimedRewards, stakeActive: _stakeActive };
}

export function loadTupleGramPadGramxStaking$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _gramxJettonMaster = source.readAddress();
    const _gramxJettonWallet = source.readAddress();
    const _jettonWalletConfigured = source.readBoolean();
    const _annualRoiBasisPoints = source.readBigNumber();
    const _sevenDaysRoiBasisPoints = source.readBigNumber();
    const _thirtyDaysRoiBasisPoints = source.readBigNumber();
    const _threeMonthsRoiBasisPoints = source.readBigNumber();
    const _nineMonthsRoiBasisPoints = source.readBigNumber();
    const _twelveMonthsRoiBasisPoints = source.readBigNumber();
    const _flexUnstakeFeeBasisPoints = source.readBigNumber();
    const _minStake = source.readBigNumber();
    const _paused = source.readBoolean();
    source = source.readTuple();
    const _totalStaked = source.readBigNumber();
    const _rewardReserve = source.readBigNumber();
    const _totalRewardsPaid = source.readBigNumber();
    const _totalFeesCollected = source.readBigNumber();
    const _activeStakerCount = source.readBigNumber();
    const _nextTransferQueryId = source.readBigNumber();
    const _nextStakeId = source.readBigNumber();
    const _pendingStakeKind = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pendingStakeDuration = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userStakeCount = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userActiveStakeCount = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userStakeIdByIndex = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeOwner = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _stakeAmount = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    source = source.readTuple();
    const _stakeRoiBasisPoints = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeKind = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeStartedAt = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeDuration = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeClaimedRewards = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeActive = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'GramPadGramxStaking$Data' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, sevenDaysRoiBasisPoints: _sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints: _thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints: _threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints: _nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints: _twelveMonthsRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, nextTransferQueryId: _nextTransferQueryId, nextStakeId: _nextStakeId, pendingStakeKind: _pendingStakeKind, pendingStakeDuration: _pendingStakeDuration, userStakeCount: _userStakeCount, userActiveStakeCount: _userActiveStakeCount, userStakeIdByIndex: _userStakeIdByIndex, stakeOwner: _stakeOwner, stakeAmount: _stakeAmount, stakeRoiBasisPoints: _stakeRoiBasisPoints, stakeKind: _stakeKind, stakeStartedAt: _stakeStartedAt, stakeDuration: _stakeDuration, stakeClaimedRewards: _stakeClaimedRewards, stakeActive: _stakeActive };
}

export function loadGetterTupleGramPadGramxStaking$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _gramxJettonMaster = source.readAddress();
    const _gramxJettonWallet = source.readAddress();
    const _jettonWalletConfigured = source.readBoolean();
    const _annualRoiBasisPoints = source.readBigNumber();
    const _sevenDaysRoiBasisPoints = source.readBigNumber();
    const _thirtyDaysRoiBasisPoints = source.readBigNumber();
    const _threeMonthsRoiBasisPoints = source.readBigNumber();
    const _nineMonthsRoiBasisPoints = source.readBigNumber();
    const _twelveMonthsRoiBasisPoints = source.readBigNumber();
    const _flexUnstakeFeeBasisPoints = source.readBigNumber();
    const _minStake = source.readBigNumber();
    const _paused = source.readBoolean();
    const _totalStaked = source.readBigNumber();
    const _rewardReserve = source.readBigNumber();
    const _totalRewardsPaid = source.readBigNumber();
    const _totalFeesCollected = source.readBigNumber();
    const _activeStakerCount = source.readBigNumber();
    const _nextTransferQueryId = source.readBigNumber();
    const _nextStakeId = source.readBigNumber();
    const _pendingStakeKind = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pendingStakeDuration = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userStakeCount = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userActiveStakeCount = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _userStakeIdByIndex = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeOwner = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _stakeAmount = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeRoiBasisPoints = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeKind = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeStartedAt = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeDuration = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeClaimedRewards = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _stakeActive = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'GramPadGramxStaking$Data' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, sevenDaysRoiBasisPoints: _sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints: _thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints: _threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints: _nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints: _twelveMonthsRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, nextTransferQueryId: _nextTransferQueryId, nextStakeId: _nextStakeId, pendingStakeKind: _pendingStakeKind, pendingStakeDuration: _pendingStakeDuration, userStakeCount: _userStakeCount, userActiveStakeCount: _userActiveStakeCount, userStakeIdByIndex: _userStakeIdByIndex, stakeOwner: _stakeOwner, stakeAmount: _stakeAmount, stakeRoiBasisPoints: _stakeRoiBasisPoints, stakeKind: _stakeKind, stakeStartedAt: _stakeStartedAt, stakeDuration: _stakeDuration, stakeClaimedRewards: _stakeClaimedRewards, stakeActive: _stakeActive };
}

export function storeTupleGramPadGramxStaking$Data(source: GramPadGramxStaking$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.deploymentId);
    builder.writeAddress(source.gramxJettonMaster);
    builder.writeAddress(source.gramxJettonWallet);
    builder.writeBoolean(source.jettonWalletConfigured);
    builder.writeNumber(source.annualRoiBasisPoints);
    builder.writeNumber(source.sevenDaysRoiBasisPoints);
    builder.writeNumber(source.thirtyDaysRoiBasisPoints);
    builder.writeNumber(source.threeMonthsRoiBasisPoints);
    builder.writeNumber(source.nineMonthsRoiBasisPoints);
    builder.writeNumber(source.twelveMonthsRoiBasisPoints);
    builder.writeNumber(source.flexUnstakeFeeBasisPoints);
    builder.writeNumber(source.minStake);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.totalStaked);
    builder.writeNumber(source.rewardReserve);
    builder.writeNumber(source.totalRewardsPaid);
    builder.writeNumber(source.totalFeesCollected);
    builder.writeNumber(source.activeStakerCount);
    builder.writeNumber(source.nextTransferQueryId);
    builder.writeNumber(source.nextStakeId);
    builder.writeCell(source.pendingStakeKind.size > 0 ? beginCell().storeDictDirect(source.pendingStakeKind, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.pendingStakeDuration.size > 0 ? beginCell().storeDictDirect(source.pendingStakeDuration, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.userStakeCount.size > 0 ? beginCell().storeDictDirect(source.userStakeCount, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.userActiveStakeCount.size > 0 ? beginCell().storeDictDirect(source.userActiveStakeCount, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.userStakeIdByIndex.size > 0 ? beginCell().storeDictDirect(source.userStakeIdByIndex, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.stakeOwner.size > 0 ? beginCell().storeDictDirect(source.stakeOwner, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.stakeAmount.size > 0 ? beginCell().storeDictDirect(source.stakeAmount, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.stakeRoiBasisPoints.size > 0 ? beginCell().storeDictDirect(source.stakeRoiBasisPoints, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.stakeKind.size > 0 ? beginCell().storeDictDirect(source.stakeKind, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.stakeStartedAt.size > 0 ? beginCell().storeDictDirect(source.stakeStartedAt, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.stakeDuration.size > 0 ? beginCell().storeDictDirect(source.stakeDuration, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.stakeClaimedRewards.size > 0 ? beginCell().storeDictDirect(source.stakeClaimedRewards, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.stakeActive.size > 0 ? beginCell().storeDictDirect(source.stakeActive, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    return builder.build();
}

export function dictValueParserGramPadGramxStaking$Data(): DictionaryValue<GramPadGramxStaking$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGramPadGramxStaking$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGramPadGramxStaking$Data(src.loadRef().beginParse());
        }
    }
}

 type GramPadGramxStaking_init_args = {
    $$type: 'GramPadGramxStaking_init_args';
    owner: Address;
    gramxJettonMaster: Address;
    annualRoiBasisPoints: bigint;
    sevenDaysRoiBasisPoints: bigint;
    thirtyDaysRoiBasisPoints: bigint;
    threeMonthsRoiBasisPoints: bigint;
    nineMonthsRoiBasisPoints: bigint;
    twelveMonthsRoiBasisPoints: bigint;
    minStake: bigint;
    flexUnstakeFeeBasisPoints: bigint;
    deploymentId: bigint;
}

function initGramPadGramxStaking_init_args(src: GramPadGramxStaking_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.gramxJettonMaster);
        b_0.storeInt(src.annualRoiBasisPoints, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.sevenDaysRoiBasisPoints, 257);
        b_1.storeInt(src.thirtyDaysRoiBasisPoints, 257);
        b_1.storeInt(src.threeMonthsRoiBasisPoints, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.nineMonthsRoiBasisPoints, 257);
        b_2.storeInt(src.twelveMonthsRoiBasisPoints, 257);
        b_2.storeInt(src.minStake, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.flexUnstakeFeeBasisPoints, 257);
        b_3.storeInt(src.deploymentId, 257);
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

async function GramPadGramxStaking_init(owner: Address, gramxJettonMaster: Address, annualRoiBasisPoints: bigint, sevenDaysRoiBasisPoints: bigint, thirtyDaysRoiBasisPoints: bigint, threeMonthsRoiBasisPoints: bigint, nineMonthsRoiBasisPoints: bigint, twelveMonthsRoiBasisPoints: bigint, minStake: bigint, flexUnstakeFeeBasisPoints: bigint, deploymentId: bigint) {
    const __code = Cell.fromHex('b5ee9c724102c101004529000114ff00f4a413f4bcf2c80b01020162025e0488d001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018f08db3c0bd15509db3ce30d1123965f0f5f0f5f05e01121d70d1ff2e082218210946a98b6ba7f80830303f68eed5b111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551ce02182107007f17abae302214e040502fc5b111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551cdb3c8200dba6f8416f24135f03c200f2f4264e044a82103140f226bae302218210bee64f35bae302218210df40f66ebae302218210dc4409afba06080a0e02f431fa00fa4030011122011123db3c815b50f8416f24135f038208989680bef2f48200a85f5623c200f2f482008438f8276f10f8416f24135f03a15624bef2f40111230111227070036d4313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00111f1121111f111e1120111e111d111f111d111c111e111c260701a4111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551d4e02f431fa00fa4030011122011123db3c817109f8416f24135f03821008f0d180bef2f4817d65561ef2f48200a85f5623c200f2f45622205612bc93305610de11115611a15623011112a1205614bc93305612de01111301a1112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c260902cc111b111d111b111a111c111a1119111b11191118111a111811171119111711161118111611151117111511141116111411131115111311141111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430db3c5b4e01f831fa40fa00fa4030112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0b02fe0d11220d0c11220c0b11220b0a11220a0911220908112208071122070611220605112205041122040311220302112202011123011124db3c817109f8416f24135f03821008f0d180bef2f48200c572f828562401c705b3f2f48200a85f5624c200f2f4821007270e007f70f8286d820898968070c8ca00c9d0104605112a05260c01f404112b04c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec90311230302112502011124017050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00111e1121111e111d1120111d111c111f111c111b111e111b111a111d111a1119111c11191118111b11181117111a11170d01dc1116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d10cf10be552ac87f01ca00112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed545c03fe8f7b31d307d31f308200b7905615b3f2f4815b50f8416f24135f038208989680bef2f48200abb722c000917f9322c001e2f2f40111220111235623db3cf8421d81010b51101125810101216e955b59f4593098c801cf004133f441e2102b81010b02011123011124810101216e955b59f4593098c801cf004133f441e2e021380f1001fa111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce0b0d108a107910681057104610354403024e044a821074146739bae302218210484c524fbae302218210c81c6299bae302218210ff8b4afaba1114171e01fc31fa4030112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781202fe106710561045103411224130db3c571e8148c0111db301111d01f2f4815b50f8416f24135f038208989680bef2f4111f1120111f111e111f111e111d111e111d7f111d111b111c111b111a111b111a1119111a1119111811191118111711181117111611171116111511161115111411151114111311141113111211131112261301b81111111211111110111111100f11100f10ef10de10cd10bc10ab109a1089107810671056104510344130c87f01ca00112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed545c01fc31d30f30112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781502fa106710561045103411224130db3c571757175717571757175717815b50f8416f24135f038208989680bef2f48200e52c561d820186a0bbf2f4561c561d561e561f5620112011211120111f1120111f111e111f111e111d111e111d111c111d111c04111c0403111b0302111a0201111901111804111704111511161115261601d81114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610355512c87f01ca00112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed545c047631d30fd30f30011122011123db3c815b50f8416f24135f038208989680bef2f45622db3c8200e52c5624820186a0bbf2f45622c007e3025622c01e2618191a00548200b28621c007917f9321c01ee2917f9321c05ae2917f952181010ebae292317f950181016dbae2f2f401d4571b5721111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c4e04fe8eee571a5721111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191119111a11191117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551de05622c05ae302112281010ebae3024e1b1c1d01d457195721111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c4e01dc5717111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171117111811171115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c4e01cc5716111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551d4e043ce302218210096819ffbae3022182100f474d03bae3022182107362d09cba1f22242801fc31d30f30112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910782002f8106710561045103411224130db3c5716815b50f8416f24135f038208989680bef2f48200b4385622811388bbf2f4112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a1119111811191118111711181117111611171116111411151114111311141113262101941112111311121111111211111110111111100f11100f550ec87f01ca00112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed545c01fc31d20030112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910782302f8106710561045103411224130db3c5714815b50f8416f24135f038208989680bef2f4112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a1119111811191118111711181117111611171116111511161115111411151114111211131112111111121111262701fc31fa4030112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910782502f8106710561045103411224130db3c5721815b50f8416f24135f038208989680bef2f4111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211112627001882008aabf8425623c705f2f4017c1110111111100f11100f550ec87f01ca00112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed545c03fe8f7b31d33f31fa00fa40817d65561ff2f48200c572f8425621c705f2f48142a623c200f2f4215623c7059520d749c1489170e2e3028200b7905616b3f2f4813168235618bef2f4112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119e021292b4301fc5b01111101a0111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a111811171119111711161118111611151117111511141116111411131115111311121114111211111113111111120f11110f0e11100e10df10ce10bd10ac109b108a10791068105710462a016c10354403c87f01ca00112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed545c03fe1118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209081122080711220706112206051122050411220403112203021122020111230111245623db3c20c204e3025625892c2d02f6305724112011231120111f1122111f111e1121111e111d1120111d111c111f111c111b111e111b111a111d111a1119111c11191118111b11181117111a11171116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d10cf552bdb3c5b4e02fcd749c148965625d74ac2009170e2971125d430d01125de5625d749c2478e5857252c81010b56258101014133f40a6fa19401d70030925b6de22c81010b56268101014133f40a6fa19401d70030925b6de28200d128226eb393216eb39170e2f2f45625500f81010bf459305625500e81010bf459300d0ee30d8200abb7222e2f00301125d31f8200e8ac0282104752414dba12f2f4d307d31f3001fec000917f9322c001e2f2f4112111231121112011221120111f1123111f111e1122111e111d1123111d111c1122111c111b1123111b111a1122111a1119112311191118112211181117112311171116112211161115112311151114112211141113112311131112112211121111112311111110112211100f11230f0e11220e3002fc0d11230d0c11220c0b11230b0a11220a09112309081122080711230706112206051123050411220403112303021122020111230111225622db3c2da4112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119111811221118111711221117383102f61116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e55c05626db3c29112011231120111f1122111f111e1121111e111d1123111d111c1122111c111b1121111b111a1123111a111911221119111811211118111711231117111611221116bc3202f81115112111151114112311141113112211131112112111121111112311111110112211100f11210f0e11230e0d11220d0c11210c0b11230b0a11220a091121090811230807112207061121060511230504112204031121030211230201112201112181010111245629562bdb3c3956240311230302112502195626018c3301fc216e955b59f45a3098c801cf004133f442e281010b1129a4102901112901562801810101216e955b59f4593098c801cf004133f441e281010b5621a41028562801810101216e955b59f4593098c801cf004133f441e21120930ba40bdf13810101015622011127206e953059f45a30944133f414e28101015412005622013401fc562601216e955b59f45a3098c801cf004133f442e222111d1120111d111c111f111c111b111e111b111a111d111a1119111c11191118111b11181117111a11171116111911161115111811151114111711141113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d10cf10be10ad109c3502fe108b107a10591078071126074650103403112503112681010111265623db3c365626031128030211270256234077216e955b59f45a3098c801cf004133f442e281010120103412562202112501216e955b59f45a3098c801cf004133f442e2810101f823211034562259216e955b59f45a3098c801cf004133f442e2810101364101f0112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d37046e0c11220c0b11220b0a11220a09112209112208070655405622db3c56228208093a80bae30256228208278d00bae3025622820876a700ba38393a3b00748200b286218208093a80ba917f97218208278d00bae2917f9721820876a700bae2917f9721820963f500bae292317f97018209e13380bae2f2f401fc5722561a112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab3d01fc57225619112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab3d03fce3021122820963f500bae3025616112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f3c3e4001fc57225618112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab3d0020109a108910781067105610451034413001fc5617112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a3f001c1089107810671056104510344130003410ef10de10cd10bc10ab109a108910781067105610451034413001fc200311260312562102112301216e955b59f45a3098c801cf004133f442e2810101702103112503562159216e955b59f45a3098c801cf004133f442e281010101111f7f71216e955b59f45a3098c801cf004133f442e211201ea0111b1121111b111a1120111a1119111f11191118111e11181117111d11171116111c111642019c1115111b11151114111a11141113111911131112111811121111111711111110111611100f11150f0e11140e11130c11120c0b11110b0a11100a109f108e107d106c105b104a10394870161513144e034c8210d53276dbbae3022182100d6eb785bae302018210efb89d8ebae3025f0f5f0f5f05f2c08244454f01f25b8200c572f842561ec705f2f4111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c4e01fe31d33f30811d69f8416f24135f03821008f0d180bef2f4f842112011211120111f1121111f111e1121111e111d1121111d111c1121111c111b1121111b111a1121111a1119112111191118112111181117112111171116112111161115112111151114112111141113112111131112112111121111112111111110112111104604f60f11210f0e11210e0d11210d0c11210c0b11210b0a11210a09112109081121080711210706112106051121050411210403112103021121020111210111228109d011245622db3c01112501f2f4815cdd11245622db3c5624c70501112501f2f4811a2b11245622db3c01112501f2f4112011211120111f1120111f678f974704fe111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e11235623db3cc001e3005623db3c81160521c200f2f4812268561422bef2f4a648934b01fa813dd4f823112111231121112011221120111f1123111f111e1122111e111d1123111d111c1122111c111b1123111b111a1122111a1119112311191118112211181117112311171116112211161115112311151114112211141113112311131112112211121111112311111110112211100f11230f0e11220e0d11230d4902fa0c11220c0b11230b0a11220a09112309081122080711230706112206051123050411220403112303021122020111230111225625db3c01112301be01112301f2f4111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a1118111711191117111611181116aa4a005c1115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551d01fe22112011231120111f1122111f111e1121111e111d1123111d111c1122111c111b1121111b111a1123111a1119112211191118112111181117112311171116112211161115112111151114112311141113112211131112112111121111112311111110112211100f11210f0e11230e0d11220d0c11210c0b11230b0a11220a4c02f4091121090811230807112207061121060511230504112204031121030211230201112201112181010111245626db3c6c125623a05624041123040311250302112702216e955b59f45a3098c801cf004133f442e20f5620a10e5620a0111e1123111e111d1122111d111c1121111c111b1120111b111a111f111ab04d02cc1119111e11191118111d11181117111c11171116111b11161115111a11151114111911141113111811131112111711121111111611111110111511100e11140e11130d11120d0c11110c0b11100b10af109e108d107c106b105a10491038470605034414db3c5b4e0164c87f01ca00112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed545c01fcd33f30817074f8416f24135f03821008f0d180bef2f4f842112011211120111f1121111f111e1121111e111d1121111d111c1121111c111b1121111b111a1121111a1119112111191118112111181117112111171116112111161115112111151114112111141113112111131112112111121111112111111110112111105004ea0f11210f0e11210e0d11210d0c11210c0b11210b0a11210a09112109081121080711210706112106051121050411210403112103021121020111210111228109d011245622db3c01112501f2f4815cdd11245622db3c5624c70501112501f2f4811a2b11245622db3c01112501f2f4f82311245622678f975103f6db3c01112501be11245622db3c813dd421c000917f925626e2f2f4112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119111811221118111711221117111611221116111511221115111411221114111311221113111211221112aaa65202f61111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405623db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119111811221118111711221117111611221116995303fc1115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405624db3c701125c000931127b393572770e2945616c2009170e29e572356215616a8812710a9041123de5626c200e30021112011221120935455003081226856135628bef2f411125626a111115626a01111111201f8111f1121111f111e1122111e111d1121111d111c1122111c111b1121111b111a1122111a1119112111191118112211181117112111171116112211161115112111151114112211141113112111131112112211121111112111111110112211100f11210f0e11220e0d11210d0c11220c0b11210b0a11220a091121095602f80811220807112107061122060511210504112204031121030211220201112101112281010111225626db3c6c125628a056220311240302112302562759216e955b59f45a3098c801cf004133f442e211115622a10e5623a0111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111ab05703fa1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411120e11130e1110111211100f11110f111010df10ce10bd10ac109b108a1079106810571046103544305625db3c20c2009130e30d8101015811257071216e955b59f45a3098c801cf004133f442e2bc5859004e81010b21a5102c562801810101216e955b59f4593098c801cf004133f441e20ac001930fa50fde01fc011121011122a1011124a08200b3e821c200f2f4111e1123111e111d1122111d111c1121111c111b1120111b111a111f111a1119111e11191118111d11181117111c11171116111b11161115111a11151114111911141113111811131112111711121111111611111110111511100f11140f0e11130e0d11120d0c11110c5a02960b11100b10af109e108d107c106b105a10491038476014db3cc87f01ca00112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed545b5c00b85610a4821007270e007ff8286d820898968070c8ca00c9d0061117065e34c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9562150337050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb0001f6011121011122ce01111f01cb3f01111d01ce01111b01ce01111901ca0001111701cb0f01111501cb0f01111301cb0f01111101cb0f1fcb0f1dcb0f1bcb0fc8500afa0218ca005006fa025004fa0258fa0201fa02cb1fcb3fcb3f12f40012f40012f40002c8f40013f40013f40003c8f40014f40014f40004c8f4005d001c15f40015f40015f400cdcd12cdcd0201205f6902014860630429b5081da89a1a400031e11b67817a2aa13b679c61b07f8083610190db3c5710571057105710571057105710571057105710571057105710571057105710571057105710571057105710571057105710571057105710571057105710571057105710551d620104db3cb804f5b59ffda89a1a400031e11b67817a2aa13b679c61a224222442242224022422240223e2240223e223c223e223c223a223c223a2238223a2238223622382236223422362234223222342232223022322230222e2230222e222c222e222c222a222c222a2228222a222822262228222622242226222422222224222307f808364013e1110111111100f11100f550edb3c6cbb6cbb3b3b3b3b3b3b3b3b3b3b3c6c1a6501f4112011221120111f1121111f111e1122111e111d1121111d111c1122111c111b1121111b111a1122111a1119112111191118112211181117112111171116112211161115112111151114112211141113112111131112112211121111112111111110112211100f11210f0e11220e0d11210d0c11220c0b11210b6602f60a11220a09112109081122080711210706112206051121050411220403112103021122020111210111228109d011225623db3c01112301f2f4112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a111811171119111711161118111667680020810101290259f40c6fa192306ddf6eb301601115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3c8d0201206a7a0201206b740201586c6f0429af57f6a268690000c7846d9e05e8aa84ed9e7186c07f80836d0110db3c6cf56cf56c456e0104db3cba04f5ae21f6a268690000c7846d9e05e8aa84ed9e7186889088918890889008910890088f8890888f888f0890088f088e888f888e888e088f088e088d888e888d888d088e088d088c888d888c888c088d088c088b888c888b888b088c088b088a888b888a888a088b088a0889888a88898889088a0889088888898888c07f80837001381110111211100f11110f0e11100e551ddb3c57105f0f57105f0f6c217101f0112111231121112011221120111f1123111f111e1122111e111d1123111d111c1122111c111b1123111b111a1122111a1119112311191118112211181117112311171116112211161115112311151114112211141113112311131112112211121111112311111110112211100f11230f0e11220e0d11230d7203fc0c11220c0b11230b0a11220a09112309081122080711230706112206051123050411220403112303021122020111230111225623db3c5623c2ff94562301b9923070e2f2e4952811248101011124db3c562303112503021124024133f40c6fa19401d70030925b6de28200ee8c216eb3f2f4112011221120111f1121111f898c7300f4111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443004f5b6165da89a1a400031e11b67817a2aa13b679c61a224222442242224022422240223e2240223e223c223e223c223a223c223a2238223a2238223622382236223422362234223222342232223022322230222e2230222e222c222e222c222a222c222a2228222a222822262228222622242226222422222224222307f80837501281110111111100f11100f550edb3c6cf36cf36c437601f0112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d7702f60c11220c0b11220b0a11220a09112209112208070655405622db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119111811221118111711221117111611221116111511221115111411221114111311221113111211221112897802fa1111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405623db3c0211240201112301112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a1118bc79009c1117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046103502016e7b7e0429ad2ef6a268690000c7846d9e05e8aa84ed9e7186c07f80837c0118db3c57105f0f57105f0f6c217d0004800b04f5af6976a268690000c7846d9e05e8aa84ed9e7186889088920890889008918890088f8891088f888f0890888f088e8890088e888e088f888e088d888f088d888d088e888d088c888e088c888c088d888c088b888d088b888b088c888b088a888c088a888a088b888a0889888b08898889088a88890888888a0888c07f8083860082fa40fa40810101d700d401d0810101d700810101d700810101d700d430d0810101d700810101d700810101d700d430d0810101d700810101d70030108b108a108901f26d6d6d6d6d6d6d6d6d6d6d6d6d8200e52c5616c2ff975616820186a0bb9170e2f2f4811b3e5615c2ff975615820186a0bb9170e2f2f48174375614c2ff975614820186a0bb9170e2f2f481081c5613c2ff975613820186a0bb9170e2f2f4817a805612c2ff975612820186a0bb9170e2f2f4816b8a5611c2ff8101fc975611820186a0bb9170e2f2f48200b4382f811388bbf2f481340d5610c200f2f45617707070547000207120091121091117112011171117111f111709111e0908111d081117111c111709111b0908111a081117111911170911180908111708091116090811150807111407061113060511120504111104031110034fed820004552901e0db3c5722112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e8401f6fa40d33ffa40fa40d200d30fd30fd30fd30fd30fd30fd30fd401d0fa00d200fa00fa00fa00fa00d31fd33fd33ff404f404f404d430d0f404f404f404d430d0f404f404f404d430d0f404f404f404f404301116112211161116112111161116112011161116111f11161116111e11161116111d11161116111c111685003c1116111b11161116111a111611161119111611161118111611161117111602fc1110111311100f11120f0e11110e0d11100d552cdb3c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c571c1115111b11151114111a111411131119111311121118111211111117111111101116111087c001f28200bdbc22c2fff2f4820083d621c2009321c1159170e2f2f4112111241121112011231120111f1122111f111e1124111e111d1123111d111c1122111c111b1124111b111a1123111a1119112211191118112411181117112311171116112211161115112411151114112311141113112211131112112411128803fe1111112311111110112211100f11240f0e11230e0d11220d0c11240c0b11230b0a11220a09112409081123080711220706112406051123050411220403112403021123020111220111245623db3c5623011126a0205626bc93305624de6d5624935302b98ae830112111231121112011221120111f1123111f111e1122111e898ab6003a81010b2c028101014133f40a6fa19401d70030925b6de2206e923070e001fe2b112011251120111f1124111f111e1123111e111d1122111d111c1121111c111b1125111b111a1124111a1119112311191118112211181117112111171116112511161115112411151114112311141113112211131112112111121111112511111110112411100f11230f0e11220e0d11210d0c11250c0b11240b0a11230a8b04f20911220908112108071125070611240605112305041122040311210302112502011124011123810101112356285626db3c562403112603021125024133f40c6fa19401d70030925b6de28200ee8c216eb3f2f481010156255628a102112502011124011125db3cc855a0db3cc90311270302112402011125018c8db3b40012c858cf16cb3fc9f90001f0112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d8e02f60c11220c0b11220b0a11220a09112209112208070655405622db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211128f90002c810101290259f40c6fa192306ddf8109d0216eb3f2f402f61111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405623db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119111811221118111711221117111611221116979102f61115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405624db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a999202f61119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405625db3c112111221121112011221120111f1122111f111e1122111e93a201f0f823112211231122112111231121112011231120111f1123111f111e1123111e111d1123111d111c1123111c111b1123111b111a1123111a1119112311191118112311181117112311171116112311161115112311151114112311141113112311131112112311121111112311111110112311100f11230f9404f80e11230e0d11230d0c11230c0b11230b0a11230a091123090811230807112307061123060511230504112304031123030211230201112301562301db3c1123db3c562321bbe30201112301a1112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a95b0a0a101f0112111231121112011221120111f1123111f111e1122111e111d1123111d111c1122111c111b1123111b111a1122111a1119112311191118112211181117112311171116112211161115112311151114112211141113112311131112112211121111112311111110112211100f11230f0e11220e0d11230d9604fc0c11220c0b11230b0a11220a09112309081122080711230706112206051123050411220403112303021122020111230111225623db3ce3035623db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211179798999a00368101012202714133f40c6fa19401d70030925b6de2206e923070e000de57225722111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551d700038810101530850334133f40c6fa19401d70030925b6de2206e923070e002f61116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405624db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111bac9b04fc111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405625db3c1126db3c011125011123a120c101945623c101e30dada39c9d00027f01fe917f945622c101e28e7030572157215722111d1121111d111c1120111c111b111f111b111a111e111a1119111d11191118111c11181117111b11171116111a11161115111911151114111811141113111711131112111611121111111511111110111411100f11130f0e11120e0d11110d0c11100c553b433070e0205626bc9e01fe9130925725e2011122011121a8812710a904011123a88209e13380a904111e1122111e111d1121111d111c1120111c111b111f111b111a111e111a1119111d11191118111c11181117111b11171116111a11161115111911151114111811141113111711131112111611121111111511111110111411100f11130f0e11120e9f00400d11110d0c11100c10bf10ae109d108c107b106a10591048103746501024102300e0305722112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e7000b41119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034413002f6111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405626db3ca3a40038810101530750334133f40c6fa19401d70030925b6de2206e923070e001f8112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220ca502fa0b11220b0a11220a09112209112208070655405627db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119111811221118111711221117111611221116111511221115111411221114111311221113111211221112111111221111a6a70038810101530650334133f40c6fa19401d70030925b6de2206e923070e002f61110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405628db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119111811221118111711221117111611221116111511221115aca802f61114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a09112209112208070655405629db3c112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a111911221119ada902f61118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a0911220911220807065540562adb3c112111221121112011221120111f1122111f111e1122111e111d1122111daaaf01f0112111221121112011221120111f1122111f111e1122111e111d1122111d111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220dab03fc0c11220c0b11220b0a11220a09112209112208070655405622db3c1123db3c01112301a0112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a1119111811191118111711181117111611171116111511161115111411151114111311141113acadae0038810101530550334133f40c6fa19401d70030925b6de2206e923070e00038810101530450334133f40c6fa19401d70030925b6de2206e923070e000601112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034413002fa111c1122111c111b1122111b111a1122111a1119112211191118112211181117112211171116112211161115112211151114112211141113112211131112112211121111112211111110112211100f11220f0e11220e0d11220d0c11220c0b11220b0a11220a0911220911220807065540562bdb3c0a112c0a09112b09b0b10038810101530350334133f40c6fa19401d70030925b6de2206e923070e001f408112a08071129070611280605112705041126040311250302112402011123011122112c11221121112b11211120112a1120111f1129111f111e1128111e111d1127111d111c1126111c111b1125111b111a1124111a1119112311191118112211181117112111171116112011161115111f11151114111e1114b2008c1113111d11131112111c11121111111b11111110111a11100f11190f0e11180e0d11170d0c11160c0b11150b0e11140e0d11130d0c11120c0b11110b0e11100e10df10ce10bd008450ab810101cf0018ce16ca0014810101cf0002c8810101cf00810101cf0012810101cf0002c8810101cf0013810101cf0013810101cf0003c8810101cf0013cdcdcd01fa206e953059f45a30944133f415e21123a4111f1124111f111e1123111e111d1122111d111c1121111c111b1120111b111a111f111a1119111e11191118111d11181117111c11171116111b11161115111a11151114111911141113111811131112111711121111111611111110111511100f11140f0e11130e0d11120db5003a0c11110c0b11100b10af109e108d107c106b105a10491038476015103401f8111d1123111d111c1122111c111b1123111b111a1122111a1119112311191118112211181117112311171116112211161115112311151114112211141113112311131112112211121111112311111110112211100f11230f0e11220e0d11230d0c11220c0b11230b0a11220a09112309081122080711230706112206b702fc05112305041122040311230302112202011123011122db3c112111311121112011301120111f112f111f111e112e111e111d112d111d111c112c111c111b112b111b111a112a111a111911291119111811281118111711271117111611261116111511251115111411241114111311231113111211221112111111311111b8b9005c2da5562201562201562201562201562201562201561d01561d01561d01561d01561d01561d01561d01561d01561c02f81110113011100f112f0f0e112e0e0d112d0d0c112c0c0b112b0b0a112a0a0911290908112808071127070611260605112505041124040311230302112202011131011130db3c112111261121112011251120111f1124111f111e1123111e111d1122111d111c1126111c111b1125111b111a1124111a111911231119babb0014561b561b561b561b561b02fe1118112211181117112611171116112511161115112411151114112311141113112211131112112611121111112511111110112411100f11230f0e11220e0d11260d0c11250c0b11240b0a11230a0911220908112608071125070611240605112305041122040311260302112502011124011123563adb3c01113b01563c01bcbd003a81010b2b028101014133f40a6fa19401d70030925b6de2206e923070e001f8563a01113eb9111b1136111b111a1135111a1119113411191118113311181117113211171116113111161115113011151114112f11141113112e11131112112d11121111112c11111110112b11100f112a0f0e11290e0d11380d0c11370c0b11240b0a11280a091127090811260807112507465004113d0403113b03be01fe02113a020111391123113d11231122113c11221121113b11211120113a1120111f1139111f111e1138111e111d1137111d111c1136111c111c1135111c111c1134111c111c1133111c111c1132111c111c1131111c111c1130111c111c112f111c111c112e111c111c112d111c111c112c111c111c112b111c111c112a111cbf0078111c1129111c111c1128111c111e1127111e111d1126111d112411251124111c1124111c111e1123111e111d1122111d111c1121111c111c111d111c00340f11150f0e11140e0d11130d0c11120c0b11110b0a11100a55593cfbabd7');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initGramPadGramxStaking_init_args({ $$type: 'GramPadGramxStaking_init_args', owner, gramxJettonMaster, annualRoiBasisPoints, sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints, minStake, flexUnstakeFeeBasisPoints, deploymentId })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const GramPadGramxStaking_errors = {
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
    2076: { message: "Invalid 3-month ROI" },
    2512: { message: "Stake not found" },
    5637: { message: "No rewards available" },
    6699: { message: "Stake not active" },
    6974: { message: "Invalid 7-day ROI" },
    7529: { message: "Not enough TON for claim gas" },
    8808: { message: "Reward reserve too low" },
    12648: { message: "Below minimum stake" },
    13325: { message: "Minimum stake required" },
    15828: { message: "Locked stake not mature" },
    17062: { message: "Invalid amount" },
    18624: { message: "Wallet already configured" },
    23376: { message: "Not enough TON for gas" },
    23773: { message: "Not stake owner" },
    27530: { message: "Invalid 12-month ROI" },
    28788: { message: "Not enough TON for unstake gas" },
    28937: { message: "Not enough TON for withdraw gas" },
    29751: { message: "Invalid 30-day ROI" },
    31360: { message: "Invalid 9-month ROI" },
    32101: { message: "Jetton wallet not configured" },
    33750: { message: "Invalid page size" },
    33848: { message: "Withdrawal exceeds TON balance" },
    35499: { message: "Only owner" },
    43103: { message: "Invalid withdrawal amount" },
    43959: { message: "Invalid stake kind" },
    45702: { message: "Invalid duration" },
    46056: { message: "Nothing to unstake" },
    46136: { message: "Fee too high" },
    46992: { message: "Staking paused" },
    48572: { message: "Invalid offset" },
    50546: { message: "Invalid Jetton wallet" },
    53544: { message: "Stake not configured" },
    56230: { message: "TON funding required" },
    58668: { message: "Invalid ROI" },
    59564: { message: "Invalid stake payload" },
    61068: { message: "Stake index not found" },
} as const

export const GramPadGramxStaking_errors_backward = {
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
    "Invalid 3-month ROI": 2076,
    "Stake not found": 2512,
    "No rewards available": 5637,
    "Stake not active": 6699,
    "Invalid 7-day ROI": 6974,
    "Not enough TON for claim gas": 7529,
    "Reward reserve too low": 8808,
    "Below minimum stake": 12648,
    "Minimum stake required": 13325,
    "Locked stake not mature": 15828,
    "Invalid amount": 17062,
    "Wallet already configured": 18624,
    "Not enough TON for gas": 23376,
    "Not stake owner": 23773,
    "Invalid 12-month ROI": 27530,
    "Not enough TON for unstake gas": 28788,
    "Not enough TON for withdraw gas": 28937,
    "Invalid 30-day ROI": 29751,
    "Invalid 9-month ROI": 31360,
    "Jetton wallet not configured": 32101,
    "Invalid page size": 33750,
    "Withdrawal exceeds TON balance": 33848,
    "Only owner": 35499,
    "Invalid withdrawal amount": 43103,
    "Invalid stake kind": 43959,
    "Invalid duration": 45702,
    "Nothing to unstake": 46056,
    "Fee too high": 46136,
    "Staking paused": 46992,
    "Invalid offset": 48572,
    "Invalid Jetton wallet": 50546,
    "Stake not configured": 53544,
    "TON funding required": 56230,
    "Invalid ROI": 58668,
    "Invalid stake payload": 59564,
    "Stake index not found": 61068,
} as const

const GramPadGramxStaking_types: ABIType[] = [
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
    {"name":"ConfigureStake","header":3695446447,"fields":[{"name":"stakeKind","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"durationSeconds","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"SetGramxJettonWallet","header":1947494201,"fields":[{"name":"gramxJettonWallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetAnnualRoi","header":1212961359,"fields":[{"name":"annualRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"SetDurationRoi","header":3357303449,"fields":[{"name":"durationDays","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"annualRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"SetFlexUnstakeFee","header":4287318778,"fields":[{"name":"flexUnstakeFeeBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"SetPaused","header":157817343,"fields":[{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ChangeOwner","header":256331011,"fields":[{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ClaimRewards","header":225359749,"fields":[{"name":"stakeId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"Unstake","header":4021853582,"fields":[{"name":"stakeId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FundContractTon","header":1879568762,"fields":[]},
    {"name":"OwnerWithdrawTon","header":826339878,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"OwnerWithdrawGramx","header":3202764597,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"OwnerWithdrawAnyJetton","header":3745576558,"fields":[{"name":"jettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonTransferNotification","header":1935855772,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonTransfer","header":260734629,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonExcesses","header":3576854235,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"ContractDetails","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"deploymentId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"gramxJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gramxJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonWalletConfigured","type":{"kind":"simple","type":"bool","optional":false}},{"name":"annualRoiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"flexUnstakeFeeBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"minStake","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"totalStaked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"rewardReserve","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalRewardsPaid","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalFeesCollected","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"activeStakerCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalStakePositions","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nextStakeId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"StakingPlans","header":null,"fields":[{"name":"sevenDaysRoiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"thirtyDaysRoiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"threeMonthsRoiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nineMonthsRoiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"twelveMonthsRoiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"UserSummary","header":null,"fields":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalStakePositions","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"activeStakePositions","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"StakeDetails","header":null,"fields":[{"name":"stakeId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"active","type":{"kind":"simple","type":"bool","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"pendingReward","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"roiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"stakeKind","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"startedAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"duration","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"maturityAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"claimedRewards","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"StakingDashboard","header":null,"fields":[{"name":"contractDetails","type":{"kind":"simple","type":"ContractDetails","optional":false}},{"name":"stakingPlans","type":{"kind":"simple","type":"StakingPlans","optional":false}},{"name":"userSummary","type":{"kind":"simple","type":"UserSummary","optional":false}},{"name":"offset","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nextOffset","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"hasMore","type":{"kind":"simple","type":"bool","optional":false}},{"name":"positions","type":{"kind":"dict","key":"int","value":"StakeDetails","valueFormat":"ref"}}]},
    {"name":"GramPadGramxStaking$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"deploymentId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"gramxJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gramxJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonWalletConfigured","type":{"kind":"simple","type":"bool","optional":false}},{"name":"annualRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"sevenDaysRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"thirtyDaysRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"threeMonthsRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"nineMonthsRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"twelveMonthsRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"flexUnstakeFeeBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"minStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"totalStaked","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardReserve","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalRewardsPaid","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalFeesCollected","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"activeStakerCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"nextTransferQueryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nextStakeId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"pendingStakeKind","type":{"kind":"dict","key":"address","value":"int"}},{"name":"pendingStakeDuration","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userStakeCount","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userActiveStakeCount","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userStakeIdByIndex","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeOwner","type":{"kind":"dict","key":"int","value":"address"}},{"name":"stakeAmount","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeRoiBasisPoints","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeKind","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeStartedAt","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeDuration","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeClaimedRewards","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeActive","type":{"kind":"dict","key":"int","value":"bool"}}]},
]

const GramPadGramxStaking_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ConfigureStake": 3695446447,
    "SetGramxJettonWallet": 1947494201,
    "SetAnnualRoi": 1212961359,
    "SetDurationRoi": 3357303449,
    "SetFlexUnstakeFee": 4287318778,
    "SetPaused": 157817343,
    "ChangeOwner": 256331011,
    "ClaimRewards": 225359749,
    "Unstake": 4021853582,
    "FundContractTon": 1879568762,
    "OwnerWithdrawTon": 826339878,
    "OwnerWithdrawGramx": 3202764597,
    "OwnerWithdrawAnyJetton": 3745576558,
    "JettonTransferNotification": 1935855772,
    "JettonTransfer": 260734629,
    "JettonExcesses": 3576854235,
}

const GramPadGramxStaking_getters: ABIGetter[] = [
    {"name":"get_contract_version","methodId":127581,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_contract_details","methodId":67648,"arguments":[],"returnType":{"kind":"simple","type":"ContractDetails","optional":false}},
    {"name":"get_staking_plans","methodId":104111,"arguments":[],"returnType":{"kind":"simple","type":"StakingPlans","optional":false}},
    {"name":"get_user_summary","methodId":110770,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"UserSummary","optional":false}},
    {"name":"get_user_stake_id_by_index","methodId":105539,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"index","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_stake_details","methodId":77055,"arguments":[{"name":"stakeId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"StakeDetails","optional":false}},
    {"name":"get_staking_dashboard","methodId":130770,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"offset","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"limit","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"StakingDashboard","optional":false}},
]

export const GramPadGramxStaking_getterMapping: { [key: string]: string } = {
    'get_contract_version': 'getGetContractVersion',
    'get_contract_details': 'getGetContractDetails',
    'get_staking_plans': 'getGetStakingPlans',
    'get_user_summary': 'getGetUserSummary',
    'get_user_stake_id_by_index': 'getGetUserStakeIdByIndex',
    'get_stake_details': 'getGetStakeDetails',
    'get_staking_dashboard': 'getGetStakingDashboard',
}

const GramPadGramxStaking_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"FundContractTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"OwnerWithdrawTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"OwnerWithdrawGramx"}},
    {"receiver":"internal","message":{"kind":"typed","type":"OwnerWithdrawAnyJetton"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ConfigureStake"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetGramxJettonWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetAnnualRoi"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetDurationRoi"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetFlexUnstakeFee"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPaused"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonTransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonExcesses"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimRewards"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Unstake"}},
]


export class GramPadGramxStaking implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = GramPadGramxStaking_errors_backward;
    public static readonly opcodes = GramPadGramxStaking_opcodes;
    
    static async init(owner: Address, gramxJettonMaster: Address, annualRoiBasisPoints: bigint, sevenDaysRoiBasisPoints: bigint, thirtyDaysRoiBasisPoints: bigint, threeMonthsRoiBasisPoints: bigint, nineMonthsRoiBasisPoints: bigint, twelveMonthsRoiBasisPoints: bigint, minStake: bigint, flexUnstakeFeeBasisPoints: bigint, deploymentId: bigint) {
        return await GramPadGramxStaking_init(owner, gramxJettonMaster, annualRoiBasisPoints, sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints, minStake, flexUnstakeFeeBasisPoints, deploymentId);
    }
    
    static async fromInit(owner: Address, gramxJettonMaster: Address, annualRoiBasisPoints: bigint, sevenDaysRoiBasisPoints: bigint, thirtyDaysRoiBasisPoints: bigint, threeMonthsRoiBasisPoints: bigint, nineMonthsRoiBasisPoints: bigint, twelveMonthsRoiBasisPoints: bigint, minStake: bigint, flexUnstakeFeeBasisPoints: bigint, deploymentId: bigint) {
        const __gen_init = await GramPadGramxStaking_init(owner, gramxJettonMaster, annualRoiBasisPoints, sevenDaysRoiBasisPoints, thirtyDaysRoiBasisPoints, threeMonthsRoiBasisPoints, nineMonthsRoiBasisPoints, twelveMonthsRoiBasisPoints, minStake, flexUnstakeFeeBasisPoints, deploymentId);
        const address = contractAddress(0, __gen_init);
        return new GramPadGramxStaking(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new GramPadGramxStaking(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  GramPadGramxStaking_types,
        getters: GramPadGramxStaking_getters,
        receivers: GramPadGramxStaking_receivers,
        errors: GramPadGramxStaking_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: Deploy | FundContractTon | OwnerWithdrawTon | OwnerWithdrawGramx | OwnerWithdrawAnyJetton | ConfigureStake | SetGramxJettonWallet | SetAnnualRoi | SetDurationRoi | SetFlexUnstakeFee | SetPaused | ChangeOwner | JettonTransferNotification | JettonExcesses | ClaimRewards | Unstake) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'FundContractTon') {
            body = beginCell().store(storeFundContractTon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'OwnerWithdrawTon') {
            body = beginCell().store(storeOwnerWithdrawTon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'OwnerWithdrawGramx') {
            body = beginCell().store(storeOwnerWithdrawGramx(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'OwnerWithdrawAnyJetton') {
            body = beginCell().store(storeOwnerWithdrawAnyJetton(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ConfigureStake') {
            body = beginCell().store(storeConfigureStake(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetGramxJettonWallet') {
            body = beginCell().store(storeSetGramxJettonWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetAnnualRoi') {
            body = beginCell().store(storeSetAnnualRoi(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetDurationRoi') {
            body = beginCell().store(storeSetDurationRoi(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetFlexUnstakeFee') {
            body = beginCell().store(storeSetFlexUnstakeFee(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPaused') {
            body = beginCell().store(storeSetPaused(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeOwner') {
            body = beginCell().store(storeChangeOwner(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonTransferNotification') {
            body = beginCell().store(storeJettonTransferNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonExcesses') {
            body = beginCell().store(storeJettonExcesses(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimRewards') {
            body = beginCell().store(storeClaimRewards(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Unstake') {
            body = beginCell().store(storeUnstake(message)).endCell();
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
    
    async getGetStakingPlans(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_staking_plans', builder.build())).stack;
        const result = loadGetterTupleStakingPlans(source);
        return result;
    }
    
    async getGetUserSummary(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_summary', builder.build())).stack;
        const result = loadGetterTupleUserSummary(source);
        return result;
    }
    
    async getGetUserStakeIdByIndex(provider: ContractProvider, user: Address, index: bigint) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        builder.writeNumber(index);
        const source = (await provider.get('get_user_stake_id_by_index', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetStakeDetails(provider: ContractProvider, stakeId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(stakeId);
        const source = (await provider.get('get_stake_details', builder.build())).stack;
        const result = loadGetterTupleStakeDetails(source);
        return result;
    }
    
    async getGetStakingDashboard(provider: ContractProvider, user: Address, offset: bigint, limit: bigint) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        builder.writeNumber(offset);
        builder.writeNumber(limit);
        const source = (await provider.get('get_staking_dashboard', builder.build())).stack;
        const result = loadGetterTupleStakingDashboard(source);
        return result;
    }
    
}