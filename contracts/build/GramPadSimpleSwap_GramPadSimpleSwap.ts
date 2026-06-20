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

export type SetRate = {
    $$type: 'SetRate';
    rateScaled: bigint;
}

export function storeSetRate(src: SetRate) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3433483583, 32);
        b_0.storeUint(src.rateScaled, 128);
    };
}

export function loadSetRate(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3433483583) { throw Error('Invalid prefix'); }
    const _rateScaled = sc_0.loadUintBig(128);
    return { $$type: 'SetRate' as const, rateScaled: _rateScaled };
}

export function loadTupleSetRate(source: TupleReader) {
    const _rateScaled = source.readBigNumber();
    return { $$type: 'SetRate' as const, rateScaled: _rateScaled };
}

export function loadGetterTupleSetRate(source: TupleReader) {
    const _rateScaled = source.readBigNumber();
    return { $$type: 'SetRate' as const, rateScaled: _rateScaled };
}

export function storeTupleSetRate(source: SetRate) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.rateScaled);
    return builder.build();
}

export function dictValueParserSetRate(): DictionaryValue<SetRate> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetRate(src)).endCell());
        },
        parse: (src) => {
            return loadSetRate(src.loadRef().beginParse());
        }
    }
}

export type SetTonRate = {
    $$type: 'SetTonRate';
    tonRateScaled: bigint;
}

export function storeSetTonRate(src: SetTonRate) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2188802301, 32);
        b_0.storeUint(src.tonRateScaled, 128);
    };
}

export function loadSetTonRate(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2188802301) { throw Error('Invalid prefix'); }
    const _tonRateScaled = sc_0.loadUintBig(128);
    return { $$type: 'SetTonRate' as const, tonRateScaled: _tonRateScaled };
}

export function loadTupleSetTonRate(source: TupleReader) {
    const _tonRateScaled = source.readBigNumber();
    return { $$type: 'SetTonRate' as const, tonRateScaled: _tonRateScaled };
}

export function loadGetterTupleSetTonRate(source: TupleReader) {
    const _tonRateScaled = source.readBigNumber();
    return { $$type: 'SetTonRate' as const, tonRateScaled: _tonRateScaled };
}

export function storeTupleSetTonRate(source: SetTonRate) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.tonRateScaled);
    return builder.build();
}

export function dictValueParserSetTonRate(): DictionaryValue<SetTonRate> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetTonRate(src)).endCell());
        },
        parse: (src) => {
            return loadSetTonRate(src.loadRef().beginParse());
        }
    }
}

export type SetMaxBuy = {
    $$type: 'SetMaxBuy';
    maxBuy: bigint;
}

export function storeSetMaxBuy(src: SetMaxBuy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1043132633, 32);
        b_0.storeCoins(src.maxBuy);
    };
}

export function loadSetMaxBuy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1043132633) { throw Error('Invalid prefix'); }
    const _maxBuy = sc_0.loadCoins();
    return { $$type: 'SetMaxBuy' as const, maxBuy: _maxBuy };
}

export function loadTupleSetMaxBuy(source: TupleReader) {
    const _maxBuy = source.readBigNumber();
    return { $$type: 'SetMaxBuy' as const, maxBuy: _maxBuy };
}

export function loadGetterTupleSetMaxBuy(source: TupleReader) {
    const _maxBuy = source.readBigNumber();
    return { $$type: 'SetMaxBuy' as const, maxBuy: _maxBuy };
}

export function storeTupleSetMaxBuy(source: SetMaxBuy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.maxBuy);
    return builder.build();
}

export function dictValueParserSetMaxBuy(): DictionaryValue<SetMaxBuy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetMaxBuy(src)).endCell());
        },
        parse: (src) => {
            return loadSetMaxBuy(src.loadRef().beginParse());
        }
    }
}

export type SetJettonWallets = {
    $$type: 'SetJettonWallets';
    gramJettonWallet: Address;
    usdtJettonWallet: Address;
}

export function storeSetJettonWallets(src: SetJettonWallets) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(658304901, 32);
        b_0.storeAddress(src.gramJettonWallet);
        b_0.storeAddress(src.usdtJettonWallet);
    };
}

export function loadSetJettonWallets(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 658304901) { throw Error('Invalid prefix'); }
    const _gramJettonWallet = sc_0.loadAddress();
    const _usdtJettonWallet = sc_0.loadAddress();
    return { $$type: 'SetJettonWallets' as const, gramJettonWallet: _gramJettonWallet, usdtJettonWallet: _usdtJettonWallet };
}

export function loadTupleSetJettonWallets(source: TupleReader) {
    const _gramJettonWallet = source.readAddress();
    const _usdtJettonWallet = source.readAddress();
    return { $$type: 'SetJettonWallets' as const, gramJettonWallet: _gramJettonWallet, usdtJettonWallet: _usdtJettonWallet };
}

export function loadGetterTupleSetJettonWallets(source: TupleReader) {
    const _gramJettonWallet = source.readAddress();
    const _usdtJettonWallet = source.readAddress();
    return { $$type: 'SetJettonWallets' as const, gramJettonWallet: _gramJettonWallet, usdtJettonWallet: _usdtJettonWallet };
}

export function storeTupleSetJettonWallets(source: SetJettonWallets) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.gramJettonWallet);
    builder.writeAddress(source.usdtJettonWallet);
    return builder.build();
}

export function dictValueParserSetJettonWallets(): DictionaryValue<SetJettonWallets> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetJettonWallets(src)).endCell());
        },
        parse: (src) => {
            return loadSetJettonWallets(src.loadRef().beginParse());
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

export type FundTon = {
    $$type: 'FundTon';
}

export function storeFundTon(src: FundTon) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(671470645, 32);
    };
}

export function loadFundTon(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 671470645) { throw Error('Invalid prefix'); }
    return { $$type: 'FundTon' as const };
}

export function loadTupleFundTon(source: TupleReader) {
    return { $$type: 'FundTon' as const };
}

export function loadGetterTupleFundTon(source: TupleReader) {
    return { $$type: 'FundTon' as const };
}

export function storeTupleFundTon(source: FundTon) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserFundTon(): DictionaryValue<FundTon> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFundTon(src)).endCell());
        },
        parse: (src) => {
            return loadFundTon(src.loadRef().beginParse());
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

export type OwnerWithdrawGram = {
    $$type: 'OwnerWithdrawGram';
    amount: bigint;
    destination: Address;
}

export function storeOwnerWithdrawGram(src: OwnerWithdrawGram) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2228972469, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadOwnerWithdrawGram(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2228972469) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'OwnerWithdrawGram' as const, amount: _amount, destination: _destination };
}

export function loadTupleOwnerWithdrawGram(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawGram' as const, amount: _amount, destination: _destination };
}

