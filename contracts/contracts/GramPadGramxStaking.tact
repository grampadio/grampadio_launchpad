import "@stdlib/deploy";

/**
 * stakeKind:
 * 0 = FLEX
 * 1 = LOCKED
 */

message ConfigureStake {
    stakeKind: Int as uint8;
    durationSeconds: Int as uint32;
}

message SetGramxJettonWallet {
    gramxJettonWallet: Address;
}

message SetAnnualRoi {
    annualRoiBasisPoints: Int as uint16;
}

message SetDurationRoi {
    durationDays: Int as uint16;
    annualRoiBasisPoints: Int as uint16;
}

message SetFlexUnstakeFee {
    flexUnstakeFeeBasisPoints: Int as uint16;
}

message SetPaused {
    paused: Bool;
}

message ChangeOwner {
    newOwner: Address;
}

message ClaimRewards {
    stakeId: Int as uint64;
}

message Unstake {
    stakeId: Int as uint64;
}

message FundContractTon {}

message OwnerWithdrawTon {
    amount: Int as coins;
    destination: Address;
}

message OwnerWithdrawGramx {
    amount: Int as coins;
    destination: Address;
}

message OwnerWithdrawAnyJetton {
    jettonWallet: Address;
    amount: Int as coins;
    destination: Address;
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
    gramxJettonMaster: Address;
    gramxJettonWallet: Address;
    jettonWalletConfigured: Bool;
    annualRoiBasisPoints: Int;
    flexUnstakeFeeBasisPoints: Int;
    minStake: Int;
    paused: Bool;
    totalStaked: Int;
    rewardReserve: Int;
    totalRewardsPaid: Int;
    totalFeesCollected: Int;
    activeStakerCount: Int;
    totalStakePositions: Int;
    nextStakeId: Int;
}

struct StakingPlans {
    sevenDaysRoiBasisPoints: Int;
    thirtyDaysRoiBasisPoints: Int;
    threeMonthsRoiBasisPoints: Int;
    nineMonthsRoiBasisPoints: Int;
    twelveMonthsRoiBasisPoints: Int;
}

struct UserSummary {
    user: Address;
    totalStakePositions: Int;
    activeStakePositions: Int;
}

struct StakeDetails {
    stakeId: Int;
    owner: Address;
    active: Bool;
    amount: Int;
    pendingReward: Int;
    roiBasisPoints: Int;
    stakeKind: Int;
    startedAt: Int;
    duration: Int;
    maturityAt: Int;
    claimedRewards: Int;
}

struct StakingDashboard {
    contractDetails: ContractDetails;
    stakingPlans: StakingPlans;
    userSummary: UserSummary;
    offset: Int;
    nextOffset: Int;
    hasMore: Bool;
    positions: map<Int, StakeDetails>;
}

