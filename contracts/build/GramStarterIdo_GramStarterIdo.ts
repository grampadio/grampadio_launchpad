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

export type Vote = {
    $$type: 'Vote';
    upvote: boolean;
}

export function storeVote(src: Vote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2581814978, 32);
        b_0.storeBit(src.upvote);
    };
}

export function loadVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2581814978) { throw Error('Invalid prefix'); }
    const _upvote = sc_0.loadBit();
    return { $$type: 'Vote' as const, upvote: _upvote };
}

export function loadTupleVote(source: TupleReader) {
    const _upvote = source.readBoolean();
    return { $$type: 'Vote' as const, upvote: _upvote };
}

export function loadGetterTupleVote(source: TupleReader) {
    const _upvote = source.readBoolean();
    return { $$type: 'Vote' as const, upvote: _upvote };
}

export function storeTupleVote(source: Vote) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.upvote);
    return builder.build();
}

export function dictValueParserVote(): DictionaryValue<Vote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVote(src)).endCell());
        },
        parse: (src) => {
            return loadVote(src.loadRef().beginParse());
        }
    }
}

export type AdvanceStage = {
    $$type: 'AdvanceStage';
    nextStage: bigint;
}

export function storeAdvanceStage(src: AdvanceStage) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2860461458, 32);
        b_0.storeUint(src.nextStage, 8);
    };
}

export function loadAdvanceStage(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2860461458) { throw Error('Invalid prefix'); }
    const _nextStage = sc_0.loadUintBig(8);
    return { $$type: 'AdvanceStage' as const, nextStage: _nextStage };
}

export function loadTupleAdvanceStage(source: TupleReader) {
    const _nextStage = source.readBigNumber();
    return { $$type: 'AdvanceStage' as const, nextStage: _nextStage };
}

export function loadGetterTupleAdvanceStage(source: TupleReader) {
    const _nextStage = source.readBigNumber();
    return { $$type: 'AdvanceStage' as const, nextStage: _nextStage };
}

export function storeTupleAdvanceStage(source: AdvanceStage) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.nextStage);
    return builder.build();
}

export function dictValueParserAdvanceStage(): DictionaryValue<AdvanceStage> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAdvanceStage(src)).endCell());
        },
        parse: (src) => {
            return loadAdvanceStage(src.loadRef().beginParse());
        }
    }
}

export type SetJettonWallets = {
    $$type: 'SetJettonWallets';
    usdtJettonWallet: Address;
    saleTokenJettonWallet: Address;
}

export function storeSetJettonWallets(src: SetJettonWallets) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1436965512, 32);
        b_0.storeAddress(src.usdtJettonWallet);
        b_0.storeAddress(src.saleTokenJettonWallet);
    };
}

export function loadSetJettonWallets(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1436965512) { throw Error('Invalid prefix'); }
    const _usdtJettonWallet = sc_0.loadAddress();
    const _saleTokenJettonWallet = sc_0.loadAddress();
    return { $$type: 'SetJettonWallets' as const, usdtJettonWallet: _usdtJettonWallet, saleTokenJettonWallet: _saleTokenJettonWallet };
}

export function loadTupleSetJettonWallets(source: TupleReader) {
    const _usdtJettonWallet = source.readAddress();
    const _saleTokenJettonWallet = source.readAddress();
    return { $$type: 'SetJettonWallets' as const, usdtJettonWallet: _usdtJettonWallet, saleTokenJettonWallet: _saleTokenJettonWallet };
}

export function loadGetterTupleSetJettonWallets(source: TupleReader) {
    const _usdtJettonWallet = source.readAddress();
    const _saleTokenJettonWallet = source.readAddress();
    return { $$type: 'SetJettonWallets' as const, usdtJettonWallet: _usdtJettonWallet, saleTokenJettonWallet: _saleTokenJettonWallet };
}

export function storeTupleSetJettonWallets(source: SetJettonWallets) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.usdtJettonWallet);
    builder.writeAddress(source.saleTokenJettonWallet);
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

export type ClaimAllocation = {
    $$type: 'ClaimAllocation';
}

export function storeClaimAllocation(src: ClaimAllocation) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3776613916, 32);
    };
}

export function loadClaimAllocation(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3776613916) { throw Error('Invalid prefix'); }
    return { $$type: 'ClaimAllocation' as const };
}

export function loadTupleClaimAllocation(source: TupleReader) {
    return { $$type: 'ClaimAllocation' as const };
}

export function loadGetterTupleClaimAllocation(source: TupleReader) {
    return { $$type: 'ClaimAllocation' as const };
}

export function storeTupleClaimAllocation(source: ClaimAllocation) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserClaimAllocation(): DictionaryValue<ClaimAllocation> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimAllocation(src)).endCell());
        },
        parse: (src) => {
            return loadClaimAllocation(src.loadRef().beginParse());
        }
    }
}

export type RefundUSDT = {
    $$type: 'RefundUSDT';
}

export function storeRefundUSDT(src: RefundUSDT) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4092342774, 32);
    };
}

export function loadRefundUSDT(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4092342774) { throw Error('Invalid prefix'); }
    return { $$type: 'RefundUSDT' as const };
}

export function loadTupleRefundUSDT(source: TupleReader) {
    return { $$type: 'RefundUSDT' as const };
}

export function loadGetterTupleRefundUSDT(source: TupleReader) {
    return { $$type: 'RefundUSDT' as const };
}

export function storeTupleRefundUSDT(source: RefundUSDT) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserRefundUSDT(): DictionaryValue<RefundUSDT> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRefundUSDT(src)).endCell());
        },
        parse: (src) => {
            return loadRefundUSDT(src.loadRef().beginParse());
        }
    }
}

export type ClaimRejectedUSDT = {
    $$type: 'ClaimRejectedUSDT';
}

export function storeClaimRejectedUSDT(src: ClaimRejectedUSDT) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3083319871, 32);
    };
}

export function loadClaimRejectedUSDT(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3083319871) { throw Error('Invalid prefix'); }
    return { $$type: 'ClaimRejectedUSDT' as const };
}

export function loadTupleClaimRejectedUSDT(source: TupleReader) {
    return { $$type: 'ClaimRejectedUSDT' as const };
}

export function loadGetterTupleClaimRejectedUSDT(source: TupleReader) {
    return { $$type: 'ClaimRejectedUSDT' as const };
}

export function storeTupleClaimRejectedUSDT(source: ClaimRejectedUSDT) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserClaimRejectedUSDT(): DictionaryValue<ClaimRejectedUSDT> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimRejectedUSDT(src)).endCell());
        },
        parse: (src) => {
            return loadClaimRejectedUSDT(src.loadRef().beginParse());
        }
    }
}

export type WithdrawRemainingSaleTokens = {
    $$type: 'WithdrawRemainingSaleTokens';
}

export function storeWithdrawRemainingSaleTokens(src: WithdrawRemainingSaleTokens) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3907670709, 32);
    };
}

export function loadWithdrawRemainingSaleTokens(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3907670709) { throw Error('Invalid prefix'); }
    return { $$type: 'WithdrawRemainingSaleTokens' as const };
}

export function loadTupleWithdrawRemainingSaleTokens(source: TupleReader) {
    return { $$type: 'WithdrawRemainingSaleTokens' as const };
}

export function loadGetterTupleWithdrawRemainingSaleTokens(source: TupleReader) {
    return { $$type: 'WithdrawRemainingSaleTokens' as const };
}

export function storeTupleWithdrawRemainingSaleTokens(source: WithdrawRemainingSaleTokens) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserWithdrawRemainingSaleTokens(): DictionaryValue<WithdrawRemainingSaleTokens> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawRemainingSaleTokens(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawRemainingSaleTokens(src.loadRef().beginParse());
        }
    }
}

export type WithdrawRaisedUSDT = {
    $$type: 'WithdrawRaisedUSDT';
}

export function storeWithdrawRaisedUSDT(src: WithdrawRaisedUSDT) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(670671511, 32);
    };
}

export function loadWithdrawRaisedUSDT(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 670671511) { throw Error('Invalid prefix'); }
    return { $$type: 'WithdrawRaisedUSDT' as const };
}

export function loadTupleWithdrawRaisedUSDT(source: TupleReader) {
    return { $$type: 'WithdrawRaisedUSDT' as const };
}

export function loadGetterTupleWithdrawRaisedUSDT(source: TupleReader) {
    return { $$type: 'WithdrawRaisedUSDT' as const };
}

export function storeTupleWithdrawRaisedUSDT(source: WithdrawRaisedUSDT) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserWithdrawRaisedUSDT(): DictionaryValue<WithdrawRaisedUSDT> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawRaisedUSDT(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawRaisedUSDT(src.loadRef().beginParse());
        }
    }
}

export type SetAdminBlocked = {
    $$type: 'SetAdminBlocked';
    blocked: boolean;
}

export function storeSetAdminBlocked(src: SetAdminBlocked) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3899144766, 32);
        b_0.storeBit(src.blocked);
    };
}

export function loadSetAdminBlocked(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3899144766) { throw Error('Invalid prefix'); }
    const _blocked = sc_0.loadBit();
    return { $$type: 'SetAdminBlocked' as const, blocked: _blocked };
}

export function loadTupleSetAdminBlocked(source: TupleReader) {
    const _blocked = source.readBoolean();
    return { $$type: 'SetAdminBlocked' as const, blocked: _blocked };
}

export function loadGetterTupleSetAdminBlocked(source: TupleReader) {
    const _blocked = source.readBoolean();
    return { $$type: 'SetAdminBlocked' as const, blocked: _blocked };
}

export function storeTupleSetAdminBlocked(source: SetAdminBlocked) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.blocked);
    return builder.build();
}

export function dictValueParserSetAdminBlocked(): DictionaryValue<SetAdminBlocked> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetAdminBlocked(src)).endCell());
        },
        parse: (src) => {
            return loadSetAdminBlocked(src.loadRef().beginParse());
        }
    }
}

export type ChangeAdmin = {
    $$type: 'ChangeAdmin';
    newAdmin: Address;
}

export function storeChangeAdmin(src: ChangeAdmin) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1895346583, 32);
        b_0.storeAddress(src.newAdmin);
    };
}

export function loadChangeAdmin(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1895346583) { throw Error('Invalid prefix'); }
    const _newAdmin = sc_0.loadAddress();
    return { $$type: 'ChangeAdmin' as const, newAdmin: _newAdmin };
}

export function loadTupleChangeAdmin(source: TupleReader) {
    const _newAdmin = source.readAddress();
    return { $$type: 'ChangeAdmin' as const, newAdmin: _newAdmin };
}

export function loadGetterTupleChangeAdmin(source: TupleReader) {
    const _newAdmin = source.readAddress();
    return { $$type: 'ChangeAdmin' as const, newAdmin: _newAdmin };
}

export function storeTupleChangeAdmin(source: ChangeAdmin) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newAdmin);
    return builder.build();
}

export function dictValueParserChangeAdmin(): DictionaryValue<ChangeAdmin> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeAdmin(src)).endCell());
        },
        parse: (src) => {
            return loadChangeAdmin(src.loadRef().beginParse());
        }
    }
}