export function loadGetterTupleOwnerWithdrawGram(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawGram' as const, amount: _amount, destination: _destination };
}

export function storeTupleOwnerWithdrawGram(source: OwnerWithdrawGram) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserOwnerWithdrawGram(): DictionaryValue<OwnerWithdrawGram> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOwnerWithdrawGram(src)).endCell());
        },
        parse: (src) => {
            return loadOwnerWithdrawGram(src.loadRef().beginParse());
        }
    }
}

export type OwnerWithdrawUsdt = {
    $$type: 'OwnerWithdrawUsdt';
    amount: bigint;
    destination: Address;
}

export function storeOwnerWithdrawUsdt(src: OwnerWithdrawUsdt) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(753626566, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadOwnerWithdrawUsdt(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 753626566) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'OwnerWithdrawUsdt' as const, amount: _amount, destination: _destination };
}

export function loadTupleOwnerWithdrawUsdt(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawUsdt' as const, amount: _amount, destination: _destination };
}

export function loadGetterTupleOwnerWithdrawUsdt(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'OwnerWithdrawUsdt' as const, amount: _amount, destination: _destination };
}

export function storeTupleOwnerWithdrawUsdt(source: OwnerWithdrawUsdt) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserOwnerWithdrawUsdt(): DictionaryValue<OwnerWithdrawUsdt> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOwnerWithdrawUsdt(src)).endCell());
        },
        parse: (src) => {
            return loadOwnerWithdrawUsdt(src.loadRef().beginParse());
        }
    }
}

export type SwapTonForGram = {
    $$type: 'SwapTonForGram';
    minOut: bigint;
}

export function storeSwapTonForGram(src: SwapTonForGram) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2431915606, 32);
        b_0.storeCoins(src.minOut);
    };
}

export function loadSwapTonForGram(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2431915606) { throw Error('Invalid prefix'); }
    const _minOut = sc_0.loadCoins();
    return { $$type: 'SwapTonForGram' as const, minOut: _minOut };
}

export function loadTupleSwapTonForGram(source: TupleReader) {
    const _minOut = source.readBigNumber();
    return { $$type: 'SwapTonForGram' as const, minOut: _minOut };
}

export function loadGetterTupleSwapTonForGram(source: TupleReader) {
    const _minOut = source.readBigNumber();
    return { $$type: 'SwapTonForGram' as const, minOut: _minOut };
}

export function storeTupleSwapTonForGram(source: SwapTonForGram) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.minOut);
    return builder.build();
}

export function dictValueParserSwapTonForGram(): DictionaryValue<SwapTonForGram> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSwapTonForGram(src)).endCell());
        },
        parse: (src) => {
            return loadSwapTonForGram(src.loadRef().beginParse());
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
    gramJettonMaster: Address;
    gramJettonWallet: Address;
    gramDecimals: bigint;
    usdtJettonMaster: Address;
    usdtJettonWallet: Address;
    usdtDecimals: bigint;
    jettonWalletsConfigured: boolean;
    paused: boolean;
    rateScaled: bigint;
    tonRateScaled: bigint;
    rateScale: bigint;
    maxBuy: bigint;
    gramReserve: bigint;
    usdtReserve: bigint;
    tonReserve: bigint;
    totalSwapCount: bigint;
    totalGramToUsdtVolume: bigint;
    totalUsdtToGramVolume: bigint;
    totalTonToGramVolume: bigint;
    totalGramToTonVolume: bigint;
}

export function storeContractDetails(src: ContractDetails) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.deploymentId, 257);
        b_0.storeAddress(src.gramJettonMaster);
        const b_1 = new Builder();
        b_1.storeAddress(src.gramJettonWallet);
        b_1.storeInt(src.gramDecimals, 257);
        b_1.storeAddress(src.usdtJettonMaster);
        const b_2 = new Builder();
        b_2.storeAddress(src.usdtJettonWallet);
        b_2.storeInt(src.usdtDecimals, 257);
        b_2.storeBit(src.jettonWalletsConfigured);
        b_2.storeBit(src.paused);
        b_2.storeInt(src.rateScaled, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.tonRateScaled, 257);
        b_3.storeInt(src.rateScale, 257);
        b_3.storeInt(src.maxBuy, 257);
        const b_4 = new Builder();
        b_4.storeInt(src.gramReserve, 257);
        b_4.storeInt(src.usdtReserve, 257);
        b_4.storeInt(src.tonReserve, 257);
        const b_5 = new Builder();
        b_5.storeInt(src.totalSwapCount, 257);
        b_5.storeInt(src.totalGramToUsdtVolume, 257);
        b_5.storeInt(src.totalUsdtToGramVolume, 257);
        const b_6 = new Builder();
        b_6.storeInt(src.totalTonToGramVolume, 257);
        b_6.storeInt(src.totalGramToTonVolume, 257);
        b_5.storeRef(b_6.endCell());
        b_4.storeRef(b_5.endCell());
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
    const _gramJettonMaster = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _gramJettonWallet = sc_1.loadAddress();
    const _gramDecimals = sc_1.loadIntBig(257);
    const _usdtJettonMaster = sc_1.loadAddress();
    const sc_2 = sc_1.loadRef().beginParse();
    const _usdtJettonWallet = sc_2.loadAddress();
    const _usdtDecimals = sc_2.loadIntBig(257);
    const _jettonWalletsConfigured = sc_2.loadBit();
    const _paused = sc_2.loadBit();
    const _rateScaled = sc_2.loadIntBig(257);
    const sc_3 = sc_2.loadRef().beginParse();
    const _tonRateScaled = sc_3.loadIntBig(257);
    const _rateScale = sc_3.loadIntBig(257);
    const _maxBuy = sc_3.loadIntBig(257);
    const sc_4 = sc_3.loadRef().beginParse();
    const _gramReserve = sc_4.loadIntBig(257);
    const _usdtReserve = sc_4.loadIntBig(257);
    const _tonReserve = sc_4.loadIntBig(257);
    const sc_5 = sc_4.loadRef().beginParse();
    const _totalSwapCount = sc_5.loadIntBig(257);
    const _totalGramToUsdtVolume = sc_5.loadIntBig(257);
    const _totalUsdtToGramVolume = sc_5.loadIntBig(257);
    const sc_6 = sc_5.loadRef().beginParse();
    const _totalTonToGramVolume = sc_6.loadIntBig(257);
    const _totalGramToTonVolume = sc_6.loadIntBig(257);
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, gramJettonMaster: _gramJettonMaster, gramJettonWallet: _gramJettonWallet, gramDecimals: _gramDecimals, usdtJettonMaster: _usdtJettonMaster, usdtJettonWallet: _usdtJettonWallet, usdtDecimals: _usdtDecimals, jettonWalletsConfigured: _jettonWalletsConfigured, paused: _paused, rateScaled: _rateScaled, tonRateScaled: _tonRateScaled, rateScale: _rateScale, maxBuy: _maxBuy, gramReserve: _gramReserve, usdtReserve: _usdtReserve, tonReserve: _tonReserve, totalSwapCount: _totalSwapCount, totalGramToUsdtVolume: _totalGramToUsdtVolume, totalUsdtToGramVolume: _totalUsdtToGramVolume, totalTonToGramVolume: _totalTonToGramVolume, totalGramToTonVolume: _totalGramToTonVolume };
}