contract GramPadGramxStaking {
    owner: Address;
    deploymentId: Int as uint64;

    gramxJettonMaster: Address;
    gramxJettonWallet: Address;
    jettonWalletConfigured: Bool;

    annualRoiBasisPoints: Int as uint16;
    sevenDaysRoiBasisPoints: Int as uint16;
    thirtyDaysRoiBasisPoints: Int as uint16;
    threeMonthsRoiBasisPoints: Int as uint16;
    nineMonthsRoiBasisPoints: Int as uint16;
    twelveMonthsRoiBasisPoints: Int as uint16;
    flexUnstakeFeeBasisPoints: Int as uint16;
    minStake: Int as coins;
    paused: Bool;

    totalStaked: Int as coins;
    rewardReserve: Int as coins;
    totalRewardsPaid: Int as coins;
    totalFeesCollected: Int as coins;

    activeStakerCount: Int as uint32;
    nextTransferQueryId: Int as uint64;
    nextStakeId: Int as uint64;

    pendingStakeKind: map<Address, Int>;
    pendingStakeDuration: map<Address, Int>;

    userStakeCount: map<Address, Int>;
    userActiveStakeCount: map<Address, Int>;
    userStakeIdByIndex: map<Int, Int>;

    stakeOwner: map<Int, Address>;
    stakeAmount: map<Int, Int>;
    stakeRoiBasisPoints: map<Int, Int>;
    stakeKind: map<Int, Int>;
    stakeStartedAt: map<Int, Int>;
    stakeDuration: map<Int, Int>;
    stakeClaimedRewards: map<Int, Int>;
    stakeActive: map<Int, Bool>;

    init(
        owner: Address,
        gramxJettonMaster: Address,
        annualRoiBasisPoints: Int,
        sevenDaysRoiBasisPoints: Int,
        thirtyDaysRoiBasisPoints: Int,
        threeMonthsRoiBasisPoints: Int,
        nineMonthsRoiBasisPoints: Int,
        twelveMonthsRoiBasisPoints: Int,
        minStake: Int,
        flexUnstakeFeeBasisPoints: Int,
        deploymentId: Int
    ) {
        require(annualRoiBasisPoints >= 0 && annualRoiBasisPoints <= 100000, "Invalid ROI");
        require(sevenDaysRoiBasisPoints >= 0 && sevenDaysRoiBasisPoints <= 100000, "Invalid 7-day ROI");
        require(thirtyDaysRoiBasisPoints >= 0 && thirtyDaysRoiBasisPoints <= 100000, "Invalid 30-day ROI");
        require(threeMonthsRoiBasisPoints >= 0 && threeMonthsRoiBasisPoints <= 100000, "Invalid 3-month ROI");
        require(nineMonthsRoiBasisPoints >= 0 && nineMonthsRoiBasisPoints <= 100000, "Invalid 9-month ROI");
        require(twelveMonthsRoiBasisPoints >= 0 && twelveMonthsRoiBasisPoints <= 100000, "Invalid 12-month ROI");
        require(flexUnstakeFeeBasisPoints <= 5000, "Fee too high");
        require(minStake > 0, "Minimum stake required");

        self.owner = owner;
        self.deploymentId = deploymentId;
        self.gramxJettonMaster = gramxJettonMaster;
        self.gramxJettonWallet = owner;
        self.jettonWalletConfigured = false;

        self.annualRoiBasisPoints = annualRoiBasisPoints;
        self.sevenDaysRoiBasisPoints = sevenDaysRoiBasisPoints;
        self.thirtyDaysRoiBasisPoints = thirtyDaysRoiBasisPoints;
        self.threeMonthsRoiBasisPoints = threeMonthsRoiBasisPoints;
        self.nineMonthsRoiBasisPoints = nineMonthsRoiBasisPoints;
        self.twelveMonthsRoiBasisPoints = twelveMonthsRoiBasisPoints;
        self.flexUnstakeFeeBasisPoints = flexUnstakeFeeBasisPoints;
        self.minStake = minStake;
        self.paused = false;

        self.totalStaked = 0;
        self.rewardReserve = 0;
        self.totalRewardsPaid = 0;
        self.totalFeesCollected = 0;

        self.activeStakerCount = 0;
        self.nextTransferQueryId = 1;
        self.nextStakeId = 1;
    }

    fun requireOwner() {
        require(sender() == self.owner, "Only owner");
    }

    fun requireValidDurationSeconds(durationSeconds: Int) {
        require(
            durationSeconds == 604800 ||
            durationSeconds == 2592000 ||
            durationSeconds == 7776000 ||
            durationSeconds == 23328000 ||
            durationSeconds == 31536000,
            "Invalid duration"
        );
    }

    fun requireValidDurationDays(durationDays: Int) {
        require(
            durationDays == 7 ||
            durationDays == 30 ||
            durationDays == 90 ||
            durationDays == 270 ||
            durationDays == 365,
            "Invalid duration"
        );
    }

    fun roiForDuration(durationSeconds: Int): Int {
        self.requireValidDurationSeconds(durationSeconds);

        if (durationSeconds == 604800) {
            return self.sevenDaysRoiBasisPoints;
        }
        if (durationSeconds == 2592000) {
            return self.thirtyDaysRoiBasisPoints;
        }
        if (durationSeconds == 7776000) {
            return self.threeMonthsRoiBasisPoints;
        }
        if (durationSeconds == 23328000) {
            return self.nineMonthsRoiBasisPoints;
        }

        return self.twelveMonthsRoiBasisPoints;
    }

    fun indexKey(user: Address, index: Int): Int {
        return beginCell()
            .storeAddress(user)
            .storeUint(index, 64)
            .endCell()
            .hash();
    }

    fun stakeExists(stakeId: Int): Bool {
        let ownerValue: Address? = self.stakeOwner.get(stakeId);
        return ownerValue != null;
    }

    fun ownerOf(stakeId: Int): Address {
        let value: Address? = self.stakeOwner.get(stakeId);
        require(value != null, "Stake not found");
        return value!!;
    }

    fun activeOf(stakeId: Int): Bool {
        let value: Bool? = self.stakeActive.get(stakeId);
        if (value == null) {
            return false;
        }
        return value!!;
    }

    fun amountOf(stakeId: Int): Int {
        let value: Int? = self.stakeAmount.get(stakeId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun claimedOf(stakeId: Int): Int {
        let value: Int? = self.stakeClaimedRewards.get(stakeId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun roiOf(stakeId: Int): Int {
        let value: Int? = self.stakeRoiBasisPoints.get(stakeId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun kindOf(stakeId: Int): Int {
        let value: Int? = self.stakeKind.get(stakeId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun startedAtOf(stakeId: Int): Int {
        let value: Int? = self.stakeStartedAt.get(stakeId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun durationOf(stakeId: Int): Int {
        let value: Int? = self.stakeDuration.get(stakeId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun maturityOf(stakeId: Int): Int {
        return self.startedAtOf(stakeId) + self.durationOf(stakeId);
    }

    fun userStakeCountOf(user: Address): Int {
        let value: Int? = self.userStakeCount.get(user);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun userActiveStakeCountOf(user: Address): Int {
        let value: Int? = self.userActiveStakeCount.get(user);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun totalReward(stakeId: Int, atTime: Int): Int {
        if (!self.activeOf(stakeId)) {
            return 0;
        }

        let amount: Int = self.amountOf(stakeId);
        let startedAt: Int = self.startedAtOf(stakeId);
        let duration: Int = self.durationOf(stakeId);
        let roi: Int = self.roiOf(stakeId);
        let elapsed: Int = atTime - startedAt;

        if (elapsed <= 0 || amount <= 0 || roi <= 0) {
            return 0;
        }

        if (elapsed > duration) {
            elapsed = duration;
        }

        return (((amount * roi) / 10000) * elapsed) / 31536000;
    }

    fun claimableReward(stakeId: Int): Int {
        let total: Int = self.totalReward(stakeId, now());
        let claimed: Int = self.claimedOf(stakeId);

        if (total <= claimed) {
            return 0;
        }

        return total - claimed;
    }

    fun sendGramx(to: Address, amount: Int) {
        let queryId: Int = self.nextTransferQueryId;
        self.nextTransferQueryId = self.nextTransferQueryId + 1;

        message(MessageParameters {
            to: self.gramxJettonWallet,
            value: ton("0.12"),
            bounce: true,
            body: JettonTransfer {
                queryId: queryId,
                amount: amount,
                destination: to,
                responseDestination: myAddress(),
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).asSlice()
            }.toCell()
        });
    }

    receive(msg: Deploy) {}

    receive(msg: FundContractTon) {
        self.requireOwner();
        require(context().value > 0, "TON funding required");
    }

    receive(msg: OwnerWithdrawTon) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        require(msg.amount > 0, "Invalid withdrawal amount");
        require(
            myBalance() - context().value >= msg.amount,
            "Withdrawal exceeds TON balance"
        );

        message(MessageParameters {
            to: msg.destination,
            value: msg.amount,
            bounce: false
        });
    }

    receive(msg: OwnerWithdrawGramx) {
        self.requireOwner();
        require(context().value >= ton("0.15"), "Not enough TON for withdraw gas");
        require(self.jettonWalletConfigured, "Jetton wallet not configured");
        require(msg.amount > 0, "Invalid withdrawal amount");

        let feesWithdrawn: Int = msg.amount;
        if (feesWithdrawn > self.totalFeesCollected) {
            feesWithdrawn = self.totalFeesCollected;
        }

        self.totalFeesCollected = self.totalFeesCollected - feesWithdrawn;
        let reserveWithdrawn: Int = msg.amount - feesWithdrawn;
        if (reserveWithdrawn > self.rewardReserve) {
            reserveWithdrawn = self.rewardReserve;
        }
        self.rewardReserve = self.rewardReserve - reserveWithdrawn;
        self.sendGramx(msg.destination, msg.amount);
    }

    receive(msg: OwnerWithdrawAnyJetton) {
        self.requireOwner();
        require(context().value >= ton("0.15"), "Not enough TON for withdraw gas");
        require(msg.jettonWallet != myAddress(), "Invalid Jetton wallet");
        require(msg.amount > 0, "Invalid withdrawal amount");

        message(MessageParameters {
            to: msg.jettonWallet,
            value: ton("0.12"),
            bounce: true,
            body: JettonTransfer {
                queryId: 0,
                amount: msg.amount,
                destination: msg.destination,
                responseDestination: myAddress(),
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).asSlice()
            }.toCell()
        });
    }

    receive(msg: ConfigureStake) {
        require(!self.paused, "Staking paused");
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        require(msg.stakeKind == 0 || msg.stakeKind == 1, "Invalid stake kind");

        self.requireValidDurationSeconds(msg.durationSeconds);

        let user: Address = sender();

        self.pendingStakeKind.set(user, msg.stakeKind);
        self.pendingStakeDuration.set(user, msg.durationSeconds);
    }

    receive(msg: SetGramxJettonWallet) {
        self.requireOwner();
        require(!self.jettonWalletConfigured, "Wallet already configured");
        require(context().value >= ton("0.01"), "Not enough TON for gas");

        self.gramxJettonWallet = msg.gramxJettonWallet;
        self.jettonWalletConfigured = true;
    }

    receive(msg: SetAnnualRoi) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        require(msg.annualRoiBasisPoints <= 100000, "Invalid ROI");

        self.annualRoiBasisPoints = msg.annualRoiBasisPoints;
        self.sevenDaysRoiBasisPoints = msg.annualRoiBasisPoints;
        self.thirtyDaysRoiBasisPoints = msg.annualRoiBasisPoints;
        self.threeMonthsRoiBasisPoints = msg.annualRoiBasisPoints;
        self.nineMonthsRoiBasisPoints = msg.annualRoiBasisPoints;
        self.twelveMonthsRoiBasisPoints = msg.annualRoiBasisPoints;
    }

    receive(msg: SetDurationRoi) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        self.requireValidDurationDays(msg.durationDays);
        require(msg.annualRoiBasisPoints <= 100000, "Invalid ROI");

        if (msg.durationDays == 7) {
            self.sevenDaysRoiBasisPoints = msg.annualRoiBasisPoints;
            return;
        }
        if (msg.durationDays == 30) {
            self.thirtyDaysRoiBasisPoints = msg.annualRoiBasisPoints;
            return;
        }
        if (msg.durationDays == 90) {
            self.threeMonthsRoiBasisPoints = msg.annualRoiBasisPoints;
            return;
        }
        if (msg.durationDays == 270) {
            self.nineMonthsRoiBasisPoints = msg.annualRoiBasisPoints;
            return;
        }

        self.twelveMonthsRoiBasisPoints = msg.annualRoiBasisPoints;
    }

    receive(msg: SetFlexUnstakeFee) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        require(msg.flexUnstakeFeeBasisPoints <= 5000, "Fee too high");

        self.flexUnstakeFeeBasisPoints = msg.flexUnstakeFeeBasisPoints;
    }

    receive(msg: SetPaused) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON for gas");

        self.paused = msg.paused;
    }

    receive(msg: ChangeOwner) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON for gas");

        self.owner = msg.newOwner;
    }

    receive(msg: JettonTransferNotification) {
        require(self.jettonWalletConfigured, "Jetton wallet not configured");
        require(sender() == self.gramxJettonWallet, "Invalid Jetton wallet");
        require(msg.amount > 0, "Invalid amount");

        // Owner transfers without stake metadata fund rewards. When the owner
        // includes the atomic stake payload, treat it as a normal stake.
        if (msg.sender == self.owner && msg.forwardPayload.bits() < 72) {
            self.rewardReserve = self.rewardReserve + msg.amount;
            return;
        }

        require(!self.paused, "Staking paused");
        require(msg.amount >= self.minStake, "Below minimum stake");

        let staker: Address = msg.sender;
        let userPositionCount: Int = self.userStakeCountOf(staker);

        // Jetton transfers complete before this notification is processed.
        // Return a sixth deposit instead of rejecting and stranding its tokens.
        if (userPositionCount >= 5) {
            self.sendGramx(staker, msg.amount);
            return;
        }

        let configuredKind: Int = -1;
        let configuredDuration: Int = 0;
        let stakePayload: Slice = msg.forwardPayload;

        // Jetton wallets may forward the custom payload inline or as a cell
        // reference. Normalize both encodings before reading stake metadata.
        if (stakePayload.bits() < 72 && stakePayload.refs() > 0) {
            stakePayload = stakePayload.loadRef().beginParse();
        }

        if (stakePayload.bits() >= 72) {
            let marker: Int = stakePayload.loadUint(32);
            require(marker == 0x4752414d, "Invalid stake payload");
            configuredKind = stakePayload.loadUint(8);
            configuredDuration = stakePayload.loadUint(32);
        } else {
            let pendingKind: Int? = self.pendingStakeKind.get(staker);
            let pendingDuration: Int? = self.pendingStakeDuration.get(staker);
            require(pendingKind != null && pendingDuration != null, "Stake not configured");
            configuredKind = pendingKind!!;
            configuredDuration = pendingDuration!!;
            self.pendingStakeKind.del(staker);
            self.pendingStakeDuration.del(staker);
        }

        require(configuredKind == 0 || configuredKind == 1, "Invalid stake kind");
        self.requireValidDurationSeconds(configuredDuration);

        let stakeId: Int = self.nextStakeId;
        self.nextStakeId = self.nextStakeId + 1;

        let userIndex: Int = userPositionCount;
        let activeBefore: Int = self.userActiveStakeCountOf(staker);

        self.userStakeIdByIndex.set(self.indexKey(staker, userIndex), stakeId);
        self.userStakeCount.set(staker, userIndex + 1);
        self.userActiveStakeCount.set(staker, activeBefore + 1);

        if (activeBefore == 0) {
            self.activeStakerCount = self.activeStakerCount + 1;
        }

        self.stakeOwner.set(stakeId, staker);
        self.stakeAmount.set(stakeId, msg.amount);
        self.stakeRoiBasisPoints.set(stakeId, self.roiForDuration(configuredDuration));
        self.stakeKind.set(stakeId, configuredKind);
        self.stakeStartedAt.set(stakeId, now());
        self.stakeDuration.set(stakeId, configuredDuration);
        self.stakeClaimedRewards.set(stakeId, 0);
        self.stakeActive.set(stakeId, true);

        self.totalStaked = self.totalStaked + msg.amount;
    }

    receive(msg: JettonExcesses) {
        require(sender() == self.gramxJettonWallet, "Invalid Jetton wallet");
    }

    receive(msg: ClaimRewards) {
        require(context().value >= ton("0.15"), "Not enough TON for claim gas");

        let user: Address = sender();

        require(self.stakeExists(msg.stakeId), "Stake not found");
        require(self.ownerOf(msg.stakeId) == user, "Not stake owner");
        require(self.activeOf(msg.stakeId), "Stake not active");

        if (self.kindOf(msg.stakeId) == 1) {
            require(now() >= self.maturityOf(msg.stakeId), "Locked stake not mature");
        }

        let reward: Int = self.claimableReward(msg.stakeId);

        require(reward > 0, "No rewards available");
        require(self.rewardReserve >= reward, "Reward reserve too low");

        self.stakeClaimedRewards.set(msg.stakeId, self.claimedOf(msg.stakeId) + reward);
        self.rewardReserve = self.rewardReserve - reward;
        self.totalRewardsPaid = self.totalRewardsPaid + reward;

        self.sendGramx(user, reward);
    }

    receive(msg: Unstake) {
        require(context().value >= ton("0.15"), "Not enough TON for unstake gas");

        let user: Address = sender();

        require(self.stakeExists(msg.stakeId), "Stake not found");
        require(self.ownerOf(msg.stakeId) == user, "Not stake owner");
        require(self.activeOf(msg.stakeId), "Stake not active");

        let matured: Bool = now() >= self.maturityOf(msg.stakeId);
        let kind: Int = self.kindOf(msg.stakeId);

        require(kind == 0 || matured, "Locked stake not mature");

        let principal: Int = self.amountOf(msg.stakeId);
        let reward: Int = self.claimableReward(msg.stakeId);
        let fee: Int = 0;

        if (kind == 0 && !matured && self.flexUnstakeFeeBasisPoints > 0) {
            fee = (principal * self.flexUnstakeFeeBasisPoints) / 10000;
        }

        if (reward > 0) {
            require(self.rewardReserve >= reward, "Reward reserve too low");
            self.rewardReserve = self.rewardReserve - reward;
            self.totalRewardsPaid = self.totalRewardsPaid + reward;
        }

        // Preserve the original principal and all rewards paid for position history.
        self.stakeClaimedRewards.set(
            msg.stakeId,
            self.claimedOf(msg.stakeId) + reward
        );
        self.totalStaked = self.totalStaked - principal;
        self.totalFeesCollected = self.totalFeesCollected + fee;

        let activeBefore: Int = self.userActiveStakeCountOf(user);
        if (activeBefore > 0) {
            self.userActiveStakeCount.set(user, activeBefore - 1);

            if (activeBefore == 1) {
                self.activeStakerCount = self.activeStakerCount - 1;
            }
        }

        self.stakeActive.set(msg.stakeId, false);

        let payout: Int = principal - fee + reward;

        require(payout > 0, "Nothing to unstake");

        self.sendGramx(user, payout);
    }

    get fun get_contract_version(): Int {
        return 11;
    }

    get fun get_contract_details(): ContractDetails {
        return self.getContractDetails();
    }

    get fun get_staking_plans(): StakingPlans {
        return self.getStakingPlans();
    }

    fun getStakingPlans(): StakingPlans {
        return StakingPlans{
            sevenDaysRoiBasisPoints: self.sevenDaysRoiBasisPoints,
            thirtyDaysRoiBasisPoints: self.thirtyDaysRoiBasisPoints,
            threeMonthsRoiBasisPoints: self.threeMonthsRoiBasisPoints,
            nineMonthsRoiBasisPoints: self.nineMonthsRoiBasisPoints,
            twelveMonthsRoiBasisPoints: self.twelveMonthsRoiBasisPoints
        };
    }

    get fun get_user_summary(user: Address): UserSummary {
        return UserSummary{
            user: user,
            totalStakePositions: self.userStakeCountOf(user),
            activeStakePositions: self.userActiveStakeCountOf(user)
        };
    }

    get fun get_user_stake_id_by_index(user: Address, index: Int): Int {
        let count: Int = self.userStakeCountOf(user);
        require(index >= 0 && index < count, "Invalid index");

        let value: Int? = self.userStakeIdByIndex.get(self.indexKey(user, index));
        require(value != null, "Stake index not found");

        return value!!;
    }

    get fun get_stake_details(stakeId: Int): StakeDetails {
        require(self.stakeExists(stakeId), "Stake not found");

        return self.stakeDetailsOf(stakeId);
    }

    fun stakeDetailsOf(stakeId: Int): StakeDetails {
        return StakeDetails{
            stakeId: stakeId,
            owner: self.ownerOf(stakeId),
            active: self.activeOf(stakeId),
            amount: self.amountOf(stakeId),
            pendingReward: self.claimableReward(stakeId),
            roiBasisPoints: self.roiOf(stakeId),
            stakeKind: self.kindOf(stakeId),
            startedAt: self.startedAtOf(stakeId),
            duration: self.durationOf(stakeId),
            maturityAt: self.maturityOf(stakeId),
            claimedRewards: self.claimedOf(stakeId)
        };
    }

    get fun get_staking_dashboard(user: Address, offset: Int, limit: Int): StakingDashboard {
        require(offset >= 0, "Invalid offset");
        require(limit > 0 && limit <= 20, "Invalid page size");

        let total: Int = self.userStakeCountOf(user);
        let end: Int = offset + limit;
        if (end > total) {
            end = total;
        }

        let positions: map<Int, StakeDetails> = emptyMap();
        let index: Int = offset;

        while (index < end) {
            let stakeId: Int? = self.userStakeIdByIndex.get(self.indexKey(user, index));
            require(stakeId != null, "Stake index not found");
            positions.set(index - offset, self.stakeDetailsOf(stakeId!!));
            index = index + 1;
        }

        return StakingDashboard{
            contractDetails: self.getContractDetails(),
            stakingPlans: self.getStakingPlans(),
            userSummary: UserSummary{
                user: user,
                totalStakePositions: total,
                activeStakePositions: self.userActiveStakeCountOf(user)
            },
            offset: offset,
            nextOffset: end,
            hasMore: end < total,
            positions: positions
        };
    }

    fun getContractDetails(): ContractDetails {
        return ContractDetails{
            owner: self.owner,
            deploymentId: self.deploymentId,
            gramxJettonMaster: self.gramxJettonMaster,
            gramxJettonWallet: self.gramxJettonWallet,
            jettonWalletConfigured: self.jettonWalletConfigured,
            annualRoiBasisPoints: self.annualRoiBasisPoints,
            flexUnstakeFeeBasisPoints: self.flexUnstakeFeeBasisPoints,
            minStake: self.minStake,
            paused: self.paused,
            totalStaked: self.totalStaked,
            rewardReserve: self.rewardReserve,
            totalRewardsPaid: self.totalRewardsPaid,
            totalFeesCollected: self.totalFeesCollected,
            activeStakerCount: self.activeStakerCount,
            totalStakePositions: self.nextStakeId - 1,
            nextStakeId: self.nextStakeId
        };
    }
}