export type SuperWithdrawJetton = {
    $$type: 'SuperWithdrawJetton';
    asset: bigint;
    amount: bigint;
    destination: Address;
}

export function storeSuperWithdrawJetton(src: SuperWithdrawJetton) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1596556854, 32);
        b_0.storeUint(src.asset, 8);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadSuperWithdrawJetton(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1596556854) { throw Error('Invalid prefix'); }
    const _asset = sc_0.loadUintBig(8);
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'SuperWithdrawJetton' as const, asset: _asset, amount: _amount, destination: _destination };
}

export function loadTupleSuperWithdrawJetton(source: TupleReader) {
    const _asset = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'SuperWithdrawJetton' as const, asset: _asset, amount: _amount, destination: _destination };
}

export function loadGetterTupleSuperWithdrawJetton(source: TupleReader) {
    const _asset = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'SuperWithdrawJetton' as const, asset: _asset, amount: _amount, destination: _destination };
}

export function storeTupleSuperWithdrawJetton(source: SuperWithdrawJetton) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.asset);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserSuperWithdrawJetton(): DictionaryValue<SuperWithdrawJetton> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSuperWithdrawJetton(src)).endCell());
        },
        parse: (src) => {
            return loadSuperWithdrawJetton(src.loadRef().beginParse());
        }
    }
}

export type SuperWithdrawAnyJetton = {
    $$type: 'SuperWithdrawAnyJetton';
    jettonWallet: Address;
    amount: bigint;
    destination: Address;
}

export function storeSuperWithdrawAnyJetton(src: SuperWithdrawAnyJetton) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3521299217, 32);
        b_0.storeAddress(src.jettonWallet);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadSuperWithdrawAnyJetton(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3521299217) { throw Error('Invalid prefix'); }
    const _jettonWallet = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'SuperWithdrawAnyJetton' as const, jettonWallet: _jettonWallet, amount: _amount, destination: _destination };
}

export function loadTupleSuperWithdrawAnyJetton(source: TupleReader) {
    const _jettonWallet = source.readAddress();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'SuperWithdrawAnyJetton' as const, jettonWallet: _jettonWallet, amount: _amount, destination: _destination };
}

export function loadGetterTupleSuperWithdrawAnyJetton(source: TupleReader) {
    const _jettonWallet = source.readAddress();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'SuperWithdrawAnyJetton' as const, jettonWallet: _jettonWallet, amount: _amount, destination: _destination };
}

export function storeTupleSuperWithdrawAnyJetton(source: SuperWithdrawAnyJetton) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jettonWallet);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserSuperWithdrawAnyJetton(): DictionaryValue<SuperWithdrawAnyJetton> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSuperWithdrawAnyJetton(src)).endCell());
        },
        parse: (src) => {
            return loadSuperWithdrawAnyJetton(src.loadRef().beginParse());
        }
    }
}

export type SuperWithdrawTon = {
    $$type: 'SuperWithdrawTon';
    amount: bigint;
    destination: Address;
}

export function storeSuperWithdrawTon(src: SuperWithdrawTon) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3686087575, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadSuperWithdrawTon(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3686087575) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'SuperWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function loadTupleSuperWithdrawTon(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'SuperWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function loadGetterTupleSuperWithdrawTon(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'SuperWithdrawTon' as const, amount: _amount, destination: _destination };
}

export function storeTupleSuperWithdrawTon(source: SuperWithdrawTon) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserSuperWithdrawTon(): DictionaryValue<SuperWithdrawTon> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSuperWithdrawTon(src)).endCell());
        },
        parse: (src) => {
            return loadSuperWithdrawTon(src.loadRef().beginParse());
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

export type GramStarterIdo$Data = {
    $$type: 'GramStarterIdo$Data';
    owner: Address;
    superAdmin: Address;
    adminBlocked: boolean;
    tonReserve: bigint;
    deploymentId: bigint;
    usdtJettonMaster: Address;
    saleTokenJettonMaster: Address;
    usdtJettonWallet: Address;
    saleTokenJettonWallet: Address;
    jettonWalletsConfigured: boolean;
    usdtDecimals: bigint;
    softCap: bigint;
    hardCap: bigint;
    minBuy: bigint;
    maxBuy: bigint;
    tokenPriceMicroUsdt: bigint;
    saleTokenUnit: bigint;
    tgeBasisPoints: bigint;
    cliffDuration: bigint;
    monthlyVestingPeriods: bigint;
    distributionStartedAt: bigint;
    saleTokenRequired: bigint;
    raised: bigint;
    saleTokenDeposited: bigint;
    saleTokenClaimed: bigint;
    usdtRefunded: bigint;
    idoStage: bigint;
    failedReason: bigint;
    upvotes: bigint;
    downvotes: bigint;
    participantCount: bigint;
    claimsProcessed: bigint;
    refundsProcessed: bigint;
    remainingSaleTokensWithdrawn: boolean;
    raisedUsdtWithdrawn: boolean;
    nextTransferQueryId: bigint;
    votes: Dictionary<Address, boolean>;
    contributions: Dictionary<Address, bigint>;
    allocations: Dictionary<Address, bigint>;
    claimedAllocations: Dictionary<Address, bigint>;
    claimed: Dictionary<Address, boolean>;
    refunded: Dictionary<Address, boolean>;
    isParticipant: Dictionary<Address, boolean>;
    pendingTransferKind: Dictionary<bigint, bigint>;
    pendingTransferUser: Dictionary<bigint, Address>;
    pendingTransferAmount: Dictionary<bigint, bigint>;
    pendingTransferAllocation: Dictionary<bigint, bigint>;
    rejectedUsdtCredits: Dictionary<Address, bigint>;
}

export function storeGramStarterIdo$Data(src: GramStarterIdo$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.superAdmin);
        b_0.storeBit(src.adminBlocked);
        b_0.storeCoins(src.tonReserve);
        b_0.storeUint(src.deploymentId, 64);
        b_0.storeAddress(src.usdtJettonMaster);
        const b_1 = new Builder();
        b_1.storeAddress(src.saleTokenJettonMaster);
        b_1.storeAddress(src.usdtJettonWallet);
        b_1.storeAddress(src.saleTokenJettonWallet);
        b_1.storeBit(src.jettonWalletsConfigured);
        b_1.storeUint(src.usdtDecimals, 8);
        b_1.storeCoins(src.softCap);
        const b_2 = new Builder();
        b_2.storeCoins(src.hardCap);
        b_2.storeCoins(src.minBuy);
        b_2.storeCoins(src.maxBuy);
        b_2.storeCoins(src.tokenPriceMicroUsdt);
        b_2.storeCoins(src.saleTokenUnit);
        b_2.storeUint(src.tgeBasisPoints, 16);
        b_2.storeUint(src.cliffDuration, 32);
        b_2.storeUint(src.monthlyVestingPeriods, 16);
        b_2.storeUint(src.distributionStartedAt, 32);
        b_2.storeCoins(src.saleTokenRequired);
        b_2.storeCoins(src.raised);
        const b_3 = new Builder();
        b_3.storeCoins(src.saleTokenDeposited);
        b_3.storeCoins(src.saleTokenClaimed);
        b_3.storeCoins(src.usdtRefunded);
        b_3.storeUint(src.idoStage, 8);
        b_3.storeUint(src.failedReason, 8);
        b_3.storeUint(src.upvotes, 32);
        b_3.storeUint(src.downvotes, 32);
        b_3.storeUint(src.participantCount, 32);
        b_3.storeUint(src.claimsProcessed, 32);
        b_3.storeUint(src.refundsProcessed, 32);
        b_3.storeBit(src.remainingSaleTokensWithdrawn);
        b_3.storeBit(src.raisedUsdtWithdrawn);
        b_3.storeUint(src.nextTransferQueryId, 64);
        b_3.storeDict(src.votes, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_3.storeDict(src.contributions, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_3.storeDict(src.allocations, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        const b_4 = new Builder();
        b_4.storeDict(src.claimedAllocations, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_4.storeDict(src.claimed, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_4.storeDict(src.refunded, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        const b_5 = new Builder();
        b_5.storeDict(src.isParticipant, Dictionary.Keys.Address(), Dictionary.Values.Bool());
        b_5.storeDict(src.pendingTransferKind, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_5.storeDict(src.pendingTransferUser, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        const b_6 = new Builder();
        b_6.storeDict(src.pendingTransferAmount, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_6.storeDict(src.pendingTransferAllocation, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_6.storeDict(src.rejectedUsdtCredits, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_5.storeRef(b_6.endCell());
        b_4.storeRef(b_5.endCell());
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadGramStarterIdo$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _superAdmin = sc_0.loadAddress();
    const _adminBlocked = sc_0.loadBit();
    const _tonReserve = sc_0.loadCoins();
    const _deploymentId = sc_0.loadUintBig(64);
    const _usdtJettonMaster = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _saleTokenJettonMaster = sc_1.loadAddress();
    const _usdtJettonWallet = sc_1.loadAddress();
    const _saleTokenJettonWallet = sc_1.loadAddress();
    const _jettonWalletsConfigured = sc_1.loadBit();
    const _usdtDecimals = sc_1.loadUintBig(8);
    const _softCap = sc_1.loadCoins();
    const sc_2 = sc_1.loadRef().beginParse();
    const _hardCap = sc_2.loadCoins();
    const _minBuy = sc_2.loadCoins();
    const _maxBuy = sc_2.loadCoins();
    const _tokenPriceMicroUsdt = sc_2.loadCoins();
    const _saleTokenUnit = sc_2.loadCoins();
    const _tgeBasisPoints = sc_2.loadUintBig(16);
    const _cliffDuration = sc_2.loadUintBig(32);
    const _monthlyVestingPeriods = sc_2.loadUintBig(16);
    const _distributionStartedAt = sc_2.loadUintBig(32);
    const _saleTokenRequired = sc_2.loadCoins();
    const _raised = sc_2.loadCoins();
    const sc_3 = sc_2.loadRef().beginParse();
    const _saleTokenDeposited = sc_3.loadCoins();
    const _saleTokenClaimed = sc_3.loadCoins();
    const _usdtRefunded = sc_3.loadCoins();
    const _idoStage = sc_3.loadUintBig(8);
    const _failedReason = sc_3.loadUintBig(8);
    const _upvotes = sc_3.loadUintBig(32);
    const _downvotes = sc_3.loadUintBig(32);
    const _participantCount = sc_3.loadUintBig(32);
    const _claimsProcessed = sc_3.loadUintBig(32);
    const _refundsProcessed = sc_3.loadUintBig(32);
    const _remainingSaleTokensWithdrawn = sc_3.loadBit();
    const _raisedUsdtWithdrawn = sc_3.loadBit();
    const _nextTransferQueryId = sc_3.loadUintBig(64);
    const _votes = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_3);
    const _contributions = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_3);
    const _allocations = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_3);
    const sc_4 = sc_3.loadRef().beginParse();
    const _claimedAllocations = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_4);
    const _claimed = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_4);
    const _refunded = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_4);
    const sc_5 = sc_4.loadRef().beginParse();
    const _isParticipant = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Bool(), sc_5);
    const _pendingTransferKind = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_5);
    const _pendingTransferUser = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_5);
    const sc_6 = sc_5.loadRef().beginParse();
    const _pendingTransferAmount = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_6);
    const _pendingTransferAllocation = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_6);
    const _rejectedUsdtCredits = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_6);
    return { $$type: 'GramStarterIdo$Data' as const, owner: _owner, superAdmin: _superAdmin, adminBlocked: _adminBlocked, tonReserve: _tonReserve, deploymentId: _deploymentId, usdtJettonMaster: _usdtJettonMaster, saleTokenJettonMaster: _saleTokenJettonMaster, usdtJettonWallet: _usdtJettonWallet, saleTokenJettonWallet: _saleTokenJettonWallet, jettonWalletsConfigured: _jettonWalletsConfigured, usdtDecimals: _usdtDecimals, softCap: _softCap, hardCap: _hardCap, minBuy: _minBuy, maxBuy: _maxBuy, tokenPriceMicroUsdt: _tokenPriceMicroUsdt, saleTokenUnit: _saleTokenUnit, tgeBasisPoints: _tgeBasisPoints, cliffDuration: _cliffDuration, monthlyVestingPeriods: _monthlyVestingPeriods, distributionStartedAt: _distributionStartedAt, saleTokenRequired: _saleTokenRequired, raised: _raised, saleTokenDeposited: _saleTokenDeposited, saleTokenClaimed: _saleTokenClaimed, usdtRefunded: _usdtRefunded, idoStage: _idoStage, failedReason: _failedReason, upvotes: _upvotes, downvotes: _downvotes, participantCount: _participantCount, claimsProcessed: _claimsProcessed, refundsProcessed: _refundsProcessed, remainingSaleTokensWithdrawn: _remainingSaleTokensWithdrawn, raisedUsdtWithdrawn: _raisedUsdtWithdrawn, nextTransferQueryId: _nextTransferQueryId, votes: _votes, contributions: _contributions, allocations: _allocations, claimedAllocations: _claimedAllocations, claimed: _claimed, refunded: _refunded, isParticipant: _isParticipant, pendingTransferKind: _pendingTransferKind, pendingTransferUser: _pendingTransferUser, pendingTransferAmount: _pendingTransferAmount, pendingTransferAllocation: _pendingTransferAllocation, rejectedUsdtCredits: _rejectedUsdtCredits };
}