export function loadTupleContractDetails(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _gramJettonMaster = source.readAddress();
    const _gramJettonWallet = source.readAddress();
    const _gramDecimals = source.readBigNumber();
    const _usdtJettonMaster = source.readAddress();
    const _usdtJettonWallet = source.readAddress();
    const _usdtDecimals = source.readBigNumber();
    const _jettonWalletsConfigured = source.readBoolean();
    const _paused = source.readBoolean();
    const _rateScaled = source.readBigNumber();
    const _tonRateScaled = source.readBigNumber();
    const _rateScale = source.readBigNumber();
    const _maxBuy = source.readBigNumber();
    source = source.readTuple();
    const _gramReserve = source.readBigNumber();
    const _usdtReserve = source.readBigNumber();
    const _tonReserve = source.readBigNumber();
    const _totalSwapCount = source.readBigNumber();
    const _totalGramToUsdtVolume = source.readBigNumber();
    const _totalUsdtToGramVolume = source.readBigNumber();
    const _totalTonToGramVolume = source.readBigNumber();
    const _totalGramToTonVolume = source.readBigNumber();
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, gramJettonMaster: _gramJettonMaster, gramJettonWallet: _gramJettonWallet, gramDecimals: _gramDecimals, usdtJettonMaster: _usdtJettonMaster, usdtJettonWallet: _usdtJettonWallet, usdtDecimals: _usdtDecimals, jettonWalletsConfigured: _jettonWalletsConfigured, paused: _paused, rateScaled: _rateScaled, tonRateScaled: _tonRateScaled, rateScale: _rateScale, maxBuy: _maxBuy, gramReserve: _gramReserve, usdtReserve: _usdtReserve, tonReserve: _tonReserve, totalSwapCount: _totalSwapCount, totalGramToUsdtVolume: _totalGramToUsdtVolume, totalUsdtToGramVolume: _totalUsdtToGramVolume, totalTonToGramVolume: _totalTonToGramVolume, totalGramToTonVolume: _totalGramToTonVolume };
}

export function loadGetterTupleContractDetails(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _gramJettonMaster = source.readAddress();
    const _gramJettonWallet = source.readAddress();
    const _gramDecimals = source.readBigNumber();
    const _usdtJettonMaster = source.readAddress();
    const _usdtJettonWallet = source.readAddress();
    const _usdtDecimals = source.readBigNumber();
    const _jettonWalletsConfigured = source.readBoolean();
    const _paused = source.readBoolean();
    const _rateScaled = source.readBigNumber();
    const _tonRateScaled = source.readBigNumber();
    const _rateScale = source.readBigNumber();
    const _maxBuy = source.readBigNumber();
    const _gramReserve = source.readBigNumber();
    const _usdtReserve = source.readBigNumber();
    const _tonReserve = source.readBigNumber();
    const _totalSwapCount = source.readBigNumber();
    const _totalGramToUsdtVolume = source.readBigNumber();
    const _totalUsdtToGramVolume = source.readBigNumber();
    const _totalTonToGramVolume = source.readBigNumber();
    const _totalGramToTonVolume = source.readBigNumber();
    return { $$type: 'ContractDetails' as const, owner: _owner, deploymentId: _deploymentId, gramJettonMaster: _gramJettonMaster, gramJettonWallet: _gramJettonWallet, gramDecimals: _gramDecimals, usdtJettonMaster: _usdtJettonMaster, usdtJettonWallet: _usdtJettonWallet, usdtDecimals: _usdtDecimals, jettonWalletsConfigured: _jettonWalletsConfigured, paused: _paused, rateScaled: _rateScaled, tonRateScaled: _tonRateScaled, rateScale: _rateScale, maxBuy: _maxBuy, gramReserve: _gramReserve, usdtReserve: _usdtReserve, tonReserve: _tonReserve, totalSwapCount: _totalSwapCount, totalGramToUsdtVolume: _totalGramToUsdtVolume, totalUsdtToGramVolume: _totalUsdtToGramVolume, totalTonToGramVolume: _totalTonToGramVolume, totalGramToTonVolume: _totalGramToTonVolume };
}

export function storeTupleContractDetails(source: ContractDetails) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.deploymentId);
    builder.writeAddress(source.gramJettonMaster);
    builder.writeAddress(source.gramJettonWallet);
    builder.writeNumber(source.gramDecimals);
    builder.writeAddress(source.usdtJettonMaster);
    builder.writeAddress(source.usdtJettonWallet);
    builder.writeNumber(source.usdtDecimals);
    builder.writeBoolean(source.jettonWalletsConfigured);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.rateScaled);
    builder.writeNumber(source.tonRateScaled);
    builder.writeNumber(source.rateScale);
    builder.writeNumber(source.maxBuy);
    builder.writeNumber(source.gramReserve);
    builder.writeNumber(source.usdtReserve);
    builder.writeNumber(source.tonReserve);
    builder.writeNumber(source.totalSwapCount);
    builder.writeNumber(source.totalGramToUsdtVolume);
    builder.writeNumber(source.totalUsdtToGramVolume);
    builder.writeNumber(source.totalTonToGramVolume);
    builder.writeNumber(source.totalGramToTonVolume);
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

export type GramPadSimpleSwap$Data = {
    $$type: 'GramPadSimpleSwap$Data';
    owner: Address;
    deploymentId: bigint;
    gramJettonMaster: Address;
    gramJettonWallet: Address;
    gramDecimals: bigint;
    usdtJettonMaster: Address;
    usdtJettonWallet: Address;
    usdtDecimals: bigint;
    jettonWalletsConfigured: boolean;
    paused: boolean;
    rateScaled: bigint;
    tonRateScaled: bigint;
    maxBuy: bigint;
    nextTransferQueryId: bigint;
    gramReserve: bigint;
    usdtReserve: bigint;
    tonReserve: bigint;
    totalSwapCount: bigint;
    totalGramToUsdtVolume: bigint;
    totalUsdtToGramVolume: bigint;
    totalTonToGramVolume: bigint;
    totalGramToTonVolume: bigint;
}

