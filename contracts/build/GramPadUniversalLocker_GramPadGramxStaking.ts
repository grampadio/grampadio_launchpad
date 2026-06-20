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

export type GramPadGramxStaking$Data = {
    $$type: 'GramPadGramxStaking$Data';
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
        b_0.storeUint(src.flexUnstakeFeeBasisPoints, 16);
        b_0.storeCoins(src.minStake);
        const b_1 = new Builder();
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
    const _flexUnstakeFeeBasisPoints = sc_0.loadUintBig(16);
    const _minStake = sc_0.loadCoins();
    const sc_1 = sc_0.loadRef().beginParse();
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
    return { $$type: 'GramPadGramxStaking$Data' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, nextTransferQueryId: _nextTransferQueryId, nextStakeId: _nextStakeId, pendingStakeKind: _pendingStakeKind, pendingStakeDuration: _pendingStakeDuration, userStakeCount: _userStakeCount, userActiveStakeCount: _userActiveStakeCount, userStakeIdByIndex: _userStakeIdByIndex, stakeOwner: _stakeOwner, stakeAmount: _stakeAmount, stakeRoiBasisPoints: _stakeRoiBasisPoints, stakeKind: _stakeKind, stakeStartedAt: _stakeStartedAt, stakeDuration: _stakeDuration, stakeClaimedRewards: _stakeClaimedRewards, stakeActive: _stakeActive };
}

export function loadTupleGramPadGramxStaking$Data(source: TupleReader) {
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
    source = source.readTuple();
    const _stakeActive = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'GramPadGramxStaking$Data' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, nextTransferQueryId: _nextTransferQueryId, nextStakeId: _nextStakeId, pendingStakeKind: _pendingStakeKind, pendingStakeDuration: _pendingStakeDuration, userStakeCount: _userStakeCount, userActiveStakeCount: _userActiveStakeCount, userStakeIdByIndex: _userStakeIdByIndex, stakeOwner: _stakeOwner, stakeAmount: _stakeAmount, stakeRoiBasisPoints: _stakeRoiBasisPoints, stakeKind: _stakeKind, stakeStartedAt: _stakeStartedAt, stakeDuration: _stakeDuration, stakeClaimedRewards: _stakeClaimedRewards, stakeActive: _stakeActive };
}

export function loadGetterTupleGramPadGramxStaking$Data(source: TupleReader) {
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
    return { $$type: 'GramPadGramxStaking$Data' as const, owner: _owner, deploymentId: _deploymentId, gramxJettonMaster: _gramxJettonMaster, gramxJettonWallet: _gramxJettonWallet, jettonWalletConfigured: _jettonWalletConfigured, annualRoiBasisPoints: _annualRoiBasisPoints, flexUnstakeFeeBasisPoints: _flexUnstakeFeeBasisPoints, minStake: _minStake, paused: _paused, totalStaked: _totalStaked, rewardReserve: _rewardReserve, totalRewardsPaid: _totalRewardsPaid, totalFeesCollected: _totalFeesCollected, activeStakerCount: _activeStakerCount, nextTransferQueryId: _nextTransferQueryId, nextStakeId: _nextStakeId, pendingStakeKind: _pendingStakeKind, pendingStakeDuration: _pendingStakeDuration, userStakeCount: _userStakeCount, userActiveStakeCount: _userActiveStakeCount, userStakeIdByIndex: _userStakeIdByIndex, stakeOwner: _stakeOwner, stakeAmount: _stakeAmount, stakeRoiBasisPoints: _stakeRoiBasisPoints, stakeKind: _stakeKind, stakeStartedAt: _stakeStartedAt, stakeDuration: _stakeDuration, stakeClaimedRewards: _stakeClaimedRewards, stakeActive: _stakeActive };
}

export function storeTupleGramPadGramxStaking$Data(source: GramPadGramxStaking$Data) {
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
        b_1.storeInt(src.minStake, 257);
        b_1.storeInt(src.flexUnstakeFeeBasisPoints, 257);
        b_1.storeInt(src.deploymentId, 257);
        b_0.storeRef(b_1.endCell());
    };
}

