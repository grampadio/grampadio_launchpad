import "@stdlib/deploy";

message SetPaused {
    paused: Bool;
}

message SetRate {
    rateScaled: Int as uint128;
}

message SetTonRate {
    tonRateScaled: Int as uint128;
}

message SetMaxBuy {
    maxBuy: Int as coins;
}

message SetJettonWallets {
    gramJettonWallet: Address;
    usdtJettonWallet: Address;
}

message ChangeOwner {
    newOwner: Address;
}

message FundTon {}

message OwnerWithdrawTon {
    amount: Int as coins;
    destination: Address;
}

message OwnerWithdrawGram {
    amount: Int as coins;
    destination: Address;
}

message OwnerWithdrawUsdt {
    amount: Int as coins;
    destination: Address;
}

message SwapTonForGram {
    minOut: Int as coins;
}

message(0x7362d09c) JettonTransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Slice as remaining;
}

message(0xf8a7ea5) JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

message(0xd53276db) JettonExcesses {
    queryId: Int as uint64;
}

struct ContractDetails {
    owner: Address;
    deploymentId: Int;
    gramJettonMaster: Address;
    gramJettonWallet: Address;
    gramDecimals: Int;
    usdtJettonMaster: Address;
    usdtJettonWallet: Address;
    usdtDecimals: Int;
    jettonWalletsConfigured: Bool;
    paused: Bool;
    rateScaled: Int;
    tonRateScaled: Int;
    rateScale: Int;
    maxBuy: Int;
    gramReserve: Int;
    usdtReserve: Int;
    tonReserve: Int;
    totalSwapCount: Int;
    totalGramToUsdtVolume: Int;
    totalUsdtToGramVolume: Int;
    totalTonToGramVolume: Int;
    totalGramToTonVolume: Int;
}