export function storeGramPadSimpleSwap$Data(src: GramPadSimpleSwap$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.deploymentId, 64);
        b_0.storeAddress(src.gramJettonMaster);
        b_0.storeAddress(src.gramJettonWallet);
        b_0.storeUint(src.gramDecimals, 8);
        const b_1 = new Builder();
        b_1.storeAddress(src.usdtJettonMaster);
        b_1.storeAddress(src.usdtJettonWallet);
        b_1.storeUint(src.usdtDecimals, 8);
        b_1.storeBit(src.jettonWalletsConfigured);
        b_1.storeBit(src.paused);
        b_1.storeUint(src.rateScaled, 128);
        b_1.storeUint(src.tonRateScaled, 128);
        b_1.storeCoins(src.maxBuy);
        b_1.storeUint(src.nextTransferQueryId, 64);
        const b_2 = new Builder();
        b_2.storeCoins(src.gramReserve);
        b_2.storeCoins(src.usdtReserve);
        b_2.storeCoins(src.tonReserve);
        b_2.storeUint(src.totalSwapCount, 64);
        b_2.storeCoins(src.totalGramToUsdtVolume);
        b_2.storeCoins(src.totalUsdtToGramVolume);
        b_2.storeCoins(src.totalTonToGramVolume);
        b_2.storeCoins(src.totalGramToTonVolume);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadGramPadSimpleSwap$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _deploymentId = sc_0.loadUintBig(64);
    const _gramJettonMaster = sc_0.loadAddress();
    const _gramJettonWallet = sc_0.loadAddress();
    const _gramDecimals = sc_0.loadUintBig(8);
    const sc_1 = sc_0.loadRef().beginParse();
    const _usdtJettonMaster = sc_1.loadAddress();
    const _usdtJettonWallet = sc_1.loadAddress();
    const _usdtDecimals = sc_1.loadUintBig(8);
    const _jettonWalletsConfigured = sc_1.loadBit();
    const _paused = sc_1.loadBit();
    const _rateScaled = sc_1.loadUintBig(128);
    const _tonRateScaled = sc_1.loadUintBig(128);
    const _maxBuy = sc_1.loadCoins();
    const _nextTransferQueryId = sc_1.loadUintBig(64);
    const sc_2 = sc_1.loadRef().beginParse();
    const _gramReserve = sc_2.loadCoins();
    const _usdtReserve = sc_2.loadCoins();
    const _tonReserve = sc_2.loadCoins();
    const _totalSwapCount = sc_2.loadUintBig(64);
    const _totalGramToUsdtVolume = sc_2.loadCoins();
    const _totalUsdtToGramVolume = sc_2.loadCoins();
    const _totalTonToGramVolume = sc_2.loadCoins();
    const _totalGramToTonVolume = sc_2.loadCoins();
    return { $$type: 'GramPadSimpleSwap$Data' as const, owner: _owner, deploymentId: _deploymentId, gramJettonMaster: _gramJettonMaster, gramJettonWallet: _gramJettonWallet, gramDecimals: _gramDecimals, usdtJettonMaster: _usdtJettonMaster, usdtJettonWallet: _usdtJettonWallet, usdtDecimals: _usdtDecimals, jettonWalletsConfigured: _jettonWalletsConfigured, paused: _paused, rateScaled: _rateScaled, tonRateScaled: _tonRateScaled, maxBuy: _maxBuy, nextTransferQueryId: _nextTransferQueryId, gramReserve: _gramReserve, usdtReserve: _usdtReserve, tonReserve: _tonReserve, totalSwapCount: _totalSwapCount, totalGramToUsdtVolume: _totalGramToUsdtVolume, totalUsdtToGramVolume: _totalUsdtToGramVolume, totalTonToGramVolume: _totalTonToGramVolume, totalGramToTonVolume: _totalGramToTonVolume };
}

export function loadTupleGramPadSimpleSwap$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _gramJettonMaster = source.readAddress();
    const _gramJettonWallet = source.readAddress();
    const _gramDecimals = source.readBigNumber();
    const _usdtJettonMaster = source.readAddress();
    const _usdtJettonWallet = source.readAddress();
    const _usdtDecimals = source.readBigNumber();
    const _jettonWalletsConfigured = source.readBoolean();
    const _paused = source.readBoolean();
    const _rateScaled = source.readBigNumber();
    const _tonRateScaled = source.readBigNumber();
    const _maxBuy = source.readBigNumber();
    const _nextTransferQueryId = source.readBigNumber();
    source = source.readTuple();
    const _gramReserve = source.readBigNumber();
    const _usdtReserve = source.readBigNumber();
    const _tonReserve = source.readBigNumber();
    const _totalSwapCount = source.readBigNumber();
    const _totalGramToUsdtVolume = source.readBigNumber();
    const _totalUsdtToGramVolume = source.readBigNumber();
    const _totalTonToGramVolume = source.readBigNumber();
    const _totalGramToTonVolume = source.readBigNumber();
    return { $$type: 'GramPadSimpleSwap$Data' as const, owner: _owner, deploymentId: _deploymentId, gramJettonMaster: _gramJettonMaster, gramJettonWallet: _gramJettonWallet, gramDecimals: _gramDecimals, usdtJettonMaster: _usdtJettonMaster, usdtJettonWallet: _usdtJettonWallet, usdtDecimals: _usdtDecimals, jettonWalletsConfigured: _jettonWalletsConfigured, paused: _paused, rateScaled: _rateScaled, tonRateScaled: _tonRateScaled, maxBuy: _maxBuy, nextTransferQueryId: _nextTransferQueryId, gramReserve: _gramReserve, usdtReserve: _usdtReserve, tonReserve: _tonReserve, totalSwapCount: _totalSwapCount, totalGramToUsdtVolume: _totalGramToUsdtVolume, totalUsdtToGramVolume: _totalUsdtToGramVolume, totalTonToGramVolume: _totalTonToGramVolume, totalGramToTonVolume: _totalGramToTonVolume };
}