export function loadTupleGramStarterIdo$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _superAdmin = source.readAddress();
    const _adminBlocked = source.readBoolean();
    const _tonReserve = source.readBigNumber();
    const _deploymentId = source.readBigNumber();
    const _usdtJettonMaster = source.readAddress();
    const _saleTokenJettonMaster = source.readAddress();
    const _usdtJettonWallet = source.readAddress();
    const _saleTokenJettonWallet = source.readAddress();
    const _jettonWalletsConfigured = source.readBoolean();
    const _usdtDecimals = source.readBigNumber();
    const _softCap = source.readBigNumber();
    const _hardCap = source.readBigNumber();
    const _minBuy = source.readBigNumber();
    source = source.readTuple();
    const _maxBuy = source.readBigNumber();
    const _tokenPriceMicroUsdt = source.readBigNumber();
    const _saleTokenUnit = source.readBigNumber();
    const _tgeBasisPoints = source.readBigNumber();
    const _cliffDuration = source.readBigNumber();
    const _monthlyVestingPeriods = source.readBigNumber();
    const _distributionStartedAt = source.readBigNumber();
    const _saleTokenRequired = source.readBigNumber();
    const _raised = source.readBigNumber();
    const _saleTokenDeposited = source.readBigNumber();
    const _saleTokenClaimed = source.readBigNumber();
    const _usdtRefunded = source.readBigNumber();
    const _idoStage = source.readBigNumber();
    const _failedReason = source.readBigNumber();
    source = source.readTuple();
    const _upvotes = source.readBigNumber();
    const _downvotes = source.readBigNumber();
    const _participantCount = source.readBigNumber();
    const _claimsProcessed = source.readBigNumber();
    const _refundsProcessed = source.readBigNumber();
    const _remainingSaleTokensWithdrawn = source.readBoolean();
    const _raisedUsdtWithdrawn = source.readBoolean();
    const _nextTransferQueryId = source.readBigNumber();
    const _votes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _contributions = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _allocations = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _claimedAllocations = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _claimed = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _refunded = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    source = source.readTuple();
    const _isParticipant = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _pendingTransferKind = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pendingTransferUser = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _pendingTransferAmount = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pendingTransferAllocation = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _rejectedUsdtCredits = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'GramStarterIdo$Data' as const, owner: _owner, superAdmin: _superAdmin, adminBlocked: _adminBlocked, tonReserve: _tonReserve, deploymentId: _deploymentId, usdtJettonMaster: _usdtJettonMaster, saleTokenJettonMaster: _saleTokenJettonMaster, usdtJettonWallet: _usdtJettonWallet, saleTokenJettonWallet: _saleTokenJettonWallet, jettonWalletsConfigured: _jettonWalletsConfigured, usdtDecimals: _usdtDecimals, softCap: _softCap, hardCap: _hardCap, minBuy: _minBuy, maxBuy: _maxBuy, tokenPriceMicroUsdt: _tokenPriceMicroUsdt, saleTokenUnit: _saleTokenUnit, tgeBasisPoints: _tgeBasisPoints, cliffDuration: _cliffDuration, monthlyVestingPeriods: _monthlyVestingPeriods, distributionStartedAt: _distributionStartedAt, saleTokenRequired: _saleTokenRequired, raised: _raised, saleTokenDeposited: _saleTokenDeposited, saleTokenClaimed: _saleTokenClaimed, usdtRefunded: _usdtRefunded, idoStage: _idoStage, failedReason: _failedReason, upvotes: _upvotes, downvotes: _downvotes, participantCount: _participantCount, claimsProcessed: _claimsProcessed, refundsProcessed: _refundsProcessed, remainingSaleTokensWithdrawn: _remainingSaleTokensWithdrawn, raisedUsdtWithdrawn: _raisedUsdtWithdrawn, nextTransferQueryId: _nextTransferQueryId, votes: _votes, contributions: _contributions, allocations: _allocations, claimedAllocations: _claimedAllocations, claimed: _claimed, refunded: _refunded, isParticipant: _isParticipant, pendingTransferKind: _pendingTransferKind, pendingTransferUser: _pendingTransferUser, pendingTransferAmount: _pendingTransferAmount, pendingTransferAllocation: _pendingTransferAllocation, rejectedUsdtCredits: _rejectedUsdtCredits };
}

export function loadGetterTupleGramStarterIdo$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _superAdmin = source.readAddress();
    const _adminBlocked = source.readBoolean();
    const _tonReserve = source.readBigNumber();
    const _deploymentId = source.readBigNumber();
    const _usdtJettonMaster = source.readAddress();
    const _saleTokenJettonMaster = source.readAddress();
    const _usdtJettonWallet = source.readAddress();
    const _saleTokenJettonWallet = source.readAddress();
    const _jettonWalletsConfigured = source.readBoolean();
    const _usdtDecimals = source.readBigNumber();
    const _softCap = source.readBigNumber();
    const _hardCap = source.readBigNumber();
    const _minBuy = source.readBigNumber();
    const _maxBuy = source.readBigNumber();
    const _tokenPriceMicroUsdt = source.readBigNumber();
    const _saleTokenUnit = source.readBigNumber();
    const _tgeBasisPoints = source.readBigNumber();
    const _cliffDuration = source.readBigNumber();
    const _monthlyVestingPeriods = source.readBigNumber();
    const _distributionStartedAt = source.readBigNumber();
    const _saleTokenRequired = source.readBigNumber();
    const _raised = source.readBigNumber();
    const _saleTokenDeposited = source.readBigNumber();
    const _saleTokenClaimed = source.readBigNumber();
    const _usdtRefunded = source.readBigNumber();
    const _idoStage = source.readBigNumber();
    const _failedReason = source.readBigNumber();
    const _upvotes = source.readBigNumber();
    const _downvotes = source.readBigNumber();
    const _participantCount = source.readBigNumber();
    const _claimsProcessed = source.readBigNumber();
    const _refundsProcessed = source.readBigNumber();
    const _remainingSaleTokensWithdrawn = source.readBoolean();
    const _raisedUsdtWithdrawn = source.readBoolean();
    const _nextTransferQueryId = source.readBigNumber();
    const _votes = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _contributions = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _allocations = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _claimedAllocations = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _claimed = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _refunded = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _isParticipant = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
    const _pendingTransferKind = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pendingTransferUser = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _pendingTransferAmount = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _pendingTransferAllocation = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _rejectedUsdtCredits = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'GramStarterIdo$Data' as const, owner: _owner, superAdmin: _superAdmin, adminBlocked: _adminBlocked, tonReserve: _tonReserve, deploymentId: _deploymentId, usdtJettonMaster: _usdtJettonMaster, saleTokenJettonMaster: _saleTokenJettonMaster, usdtJettonWallet: _usdtJettonWallet, saleTokenJettonWallet: _saleTokenJettonWallet, jettonWalletsConfigured: _jettonWalletsConfigured, usdtDecimals: _usdtDecimals, softCap: _softCap, hardCap: _hardCap, minBuy: _minBuy, maxBuy: _maxBuy, tokenPriceMicroUsdt: _tokenPriceMicroUsdt, saleTokenUnit: _saleTokenUnit, tgeBasisPoints: _tgeBasisPoints, cliffDuration: _cliffDuration, monthlyVestingPeriods: _monthlyVestingPeriods, distributionStartedAt: _distributionStartedAt, saleTokenRequired: _saleTokenRequired, raised: _raised, saleTokenDeposited: _saleTokenDeposited, saleTokenClaimed: _saleTokenClaimed, usdtRefunded: _usdtRefunded, idoStage: _idoStage, failedReason: _failedReason, upvotes: _upvotes, downvotes: _downvotes, participantCount: _participantCount, claimsProcessed: _claimsProcessed, refundsProcessed: _refundsProcessed, remainingSaleTokensWithdrawn: _remainingSaleTokensWithdrawn, raisedUsdtWithdrawn: _raisedUsdtWithdrawn, nextTransferQueryId: _nextTransferQueryId, votes: _votes, contributions: _contributions, allocations: _allocations, claimedAllocations: _claimedAllocations, claimed: _claimed, refunded: _refunded, isParticipant: _isParticipant, pendingTransferKind: _pendingTransferKind, pendingTransferUser: _pendingTransferUser, pendingTransferAmount: _pendingTransferAmount, pendingTransferAllocation: _pendingTransferAllocation, rejectedUsdtCredits: _rejectedUsdtCredits };
}

