import "@stdlib/deploy";

message ConfigureLock {
    unlockTime: Int as uint32;
}

message SetPaused {
    paused: Bool;
}

message ChangeOwner {
    newOwner: Address;
}

message WithdrawLock {
    lockId: Int as uint64;
}

message EmergencyWithdrawTon {
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

struct LockDetails {
    lockId: Int;
    owner: Address;
    jettonWallet: Address;
    amount: Int;
    lockedAt: Int;
    unlockTime: Int;
    withdrawn: Bool;
}

struct UserLockSummary {
    user: Address;
    totalLocks: Int;
    activeLocks: Int;
}

struct ContractDetails {
    owner: Address;
    deploymentId: Int;
    paused: Bool;
    totalLockedPositions: Int;
    activeLockPositions: Int;
    totalWithdrawnPositions: Int;
    nextLockId: Int;
}

contract GramPadUniversalLocker {
    owner: Address;
    deploymentId: Int as uint64;
    paused: Bool;

    nextLockId: Int as uint64;
    nextTransferQueryId: Int as uint64;

    totalLockedPositions: Int as uint64;
    activeLockPositions: Int as uint64;
    totalWithdrawnPositions: Int as uint64;

    pendingUnlockTime: map<Address, Int>;

    userLockCount: map<Address, Int>;
    userActiveLockCount: map<Address, Int>;
    userLockIdByIndex: map<Int, Int>;

    lockOwner: map<Int, Address>;
    lockJettonWallet: map<Int, Address>;
    lockAmount: map<Int, Int>;
    lockCreatedAt: map<Int, Int>;
    lockUnlockTime: map<Int, Int>;
    lockWithdrawn: map<Int, Bool>;

    init(owner: Address, deploymentId: Int) {
        self.owner = owner;
        self.deploymentId = deploymentId;
        self.paused = false;

        self.nextLockId = 1;
        self.nextTransferQueryId = 1;

        self.totalLockedPositions = 0;
        self.activeLockPositions = 0;
        self.totalWithdrawnPositions = 0;
    }

    fun requireOwner() {
        require(sender() == self.owner, "Only owner");
    }

    fun indexKey(user: Address, index: Int): Int {
        return beginCell()
            .storeAddress(user)
            .storeUint(index, 64)
            .endCell()
            .hash();
    }

    fun lockExists(lockId: Int): Bool {
        let value: Address? = self.lockOwner.get(lockId);
        return value != null;
    }

    fun ownerOf(lockId: Int): Address {
        let value: Address? = self.lockOwner.get(lockId);
        require(value != null, "Lock not found");
        return value!!;
    }

    fun jettonWalletOf(lockId: Int): Address {
        let value: Address? = self.lockJettonWallet.get(lockId);
        require(value != null, "Jetton wallet not found");
        return value!!;
    }

    fun amountOf(lockId: Int): Int {
        let value: Int? = self.lockAmount.get(lockId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun createdAtOf(lockId: Int): Int {
        let value: Int? = self.lockCreatedAt.get(lockId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun unlockTimeOf(lockId: Int): Int {
        let value: Int? = self.lockUnlockTime.get(lockId);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun withdrawnOf(lockId: Int): Bool {
        let value: Bool? = self.lockWithdrawn.get(lockId);
        if (value == null) {
            return false;
        }
        return value!!;
    }

    fun userLockCountOf(user: Address): Int {
        let value: Int? = self.userLockCount.get(user);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun userActiveLockCountOf(user: Address): Int {
        let value: Int? = self.userActiveLockCount.get(user);
        if (value == null) {
            return 0;
        }
        return value!!;
    }

    fun sendJetton(jettonWallet: Address, to: Address, amount: Int) {
        let queryId: Int = self.nextTransferQueryId;
        self.nextTransferQueryId = self.nextTransferQueryId + 1;

        message(MessageParameters {
            to: jettonWallet,
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

    receive(msg: SetPaused) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
        self.paused = msg.paused;
    }

    receive(msg: ChangeOwner) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
        self.owner = msg.newOwner;
    }

    receive(msg: EmergencyWithdrawTon) {
        self.requireOwner();
        require(context().value >= ton("0.01"), "Not enough TON");
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

    receive(msg: ConfigureLock) {
        require(!self.paused, "Locker paused");
        require(context().value >= ton("0.01"), "Not enough TON");
        require(msg.unlockTime > now(), "Unlock time must be future");

        self.pendingUnlockTime.set(sender(), msg.unlockTime);
    }

    receive(msg: JettonTransferNotification) {
        require(!self.paused, "Locker paused");
        require(msg.amount > 0, "Invalid amount");

        let locker: Address = msg.sender;
        let jettonWallet: Address = sender();

        let unlockTime: Int? = self.pendingUnlockTime.get(locker);
        require(unlockTime != null, "Lock not configured");

        self.pendingUnlockTime.del(locker);

        let lockId: Int = self.nextLockId;
        self.nextLockId = self.nextLockId + 1;

        let userIndex: Int = self.userLockCountOf(locker);
        let activeBefore: Int = self.userActiveLockCountOf(locker);

        self.userLockIdByIndex.set(self.indexKey(locker, userIndex), lockId);
        self.userLockCount.set(locker, userIndex + 1);
        self.userActiveLockCount.set(locker, activeBefore + 1);

        self.lockOwner.set(lockId, locker);
        self.lockJettonWallet.set(lockId, jettonWallet);
        self.lockAmount.set(lockId, msg.amount);
        self.lockCreatedAt.set(lockId, now());
        self.lockUnlockTime.set(lockId, unlockTime!!);
        self.lockWithdrawn.set(lockId, false);

        self.totalLockedPositions = self.totalLockedPositions + 1;
        self.activeLockPositions = self.activeLockPositions + 1;
    }

    receive(msg: WithdrawLock) {
        require(context().value >= ton("0.15"), "Not enough TON");

        let user: Address = sender();

        require(self.lockExists(msg.lockId), "Lock not found");
        require(self.ownerOf(msg.lockId) == user, "Not lock owner");
        require(!self.withdrawnOf(msg.lockId), "Already withdrawn");
        require(now() >= self.unlockTimeOf(msg.lockId), "Still locked");

        let amount: Int = self.amountOf(msg.lockId);
        require(amount > 0, "Nothing to withdraw");

        let jettonWallet: Address = self.jettonWalletOf(msg.lockId);

        self.lockWithdrawn.set(msg.lockId, true);
        self.lockAmount.set(msg.lockId, 0);

        let activeBefore: Int = self.userActiveLockCountOf(user);
        if (activeBefore > 0) {
            self.userActiveLockCount.set(user, activeBefore - 1);
        }

        self.activeLockPositions = self.activeLockPositions - 1;
        self.totalWithdrawnPositions = self.totalWithdrawnPositions + 1;

        self.sendJetton(jettonWallet, user, amount);
    }

    get fun get_contract_version(): Int {
        return 2;
    }

    get fun get_contract_details(): ContractDetails {
        return ContractDetails{
            owner: self.owner,
            deploymentId: self.deploymentId,
            paused: self.paused,
            totalLockedPositions: self.totalLockedPositions,
            activeLockPositions: self.activeLockPositions,
            totalWithdrawnPositions: self.totalWithdrawnPositions,
            nextLockId: self.nextLockId
        };
    }

    get fun get_user_summary(user: Address): UserLockSummary {
        return UserLockSummary{
            user: user,
            totalLocks: self.userLockCountOf(user),
            activeLocks: self.userActiveLockCountOf(user)
        };
    }

    get fun get_user_lock_id_by_index(user: Address, index: Int): Int {
        let count: Int = self.userLockCountOf(user);
        require(index >= 0 && index < count, "Invalid index");

        let value: Int? = self.userLockIdByIndex.get(self.indexKey(user, index));
        require(value != null, "Lock index not found");

        return value!!;
    }

    get fun get_lock_details(lockId: Int): LockDetails {
        require(self.lockExists(lockId), "Lock not found");

        return LockDetails{
            lockId: lockId,
            owner: self.ownerOf(lockId),
            jettonWallet: self.jettonWalletOf(lockId),
            amount: self.amountOf(lockId),
            lockedAt: self.createdAtOf(lockId),
            unlockTime: self.unlockTimeOf(lockId),
            withdrawn: self.withdrawnOf(lockId)
        };
    }
}