export function loadGetterTupleGramPadSimpleSwap$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _deploymentId = source.readBigNumber();
    const _gramJettonMaster = source.readAddress();
    const _gramJettonWallet = source.readAddress();
    const _gramDecimals = source.readBigNumber();
    const _usdtJettonMaster = source.readAddress();
    const _usdtJettonWallet = source.readAddress();
    const _usdtDecimals = source.readBigNumber();
    const _jettonWalletsConfigured = source.readBoolean();
    const _paused = source.readBoolean();
    const _rateScaled = source.readBigNumber();
    const _tonRateScaled = source.readBigNumber();
    const _maxBuy = source.readBigNumber();
    const _nextTransferQueryId = source.readBigNumber();
    const _gramReserve = source.readBigNumber();
    const _usdtReserve = source.readBigNumber();
    const _tonReserve = source.readBigNumber();
    const _totalSwapCount = source.readBigNumber();
    const _totalGramToUsdtVolume = source.readBigNumber();
    const _totalUsdtToGramVolume = source.readBigNumber();
    const _totalTonToGramVolume = source.readBigNumber();
    const _totalGramToTonVolume = source.readBigNumber();
    return { $$type: 'GramPadSimpleSwap$Data' as const, owner: _owner, deploymentId: _deploymentId, gramJettonMaster: _gramJettonMaster, gramJettonWallet: _gramJettonWallet, gramDecimals: _gramDecimals, usdtJettonMaster: _usdtJettonMaster, usdtJettonWallet: _usdtJettonWallet, usdtDecimals: _usdtDecimals, jettonWalletsConfigured: _jettonWalletsConfigured, paused: _paused, rateScaled: _rateScaled, tonRateScaled: _tonRateScaled, maxBuy: _maxBuy, nextTransferQueryId: _nextTransferQueryId, gramReserve: _gramReserve, usdtReserve: _usdtReserve, tonReserve: _tonReserve, totalSwapCount: _totalSwapCount, totalGramToUsdtVolume: _totalGramToUsdtVolume, totalUsdtToGramVolume: _totalUsdtToGramVolume, totalTonToGramVolume: _totalTonToGramVolume, totalGramToTonVolume: _totalGramToTonVolume };
}

export function storeTupleGramPadSimpleSwap$Data(source: GramPadSimpleSwap$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.deploymentId);
    builder.writeAddress(source.gramJettonMaster);
    builder.writeAddress(source.gramJettonWallet);
    builder.writeNumber(source.gramDecimals);
    builder.writeAddress(source.usdtJettonMaster);
    builder.writeAddress(source.usdtJettonWallet);
    builder.writeNumber(source.usdtDecimals);
    builder.writeBoolean(source.jettonWalletsConfigured);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.rateScaled);
    builder.writeNumber(source.tonRateScaled);
    builder.writeNumber(source.maxBuy);
    builder.writeNumber(source.nextTransferQueryId);
    builder.writeNumber(source.gramReserve);
    builder.writeNumber(source.usdtReserve);
    builder.writeNumber(source.tonReserve);
    builder.writeNumber(source.totalSwapCount);
    builder.writeNumber(source.totalGramToUsdtVolume);
    builder.writeNumber(source.totalUsdtToGramVolume);
    builder.writeNumber(source.totalTonToGramVolume);
    builder.writeNumber(source.totalGramToTonVolume);
    return builder.build();
}

export function dictValueParserGramPadSimpleSwap$Data(): DictionaryValue<GramPadSimpleSwap$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGramPadSimpleSwap$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGramPadSimpleSwap$Data(src.loadRef().beginParse());
        }
    }
}

 type GramPadSimpleSwap_init_args = {
    $$type: 'GramPadSimpleSwap_init_args';
    owner: Address;
    gramJettonMaster: Address;
    gramDecimals: bigint;
    usdtJettonMaster: Address;
    usdtDecimals: bigint;
    rateScaled: bigint;
    tonRateScaled: bigint;
    maxBuy: bigint;
    deploymentId: bigint;
}

function initGramPadSimpleSwap_init_args(src: GramPadSimpleSwap_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.gramJettonMaster);
        b_0.storeInt(src.gramDecimals, 257);
        const b_1 = new Builder();
        b_1.storeAddress(src.usdtJettonMaster);
        b_1.storeInt(src.usdtDecimals, 257);
        b_1.storeInt(src.rateScaled, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.tonRateScaled, 257);
        b_2.storeInt(src.maxBuy, 257);
        b_2.storeInt(src.deploymentId, 257);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