async function GramPadGramxStaking_init(owner: Address, gramxJettonMaster: Address, annualRoiBasisPoints: bigint, minStake: bigint, flexUnstakeFeeBasisPoints: bigint, deploymentId: bigint) {
    const __code = Cell.fromHex('b5ee9c7241026e0100265b000114ff00f4a413f4bcf2c80b01020162023204d8d001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018ea8fa40fa40810101d700d401d0810101d700810101d700810101d7003010361035103406d15504db3ce30d111e945f0f5f0fe0111cd70d1ff2e082218210946a98b6bae3022182107007f17aba696b0304019e5b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3c3004ea8f605b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551ddb3c8200dba6f8416f24135f03c200f2f4db3ce0218210dc4409afbae30221821074146739ba1330050801ec31d307d31f308200b7905615b3f2f4815b50f8416f24135f038208989680bef2f48200abb722c000917f9322c001e2f2f48200b286218208093a80ba917f97218208278d00bae2917f9721820876a700bae2917f9721820963f500bae2917f97218209e13380bae2f2f4f8421d81010b5420048101010601fc216e955b59f4593098c801cf004133f441e2102b81010b400d810101216e955b59f4593098c801cf004133f441e2111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd07012810ac0b108a10791068105710461035440302db3c30043ce302218210484c524fbae302218210ff8b4afabae302218210096819ffba090b0d0f02fe31fa4030111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034111d4130db3c57198148c01118b301111801f2f4815b50130a01dcf8416f24135f038208989680bef2f4111a111b111a1119111a11191118111911187f11181116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a1089107810671056104510344130db3c3002fe31d30f30111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034111d4130db3c5717815b50f8416f24135f038208989680130c01b4bef2f48200e52c561d820186a0bbf2f4111b111c111b111a111b111a1119111a11191118111911181117111811171115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c3002fe31d30f30111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034111d4130db3c5716815b50f8416f24135f038208989680130e01b2bef2f48200b438561d811388bbf2f4111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161114111511141113111411131112111311121111111211111110111111100f11100f550edb3c30043ce3022182100f474d03bae3022182107362d09cbae3022182100d6eb785ba1012151f02fe31d20030111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034111d4130db3c5714815b50f8416f24135f0382089896801311019abef2f4111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141112111311121111111211111110111111100f11100f550edb3c3002fe31fa4030111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034111d4130db3c571c815b50f8416f24135f0382089896801314001882008aabf842561ec705f2f4019abef2f4111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c3002fa31d33f31fa00fa4030817d655619f2f48200c572f842561bc705f2f48142a622c200f2f420561dc705e3028200b7905615b3f2f4813168225617bef2f42c81010b228101014133f40a6fa19401d70030925b6de22c81010b238101014133f40a6fa19401d70030925b6de28200d128226eb393216eb39170e2f2f4522f161701cc3001111101a0111a111c111a1119111b11191118111a111811171119111711161118111611151117111511141116111411131115111311121114111211111113111111120f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430db3c3001fc81010bf45930522e81010bf459302fa4111c111f111c111b111e111b111a111d111a1119111f11191118111e11181117111d11171116111f11161115111e11151114111d11141113111f11131112111e11121111111d11111110111f11100f111e0f0e111d0e0d0c111d0c50ba09111d09508706111d06505403111d03121803fe011120011121561ddb3c111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d0807065540561edb3c64661901fa29111b111e111b111a111d111a1119111c11191118111e11181117111d11171116111c11161115111e11151114111d11141113111c11131112111e11121111111d11111110111c11100f111e0f0e111d0e0d111c0d0c111e0c0b111d0b0a111c0a09111e0908111d0807111c0706111e0605111d0504111c0403111e031a03fe02111d0201111c01111e810101111e56215621db3c39561e0311200302111f0219562401216e955b59f45a3098c801cf004133f442e281010b111fa4102901111f01562001810101216e955b59f4593098c801cf004133f441e281010b561ba41028562001810101216e955b59f4593098c801cf004133f441e2111ae301135f1b1c00060ba40b01fe81010101562001111f206e953059f45a30944133f414e2810101541200562001562301216e955b59f45a3098c801cf004133f442e2810101541300562001561501216e955b59f45a3098c801cf004133f442e28101012003111e0312562002112201216e955b59f45a3098c801cf004133f442e2810101f8232110375620591d01f6216e955b59f45a3098c801cf004133f442e28101012003111b0312561f02111f01216e955b59f45a3098c801cf004133f442e2810101702103111a03561f59216e955b59f45a3098c801cf004133f442e281010101111d7f71216e955b59f45a3098c801cf004133f442e2111d1ba01113111c11131112111b11121e01881111111a11111110111911100f11180f0e11170e0d11160d0c11150c0b11140b1113091112090811110807111007106f105e104d103c102b10295e25104645404330db3c3002fe8efd31d33f30811d69f8416f24135f03821008f0d180bef2f4f842111b111c111b111a111c111a1119111c11191118111c11181117111c11171116111c11161115111c11151114111c11141113111c11131112111c11121111111c11111110111c11100f111c0f0e111c0e0d111c0d0c111c0c0b111c0b0a111c0a09111c09202604fa08111c0807111c0706111c0605111c0504111c0403111c0302111c0201111c01111d8109d0111f561ddb3c01112001f2f4815cdd111f561ddb3c561fc70501112001f2f4811a2b111f561ddb3c01112001f2f4111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611153a3b432104f41114111511141113111411131112111311121111111211111110111111100f11100f550e111e561edb3cc001e300561edb3c81160521c200f2f4812268561422bef2f422111b111e111b111a111d111a1119111c11191118111e11181117111d11171116111c11161115111e11151114111d11141113111c11134e223f2401fe813dd4f823111c111e111c111b111d111b111a111e111a1119111d11191118111e11181117111d11171116111e11161115111d11151114111e11141113111d11131112111e11121111111d11111110111e11100f111d0f0e111e0e0d111d0d0c111e0c0b111d0b0a111e0a09111d0908111e0807111d0706111e0605111d052301da04111e0403111d0302111e0201111d01111e5620db3c01111f01be01111d01f2f4111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e551d5202fe1112111e11121111111d11111110111c11100f111e0f0e111d0e0d111c0d0c111e0c0b111d0b0a111c0a09111e0908111d0807111c0706111e0605111d0504111c0403111e0302111d0201111c01111e810101111e5621db3c6c12561da0561e0411200403111f0302112202216e955b59f45a3098c801cf004133f442e20f572502de561aa10e561aa01119111e11191118111d11181117111c11171116111b11161115111a11151114111911141113111811131112111711121111111611111110111511100e11140e11130d11120d0c11110c0b11100b10af109e108d107c106b105a10491038476010354400db3cdb3c2f300124e0018210efb89d8ebae3025f0f5f0ff2c0822701f8d33f30817074f8416f24135f03821008f0d180bef2f4f842111b111c111b111a111c111a1119111c11191118111c11181117111c11171116111c11161115111c11151114111c11141113111c11131112111c11121111111c11111110111c11100f111c0f0e111c0e0d111c0d0c111c0c0b111c0b0a111c0a09111c092804b208111c0807111c0706111c0605111c0504111c0403111c0302111c0201111c01111d8109d0111f561ddb3c01112001f2f4815cdd111f561ddb3c561fc70501112001f2f4811a2b111f561ddb3c01112001f2f4f823111f561d3a3b432903fadb3c01112001be111f561ddb3c813dd421c000917f925621e2f2f4111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b524e2a02fe0a111d0a09111d09111d0807065540561edb3c111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d442b04dc0807065540561fdb3c701120c000931122b393572270e2945616c2009170e29e571e561c5616a8812710a904111ede5621c2008e1881226856135623bef2f411125621a111115621a011111112de1113561da11110561ea0111011135620db3c20c2009130e30d810101562070713f662c2d004e81010b21a5102c562301810101216e955b59f4593098c801cf004133f441e20ac001930fa50fde01fa216e955b59f45a3098c801cf004133f442e281010170211039562259216e955b59f45a3098c801cf004133f442e28101017054120202112202216e955b59f45a3098c801cf004133f442e201111c01111da101111fa08200b3e821c200f2f41119111e11191118111d11181117111c11171116111b11161115111a11152e02901114111911141113111811131112111711121111111611111110111511100f11140f0e11130e0d11120d0c11110c0b11100b10af109e108d107c106b105a104947605e21db3cdb3c2f3000b85610a4821007270e007ff8286d820898968070c8ca00c9d0061117065e34c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9561c50337050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb000146c87f01ca00111d111c111b111a111911181117111611151114111311121111111055e03100ec01111c01111dce01111a01cb3f01111801ce01111601ce01111401ca0001111201cb0f01111001cb0f500efa020cc8ca00500bfa025009fa025007fa025005fa0213cb1fcb3fcb3ff400f400f40001c8f40013f40013f40003c8f40014f40014f40004c8f40015f40015f40015f400cdcdcdcdc9ed540201203359020148343603e5b5081da89a1a400031d51f481f481020203ae01a803a1020203ae01020203ae01020203ae0060206c206a20680da2aa09b679c61bb678ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ae20ab850696b35005c2da5561d01561d01561d01561d01561d01561d01561d01561d01561d01561d01561d01561d01561d01561d01561c03f9b59ffda89a1a400031d51f481f481020203ae01a803a1020203ae01020203ae01020203ae0060206c206a20680da2aa09b679c61a2238223a2238223622382236223422362234223222342232223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422230696b3701281110111111100f11100f550edb3c6cbb6cbb6c7b3801f0111b111d111b111a111c111a1119111d11191118111c11181117111d11171116111c11161115111d11151114111c11141113111d11131112111c11121111111d11111110111c11100f111d0f0e111c0e0d111d0d0c111c0c0b111d0b0a111c0a09111d0908111c0807111d0706111c0605111d0504111c043903fa03111d0302111c0201111d01111c8109d0111e561ddb3c01111f01f2f4111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e111d561ddb3c111c111d111c111b111d111b3a3b3c0020810101290259f40c6fa192306ddf6eb3002c810101290259f40c6fa192306ddf8109d0216eb3f2f402f6111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d0807065540561edb3c111c111d111c111b111d111b111a111d111a433d02f61119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d0807065540561fdb3c111c111d111c111b111d111b111a111d111a1119111d1119443e02f61118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d08070655405620db3c111c111d111c111b111d111b111a111d111a1119111d11191118111d11183f4b01f4f823111d111e111d111c111e111c111b111e111b111a111e111a1119111e11191118111e11181117111e11171116111e11161115111e11151114111e11141113111e11131112111e11121111111e11111110111e11100f111e0f0e111e0e0d111e0d0c111e0c0b111e0b0a111e0a09111e0908111e0807111e074003fe06111e0605111e0504111e0403111e0302111e0201111e01561e01db3c111edb3c561e21bb8e5230571d111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e70e001111e01a141574a01f4111c111e111c111b111d111b111a111e111a1119111d11191118111e11181117111d11171116111e11161115111d11151114111e11141113111d11131112111e11121111111d11111110111e11100f111d0f0e111e0e0d111d0d0c111e0c0b111d0b0a111e0a09111d0908111e0807111d0706111e0605111d054203f804111e0403111d0302111e0201111d01111e561ddb3c8e53571d571d111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c70e1561ddb3c111c111d111c111b111d111b43444500368101012202714133f40c6fa19401d70030925b6de2206e923070e00038810101530850334133f40c6fa19401d70030925b6de2206e923070e002f6111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d0807065540561edb3c111c111d111c111b111d111b111a111d111a534604fa1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d0807065540561fdb3c1120db3c01112101111ea120c101917f94561ec101e2917fe30e544c47480008561dc10101f48e5030571c571c571c1118111c11181117111b11171116111a11161115111911151114111811141113111711131112111611121111111511111110111411100f11130f0e11120e0d11110d0c11100c553b70e0205620bc913092571fe201111d01111ca8812710a90401111da88209e13380a9041119111d11194900b41118111c11181117111b11171116111a11161115111911151114111811141113111711131112111611121111111511111110111411100f11130f0e11120e0d11110d0c11100c10bf10ae109d108c107b106a105910481037465000d8111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034413002f61117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d08070655405621db3c111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11174c4d0038810101530750334133f40c6fa19401d70030925b6de2206e923070e002f61116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d08070655405622db3c111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11164e4f0038810101530650334133f40c6fa19401d70030925b6de2206e923070e002f61115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d08070655405623db3c111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d1115535002f61114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d08070655405624db3c111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d1114545102f61113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d08070655405625db3c111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d1113525603f2111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d0807065540561ddb3c111edb3c5354550038810101530550334133f40c6fa19401d70030925b6de2206e923070e00038810101530450334133f40c6fa19401d70030925b6de2206e923070e000e201111e01a0111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a108910781067105610451034413002fe1112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d08070655405626db3c0a11270a0911260908112508071124070611230605112205041121040311200302111f0201111e01111d1127111d111c1126111c111b1125111b111a1124111a11191123111957580038810101530350334133f40c6fa19401d70030925b6de2206e923070e000dc1118112211181117112111171116112011161115111f11151114111e11141113111d11131112111c11121111111b11111110111a11100f11190f0e11180e0d11170d0c11160c0b11150b1113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc0201205a680201205b6103f9b7887da89a1a400031d51f481f481020203ae01a803a1020203ae01020203ae01020203ae0060206c206a20680da2aa09b679c61a2238223c22382236223a2236223422382234223222362232223022342230222e2232222e222c2230222c222a222e222a2228222c22282226222a22262224222822242222222622230696b5c01341110111211100f11110f0e11100e10df551cdb3c57105f0f6cd15d01f4111c111e111c111b111d111b111a111e111a1119111d11191118111e11181117111d11171116111e11161115111d11151114111e11141113111d11131112111e11121111111d11111110111e11100f111d0f0e111e0e0d111d0d0c111e0c0b111d0b0a111e0a09111d0908111e0807111d0706111e0605111d055e03f804111e0403111d0302111e0201111d01111e561ddb3c561fc2ff94561f01b9923070e2f2e49528111e8101011120db3c561f03111f03021120024133f40c6fa19401d70030925b6de28200ee8c216eb3f2f4111b111d111b111a111c111a1119111b11191118111a1118111711191117111611181116111511171115645f600012c858cf16cb3fc9f900007c1114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443003f9b6165da89a1a400031d51f481f481020203ae01a803a1020203ae01020203ae01020203ae0060206c206a20680da2aa09b679c61a2238223a2238223622382236223422362234223222342232223022322230222e2230222e222c222e222c222a222c222a2228222a22282226222822262224222622242222222422230696b6201241110111111100f11100f550edb3c6cf36ce36302f6111c111d111c111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d0807065540561ddb3c111c111d111c6465003a81010b2c028101014133f40a6fa19401d70030925b6de2206e923070e002fa111b111d111b111a111d111a1119111d11191118111d11181117111d11171116111d11161115111d11151114111d11141113111d11131112111d11121111111d11111110111d11100f111d0f0e111d0e0d111d0d0c111d0c0b111d0b0a111d0a09111d09111d0807065540561edb3c02111f0201111e01111d111f111d6667003a81010b2b028101014133f40a6fa19401d70030925b6de2206e923070e000dc111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046103510340379bb25ded44d0d200018ea8fa40fa40810101d700d401d0810101d700810101d700810101d7003010361035103406d15504db3ce30ddb3c57105f0f6cd18696b6d01f66d6d6d6d6d6d6d6d6d6d6d6d6d8200e52c5611c2ff975611820186a0bb9170e2f2f48200b4382f811388bbf2f481340d5610c200f2f4561270707054700020712009111c091117111b11171117111a11170911190908111808081116080911150907111407061113060511120504111104031110034fed5e38107a6a0016106910581047103645330401fefa40d33ffa40fa40d200d30fd30ffa00d401d0d200fa00fa00fa00fa00d31fd33fd33ff404f404f404d430d0f404f404f404d430d0f404f404f404d430d0f404f404f404f404301115111d11151115111c11151115111b11151115111a1115111511191115111511181115111511171115111511161115571d111b111c111b6c0090111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e0002738e620d11');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initGramPadGramxStaking_init_args({ $$type: 'GramPadGramxStaking_init_args', owner, gramxJettonMaster, annualRoiBasisPoints, minStake, flexUnstakeFeeBasisPoints, deploymentId })(builder);
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
    2512: { message: "Stake not found" },
    5637: { message: "No rewards available" },
    6699: { message: "Stake not active" },
    7529: { message: "Not enough TON for claim gas" },
    8808: { message: "Reward reserve too low" },
    12648: { message: "Below minimum stake" },
    13325: { message: "Minimum stake required" },
    15828: { message: "Locked stake not mature" },
    17062: { message: "Invalid amount" },
    18624: { message: "Wallet already configured" },
    23376: { message: "Not enough TON for gas" },
    23773: { message: "Not stake owner" },
    28788: { message: "Not enough TON for unstake gas" },
    32101: { message: "Jetton wallet not configured" },
    35499: { message: "Only owner" },
    43959: { message: "Invalid stake kind" },
    45702: { message: "Invalid duration" },
    46056: { message: "Nothing to unstake" },
    46136: { message: "Fee too high" },
    46992: { message: "Staking paused" },
    50546: { message: "Invalid Jetton wallet" },
    53544: { message: "Stake not configured" },
    56230: { message: "TON funding required" },
    58668: { message: "Invalid ROI" },
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
    "Stake not found": 2512,
    "No rewards available": 5637,
    "Stake not active": 6699,
    "Not enough TON for claim gas": 7529,
    "Reward reserve too low": 8808,
    "Below minimum stake": 12648,
    "Minimum stake required": 13325,
    "Locked stake not mature": 15828,
    "Invalid amount": 17062,
    "Wallet already configured": 18624,
    "Not enough TON for gas": 23376,
    "Not stake owner": 23773,
    "Not enough TON for unstake gas": 28788,
    "Jetton wallet not configured": 32101,
    "Only owner": 35499,
    "Invalid stake kind": 43959,
    "Invalid duration": 45702,
    "Nothing to unstake": 46056,
    "Fee too high": 46136,
    "Staking paused": 46992,
    "Invalid Jetton wallet": 50546,
    "Stake not configured": 53544,
    "TON funding required": 56230,
    "Invalid ROI": 58668,
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
    {"name":"SetFlexUnstakeFee","header":4287318778,"fields":[{"name":"flexUnstakeFeeBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}}]},
    {"name":"SetPaused","header":157817343,"fields":[{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ChangeOwner","header":256331011,"fields":[{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ClaimRewards","header":225359749,"fields":[{"name":"stakeId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"Unstake","header":4021853582,"fields":[{"name":"stakeId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FundContractTon","header":1879568762,"fields":[]},
    {"name":"JettonTransferNotification","header":1935855772,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonTransfer","header":260734629,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"ContractDetails","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"deploymentId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"gramxJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gramxJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonWalletConfigured","type":{"kind":"simple","type":"bool","optional":false}},{"name":"annualRoiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"flexUnstakeFeeBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"minStake","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"totalStaked","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"rewardReserve","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalRewardsPaid","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalFeesCollected","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"activeStakerCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalStakePositions","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nextStakeId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"UserSummary","header":null,"fields":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalStakePositions","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"activeStakePositions","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"StakeDetails","header":null,"fields":[{"name":"stakeId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"active","type":{"kind":"simple","type":"bool","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"pendingReward","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"roiBasisPoints","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"stakeKind","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"startedAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"duration","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"maturityAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"claimedRewards","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"GramPadGramxStaking$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"deploymentId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"gramxJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gramxJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonWalletConfigured","type":{"kind":"simple","type":"bool","optional":false}},{"name":"annualRoiBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"flexUnstakeFeeBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"minStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"totalStaked","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"rewardReserve","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalRewardsPaid","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalFeesCollected","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"activeStakerCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"nextTransferQueryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"nextStakeId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"pendingStakeKind","type":{"kind":"dict","key":"address","value":"int"}},{"name":"pendingStakeDuration","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userStakeCount","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userActiveStakeCount","type":{"kind":"dict","key":"address","value":"int"}},{"name":"userStakeIdByIndex","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeOwner","type":{"kind":"dict","key":"int","value":"address"}},{"name":"stakeAmount","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeRoiBasisPoints","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeKind","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeStartedAt","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeDuration","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeClaimedRewards","type":{"kind":"dict","key":"int","value":"int"}},{"name":"stakeActive","type":{"kind":"dict","key":"int","value":"bool"}}]},
]

const GramPadGramxStaking_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ConfigureStake": 3695446447,
    "SetGramxJettonWallet": 1947494201,
    "SetAnnualRoi": 1212961359,
    "SetFlexUnstakeFee": 4287318778,
    "SetPaused": 157817343,
    "ChangeOwner": 256331011,
    "ClaimRewards": 225359749,
    "Unstake": 4021853582,
    "FundContractTon": 1879568762,
    "JettonTransferNotification": 1935855772,
    "JettonTransfer": 260734629,
}

const GramPadGramxStaking_getters: ABIGetter[] = [
    {"name":"get_contract_version","methodId":127581,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_contract_details","methodId":67648,"arguments":[],"returnType":{"kind":"simple","type":"ContractDetails","optional":false}},
    {"name":"get_user_summary","methodId":110770,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"UserSummary","optional":false}},
    {"name":"get_user_stake_id_by_index","methodId":105539,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}},{"name":"index","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_stake_details","methodId":77055,"arguments":[{"name":"stakeId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"StakeDetails","optional":false}},
]

export const GramPadGramxStaking_getterMapping: { [key: string]: string } = {
    'get_contract_version': 'getGetContractVersion',
    'get_contract_details': 'getGetContractDetails',
    'get_user_summary': 'getGetUserSummary',
    'get_user_stake_id_by_index': 'getGetUserStakeIdByIndex',
    'get_stake_details': 'getGetStakeDetails',
}

const GramPadGramxStaking_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"FundContractTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ConfigureStake"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetGramxJettonWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetAnnualRoi"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetFlexUnstakeFee"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPaused"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonTransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimRewards"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Unstake"}},
]


export class GramPadGramxStaking implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = GramPadGramxStaking_errors_backward;
    public static readonly opcodes = GramPadGramxStaking_opcodes;
    
    static async init(owner: Address, gramxJettonMaster: Address, annualRoiBasisPoints: bigint, minStake: bigint, flexUnstakeFeeBasisPoints: bigint, deploymentId: bigint) {
        return await GramPadGramxStaking_init(owner, gramxJettonMaster, annualRoiBasisPoints, minStake, flexUnstakeFeeBasisPoints, deploymentId);
    }
    
    static async fromInit(owner: Address, gramxJettonMaster: Address, annualRoiBasisPoints: bigint, minStake: bigint, flexUnstakeFeeBasisPoints: bigint, deploymentId: bigint) {
        const __gen_init = await GramPadGramxStaking_init(owner, gramxJettonMaster, annualRoiBasisPoints, minStake, flexUnstakeFeeBasisPoints, deploymentId);
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
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: Deploy | FundContractTon | ConfigureStake | SetGramxJettonWallet | SetAnnualRoi | SetFlexUnstakeFee | SetPaused | ChangeOwner | JettonTransferNotification | ClaimRewards | Unstake) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'FundContractTon') {
            body = beginCell().store(storeFundContractTon(message)).endCell();
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
    
}