contract GramPadSimpleSwap {
    owner: Address;
    deploymentId: Int as uint64;

    gramJettonMaster: Address;
    gramJettonWallet: Address;
    gramDecimals: Int as uint8;

    usdtJettonMaster: Address;
    usdtJettonWallet: Address;
    usdtDecimals: Int as uint8;
    jettonWalletsConfigured: Bool;

    paused: Bool;

    rateScaled: Int as uint128;
    tonRateScaled: Int as uint128;
    maxBuy: Int as coins;
    nextTransferQueryId: Int as uint64;

    gramReserve: Int as coins;
    usdtReserve: Int as coins;
    tonReserve: Int as coins;

    totalSwapCount: Int as uint64;
    totalGramToUsdtVolume: Int as coins;
    totalUsdtToGramVolume: Int as coins;
    totalTonToGramVolume: Int as coins;
    totalGramToTonVolume: Int as coins;

    init(
        owner: Address,
        gramJettonMaster: Address,
        gramDecimals: Int,
        usdtJettonMaster: Address,
        usdtDecimals: Int,
        rateScaled: Int,
        tonRateScaled: Int,
        maxBuy: Int,
        deploymentId: Int
    ) {
        require(rateScaled > 0, "Invalid rate");
        require(tonRateScaled > 0, "Invalid TON rate");
        require(maxBuy >= 0, "Invalid max buy");
        require(gramDecimals >= 0 && gramDecimals <= 18, "Invalid GRAM decimals");
        require(usdtDecimals >= 0 && usdtDecimals <= 18, "Invalid USDT decimals");

        self.owner = owner;
        self.deploymentId = deploymentId;
        self.gramJettonMaster = gramJettonMaster;
        self.gramJettonWallet = owner;
        self.gramDecimals = gramDecimals;
        self.usdtJettonMaster = usdtJettonMaster;
        self.usdtJettonWallet = owner;
        self.usdtDecimals = usdtDecimals;
        self.jettonWalletsConfigured = false;
        self.paused = false;
        self.rateScaled = rateScaled;
        self.tonRateScaled = tonRateScaled;
        self.maxBuy = maxBuy;
        self.nextTransferQueryId = 1;
        self.gramReserve = 0;
        self.usdtReserve = 0;
        self.tonReserve = 0;
        self.totalSwapCount = 0;
        self.totalGramToUsdtVolume = 0;
        self.totalUsdtToGramVolume = 0;
        self.totalTonToGramVolume = 0;
        self.totalGramToTonVolume = 0;
    }

    fun rateScale(): Int {
        return 1000000000;
    }

    fun requireOwner() {
        require(sender() == self.owner, "Only owner");
    }

    fun decimalFactor(decimals: Int): Int {
        let factor: Int = 1;
        let i: Int = 0;
        while (i < decimals) {
            factor = factor * 10;
            i = i + 1;
        }
        return factor;
    }

    fun quoteGramOut(usdtAmount: Int): Int {
        return (
            usdtAmount *
            self.rateScaled *
            self.decimalFactor(self.gramDecimals)
        ) / (
            self.rateScale() * self.decimalFactor(self.usdtDecimals)
        );
    }

    fun quoteUsdtOut(gramAmount: Int): Int {
        return (
            gramAmount *
            self.rateScale() *
            self.decimalFactor(self.usdtDecimals)
        ) / (
            self.rateScaled * self.decimalFactor(self.gramDecimals)
        );
    }

    fun quoteGramOutFromTon(tonAmount: Int): Int {
        return (
            tonAmount *
            self.tonRateScaled *
            self.decimalFactor(self.gramDecimals)
        ) / (
            self.rateScale() * self.decimalFactor(9)
        );
    }

    fun quoteTonOut(gramAmount: Int): Int {
        return (
            gramAmount *
            self.rateScale() *
            self.decimalFactor(9)
        ) / (
            self.tonRateScaled * self.decimalFactor(self.gramDecimals)
        );
    }

    fun sendJetton(jettonWallet: Address, destination: Address, amount: Int) {
        let queryId: Int = self.nextTransferQueryId;
        self.nextTransferQueryId = self.nextTransferQueryId + 1;

        message(MessageParameters {
            to: jettonWallet,
            value: ton("0.20"),
            bounce: true,
            body: JettonTransfer {
                queryId: queryId,
                amount: amount,
                destination: destination,
                responseDestination: myAddress(),
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).asSlice()
            }.toCell()
        });
    }

    fun getContractDetails(): ContractDetails {
        return ContractDetails {
            owner: self.owner,
            deploymentId: self.deploymentId,
            gramJettonMaster: self.gramJettonMaster,
            gramJettonWallet: self.gramJettonWallet,
            gramDecimals: self.gramDecimals,
            usdtJettonMaster: self.usdtJettonMaster,
            usdtJettonWallet: self.usdtJettonWallet,
            usdtDecimals: self.usdtDecimals,
            jettonWalletsConfigured: self.jettonWalletsConfigured,
            paused: self.paused,
            rateScaled: self.rateScaled,
            tonRateScaled: self.tonRateScaled,
            rateScale: self.rateScale(),
            maxBuy: self.maxBuy,
            gramReserve: self.gramReserve,
            usdtReserve: self.usdtReserve,
            tonReserve: self.tonReserve,
            totalSwapCount: self.totalSwapCount,
            totalGramToUsdtVolume: self.totalGramToUsdtVolume,
            totalUsdtToGramVolume: self.totalUsdtToGramVolume,
            totalTonToGramVolume: self.totalTonToGramVolume,
            totalGramToTonVolume: self.totalGramToTonVolume
        };
    }

    receive(msg: Deploy) {}

    receive(msg: FundTon) {
        require(context().value > 0, "TON amount required");
        self.tonReserve = self.tonReserve + context().value;
    }

    receive(msg: SetPaused) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
        self.paused = msg.paused;
    }

    receive(msg: SetRate) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
        require(msg.rateScaled > 0, "Invalid rate");
        self.rateScaled = msg.rateScaled;
    }

    receive(msg: SetTonRate) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
        require(msg.tonRateScaled > 0, "Invalid TON rate");
        self.tonRateScaled = msg.tonRateScaled;
    }

    receive(msg: SetMaxBuy) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
        require(msg.maxBuy >= 0, "Invalid max buy");
        self.maxBuy = msg.maxBuy;
    }

    receive(msg: SetJettonWallets) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");

        self.gramJettonWallet = msg.gramJettonWallet;
        self.usdtJettonWallet = msg.usdtJettonWallet;
        self.jettonWalletsConfigured = true;
    }

    receive(msg: ChangeOwner) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
        self.owner = msg.newOwner;
    }

    receive(msg: OwnerWithdrawTon) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
        require(msg.amount > 0, "Invalid amount");
        require(self.tonReserve >= msg.amount, "TON reserve too low");
        require(myBalance() - context().value >= msg.amount, "TON balance too low");

        self.tonReserve = self.tonReserve - msg.amount;

        message(MessageParameters {
            to: msg.destination,
            value: msg.amount,
            bounce: false
        });
    }

    receive(msg: OwnerWithdrawGram) {
        self.requireOwner();
        require(context().value >= ton("0.16"), "Not enough TON");
        require(msg.amount > 0, "Invalid amount");
        require(self.gramReserve >= msg.amount, "GRAM reserve too low");

        self.gramReserve = self.gramReserve - msg.amount;
        self.sendJetton(self.gramJettonWallet, msg.destination, msg.amount);
    }

    receive(msg: OwnerWithdrawUsdt) {
        self.requireOwner();
        require(context().value >= ton("0.16"), "Not enough TON");
        require(msg.amount > 0, "Invalid amount");
        require(self.usdtReserve >= msg.amount, "USDT reserve too low");

        self.usdtReserve = self.usdtReserve - msg.amount;
        self.sendJetton(self.usdtJettonWallet, msg.destination, msg.amount);
    }

    receive(msg: JettonTransferNotification) {
        require(msg.amount > 0, "Invalid amount");
        require(self.jettonWalletsConfigured, "Jetton wallets not configured");

        let incomingWallet: Address = sender();
        let payload: Slice = msg.forwardPayload;

        if (payload.bits() < 160 && payload.refs() > 0) {
            payload = payload.loadRef().beginParse();
        }

        if (incomingWallet == self.usdtJettonWallet) {
            if (payload.bits() < 160) {
                self.usdtReserve = self.usdtReserve + msg.amount;
                return;
            }

            require(!self.paused, "Swap paused");
            require(myBalance() - context().value >= ton("0.22"), "TON reserve too low");
            require(self.maxBuy == 0 || msg.amount <= self.maxBuy, "Max buy exceeded");

            let marker: Int = payload.loadUint(32);
            require(marker == 0x53574150, "Invalid swap payload");
            let minOut: Int = payload.loadUint(128);

            let gramOut: Int = self.quoteGramOut(msg.amount);
            require(gramOut > 0, "Swap output too low");
            require(gramOut >= minOut, "Slippage exceeded");
            require(self.gramReserve >= gramOut, "GRAM reserve too low");

            self.usdtReserve = self.usdtReserve + msg.amount;
            self.gramReserve = self.gramReserve - gramOut;
            self.totalSwapCount = self.totalSwapCount + 1;
            self.totalUsdtToGramVolume = self.totalUsdtToGramVolume + msg.amount;

            self.sendJetton(self.gramJettonWallet, msg.sender, gramOut);
            return;
        }

        require(incomingWallet == self.gramJettonWallet, "Invalid Jetton wallet");

        if (payload.bits() < 160) {
            self.gramReserve = self.gramReserve + msg.amount;
            return;
        }

        require(!self.paused, "Swap paused");
        require(myBalance() - context().value >= ton("0.22"), "TON reserve too low");
        let tonOutCheck: Int = self.quoteTonOut(msg.amount);

        let marker: Int = payload.loadUint(32);
        require(marker == 0x53574150, "Invalid swap payload");
        let route: Int = payload.loadUint(8);
        let minOut: Int = payload.loadUint(128);

        if (route == 0) {
            require(self.maxBuy == 0 || self.quoteUsdtOut(msg.amount) <= self.maxBuy, "Max buy exceeded");

            let usdtOut: Int = self.quoteUsdtOut(msg.amount);
            require(usdtOut > 0, "Swap output too low");
            require(usdtOut >= minOut, "Slippage exceeded");
            require(self.usdtReserve >= usdtOut, "USDT reserve too low");

            self.gramReserve = self.gramReserve + msg.amount;
            self.usdtReserve = self.usdtReserve - usdtOut;
            self.totalSwapCount = self.totalSwapCount + 1;
            self.totalGramToUsdtVolume = self.totalGramToUsdtVolume + msg.amount;

            self.sendJetton(self.usdtJettonWallet, msg.sender, usdtOut);
            return;
        }

        require(route == 1, "Invalid swap route");
        require(tonOutCheck > 0, "Swap output too low");
        require(tonOutCheck >= minOut, "Slippage exceeded");
        require(self.tonReserve >= tonOutCheck, "TON reserve too low");
        require(myBalance() - context().value >= tonOutCheck, "TON payout unavailable");

        self.gramReserve = self.gramReserve + msg.amount;
        self.tonReserve = self.tonReserve - tonOutCheck;
        self.totalSwapCount = self.totalSwapCount + 1;
        self.totalGramToTonVolume = self.totalGramToTonVolume + msg.amount;

        message(MessageParameters {
            to: msg.sender,
            value: tonOutCheck,
            bounce: false
        });
    }

    receive(msg: SwapTonForGram) {
        require(!self.paused, "Swap paused");
        require(msg.minOut >= 0, "Invalid min out");

        let tonAmount: Int = context().value;
        require(tonAmount > 0, "TON amount required");

        let gramOut: Int = self.quoteGramOutFromTon(tonAmount);
        require(gramOut > 0, "Swap output too low");
        require(gramOut >= msg.minOut, "Slippage exceeded");
        require(self.gramReserve >= gramOut, "GRAM reserve too low");
        require(myBalance() >= ton("0.22"), "TON reserve too low");

        self.tonReserve = self.tonReserve + tonAmount;
        self.gramReserve = self.gramReserve - gramOut;
        self.totalSwapCount = self.totalSwapCount + 1;
        self.totalTonToGramVolume = self.totalTonToGramVolume + tonAmount;

        self.sendJetton(self.gramJettonWallet, sender(), gramOut);
    }

    receive(msg: JettonExcesses) {}

    get fun get_contract_version(): Int {
        return 1;
    }

    get fun get_contract_details(): ContractDetails {
        return self.getContractDetails();
    }

    get fun get_quote_gram_out(usdtAmount: Int): Int {
        require(usdtAmount >= 0, "Invalid amount");
        return self.quoteGramOut(usdtAmount);
    }

    get fun get_quote_usdt_out(gramAmount: Int): Int {
        require(gramAmount >= 0, "Invalid amount");
        return self.quoteUsdtOut(gramAmount);
    }

    get fun get_quote_gram_out_from_ton(tonAmount: Int): Int {
        require(tonAmount >= 0, "Invalid amount");
        return self.quoteGramOutFromTon(tonAmount);
    }

    get fun get_quote_ton_out(gramAmount: Int): Int {
        require(gramAmount >= 0, "Invalid amount");
        return self.quoteTonOut(gramAmount);
    }
}