async function GramPadSimpleSwap_init(owner: Address, gramJettonMaster: Address, gramDecimals: bigint, usdtJettonMaster: Address, usdtDecimals: bigint, rateScaled: bigint, tonRateScaled: bigint, maxBuy: bigint, deploymentId: bigint) {
    const __code = Cell.fromHex('b5ee9c72410248010017a2000114ff00f4a413f4bcf2c80b01020162022804f2d001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018eb5fa40fa40810101d700d401d0fa40810101d700810101d700d430d0810101d700810101d700810101d7003010691068106709d15507e30d1117945f0f5f08e01115d70d1ff2e082218210946a98b6bae3022182102805d435ba45460304014a5b1113111511131112111411121111111311111110111211100f11110f0e11100e10df551c2704dc8ecf5b8111fbf8416f24135f03c200f2f4f8416f24135f0314a01113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046443512e0218210096819ffbae302218210cca6cd3fbae302218210827678fdba2705070902fe31d200301114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411164130db3c3c813bc8f8416f24135f038208989680bef2f41114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd160600d2550ac87f01ca00111611151114111311121111111055e0011115011116ce01111301cb3f01111101ce1fce1dcb070bc8ce1ace18cb0716ca0014ca0012cb7fcb7f01fa02cb3fc858fa0258fa025003fa0213cb3f5003fa025003fa025003fa025003fa02cdcdc9ed5402fe31d37f301114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411164130db3c3b813bc8f8416f24135f038208989680bef2f482009cf05616c200f2f4111411151114111311141113111211131112111111121111111011111110160800ea0f11100f10ef10de10cd10bc5509c87f01ca00111611151114111311121111111055e0011115011116ce01111301cb3f01111101ce1fce1dcb070bc8ce1ace18cb0716ca0014ca0012cb7fcb7f01fa02cb3fc858fa0258fa025003fa0213cb3f5003fa025003fa025003fa025003fa02cdcdc9ed54043ce3022182103e2cf0d9bae302218210273cef85bae3022182100f474d03ba0a0c0e0f02fe31d37f301114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411164130db3c3a813bc8f8416f24135f038208989680bef2f482009f5a5616c200f2f4111411151114111311141113111211131112111111121111111011111110160b00ee0f11100f10ef10de10cd10bc10ab5508c87f01ca00111611151114111311121111111055e0011115011116ce01111301cb3f01111101ce1fce1dcb070bc8ce1ace18cb0716ca0014ca0012cb7fcb7f01fa02cb3fc858fa0258fa025003fa0213cb3f5003fa025003fa025003fa025003fa02cdcdc9ed5402fe31fa00301114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411164130db3c39813bc8f8416f24135f038208989680bef2f48200925a5616c2fff2f4111411151114111311141113111211131112111111121111111011111110160d00f20f11100f10ef10de10cd10bc10ab109a5507c87f01ca00111611151114111311121111111055e0011115011116ce01111301cb3f01111101ce1fce1dcb070bc8ce1ace18cb0716ca0014ca0012cb7fcb7f01fa02cb3fc858fa0258fa025003fa0213cb3f5003fa025003fa025003fa025003fa02cdcdc9ed5402a431fa40fa4030011116011117db3c3d3e5710813bc8f8416f24135f038208989680bef2f41112111411121111111311111110111211100e11100e10df10bd7f0d10ac109b108a107910681057104610354403162703f48f7631fa40301114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103411164130db3c5715813bc8f8416f24135f038208989680bef2f41113111411131112111311121111111211111110111111100f11100f550ee021162710044a82103140f226bae30221821084db6bb5bae3022182102ceb6dc6bae3022182107362d09cba1113151702fe31fa00fa4030011116011117db3c813bc8f8416f24135f038208989680bef2f48142a65617c200f2f481635b265618bef2f48111cef8276f10f8416f24135f03a15618bef2f4055616a10111170111167070036d4313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb001113111511131112111411121111111311111612014c1110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046104555122702fc31fa00fa4030011116011117db3c813bc8f8416f24135f03821009896800bef2f48142a65617c200f2f4813f88285618bef2f4075616a1111511171115111411161114111311151113561211151112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b1a107910681057104610351024161401d61023db3cc87f01ca00111611151114111311121111111055e0011115011116ce01111301cb3f01111101ce1fce1dcb070bc8ce1ace18cb0716ca0014ca0012cb7fcb7f01fa02cb3fc858fa0258fa025003fa0213cb3f5003fa025003fa025003fa025003fa02cdcdc9ed542603fe31fa00fa4030011116011117db3c813bc8f8416f24135f03821009896800bef2f48142a65617c200f2f4816303275618bef2f4065616a11115111711151114111611141113111511131112111411121111111311111110111211102f11120f11110f0e11100e10df10ce10bd10ac109b108a1910681057104610354400db3c162627001882008aabf8425617c705f2f404fe8ffc31d33f31fa00fa408142a623c200f2f48131542ff2f4f84221d7498100a0b99521d74ac2009170e29501d430d001de205612c705e3028200c572015615c705f2f420d7498100a0b9e3028200aef32eb3f2f481635bf8276f10f8416f24135f03a182100d1cef00bef2f4111511161115111411161114111311161113e0181b1c2302f63020d7498100a0b98eba5b15a01113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810570610354403e08200aef32eb3f2f481635bf8276f10f8416f24135f03a182100d1cef00bef2f48158562bc000917f93533bbbe2f2f4d31f820084e702271902fa821053574150ba12f2f4d37f301115111611151114111611141113111611131112111611121111111611111110111611100f11160f0e11160e0d11160d0c11160c0b11160b0a11160a09111609081116080711160706111606051116050411160403111603021116020111170111185616db3c8200eba221c200f2f420401a02d48200a239111bbe01111a01f2f4813f8828561abef2f4065616a0075618a104a4111612a0111411171114111311161113111211151112561111151111111411111110111311100f11120f0e11110e0d11100d10cf10be10ad109c108b104a10791058104710365e31db3c262701765b16a01113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106807104610354430122703fe1112111611121111111611111110111611100f11160f0e11160e0d11160d0c11160c0b11160b0a11160a09111609081116080711160706111606051116050411160403111603021116020111170111185616db3c1119d31f820084e702821053574150ba12f2f4d307d37f3021e303820087dc02c00112f2f48200eba2561a321d2103fe3157198158562ac000917fe30ef2f45616db3c8200eba221c200f2f4208200a239111bbe01111a01f2f481630327561abef2f4075616a0065618a104a4111613a01114111711141113111611131112111511121111111411111110111311100f11120f2e11120e11110e0d11100d10cf10be10ad109c108b106a10491058161e372002fe1115111611151114111611141113111611131112111611121111111611111110111611100f11160f0e11160e0d11160d0c11160c0b11160b0a11160a09111609111608070655405617db3c2abb1116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de371f002c10cd10bc10ab109a108910781067105610451034413001dc4570134440db3cc87f01ca00111611151114111311121111111055e0011115011116ce01111301cb3f01111101ce1fce1dcb070bc8ce1ace18cb0716ca0014ca0012cb7fcb7f01fa02cb3fc858fa0258fa025003fa0213cb3f5003fa025003fa025003fa025003fa02cdcdc9ed542601fcc200f2f456198200a23902bef2f481635b26561abef2f4811438f8276f10f8416f24135f03a1561abef2f4075616a0055618a104a4111617a00111160111177070036d4313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb001112111511121111111411111110111311100f11120f0e11110e0d11100d10cf10be2200f410ad109c108b107a1069105810271036445312c87f01ca00111611151114111311121111111055e0011115011116ce01111301cb3f01111101ce1fce1dcb070bc8ce1ace18cb0716ca0014ca0012cb7fcb7f01fa02cb3fc858fa0258fa025003fa0213cb3f5003fa025003fa025003fa025003fa02cdcdc9ed54028021821090f41656bae302308210d53276dbba8ea41113111511131112111411121111111311111110111211100f11110f0e11100e10df551ce05f0f5f07f2c082242702fe31fa00308200aef32cb3f2f48200f56f21c2fff2f4f8416f24135f038111fb21c200f2f40111160111175617db3c8200eba221c200f2f4208200a2391119be01111801f2f4813f88285618bef2f481635bf8276f1082100d1cef00bef2f4055617a0075616a104a41117a0f8421115111711151114111611141113111511133b250270561211151112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b105a107910571046103510241023db3c262700b02ba482100bebc2007ff8286d820898968070c8ca00c9d0061112065e34c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9127050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb0000cec87f01ca00111611151114111311121111111055e0011115011116ce01111301cb3f01111101ce1fce1dcb070bc8ce1ace18cb0716ca0014ca0012cb7fcb7f01fa02cb3fc858fa0258fa025003fa0213cb3f5003fa025003fa025003fa025003fa02cdcdc9ed54020120293d0201202a340201202b3003dfb5081da89a1a400031d6bf481f481020203ae01a803a1f481020203ae01020203ae01a861a1020203ae01020203ae01020203ae006020d220d020ce13a2aa0fc61bb678ae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2cae2d045462c0104db3c2d01f45615561556155615561556155615561556155615561556151115112111151114112011141113111f11131112111e11121111111d11111110111c11100f111b0f0e111a0e0d11190d0c11180c0b11170b0a11160a091121090811200807111f0706111e0605111d0504111c0403111b0302111a020111190111182e02f4db3c0c11180c0b11170b0a11220a091121090811200807111f0706111e0605111d0504111c0403111b0302111a0201111901562256215621562156215621562156215621111f112b111f111e112a111e111d1129111d111c1128111c111b1127111b111a1126111a111911251119111811241118111711231117412f000c11161122111603e7b6507da89a1a400031d6bf481f481020203ae01a803a1f481020203ae01020203ae01a861a1020203ae01020203ae01020203ae006020d220d020ce13a2aa0fc61a222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1db678ae20be1ed8c3045463101148142a621c2fff2f4db3c3203f61115111611151114111611141113111611131112111611121111111611111110111611100f11160f0e11160e0d11160d0c11160c0b11160b0a11160a0911160911160807065540db3c01111701a8111679db3c01111701a82a11151116111511141116111411131116111311121116111256161112111111100f0e41423301bc0d0c0b0a0908070605044313011118011117db3c01111801a801111601a9041114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430124202039710353903e5a3cbb513434800063ad7e903e9020404075c03500743e9020404075c020404075c0350c3420404075c020404075c020404075c00c041a441a0419c2745541f8c34445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543b6cf15c417c3db18645463601148142a621c2fff2f4db3c3703f61115111611151114111611141113111611131112111611121111111611111110111611100f11160f0e11160e0d11160d0c11160c0b11160b0a11160a0911160911160807065540db3c01111701a82e01111701db3c01111701a82b111511161115111411161114111311161113111211161112561611121111111041423801c00f0e0d0c0b0a0908070605044313011118011117db3c01111801a801111601a9041114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430124203e5a3f3b513434800063ad7e903e9020404075c03500743e9020404075c020404075c0350c3420404075c020404075c020404075c00c041a441a0419c2745541f8c34445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543b6cf15c417c3db18645463a01148142a621c2fff2f4db3c3b04f62ba8111511161115111411161114111311161113111211161112561611121111111055e01117db3c01111701a81116db3c1115111611151114111611141113111611131112111611121111111611111110111611100f11160f0e11160e0d11160d0c11160c0b11160b0a11160a091116091116080706554079db3c4241423c009201111701a801111701a9041114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046103544300201203e4403e7b95a6ed44d0d200018eb5fa40fa40810101d700d401d0fa40810101d700810101d700d430d0810101d700810101d700810101d7003010691068106709d15507e30d1115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f6c61845463f01148142a621c2fff2f4db3c4004f02ca8111511161115111411161114111311161113111211161112561611121111111055e01117db3c01111701a81116db3c1115111611151114111611141113111611131112111611121111111611111110111611100f11160f561655e01117db3c01111701a801111701a90411141116111411131115111342414243000c82103b9aca00001e7170935302b99501a70a01a4e8303100641112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046103544300393bb25ded44d0d200018eb5fa40fa40810101d700d401d0fa40810101d700810101d700d430d0810101d700810101d700810101d7003010691068106709d15507e30ddb3c57105f0f6c61845464700c882009cf024c200f2f482009f5a23c200f2f48200925a22c2fff2f4820096d227c2ff9327c1139170e2f2f48200e0be25c2ff9325c1139170e2f2f4538870707170547000547000200c11150c0d11140d0d11130d0b11120b0d11110d5e4b10ad109c109a00eefa40d33ffa40fa40d307d401d0fa40fa40d307d200d200d37fd37ffa00d33fd430d0fa00fa00fa00d33ffa00fa00fa00fa003011111116111111111115111111111114111111111113111111111112111157161114111511141113111411131112111311121111111211111110111111100f11100f550e000271370af548');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initGramPadSimpleSwap_init_args({ $$type: 'GramPadSimpleSwap_init_args', owner, gramJettonMaster, gramDecimals, usdtJettonMaster, usdtDecimals, rateScaled, tonRateScaled, maxBuy, deploymentId })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const GramPadSimpleSwap_errors = {
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
    4558: { message: "TON balance too low" },
    4603: { message: "TON amount required" },
    5176: { message: "TON payout unavailable" },
    12628: { message: "Jetton wallets not configured" },
    15304: { message: "Not enough TON" },
    16264: { message: "GRAM reserve too low" },
    17062: { message: "Invalid amount" },
    22614: { message: "Max buy exceeded" },
    25347: { message: "USDT reserve too low" },
    25435: { message: "TON reserve too low" },
    34023: { message: "Invalid swap payload" },
    34780: { message: "Invalid swap route" },
    35499: { message: "Only owner" },
    37466: { message: "Invalid max buy" },
    38610: { message: "Invalid GRAM decimals" },
    40176: { message: "Invalid rate" },
    40794: { message: "Invalid TON rate" },
    41529: { message: "Slippage exceeded" },
    44787: { message: "Swap paused" },
    50546: { message: "Invalid Jetton wallet" },
    57534: { message: "Invalid USDT decimals" },
    60322: { message: "Swap output too low" },
    62831: { message: "Invalid min out" },
} as const

export const GramPadSimpleSwap_errors_backward = {
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
    "TON balance too low": 4558,
    "TON amount required": 4603,
    "TON payout unavailable": 5176,
    "Jetton wallets not configured": 12628,
    "Not enough TON": 15304,
    "GRAM reserve too low": 16264,
    "Invalid amount": 17062,
    "Max buy exceeded": 22614,
    "USDT reserve too low": 25347,
    "TON reserve too low": 25435,
    "Invalid swap payload": 34023,
    "Invalid swap route": 34780,
    "Only owner": 35499,
    "Invalid max buy": 37466,
    "Invalid GRAM decimals": 38610,
    "Invalid rate": 40176,
    "Invalid TON rate": 40794,
    "Slippage exceeded": 41529,
    "Swap paused": 44787,
    "Invalid Jetton wallet": 50546,
    "Invalid USDT decimals": 57534,
    "Swap output too low": 60322,
    "Invalid min out": 62831,
} as const

const GramPadSimpleSwap_types: ABIType[] = [
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
    {"name":"SetPaused","header":157817343,"fields":[{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SetRate","header":3433483583,"fields":[{"name":"rateScaled","type":{"kind":"simple","type":"uint","optional":false,"format":128}}]},
    {"name":"SetTonRate","header":2188802301,"fields":[{"name":"tonRateScaled","type":{"kind":"simple","type":"uint","optional":false,"format":128}}]},
    {"name":"SetMaxBuy","header":1043132633,"fields":[{"name":"maxBuy","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"SetJettonWallets","header":658304901,"fields":[{"name":"gramJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"usdtJettonWallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":256331011,"fields":[{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"FundTon","header":671470645,"fields":[]},
    {"name":"OwnerWithdrawTon","header":826339878,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"OwnerWithdrawGram","header":2228972469,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"OwnerWithdrawUsdt","header":753626566,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SwapTonForGram","header":2431915606,"fields":[{"name":"minOut","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"JettonTransferNotification","header":1935855772,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonTransfer","header":260734629,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonExcesses","header":3576854235,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"ContractDetails","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"deploymentId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"gramJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gramJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"gramDecimals","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"usdtJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"usdtJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"usdtDecimals","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"jettonWalletsConfigured","type":{"kind":"simple","type":"bool","optional":false}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"rateScaled","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"tonRateScaled","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"rateScale","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"maxBuy","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"gramReserve","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"usdtReserve","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"tonReserve","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalSwapCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalGramToUsdtVolume","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalUsdtToGramVolume","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalTonToGramVolume","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"totalGramToTonVolume","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"GramPadSimpleSwap$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"deploymentId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"gramJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"gramJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"gramDecimals","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"usdtJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"usdtJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"usdtDecimals","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"jettonWalletsConfigured","type":{"kind":"simple","type":"bool","optional":false}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"rateScaled","type":{"kind":"simple","type":"uint","optional":false,"format":128}},{"name":"tonRateScaled","type":{"kind":"simple","type":"uint","optional":false,"format":128}},{"name":"maxBuy","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"nextTransferQueryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"gramReserve","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"usdtReserve","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"tonReserve","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalSwapCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"totalGramToUsdtVolume","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalUsdtToGramVolume","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalTonToGramVolume","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalGramToTonVolume","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
]

const GramPadSimpleSwap_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "SetPaused": 157817343,
    "SetRate": 3433483583,
    "SetTonRate": 2188802301,
    "SetMaxBuy": 1043132633,
    "SetJettonWallets": 658304901,
    "ChangeOwner": 256331011,
    "FundTon": 671470645,
    "OwnerWithdrawTon": 826339878,
    "OwnerWithdrawGram": 2228972469,
    "OwnerWithdrawUsdt": 753626566,
    "SwapTonForGram": 2431915606,
    "JettonTransferNotification": 1935855772,
    "JettonTransfer": 260734629,
    "JettonExcesses": 3576854235,
}

const GramPadSimpleSwap_getters: ABIGetter[] = [
    {"name":"get_contract_version","methodId":127581,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_contract_details","methodId":67648,"arguments":[],"returnType":{"kind":"simple","type":"ContractDetails","optional":false}},
    {"name":"get_quote_gram_out","methodId":103846,"arguments":[{"name":"usdtAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_quote_usdt_out","methodId":94450,"arguments":[{"name":"gramAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_quote_gram_out_from_ton","methodId":94716,"arguments":[{"name":"tonAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_quote_ton_out","methodId":78467,"arguments":[{"name":"gramAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const GramPadSimpleSwap_getterMapping: { [key: string]: string } = {
    'get_contract_version': 'getGetContractVersion',
    'get_contract_details': 'getGetContractDetails',
    'get_quote_gram_out': 'getGetQuoteGramOut',
    'get_quote_usdt_out': 'getGetQuoteUsdtOut',
    'get_quote_gram_out_from_ton': 'getGetQuoteGramOutFromTon',
    'get_quote_ton_out': 'getGetQuoteTonOut',
}

const GramPadSimpleSwap_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"FundTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPaused"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetRate"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetTonRate"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetMaxBuy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetJettonWallets"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
    {"receiver":"internal","message":{"kind":"typed","type":"OwnerWithdrawTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"OwnerWithdrawGram"}},
    {"receiver":"internal","message":{"kind":"typed","type":"OwnerWithdrawUsdt"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonTransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SwapTonForGram"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonExcesses"}},
]


export class GramPadSimpleSwap implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = GramPadSimpleSwap_errors_backward;
    public static readonly opcodes = GramPadSimpleSwap_opcodes;
    
    static async init(owner: Address, gramJettonMaster: Address, gramDecimals: bigint, usdtJettonMaster: Address, usdtDecimals: bigint, rateScaled: bigint, tonRateScaled: bigint, maxBuy: bigint, deploymentId: bigint) {
        return await GramPadSimpleSwap_init(owner, gramJettonMaster, gramDecimals, usdtJettonMaster, usdtDecimals, rateScaled, tonRateScaled, maxBuy, deploymentId);
    }
    
    static async fromInit(owner: Address, gramJettonMaster: Address, gramDecimals: bigint, usdtJettonMaster: Address, usdtDecimals: bigint, rateScaled: bigint, tonRateScaled: bigint, maxBuy: bigint, deploymentId: bigint) {
        const __gen_init = await GramPadSimpleSwap_init(owner, gramJettonMaster, gramDecimals, usdtJettonMaster, usdtDecimals, rateScaled, tonRateScaled, maxBuy, deploymentId);
        const address = contractAddress(0, __gen_init);
        return new GramPadSimpleSwap(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new GramPadSimpleSwap(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  GramPadSimpleSwap_types,
        getters: GramPadSimpleSwap_getters,
        receivers: GramPadSimpleSwap_receivers,
        errors: GramPadSimpleSwap_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: Deploy | FundTon | SetPaused | SetRate | SetTonRate | SetMaxBuy | SetJettonWallets | ChangeOwner | OwnerWithdrawTon | OwnerWithdrawGram | OwnerWithdrawUsdt | JettonTransferNotification | SwapTonForGram | JettonExcesses) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'FundTon') {
            body = beginCell().store(storeFundTon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPaused') {
            body = beginCell().store(storeSetPaused(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetRate') {
            body = beginCell().store(storeSetRate(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetTonRate') {
            body = beginCell().store(storeSetTonRate(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetMaxBuy') {
            body = beginCell().store(storeSetMaxBuy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetJettonWallets') {
            body = beginCell().store(storeSetJettonWallets(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeOwner') {
            body = beginCell().store(storeChangeOwner(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'OwnerWithdrawTon') {
            body = beginCell().store(storeOwnerWithdrawTon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'OwnerWithdrawGram') {
            body = beginCell().store(storeOwnerWithdrawGram(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'OwnerWithdrawUsdt') {
            body = beginCell().store(storeOwnerWithdrawUsdt(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonTransferNotification') {
            body = beginCell().store(storeJettonTransferNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SwapTonForGram') {
            body = beginCell().store(storeSwapTonForGram(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonExcesses') {
            body = beginCell().store(storeJettonExcesses(message)).endCell();
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
    
    async getGetQuoteGramOut(provider: ContractProvider, usdtAmount: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(usdtAmount);
        const source = (await provider.get('get_quote_gram_out', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetQuoteUsdtOut(provider: ContractProvider, gramAmount: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(gramAmount);
        const source = (await provider.get('get_quote_usdt_out', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetQuoteGramOutFromTon(provider: ContractProvider, tonAmount: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(tonAmount);
        const source = (await provider.get('get_quote_gram_out_from_ton', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetQuoteTonOut(provider: ContractProvider, gramAmount: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(gramAmount);
        const source = (await provider.get('get_quote_ton_out', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}