export function storeTupleGramStarterIdo$Data(source: GramStarterIdo$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.superAdmin);
    builder.writeBoolean(source.adminBlocked);
    builder.writeNumber(source.tonReserve);
    builder.writeNumber(source.deploymentId);
    builder.writeAddress(source.usdtJettonMaster);
    builder.writeAddress(source.saleTokenJettonMaster);
    builder.writeAddress(source.usdtJettonWallet);
    builder.writeAddress(source.saleTokenJettonWallet);
    builder.writeBoolean(source.jettonWalletsConfigured);
    builder.writeNumber(source.usdtDecimals);
    builder.writeNumber(source.softCap);
    builder.writeNumber(source.hardCap);
    builder.writeNumber(source.minBuy);
    builder.writeNumber(source.maxBuy);
    builder.writeNumber(source.tokenPriceMicroUsdt);
    builder.writeNumber(source.saleTokenUnit);
    builder.writeNumber(source.tgeBasisPoints);
    builder.writeNumber(source.cliffDuration);
    builder.writeNumber(source.monthlyVestingPeriods);
    builder.writeNumber(source.distributionStartedAt);
    builder.writeNumber(source.saleTokenRequired);
    builder.writeNumber(source.raised);
    builder.writeNumber(source.saleTokenDeposited);
    builder.writeNumber(source.saleTokenClaimed);
    builder.writeNumber(source.usdtRefunded);
    builder.writeNumber(source.idoStage);
    builder.writeNumber(source.failedReason);
    builder.writeNumber(source.upvotes);
    builder.writeNumber(source.downvotes);
    builder.writeNumber(source.participantCount);
    builder.writeNumber(source.claimsProcessed);
    builder.writeNumber(source.refundsProcessed);
    builder.writeBoolean(source.remainingSaleTokensWithdrawn);
    builder.writeBoolean(source.raisedUsdtWithdrawn);
    builder.writeNumber(source.nextTransferQueryId);
    builder.writeCell(source.votes.size > 0 ? beginCell().storeDictDirect(source.votes, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.contributions.size > 0 ? beginCell().storeDictDirect(source.contributions, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.allocations.size > 0 ? beginCell().storeDictDirect(source.allocations, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.claimedAllocations.size > 0 ? beginCell().storeDictDirect(source.claimedAllocations, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.claimed.size > 0 ? beginCell().storeDictDirect(source.claimed, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.refunded.size > 0 ? beginCell().storeDictDirect(source.refunded, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.isParticipant.size > 0 ? beginCell().storeDictDirect(source.isParticipant, Dictionary.Keys.Address(), Dictionary.Values.Bool()).endCell() : null);
    builder.writeCell(source.pendingTransferKind.size > 0 ? beginCell().storeDictDirect(source.pendingTransferKind, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.pendingTransferUser.size > 0 ? beginCell().storeDictDirect(source.pendingTransferUser, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeCell(source.pendingTransferAmount.size > 0 ? beginCell().storeDictDirect(source.pendingTransferAmount, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.pendingTransferAllocation.size > 0 ? beginCell().storeDictDirect(source.pendingTransferAllocation, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.rejectedUsdtCredits.size > 0 ? beginCell().storeDictDirect(source.rejectedUsdtCredits, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    return builder.build();
}

export function dictValueParserGramStarterIdo$Data(): DictionaryValue<GramStarterIdo$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGramStarterIdo$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGramStarterIdo$Data(src.loadRef().beginParse());
        }
    }
}

 type GramStarterIdo_init_args = {
    $$type: 'GramStarterIdo_init_args';
    owner: Address;
    superAdmin: Address;
    tonReserve: bigint;
    usdtJettonMaster: Address;
    saleTokenJettonMaster: Address;
    softCap: bigint;
    hardCap: bigint;
    minBuy: bigint;
    maxBuy: bigint;
    tokenPriceMicroUsdt: bigint;
    saleTokenUnit: bigint;
    tgeBasisPoints: bigint;
    cliffDuration: bigint;
    monthlyVestingPeriods: bigint;
    usdtDecimals: bigint;
    deploymentId: bigint;
}

function initGramStarterIdo_init_args(src: GramStarterIdo_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.superAdmin);
        b_0.storeInt(src.tonReserve, 257);
        const b_1 = new Builder();
        b_1.storeAddress(src.usdtJettonMaster);
        b_1.storeAddress(src.saleTokenJettonMaster);
        b_1.storeInt(src.softCap, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.hardCap, 257);
        b_2.storeInt(src.minBuy, 257);
        b_2.storeInt(src.maxBuy, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.tokenPriceMicroUsdt, 257);
        b_3.storeInt(src.saleTokenUnit, 257);
        b_3.storeInt(src.tgeBasisPoints, 257);
        const b_4 = new Builder();
        b_4.storeInt(src.cliffDuration, 257);
        b_4.storeInt(src.monthlyVestingPeriods, 257);
        b_4.storeInt(src.usdtDecimals, 257);
        const b_5 = new Builder();
        b_5.storeInt(src.deploymentId, 257);
        b_4.storeRef(b_5.endCell());
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

async function GramStarterIdo_init(owner: Address, superAdmin: Address, tonReserve: bigint, usdtJettonMaster: Address, saleTokenJettonMaster: Address, softCap: bigint, hardCap: bigint, minBuy: bigint, maxBuy: bigint, tokenPriceMicroUsdt: bigint, saleTokenUnit: bigint, tgeBasisPoints: bigint, cliffDuration: bigint, monthlyVestingPeriods: bigint, usdtDecimals: bigint, deploymentId: bigint) {
    const __code = Cell.fromHex('b5ee9c724202012b00010000436a00000114ff00f4a413f4bcf2c80b000102016200020067045ad001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018f09db3c1110d1550edb3ce30d1131011f01200125000304948ea3112f8020d7217021d749c21f9430d31f01de82100f8a7ea5bae3025f0f5f0f5f0f5f04e0112fd70d1ff2e082218210946a98b6bae30221821099e35ec2bae30221821055a65a88ba000400110012001504c0d33ffa0059303181010154540052304133f40c6fa19401d70030925b6de2238101012359f40c6fa192306ddf81010154540052504133f40c6fa19401d70030925b6de2226e917f92216ee2917f92206ee2e30222c001e30022c002e30022c007000500070009000b01f45f04112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a000601901119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c006401fe702b81010b248101014133f40a6fa19401d70030925b6de2206eb391319130e221a1702b81010b25714133f40a6fa19401d70030925b6de2206eb391319130e21c81010b54204e810101216e955b59f4593098c801cf004133f441e20b8e1f0981010b227071216e955b59f4593098c801cf004133f441e21112a5111209de0008000e11195619a1111901fe708101012056355422734133f40c6fa19401d70030925b6de2206eb391319130e20981010b237071216e955b59f4593098c801cf004133f441e21112a5111921a10d81010b5d810101216e955b59f4593098c801cf004133f441e21c81010b54203b810101216e955b59f4593098c801cf004133f441e20c11180c0c11110c000a0006108c0b02fce30022c003917f9322c004e28e4270563481010b248101014133f40a6fa19401d70030925b6de2206eb391319130e281010b02a00311340312810101216e955b59f4593098c801cf004133f441e21131915be220c00592703fdec00692703dde5204810101f45a305233810101f45a305232810101f45a30112f13810101000c000f02fe708101012056355422734133f40c6fa19401d70030925b6de2206eb391319130e2111921a1111c21a00d81010b5d810101216e955b59f4593098c801cf004133f441e21c81010b5232111b810101216e955b59f4593098c801cf004133f441e22781010b23714133f40a6fa19401d70030925b6de2206e92307f91b3e2e300000d000e003e0781010b227f71216e955b59f4593098c801cf004133f441e21113a411130700120c111b0c0c11180c0b01f6f45a30112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a001001ba1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035440403006401fc31d33f30562b70fb02f842707081008204c8018210aff90f5758cb1fcb3fc9103441304343c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123005901fc31d200308200c9ac5615c000f2f4815b50f8416f24135f038208989680bef2f4f8422b81010b22714133f40a6fa19401d70030925b6de28200e7e9016ef2f41b81010b511c71216e955b59f4593098c801cf004133f441e20a931111a4971110a411101111e2112d112f112d112c112e112c112b112d112b112a112c112a001301fc1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711150014017611141116111411131115111311121114111211131110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430120064043ce302218210aa7f2d92bae3022182107362d09cbae302218210e11a8e1cba001600190021002f01fe31572657261124fa40fa4030811c70f842562ec705917f9df842562fc70593562cb39170e2e2f2f4815b50f8416f24135f038208989680bef2f48200f7481125b301112501f2f48200bc935613c000f2f4820094ba215625c705b3f2f481087ef8285220c705b3f2f4816771f828562501c705b3f2f481087e21562ec705b3001701fcf2f48167715624562ec705b3f2f481087e21562dc705b3f2f48167715624562dc705b3f2f4112c112e112c112b112d112b112a112c112a1129112b11291128112a112811271129112711261128112611271123112611237f1126112311251123112211241122112111231121112011221120111f1121111f111e1120111e001801e8111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354014006404f431d30730811c70f842562fc705917f9df8425630c70593562db39170e2e2f2f4815b50f8416f24135f038208989680bef2f4817eda21c003917f9321c004e2917f9321c005e2f2f45614c0009320c0039170e2e3025614c0039320c0049170e2e3025614c00392c005923070e2e302815174f2f0112d112f112d001a001b001d001f01f8305712571253febe998131545623f2f47370927571e2112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d001c01fc305712571256155621b99275729957177470f823111959e2112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d001c01d0111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611140111150111141111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354400006401f4571257128127f956165622b9f2f4112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a001e01c41119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411127511147211141111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354400006401fc112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a1118002001781117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c006403f431d33f31fa00fa40308131545627f2f4f8425628c705e302f8425629c705e3025b810a2bf2f0112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a112811271129112711261128112611251127112511241126112411231125112311221124112211211123112111201122112000220024002e01fc308200c2405615c000917f945615c003e2f2f401111701a0112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d002301d4111c111e111c111b111d111b111a111c111a1119111b11191118111a111811171119111711181115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354403006403fc702b81010b238101014133f40a6fa19401d70030925b6de2206eb391319130e25616c303917f955619561cb9e2917f95215631c705e2917f94225624b9e2917f94225623bce2917f965302a05623bce2917f97561a23a05625bce2e302702781010b24714133f40a6fa19401d70030925b6de2206eb391319130e2e301220025002a002b02f63070563281010b238101014133f40a6fa19401d70030925b6de2206eb391319130e281010b5313a0021134025230810101216e955b59f4593098c801cf004133f441e2f8416f24135f03821008f0d180be9357325be30d112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a11280026002801f42da481010174211039561159216e955b59f45a3098c801cf004133f442e20581010153f3206e953059f45a30944133f414e281010154150056105262216e955b59f45a3098c801cf004133f442e256338e1c81010b52321135810101216e955b59f4593098c801cf004133f441e29a5733521081010bf45930e2002700c2821007270e007ff8286d820898968070c8ca00c9d00611130610581047c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9562955207050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb000a112f0a410a01fc112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a1118111711191117111611181116111511171115111411161114111311151113002901d81112111411121111111311111110111211100f11110f0e11100e10df551cc87f01ca001130112f112e112d112c112b112a1129112811271126112511241123112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed540065003e0681010b227f71216e955b59f4593098c801cf004133f441e21112a411120601fa5621a85622a904702c81010b258101014133f40a6fa19401d70030925b6de2206eb391319130e281010b5135a04e305240810101216e955b59f4593098c801cf004133f441e20181010b0da0103b4cc0810101216e955b59f4593098c801cf004133f441e20111180108a0112d112f112d112c112e112c112b112d112b002c01f4112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181119111611181116002d018a1115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443012006401d8111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c0064043ce302218210f3ec31f6bae302218210b7c7ba3fbae302218210d53276dbba003000390041004501fc5b8200cd005614c004f2f4812e3956185624bef2f4811d69f8416f24135f03821008f0d180bef2f4f8422981010b228101014133f40a6fa19401d70030925b6de28156a6216eb39301c200923170e2f2f42881010b228101014133f40a6fa19401d70030925b6de28200de33216eb39321c2009170e2f2f4702981010b24003101f88101014133f40a6fa19401d70030925b6de2206eb391319130e2f823113011311130112f1131112f112e1131112e112d1131112d112c1131112c112b1131112b112a1131112a112911311129112811311128112711311127112611311126112511311125112411311124112311311123112211311122112111311121003201fc112011311120111f1131111f111e1131111e111d1131111d111c1131111c111b1131111b111a1131111a1119113111191118113111181117113111171116113111161115113111151114113111141113113111131112113111121111113111111110113111100f11310f0e11310e0d11310d0c11310c0b11310b0a11310a003303fe091131090811310807113107061131060511310504113104031131030211320201113301563201db3c8200d6dc215635bcf2f45633a1563321a00a81010b56332c810101216e955b59f4593098c801cf004133f441e2111921a011331abae3002ca481010171211038561059216e955b59f45a3098c801cf004133f442e20400fc0034003500400781010b56317f71216e955b59f4593098c801cf004133f441e21110a411100701da8101012e5633206e953059f45a30944133f414e2810101541400546fc0216e955b59f45a3098c801cf004133f442e2810101201034544f13113601216e955b59f45a3098c801cf004133f442e2821007270e007ff8286d820898968070c8ca00c9d006111206105e04113604c8003601f8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9562749131131017050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00112c112f112c112b112e112b112a112d112a1129112c11291128112b11281127112a1127112611291126112511281125112411271124112311261123003701fc112211251122112111241121112011231120111f1122111f111e1121111e111d1120111d111c111f111c111b111e111b111a111d111a1119111c11191118111b11181117111a11171116111911161115111811151116111711161113111611131112111511121111111411111110111311100f11120f0e11110e0d11100d003801c410cf10be10ad1c108b107a10691047103645145ac87f01ca001130112f112e112d112c112b112a1129112811271126112511241123112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed54006502fe5b5613c0035614c005917f9d5614c0049556185624b99170e2e281432422917f9121e2f2f48200bfcdf8416f24135f03821008f0d180bef2f4f8422b81010b228101014133f40a6fa19401d70030925b6de28156a6216eb39321c2009170e2f2f4702981010b24714133f40a6fa19401d70030925b6de2206eb39130e30d03003a003b00023102fe8e5c328200f3d5561b23bef2f4111a21a12681010b561c714133f40a6fa19401d70030925b6de2206eb3923070df945612c2009170e28e200681010b561b7071216e955b59f4593098c801cf004133f441e21112a5111206de111a071110e30d111721a0702b81010b2a8101014133f40a6fa19401d70030925b6de2206eb3003c003d004881578b03b313f2f40781010b287f71216e955b59f4593098c801cf004133f441e21110a401fe91319130e22ea48101010591779172e22510391026561159216e955b59f45a3098c801cf004133f442e20581010153f9206e953059f45a30944133f414e281010154150056105252216e955b59f45a3098c801cf004133f442e281010120031134031256104099216e955b59f45a3098c801cf004133f442e20b81010b2870003e01fe810101216e955b59f4593098c801cf004133f441e20a81010b2870810101216e955b59f4593098c801cf004133f441e2821007270e007ff8286d820898968070c8ca00c9d0061113061057104dc8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec956290350887050444313c8cf8580ca00cf8440ce003f01fe01fa02806acf40f400c901fb00112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b004001b8111a111c111a1119111b11191118111a11181117111911171116111811161115111711151113111511131112111411121111111311111110111211100f11110f0e11100e10ef10ce10bd104c109b107a107910681057105603505504006401f05b81697df8416f24135f03821008f0d180bef2f4f842563081010b228101014133f40a6fa19401d70030925b6de2811340216eb39321c2009170e2f2f42ca481010174211038561059216e955b59f45a3098c801cf004133f442e20481010153e3206e953059f45a30944133f414e2810101541400546f40004201f6216e955b59f45a3098c801cf004133f442e25220113381010bf45930821007270e007ff8286d820898968070c8ca00c9d0061113065e34c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9562950337050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00112d112f112d004301fc112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a1118004401a01117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd102c109b108a1079106810571046034555040064043ce302218210e8ea52b5bae30221821027f9a297bae302218210e8683a3eba00460048004d005101fe5b112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b1119004701841118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c006401fa5b811c70f842562ec705917f9df842562fc70593562cb39170e2e2f2f4817109f8416f24135f03821008f0d180bef2f481480d5614c004917f945614c005e2f2f48164d20db31df2f456165622be945612c0049170e29d815d8053efbaf2f456155615a19b8200d63053dfbaf2f45615e28200f20721c200f2f47f2ba4004901d681010175531e104859216e955b59f45a3098c801cf004133f442e2038101012d5631206e953059f45a30944133f414e2810101541f00546e50216e955b59f45a3098c801cf004133f442e2821007270e007ff8286d820898968070c8ca00c9d005111205104856355530c8004a01f6556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec956284e1350447050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124004b01f8112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f004c01d40e11100e10df0e10bd102c109b108a10791068105710461035440403c87f01ca001130112f112e112d112c112b112a1129112811271126112511241123112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed54006501fe5b811c70f842562ec705917f9df842562fc70593562cb39170e2e2f2f4817109f8416f24135f03821008f0d180bef2f48200af7f5614c0049556185624be9170e2f2f4820081905618c200f2f42aa481010176531d104759216e955b59f45a3098c801cf004133f442e2028101012c5630206e953059f45a30944133f414e2004e01f881010154120052d0561b01216e955b59f45a3098c801cf004133f442e2821007270e007ff8286d820898968070c8ca00c9d004111104561e0456354434c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec956290350ee7050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00004f01fc112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b1119005001aa1118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd102c109b108a1079106810571046034445006402fe8efc31572c112bd200308200a7eaf842562ec705f2f4815b50f8416f24135f038208989680bef2f4112d112f112d112c112e112c112d112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111fe00052005301f6111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354430120064044c21821070f8b197bae3022182105f298636bae302218210d1e2c311bae302218210dbb53b97ba00540057005a005e01f431572c572d112afa40308200a7eaf842562dc705f2f4815b50f8416f24135f038208989680bef2f4817f0621562dc705b3f2f4112e112b112d112b70112d112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121005501fc112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068005601ac1057104610354044c87f01ca001130112f112e112d112c112b112a1129112811271126112511241123112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed54006501dc31d307fa00fa40308200a7eaf8425631c705f2f4817109f8416f24135f03821008f0d180bef2f48131545628f2f48200abf523c000917f9323c001e2f2f481551422c200f2f4562903c0019432562702de821007270e007f70f8286d820898968070c8ca00c9d0104610581047c8005801f8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9127050444313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123005901fc112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c006402fc31fa40fa00fa40308200a7eaf8425631c705f2f4817109f8416f24135f03821008f0d180bef2f48200c572f8285240c705b3f2f481551422c200f2f4821007270e007f70f8286d820898968070c8ca00c9d0104610581047c8556082100f8a7ea55008cb1f16cb3f5004fa0212cecef40001fa02cec9127050444313c889005b005c00016001f6cf16ca00cf8440ce01fa02806acf40f400c901fb00112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d005d01b4111c111e111c111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c0064022ee3023082107007f17abae3025f0f5f0f5f0f5f03f2c082005f006201fe31fa00fa40308200a7eaf8425630c705f2f4815b50f8416f24135f038208989680bef2f481551422c200f2f48200988df8276f10f8416f24135f03a123562fa0bef2f4017070036d4313c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00112d112f112d112c112e112c112b112d112b112a112c112a1129112b1129006001fc1128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c111b111d111b111a111c111a1119111b11191118111a1118111711191117111611181116111511171115111411161114006101e41113111511131112111411121111111311111110111211100f11110f0e11100e10df551cc87f01ca001130112f112e112d112c112b112a1129112811271126112511241123112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed54006501f68200dba6f8416f24135f03c200f2f4112d112f112d112c112e112c112b112d112b112a112c112a1129112b11291128112a1128112711291127112611281126112511271125112411261124112311251123112211241122112111231121112011221120111f1121111f111e1120111e111d111f111d111c111e111c006301a8111b111d111b111a111c111a1119111b11191118111a11181117111911171116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551c0064019cc87f01ca001130112f112e112d112c112b112a1129112811271126112511241123112211211120111f111e111d111c111b111a111911181117111611151114111311121111111055e0db3cc9ed54006501f601112f011130ce01112d01ce01112b01ca00011129fa0201112701cb3f01112501ce1123c8ce01112201ce01112001ce01111e01ca0001111c01cb0701111afa02c8011119fa02011117fa02011115fa02011113fa02011111fa021fcb0f1dcb1f1bcb0f19cb1f5007fa025005fa02c85004fa0258fa0201fa02120066009ecb0712cb0712cb1f12cb1f12cb1f12cb1f12cb1f12ca0012ca0012cb3f13f40013f40013f40003c8f40014f40015f40005c8f40016f40016f40006c8f40017f40017f40014cd13cd12cd13cd12cdcd020120006800bd020120006900a2020120006a0087020120006b0072020273006c006f0429a043b513434800063c276cf0444345543b6cf38c36011f01200125006d011cdb3c57105f0f57105f0f57105f0f006e0004561e04f5a16bb513434800063c276cf0444345543b6cf38c3444bc44c044bc44b844bc44b844b444b844b444b044b444b044ac44b044ac44a844ac44a844a444a844a444a044a444a0449c44a0449c4498449c4498449444984494449044944490448c4490448c4488448c4488448444884484448044844480447c4480447e011f01200125007001dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f0071003a81010b2c028101014133f40a6fa19401d70030925b6de2206e923070e00201200073007a02012000740077042aa972ed44d0d200018f09db3c1110d1550edb3ce30d011f012001250075011cdb3c57105f0f57105f0f57105f0f00760004561404f6ab3ded44d0d200018f09db3c1110d1550edb3ce30d112f1130112f112e112f112e112d112e112d112c112d112c112b112c112b112a112b112a1129112a1129112811291128112711281127112611271126112511261125112411251124112311241123112211231122112111221121112011211120111f1120111f011f01200125007801dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f0079003a81010b2a028101014133f40a6fa19401d70030925b6de2206e923070e0020148007b007e0429a4b9da89a1a400031e13b6782221a2aa1db679c61b011f01200125007c011cdb3c57105f0f57105f0f57105f0f007d0004562404f5a6adda89a1a400031e13b6782221a2aa1db679c61a225e2260225e225c225e225c225a225c225a2258225a2258225622582256225422562254225222542252225022522250224e2250224e224c224e224c224a224c224a2248224a2248224622482246224422462244224222442242224022422240223e2240223f011f01200125007f01dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f008001ec2a81010b228101014133f40a6fa19401d70030925b6de2206e925b70e07081010b544c148101014133f40a6fa19401d70030925b6de2206eb391329130e2f823113111321131113011321130112f1132112f112e1132112e112d1132112d112c1132112c112b1132112b112a1132112a112911321129008101fc112811321128112711321127112611321126112511321125112411321124112311321123112211321122112111321121112011321120111f1132111f111e1132111e111d1132111d111c1132111c111b1132111b111a1132111a111911321119111811321118111711321117111611321116111511321115111411321114008203f41113113211131112113211121111113211111110113211100f11320f0e11320e0d11320d0c11320c0b11320b0a11320a0911320908113208071132070611320605113205041132040311320302113202db3c205632bbe302011131a1112f1130112f112e112f112e112d112e112d112c112d112c112b112c112b00fc0083008501f6305730112e112f112e112d112e112d112c112d112c112b112c112b112a112b112a1129112a1129112811291128112711281127112611271126112511261125112411251124112311241123112211231122112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b00840092111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e7001fc112a112b112a1129112a1129112811291128112711281127112611271126112511261125112411251124112311241123112211231122112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a1119111811191118111711181117111611171116008600841115111611151114111511141113111411131112111311121111111211111110111111100f11100f10ef10de10cd10bc10ab109a10891078106710561045103441300201200088009702012000890090020120008a008d042aa9c5ed44d0d200018f09db3c1110d1550edb3ce30d011f01200125008b011cdb3c57105f0f57105f0f57105f0f008c0004562e042aaa8aed44d0d200018f09db3c1110d1550edb3ce30d011f01200125008e011cdb3c57105f0f57105f0f57105f0f008f0004561c020158009100940429a551da89a1a400031e13b6782221a2aa1db679c61b011f012001250092011cdb3c57105f0f57105f0f57105f0f0093000456110429a60bda89a1a400031e13b6782221a2aa1db679c61b011f012001250095011cdb3c57105f0f57105f0f57105f0f0096000456270201200098009b042bac30f6a268690000c784ed9e088868aa876d9e7186c0011f012001250099011cdb3c57105f0f57105f0f57105f0f009a00045613020166009c009f0429a373b513434800063c276cf0444345543b6cf38c36011f01200125009d011cdb3c57105f0f57105f0f57105f0f009e00022d0429a2a7b513434800063c276cf0444345543b6cf38c36011f0120012500a0011cdb3c57105f0f57105f0f57105f0f00a10004561802012000a300b202012000a400af02014800a500a8042aa944ed44d0d200018f09db3c1110d1550edb3ce30d011f0120012500a6011cdb3c57105f0f57105f0f57105f0f00a70004561502012000a900ac0429a483da89a1a400031e13b6782221a2aa1db679c61b011f0120012500aa011cdb3c57105f0f57105f0f57105f0f00ab000456160429a6a1da89a1a400031e13b6782221a2aa1db679c61b011f0120012500ad011cdb3c57105f0f57105f0f57105f0f00ae00045617042bb2fefb513434800063c276cf0444345543b6cf38c360011f0120012500b0011cdb3c57105f0f57105f0f57105f0f00b10004562a02012000b300b6042bb14bfb513434800063c276cf0444345543b6cf38c360011f0120012500b4011cdb3c57105f0f57105f0f57105f0f00b50004562b02015800b700ba042aab28ed44d0d200018f09db3c1110d1550edb3ce30d011f0120012500b8011cdb3c57105f0f57105f0f57105f0f00b900045621042aa9a3ed44d0d200018f09db3c1110d1550edb3ce30d011f0120012500bb011cdb3c57105f0f57105f0f57105f0f00bc001256195620a85621a90402012000be00e902012000bf00ce02012000c000c702014800c100c4042aaa30ed44d0d200018f09db3c1110d1550edb3ce30d011f0120012500c2011cdb3c57105f0f57105f0f57105f0f00c30004562804f6aa34ed44d0d200018f09db3c1110d1550edb3ce30d112f1130112f112e112f112e112d112e112d112c112d112c112b112c112b112a112b112a1129112a1129112811291128112711281127112611271126112511261125112411251124112311241123112211231122112111221121112011211120111f1120111f011f0120012500c501dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f00c6002e81010b2d02714133f40a6fa19401d70030925b6de26eb302012000c800cb042baee7f6a268690000c784ed9e088868aa876d9e7186c0011f0120012500c9011cdb3c57105f0f57105f0f57105f0f00ca0004561b042bae9676a268690000c784ed9e088868aa876d9e7186c0011f0120012500cc011cdb3c57105f0f57105f0f57105f0f00cd0004562502012000cf00d602012000d000d304f7ac7af6a268690000c784ed9e088868aa876d9e7186889788980897889708978897089688970896889608968896089588960895889508958895089488950894889408948894089388940893889308938893089288930892889208928892089188920891889108918891089088910890889008908890088f8890088fc0011f0120012500d101dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f00d2003681010b2d02714133f40a6fa19401d70030925b6de2206e923070e0042bacf576a268690000c784ed9e088868aa876d9e7186c0011f0120012500d4011cdb3c57105f0f57105f0f57105f0f00d500022e02012000d700da04f7acab76a268690000c784ed9e088868aa876d9e7186889788980897889708978897089688970896889608968896089588960895889508958895089488950894889408948894089388940893889308938893089288930892889208928892089188920891889108918891089088910890889008908890088f8890088fc0011f0120012500d801dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f00d9003a81010b2b028101014133f40a6fa19401d70030925b6de2206e923070e002012000db00e202014800dc00df04f5a1b3b513434800063c276cf0444345543b6cf38c3444bc44c044bc44b844bc44b844b444b844b444b044b444b044ac44b044ac44a844ac44a844a444a844a444a044a444a0449c44a0449c4498449c4498449444984494449044944490448c4490448c4488448c4488448444884484448044844480447c4480447e011f0120012500dd01dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f00de003681010b2902714133f40a6fa19401d70030925b6de2206e923070e00429a3dbb513434800063c276cf0444345543b6cf38c36011f0120012500e0011cdb3c57105f0f57105f0f57105f0f00e10004562f02016e00e300e60429beced44d0d200018f09db3c1110d1550edb3ce30d8011f0120012500e4011cdb3c57105f0f57105f0f57105f0f00e50004561a0429bb5ed44d0d200018f09db3c1110d1550edb3ce30d8011f0120012500e7011cdb3c57105f0f57105f0f57105f0f00e80004562202012000ea010602012000eb010302012000ec00f302015800ed00f00429a7ebda89a1a400031e13b6782221a2aa1db679c61b011f0120012500ee011cdb3c57105f0f57105f0f57105f0f00ef0004561004f5a4adda89a1a400031e13b6782221a2aa1db679c61a225e2260225e225c225e225c225a225c225a2258225a2258225622582256225422562254225222542252225022522250224e2250224e224c224e224c224a224c224a2248224a2248224622482246224422462244224222442242224022422240223e2240223f011f0120012500f101dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f00f2003a81010b22028101014133f40a6fa19401d70030925b6de2206e923070e002012000f4010002015800f500fd02012000f600f90429ba7ed44d0d200018f09db3c1110d1550edb3ce30d8011f0120012500f7011cdb3c57105f0f57105f0f57105f0f00f80004562c04f5be0ed44d0d200018f09db3c1110d1550edb3ce30d112f1130112f112e112f112e112d112e112d112c112d112c112b112c112b112a112b112a1129112a1129112811291128112711281127112611271126112511261125112411251124112311241123112211231122112111221121112011211120111f1120111f8011f0120012500fa01dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f00fb014281010b2b028101014133f40a6fa19401d70030925b6de2206e923070e0f823db3c00fc0090561dc000917f9321c101e2925b70e0215621a8812710a9045621812710ba915be0561e5621a05320b993135f03e012a18208278d00a904205620be915be05121a158a8561ea904a00429a3afb513434800063c276cf0444345543b6cf38c36011f0120012500fe011cdb3c57105f0f57105f0f57105f0f00ff00045612042aab76ed44d0d200018f09db3c1110d1550edb3ce30d011f012001250101011cdb3c57105f0f57105f0f57105f0f010200045619042bb26c3b513434800063c276cf0444345543b6cf38c360011f012001250104011cdb3c57105f0f57105f0f57105f0f0105000456230201200107010e0201580108010b042aa8f9ed44d0d200018f09db3c1110d1550edb3ce30d011f012001250109011cdb3c57105f0f57105f0f57105f0f010a0004562604f6abb7ed44d0d200018f09db3c1110d1550edb3ce30d112f1130112f112e112f112e112d112e112d112c112d112c112b112c112b112a112b112a1129112a1129112811291128112711281127112611271126112511261125112411251124112311241123112211231122112111221121112011211120111f1120111f011f01200125010c01dc111e111f111e111d111e111d111c111d111c111b111c111b111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550edb3c57105f0f57105f0f57105f0f010d003681010b2802714133f40a6fa19401d70030925b6de2206e923070e0020120010f011e02012001100117020120011101140429a50dda89a1a400031e13b6782221a2aa1db679c61b011f012001250112011cdb3c57105f0f57105f0f57105f0f011300022f0429a4bbda89a1a400031e13b6782221a2aa1db679c61b011f012001250115011cdb3c57105f0f57105f0f57105f0f01160004800e0201200118011b0429a403da89a1a400031e13b6782221a2aa1db679c61b011f012001250119011cdb3c57105f0f57105f0f57105f0f011a0004562d0429a59dda89a1a400031e13b6782221a2aa1db679c61b011f01200125011c011cdb3c57105f0f57105f0f57105f0f011d00045629042bac16f6a268690000c784ed9e088868aa876d9e7186c0011f01200125012900b8fa40fa40810101d700d401d0fa40fa40810101d700d430d0810101d700810101d700810101d700d430d0810101d700810101d700810101d700d430d0810101d700810101d700810101d700d430d0810101d700300d11100d10df10de02f46d6d6d6d6d6d6d6d6d6d6d6d8200b66a5617c200f2f481635b561a821005f5e100bef2f4816d2a561a8212540be400bbf2f48200d9b456165618bef2f48126b55615c200f2f4815fb956145616bef2f48108ea56145617bbf2f481710d5613c200f2f481662d5612c200f2f48200c69e5611c2ff9170e30df2f401210122000c5611812710bb01fe8130835610c2fff2f48200dc305611812710ba917f932fc200e2f2f48200ad162fc179f2f48200ae4856155613a85614bef2f48200e55856165613a85614bef2f48200e0be2ec204932ec1139170e2f2f481220c2dc200f2f48200adc3561c561cc705b3f2f4561b70561d70561956175617111c701119a8011119a9045617012301f8547000547000547000201110112c11100f112a0f0f11290f111d1128111d0f11270f111d1126111d0e11250e1110112411100d11230d111e1122111e0f11210f0c11200c0e111f0e1110111e11100d111d0d0d111c0d0f111b0f0c111a0c0e11190e1110111811100b11170b0a11160a09111509081114080711130701240048061112060511110504111004103f4ed07050dc700c710c104b106a10391058461450330502f8db3c5730112e112f112e112d112e112d112c112d112c112b112c112b112a112b112a1129112a1129112811291128112711281127112611271126112511261125112411251124112311241123112211231122112111221121112011211120111f1120111f111e111f111e111d111e111d111c111d111c111b111c111b0126012801f2fa40fa40d200fa00d33ffa40d401d0fa40fa40fa40d200d307fa00d430d0fa00fa00fa00fa00fa00d30fd31fd30fd31ffa00fa00d430d0fa00fa00fa00d307d307d31fd31fd31fd31fd31fd200d200d33ff404f404f404d430d0f404f404f404d430d0f404f404f404d430d0f404f404f40430112a1130112a0127003c112a112f112a112a112e112a112a112d112a112a112c112a112a112b112a0090111a111b111a1119111a11191118111911181117111811171116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e011cdb3c57105f0f57105f0f57105f0f012a0004561d57e18364');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initGramStarterIdo_init_args({ $$type: 'GramStarterIdo_init_args', owner, superAdmin, tonReserve, usdtJettonMaster, saleTokenJettonMaster, softCap, hardCap, minBuy, maxBuy, tokenPriceMicroUsdt, saleTokenUnit, tgeBasisPoints, cliffDuration, monthlyVestingPeriods, usdtDecimals, deploymentId })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const GramStarterIdo_errors = {
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
    2174: { message: "Invalid USDT wallet" },
    2282: { message: "Maximum buy cannot exceed hard cap" },
    2603: { message: "Unknown Jetton wallet" },
    4928: { message: "No rejected USDT credit" },
    7280: { message: "Admin access denied" },
    7529: { message: "Not enough TON for claim gas" },
    8716: { message: "Deployment ID required" },
    9909: { message: "Minimum buy must be positive" },
    10233: { message: "Soft cap is still reached" },
    11833: { message: "Soft cap not reached" },
    12419: { message: "Invalid cliff duration" },
    12628: { message: "Jetton wallets not configured" },
    17188: { message: "Refund is not available" },
    18445: { message: "IDO not finished" },
    20852: { message: "Invalid stage transition" },
    21780: { message: "Withdrawal amount must be positive" },
    22182: { message: "No contribution found" },
    22411: { message: "Already refunded" },
    23376: { message: "Not enough TON for gas" },
    23936: { message: "All participants have not claimed" },
    24505: { message: "Maximum buy must cover minimum buy" },
    25435: { message: "TON reserve too low" },
    25810: { message: "Already withdrawn" },
    26157: { message: "Sale token unit must be positive" },
    26481: { message: "Invalid sale-token wallet" },
    27005: { message: "Not enough TON for return gas" },
    27946: { message: "TON reserve too high" },
    28937: { message: "Not enough TON for withdraw gas" },
    28941: { message: "Token price must be positive" },
    32474: { message: "Invalid IDO stage" },
    32518: { message: "Admin cannot be superadmin" },
    33168: { message: "No USDT to withdraw" },
    38074: { message: "Jetton wallets must be different" },
    39053: { message: "Keep configured TON reserve" },
    42986: { message: "Only superadmin" },
    44021: { message: "Unknown Jetton asset" },
    44310: { message: "Too many vesting periods" },
    44483: { message: "Admin and superadmin must be different" },
    44616: { message: "Minimum buy allocation rounds to zero" },
    44927: { message: "IDO was not successful" },
    46698: { message: "Soft cap must be positive" },
    48275: { message: "Jetton wallets must be configured during voting" },
    49101: { message: "Not enough TON for refund gas" },
    49728: { message: "Sale token deposit closed" },
    50546: { message: "Invalid Jetton wallet" },
    50846: { message: "Invalid TGE percent" },
    51628: { message: "Voting is not active" },
    52480: { message: "Distribution is not active" },
    54832: { message: "All participants have not refunded" },
    55004: { message: "No vested tokens available" },
    55732: { message: "Hard cap must cover soft cap" },
    56230: { message: "TON funding required" },
    56368: { message: "Vesting periods required" },
    56883: { message: "No allocation found" },
    57534: { message: "Invalid USDT decimals" },
    58712: { message: "Required sale-token inventory rounds to zero" },
    59369: { message: "Already voted" },
    61959: { message: "No sale tokens to withdraw" },
    62421: { message: "Invalid raised amount" },
    63304: { message: "Jetton wallets already configured" },
} as const

export const GramStarterIdo_errors_backward = {
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
    "Invalid USDT wallet": 2174,
    "Maximum buy cannot exceed hard cap": 2282,
    "Unknown Jetton wallet": 2603,
    "No rejected USDT credit": 4928,
    "Admin access denied": 7280,
    "Not enough TON for claim gas": 7529,
    "Deployment ID required": 8716,
    "Minimum buy must be positive": 9909,
    "Soft cap is still reached": 10233,
    "Soft cap not reached": 11833,
    "Invalid cliff duration": 12419,
    "Jetton wallets not configured": 12628,
    "Refund is not available": 17188,
    "IDO not finished": 18445,
    "Invalid stage transition": 20852,
    "Withdrawal amount must be positive": 21780,
    "No contribution found": 22182,
    "Already refunded": 22411,
    "Not enough TON for gas": 23376,
    "All participants have not claimed": 23936,
    "Maximum buy must cover minimum buy": 24505,
    "TON reserve too low": 25435,
    "Already withdrawn": 25810,
    "Sale token unit must be positive": 26157,
    "Invalid sale-token wallet": 26481,
    "Not enough TON for return gas": 27005,
    "TON reserve too high": 27946,
    "Not enough TON for withdraw gas": 28937,
    "Token price must be positive": 28941,
    "Invalid IDO stage": 32474,
    "Admin cannot be superadmin": 32518,
    "No USDT to withdraw": 33168,
    "Jetton wallets must be different": 38074,
    "Keep configured TON reserve": 39053,
    "Only superadmin": 42986,
    "Unknown Jetton asset": 44021,
    "Too many vesting periods": 44310,
    "Admin and superadmin must be different": 44483,
    "Minimum buy allocation rounds to zero": 44616,
    "IDO was not successful": 44927,
    "Soft cap must be positive": 46698,
    "Jetton wallets must be configured during voting": 48275,
    "Not enough TON for refund gas": 49101,
    "Sale token deposit closed": 49728,
    "Invalid Jetton wallet": 50546,
    "Invalid TGE percent": 50846,
    "Voting is not active": 51628,
    "Distribution is not active": 52480,
    "All participants have not refunded": 54832,
    "No vested tokens available": 55004,
    "Hard cap must cover soft cap": 55732,
    "TON funding required": 56230,
    "Vesting periods required": 56368,
    "No allocation found": 56883,
    "Invalid USDT decimals": 57534,
    "Required sale-token inventory rounds to zero": 58712,
    "Already voted": 59369,
    "No sale tokens to withdraw": 61959,
    "Invalid raised amount": 62421,
    "Jetton wallets already configured": 63304,
} as const

const GramStarterIdo_types: ABIType[] = [
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
    {"name":"Vote","header":2581814978,"fields":[{"name":"upvote","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"AdvanceStage","header":2860461458,"fields":[{"name":"nextStage","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"SetJettonWallets","header":1436965512,"fields":[{"name":"usdtJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"saleTokenJettonWallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ClaimAllocation","header":3776613916,"fields":[]},
    {"name":"RefundUSDT","header":4092342774,"fields":[]},
    {"name":"ClaimRejectedUSDT","header":3083319871,"fields":[]},
    {"name":"WithdrawRemainingSaleTokens","header":3907670709,"fields":[]},
    {"name":"WithdrawRaisedUSDT","header":670671511,"fields":[]},
    {"name":"SetAdminBlocked","header":3899144766,"fields":[{"name":"blocked","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ChangeAdmin","header":1895346583,"fields":[{"name":"newAdmin","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SuperWithdrawJetton","header":1596556854,"fields":[{"name":"asset","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SuperWithdrawAnyJetton","header":3521299217,"fields":[{"name":"jettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SuperWithdrawTon","header":3686087575,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"FundContractTon","header":1879568762,"fields":[]},
    {"name":"JettonTransferNotification","header":1935855772,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonExcesses","header":3576854235,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"JettonTransfer","header":260734629,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"GramStarterIdo$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"superAdmin","type":{"kind":"simple","type":"address","optional":false}},{"name":"adminBlocked","type":{"kind":"simple","type":"bool","optional":false}},{"name":"tonReserve","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"deploymentId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"usdtJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"saleTokenJettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"usdtJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"saleTokenJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonWalletsConfigured","type":{"kind":"simple","type":"bool","optional":false}},{"name":"usdtDecimals","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"softCap","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"hardCap","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"minBuy","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"maxBuy","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"tokenPriceMicroUsdt","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"saleTokenUnit","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"tgeBasisPoints","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"cliffDuration","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"monthlyVestingPeriods","type":{"kind":"simple","type":"uint","optional":false,"format":16}},{"name":"distributionStartedAt","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"saleTokenRequired","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"raised","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"saleTokenDeposited","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"saleTokenClaimed","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"usdtRefunded","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"idoStage","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"failedReason","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"upvotes","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"downvotes","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"participantCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"claimsProcessed","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"refundsProcessed","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"remainingSaleTokensWithdrawn","type":{"kind":"simple","type":"bool","optional":false}},{"name":"raisedUsdtWithdrawn","type":{"kind":"simple","type":"bool","optional":false}},{"name":"nextTransferQueryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"votes","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"contributions","type":{"kind":"dict","key":"address","value":"int"}},{"name":"allocations","type":{"kind":"dict","key":"address","value":"int"}},{"name":"claimedAllocations","type":{"kind":"dict","key":"address","value":"int"}},{"name":"claimed","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"refunded","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"isParticipant","type":{"kind":"dict","key":"address","value":"bool"}},{"name":"pendingTransferKind","type":{"kind":"dict","key":"int","value":"int"}},{"name":"pendingTransferUser","type":{"kind":"dict","key":"int","value":"address"}},{"name":"pendingTransferAmount","type":{"kind":"dict","key":"int","value":"int"}},{"name":"pendingTransferAllocation","type":{"kind":"dict","key":"int","value":"int"}},{"name":"rejectedUsdtCredits","type":{"kind":"dict","key":"address","value":"int"}}]},
]

const GramStarterIdo_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "Vote": 2581814978,
    "AdvanceStage": 2860461458,
    "SetJettonWallets": 1436965512,
    "ClaimAllocation": 3776613916,
    "RefundUSDT": 4092342774,
    "ClaimRejectedUSDT": 3083319871,
    "WithdrawRemainingSaleTokens": 3907670709,
    "WithdrawRaisedUSDT": 670671511,
    "SetAdminBlocked": 3899144766,
    "ChangeAdmin": 1895346583,
    "SuperWithdrawJetton": 1596556854,
    "SuperWithdrawAnyJetton": 3521299217,
    "SuperWithdrawTon": 3686087575,
    "FundContractTon": 1879568762,
    "JettonTransferNotification": 1935855772,
    "JettonExcesses": 3576854235,
    "JettonTransfer": 260734629,
}

const GramStarterIdo_getters: ABIGetter[] = [
    {"name":"get_contract_version","methodId":127581,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_ton_reserve","methodId":117287,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_deployment_id","methodId":91439,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_ido_state","methodId":82244,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_failed_reason","methodId":70002,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_raised_capital","methodId":118646,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_soft_cap","methodId":71772,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_hard_cap","methodId":121264,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_min_buy","methodId":114613,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_max_buy","methodId":97064,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_sold_tokens","methodId":97699,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_admin","methodId":113142,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_superadmin","methodId":74181,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_admin_blocked","methodId":128001,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_raised_usdt_withdrawn","methodId":80604,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_sale_token_required","methodId":114540,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_sale_token_deposited","methodId":80809,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_sale_token_claimed","methodId":83792,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_tge_basis_points","methodId":67088,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_cliff_duration","methodId":129069,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_monthly_vesting_periods","methodId":75402,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_distribution_started_at","methodId":103887,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_usdt_refunded","methodId":83009,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_upvotes","methodId":77921,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_downvotes","methodId":117739,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_participant_count","methodId":76968,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_claims_processed","methodId":116213,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_refunds_processed","methodId":127110,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_usdt_jetton_master","methodId":89083,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_usdt_decimals","methodId":105772,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_sale_token_jetton_master","methodId":128718,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_usdt_jetton_wallet","methodId":98864,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_sale_token_jetton_wallet","methodId":77573,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_remaining_sale_tokens_withdrawn","methodId":109034,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_jetton_wallets_configured","methodId":125177,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_user_has_voted","methodId":99892,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_user_vote","methodId":106741,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_user_contribution","methodId":67418,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_user_allocation","methodId":110934,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_user_claimed","methodId":112748,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_user_claimed_allocation","methodId":71485,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_user_vested_allocation","methodId":117472,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_user_claimable_allocation","methodId":72534,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_user_refunded","methodId":126903,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_user_rejected_usdt_credit","methodId":116310,"arguments":[{"name":"user","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const GramStarterIdo_getterMapping: { [key: string]: string } = {
    'get_contract_version': 'getGetContractVersion',
    'get_ton_reserve': 'getGetTonReserve',
    'get_deployment_id': 'getGetDeploymentId',
    'get_ido_state': 'getGetIdoState',
    'get_failed_reason': 'getGetFailedReason',
    'get_raised_capital': 'getGetRaisedCapital',
    'get_soft_cap': 'getGetSoftCap',
    'get_hard_cap': 'getGetHardCap',
    'get_min_buy': 'getGetMinBuy',
    'get_max_buy': 'getGetMaxBuy',
    'get_sold_tokens': 'getGetSoldTokens',
    'get_admin': 'getGetAdmin',
    'get_superadmin': 'getGetSuperadmin',
    'get_admin_blocked': 'getGetAdminBlocked',
    'get_raised_usdt_withdrawn': 'getGetRaisedUsdtWithdrawn',
    'get_sale_token_required': 'getGetSaleTokenRequired',
    'get_sale_token_deposited': 'getGetSaleTokenDeposited',
    'get_sale_token_claimed': 'getGetSaleTokenClaimed',
    'get_tge_basis_points': 'getGetTgeBasisPoints',
    'get_cliff_duration': 'getGetCliffDuration',
    'get_monthly_vesting_periods': 'getGetMonthlyVestingPeriods',
    'get_distribution_started_at': 'getGetDistributionStartedAt',
    'get_usdt_refunded': 'getGetUsdtRefunded',
    'get_upvotes': 'getGetUpvotes',
    'get_downvotes': 'getGetDownvotes',
    'get_participant_count': 'getGetParticipantCount',
    'get_claims_processed': 'getGetClaimsProcessed',
    'get_refunds_processed': 'getGetRefundsProcessed',
    'get_usdt_jetton_master': 'getGetUsdtJettonMaster',
    'get_usdt_decimals': 'getGetUsdtDecimals',
    'get_sale_token_jetton_master': 'getGetSaleTokenJettonMaster',
    'get_usdt_jetton_wallet': 'getGetUsdtJettonWallet',
    'get_sale_token_jetton_wallet': 'getGetSaleTokenJettonWallet',
    'get_remaining_sale_tokens_withdrawn': 'getGetRemainingSaleTokensWithdrawn',
    'get_jetton_wallets_configured': 'getGetJettonWalletsConfigured',
    'get_user_has_voted': 'getGetUserHasVoted',
    'get_user_vote': 'getGetUserVote',
    'get_user_contribution': 'getGetUserContribution',
    'get_user_allocation': 'getGetUserAllocation',
    'get_user_claimed': 'getGetUserClaimed',
    'get_user_claimed_allocation': 'getGetUserClaimedAllocation',
    'get_user_vested_allocation': 'getGetUserVestedAllocation',
    'get_user_claimable_allocation': 'getGetUserClaimableAllocation',
    'get_user_refunded': 'getGetUserRefunded',
    'get_user_rejected_usdt_credit': 'getGetUserRejectedUsdtCredit',
}

const GramStarterIdo_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Vote"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetJettonWallets"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AdvanceStage"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonTransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimAllocation"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RefundUSDT"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimRejectedUSDT"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonExcesses"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawRemainingSaleTokens"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawRaisedUSDT"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetAdminBlocked"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeAdmin"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SuperWithdrawJetton"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SuperWithdrawAnyJetton"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SuperWithdrawTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"FundContractTon"}},
]


export class GramStarterIdo implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = GramStarterIdo_errors_backward;
    public static readonly opcodes = GramStarterIdo_opcodes;
    
    static async init(owner: Address, superAdmin: Address, tonReserve: bigint, usdtJettonMaster: Address, saleTokenJettonMaster: Address, softCap: bigint, hardCap: bigint, minBuy: bigint, maxBuy: bigint, tokenPriceMicroUsdt: bigint, saleTokenUnit: bigint, tgeBasisPoints: bigint, cliffDuration: bigint, monthlyVestingPeriods: bigint, usdtDecimals: bigint, deploymentId: bigint) {
        return await GramStarterIdo_init(owner, superAdmin, tonReserve, usdtJettonMaster, saleTokenJettonMaster, softCap, hardCap, minBuy, maxBuy, tokenPriceMicroUsdt, saleTokenUnit, tgeBasisPoints, cliffDuration, monthlyVestingPeriods, usdtDecimals, deploymentId);
    }
    
    static async fromInit(owner: Address, superAdmin: Address, tonReserve: bigint, usdtJettonMaster: Address, saleTokenJettonMaster: Address, softCap: bigint, hardCap: bigint, minBuy: bigint, maxBuy: bigint, tokenPriceMicroUsdt: bigint, saleTokenUnit: bigint, tgeBasisPoints: bigint, cliffDuration: bigint, monthlyVestingPeriods: bigint, usdtDecimals: bigint, deploymentId: bigint) {
        const __gen_init = await GramStarterIdo_init(owner, superAdmin, tonReserve, usdtJettonMaster, saleTokenJettonMaster, softCap, hardCap, minBuy, maxBuy, tokenPriceMicroUsdt, saleTokenUnit, tgeBasisPoints, cliffDuration, monthlyVestingPeriods, usdtDecimals, deploymentId);
        const address = contractAddress(0, __gen_init);
        return new GramStarterIdo(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new GramStarterIdo(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  GramStarterIdo_types,
        getters: GramStarterIdo_getters,
        receivers: GramStarterIdo_receivers,
        errors: GramStarterIdo_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: Deploy | Vote | SetJettonWallets | AdvanceStage | JettonTransferNotification | ClaimAllocation | RefundUSDT | ClaimRejectedUSDT | JettonExcesses | WithdrawRemainingSaleTokens | WithdrawRaisedUSDT | SetAdminBlocked | ChangeAdmin | SuperWithdrawJetton | SuperWithdrawAnyJetton | SuperWithdrawTon | FundContractTon) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Vote') {
            body = beginCell().store(storeVote(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetJettonWallets') {
            body = beginCell().store(storeSetJettonWallets(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AdvanceStage') {
            body = beginCell().store(storeAdvanceStage(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonTransferNotification') {
            body = beginCell().store(storeJettonTransferNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimAllocation') {
            body = beginCell().store(storeClaimAllocation(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RefundUSDT') {
            body = beginCell().store(storeRefundUSDT(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimRejectedUSDT') {
            body = beginCell().store(storeClaimRejectedUSDT(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonExcesses') {
            body = beginCell().store(storeJettonExcesses(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawRemainingSaleTokens') {
            body = beginCell().store(storeWithdrawRemainingSaleTokens(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawRaisedUSDT') {
            body = beginCell().store(storeWithdrawRaisedUSDT(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetAdminBlocked') {
            body = beginCell().store(storeSetAdminBlocked(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeAdmin') {
            body = beginCell().store(storeChangeAdmin(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SuperWithdrawJetton') {
            body = beginCell().store(storeSuperWithdrawJetton(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SuperWithdrawAnyJetton') {
            body = beginCell().store(storeSuperWithdrawAnyJetton(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SuperWithdrawTon') {
            body = beginCell().store(storeSuperWithdrawTon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'FundContractTon') {
            body = beginCell().store(storeFundContractTon(message)).endCell();
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
    
    async getGetTonReserve(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_ton_reserve', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetDeploymentId(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_deployment_id', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetIdoState(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_ido_state', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetFailedReason(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_failed_reason', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetRaisedCapital(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_raised_capital', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetSoftCap(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_soft_cap', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetHardCap(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_hard_cap', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetMinBuy(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_min_buy', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetMaxBuy(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_max_buy', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetSoldTokens(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_sold_tokens', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetAdmin(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_admin', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetSuperadmin(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_superadmin', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetAdminBlocked(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_admin_blocked', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetRaisedUsdtWithdrawn(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_raised_usdt_withdrawn', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetSaleTokenRequired(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_sale_token_required', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetSaleTokenDeposited(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_sale_token_deposited', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetSaleTokenClaimed(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_sale_token_claimed', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetTgeBasisPoints(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_tge_basis_points', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetCliffDuration(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_cliff_duration', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetMonthlyVestingPeriods(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_monthly_vesting_periods', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetDistributionStartedAt(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_distribution_started_at', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetUsdtRefunded(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_usdt_refunded', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetUpvotes(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_upvotes', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetDownvotes(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_downvotes', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetParticipantCount(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_participant_count', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetClaimsProcessed(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_claims_processed', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetRefundsProcessed(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_refunds_processed', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetUsdtJettonMaster(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_usdt_jetton_master', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetUsdtDecimals(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_usdt_decimals', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetSaleTokenJettonMaster(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_sale_token_jetton_master', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetUsdtJettonWallet(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_usdt_jetton_wallet', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetSaleTokenJettonWallet(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_sale_token_jetton_wallet', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetRemainingSaleTokensWithdrawn(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_remaining_sale_tokens_withdrawn', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetJettonWalletsConfigured(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_jetton_wallets_configured', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetUserHasVoted(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_has_voted', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetUserVote(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_vote', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetUserContribution(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_contribution', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetUserAllocation(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_allocation', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetUserClaimed(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_claimed', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetUserClaimedAllocation(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_claimed_allocation', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetUserVestedAllocation(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_vested_allocation', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetUserClaimableAllocation(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_claimable_allocation', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetUserRefunded(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_refunded', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetUserRejectedUsdtCredit(provider: ContractProvider, user: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(user);
        const source = (await provider.get('get_user_rejected_usdt_credit', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}