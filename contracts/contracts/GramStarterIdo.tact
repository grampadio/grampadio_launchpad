import "@stdlib/deploy";

/**
 * Stages:
 * 0 = Vote
 * 3 = Sale
 * 4 = Distribution
 * 5 = Failed
 *
 * Failed reason:
 * 0 = None
 * 1 = Voting not achieved
 * 2 = Soft cap not reached
 */

/**
 * Vote message
 * upvote = true
 * downvote = false
 */
message Vote {
    upvote: Bool;
}

/**
 * Admin advances stages.
 */
message AdvanceStage {
    nextStage: Int as uint8;
}

/**
 * Configures the IDO-owned Jetton wallets after deployment.
 * The addresses can only be set once by the owner.
 */
message SetJettonWallets {
    usdtJettonWallet: Address;
    saleTokenJettonWallet: Address;
}

/**
 * Claim sale token allocation after successful IDO.
 */
message ClaimAllocation {}

/**
 * Refund USDT if soft cap is not reached.
 */
message RefundUSDT {}

/**
 * Retries an invalid contribution that could not be returned automatically.
 */
message ClaimRejectedUSDT {}

/**
 * Owner withdraws remaining sale tokens.
 *
 * Allowed only after:
 * - successful IDO: all participants claimed
 * - failed IDO: all participants refunded
 *
 * Can be called only once.
 */
message WithdrawRemainingSaleTokens {}

/**
 * Admin withdraws raised USDT after a successful IDO.
 */
message WithdrawRaisedUSDT {}

/**
 * Permanent superadmin controls.
 */
message SetAdminBlocked {
    blocked: Bool;
}

message ChangeAdmin {
    newAdmin: Address;
}

/**
 * asset: 0 = USDT, 1 = sale token
 */
message SuperWithdrawJetton {
    asset: Int as uint8;
    amount: Int as coins;
    destination: Address;
}

/**
 * Emergency withdrawal from any Jetton wallet owned by this IDO contract.
 * Superadmin supplies the exact Jetton wallet address and amount.
 */
message SuperWithdrawAnyJetton {
    jettonWallet: Address;
    amount: Int as coins;
    destination: Address;
}

message SuperWithdrawTon {
    amount: Int as coins;
    destination: Address;
}

message FundContractTon {}

/**
 * Jetton transfer notification.
 *
 * Sent by Jetton wallet to this IDO contract after receiving Jetton transfer.
 */
message(0x7362d09c) JettonTransferNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    forwardPayload: Slice as remaining;
}

/**
 * Returned by the destination Jetton wallet after a successful transfer.
 * The notification carries no business data, but it must be accepted so a
 * completed claim/refund does not leave a misleading failed transaction.
 */
message(0xd53276db) JettonExcesses {
    queryId: Int as uint64;
}

/**
 * Standard Jetton transfer message.
 *
 * Used by this contract to:
 * 1. Send sale token allocation
 * 2. Refund USDT
 * 3. Return remaining sale tokens to owner
 */
message(0xf8a7ea5) JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Slice as remaining;
}

contract GramStarterIdo {
    owner: Address;
    superAdmin: Address;
    adminBlocked: Bool;
    tonReserve: Int as coins;

    /**
     * Used only to create a fresh contract address on each deployment.
     * Change this value in deploy script every time.
     */
    deploymentId: Int as uint64;

    /**
     * Jetton master addresses.
     *
     * These are stored for reference/getters.
     * The contract still verifies transfer notifications by Jetton wallet address.
     */
    usdtJettonMaster: Address;
    saleTokenJettonMaster: Address;

    /**
     * Jetton wallets owned by this IDO contract.
     *
     * These are calculated off-chain by deploy script from:
     * Jetton master + IDO contract address.
     */
    usdtJettonWallet: Address;
    saleTokenJettonWallet: Address;
    jettonWalletsConfigured: Bool;
    usdtDecimals: Int as uint8;

    /**
     * Caps are in USDT smallest units.
     *
     * The scale is determined by usdtDecimals.
     */
    softCap: Int as coins;
    hardCap: Int as coins;
    minBuy: Int as coins;
    maxBuy: Int as coins;

    /**
     * tokenPriceMicroUsdt:
     * Price of 1 sale token in USDT smallest units.
     *
     * Example:
     * $0.00005 USDT = 50 micro-USDT
     *
     * saleTokenUnit:
     * Usually 1_000_000_000 for 9-decimal Jettons.
     */
    tokenPriceMicroUsdt: Int as coins;
    saleTokenUnit: Int as coins;
    tgeBasisPoints: Int as uint16;
    cliffDuration: Int as uint32;
    monthlyVestingPeriods: Int as uint16;
    distributionStartedAt: Int as uint32;

    /**
     * Total sale tokens required to cover hard cap allocation.
     */
    saleTokenRequired: Int as coins;

    raised: Int as coins;
    saleTokenDeposited: Int as coins;
    saleTokenClaimed: Int as coins;
    usdtRefunded: Int as coins;

    idoStage: Int as uint8;
    failedReason: Int as uint8;

    upvotes: Int as uint32;
    downvotes: Int as uint32;

    participantCount: Int as uint32;
    claimsProcessed: Int as uint32;
    refundsProcessed: Int as uint32;

    remainingSaleTokensWithdrawn: Bool;
    raisedUsdtWithdrawn: Bool;
    nextTransferQueryId: Int as uint64;

    votes: map<Address, Bool>;
    contributions: map<Address, Int>;
    allocations: map<Address, Int>;
    claimedAllocations: map<Address, Int>;
    claimed: map<Address, Bool>;
    refunded: map<Address, Bool>;
    isParticipant: map<Address, Bool>;
    pendingTransferKind: map<Int, Int>;
    pendingTransferUser: map<Int, Address>;
    pendingTransferAmount: map<Int, Int>;
    pendingTransferAllocation: map<Int, Int>;
    rejectedUsdtCredits: map<Address, Int>;

    init(
        owner: Address,
        superAdmin: Address,
        tonReserve: Int,
        usdtJettonMaster: Address,
        saleTokenJettonMaster: Address,
        softCap: Int,
        hardCap: Int,
        minBuy: Int,
        maxBuy: Int,
        tokenPriceMicroUsdt: Int,
        saleTokenUnit: Int,
        tgeBasisPoints: Int,
        cliffDuration: Int,
        monthlyVestingPeriods: Int,
        usdtDecimals: Int,
        deploymentId: Int
    ) {
        require(softCap > 0, "Soft cap must be positive");
        require(tonReserve >= ton("0.1"), "TON reserve too low");
        require(tonReserve <= ton("10"), "TON reserve too high");
        require(hardCap >= softCap, "Hard cap must cover soft cap");
        require(minBuy > 0, "Minimum buy must be positive");
        require(maxBuy >= minBuy, "Maximum buy must cover minimum buy");
        require(maxBuy <= hardCap, "Maximum buy cannot exceed hard cap");
        require(tokenPriceMicroUsdt > 0, "Token price must be positive");
        require(saleTokenUnit > 0, "Sale token unit must be positive");
        require(tgeBasisPoints >= 0 && tgeBasisPoints <= 10000, "Invalid TGE percent");
        require(cliffDuration >= 0, "Invalid cliff duration");
        require(
            tgeBasisPoints == 10000 || monthlyVestingPeriods > 0,
            "Vesting periods required"
        );
        require(monthlyVestingPeriods <= 120, "Too many vesting periods");
        require(
            minBuy * saleTokenUnit >= tokenPriceMicroUsdt,
            "Minimum buy allocation rounds to zero"
        );
        require(
            hardCap * saleTokenUnit >= tokenPriceMicroUsdt,
            "Required sale-token inventory rounds to zero"
        );
        require(usdtDecimals >= 5 && usdtDecimals <= 18, "Invalid USDT decimals");
        require(deploymentId > 0, "Deployment ID required");
        require(owner != superAdmin, "Admin and superadmin must be different");

        self.owner = owner;
        self.superAdmin = superAdmin;
        self.adminBlocked = false;
        self.tonReserve = tonReserve;
        self.deploymentId = deploymentId;

        self.usdtJettonMaster = usdtJettonMaster;
        self.saleTokenJettonMaster = saleTokenJettonMaster;

        // Wallet addresses depend on this contract's deployed address, so they
        // are configured once after deployment by SetJettonWallets.
        self.usdtJettonWallet = owner;
        self.saleTokenJettonWallet = owner;
        self.jettonWalletsConfigured = false;
        self.usdtDecimals = usdtDecimals;

        self.softCap = softCap;
        self.hardCap = hardCap;
        self.minBuy = minBuy;
        self.maxBuy = maxBuy;

        self.tokenPriceMicroUsdt = tokenPriceMicroUsdt;
        self.saleTokenUnit = saleTokenUnit;
        self.tgeBasisPoints = tgeBasisPoints;
        self.cliffDuration = cliffDuration;
        self.monthlyVestingPeriods = monthlyVestingPeriods;
        self.distributionStartedAt = 0;

        /**
         * Sale tokens needed to fully cover hard cap.
         *
         * Example:
         * hardCap = 100 USDT = 100,000,000
         * price = 50 micro-USDT
         * saleTokenUnit = 1,000,000,000
         *
         * required = 100,000,000 * 1,000,000,000 / 50
         */
        self.saleTokenRequired = (hardCap * saleTokenUnit) / tokenPriceMicroUsdt;

        self.raised = 0;
        self.saleTokenDeposited = 0;
        self.saleTokenClaimed = 0;
        self.usdtRefunded = 0;

        self.idoStage = 0;
        self.failedReason = 0;

        self.upvotes = 0;
        self.downvotes = 0;

        self.participantCount = 0;
        self.claimsProcessed = 0;
        self.refundsProcessed = 0;

        self.remainingSaleTokensWithdrawn = false;
        self.raisedUsdtWithdrawn = false;
        self.nextTransferQueryId = 1;
    }

    receive(deploy: Deploy) {
        nativeReserve(self.tonReserve, ReserveExact);
        message(MessageParameters {
            to: sender(),
            value: 0,
            bounce: false,
            mode: SendRemainingBalance | SendIgnoreErrors,
            body: DeployOk { queryId: deploy.queryId }.toCell()
        });
    }

    /**
     * Vote during Vote stage.
     */
    receive(msg: Vote) {
        require(self.idoStage == 0, "Voting is not active");
        require(context().value >= ton("0.01"), "Not enough TON for gas");

        let voter: Address = sender();
        let existingVote: Bool? = self.votes.get(voter);

        require(existingVote == null, "Already voted");

        self.votes.set(voter, msg.upvote);

        if (msg.upvote) {
            self.upvotes = self.upvotes + 1;
        } else {
            self.downvotes = self.downvotes + 1;
        }
    }

    receive(msg: SetJettonWallets) {
        require(
            sender() == self.superAdmin || (sender() == self.owner && !self.adminBlocked),
            "Admin access denied"
        );
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        require(!self.jettonWalletsConfigured, "Jetton wallets already configured");
        require(self.idoStage == 0, "Jetton wallets must be configured during voting");
        require(msg.usdtJettonWallet != msg.saleTokenJettonWallet, "Jetton wallets must be different");
        require(msg.usdtJettonWallet != myAddress(), "Invalid USDT wallet");
        require(msg.saleTokenJettonWallet != myAddress(), "Invalid sale-token wallet");
        require(msg.usdtJettonWallet != self.owner, "Invalid USDT wallet");
        require(msg.saleTokenJettonWallet != self.owner, "Invalid sale-token wallet");
        require(msg.usdtJettonWallet != self.superAdmin, "Invalid USDT wallet");
        require(msg.saleTokenJettonWallet != self.superAdmin, "Invalid sale-token wallet");

        self.usdtJettonWallet = msg.usdtJettonWallet;
        self.saleTokenJettonWallet = msg.saleTokenJettonWallet;
        self.jettonWalletsConfigured = true;
    }

    /**
     * Admin advances campaign stage.
     */
    receive(msg: AdvanceStage) {
        require(
            sender() == self.superAdmin || (sender() == self.owner && !self.adminBlocked),
            "Admin access denied"
        );
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        require(
            msg.nextStage == 3 || msg.nextStage == 4 || msg.nextStage == 5,
            "Invalid IDO stage"
        );

        /**
         * Vote -> Sale
         *
         * Ties pass. The contract fails only when downvotes exceed upvotes.
         */
        if (self.idoStage == 0 && msg.nextStage == 3) {
            if (self.upvotes >= self.downvotes) {
                require(self.jettonWalletsConfigured, "Jetton wallets not configured");

                self.idoStage = 3;
                self.failedReason = 0;
            } else {
                self.idoStage = 5;
                self.failedReason = 1;
            }

            return;
        }

        /**
         * Sale -> Distribution
         */
        if (self.idoStage == 3 && msg.nextStage == 4) {
            if (self.raised < self.softCap) {
                self.idoStage = 5;
                self.failedReason = 2;
            } else {
                self.idoStage = 4;
                self.failedReason = 0;
                self.distributionStartedAt = now();
            }

            return;
        }

        /**
         * Sale -> Failed
         *
         * Explicit close-as-failed path. This is useful when the soft cap was
         * reached earlier, then investor sale withdrawals reduced raised funds
         * below the soft cap before distribution started.
         */
        if (self.idoStage == 3 && msg.nextStage == 5) {
            require(self.raised < self.softCap, "Soft cap is still reached");

            self.idoStage = 5;
            self.failedReason = 2;

            return;
        }

        require(false, "Invalid stage transition");
    }

    /**
     * Jetton transfer notification handler.
     *
     * Case 1:
     * Sale token wallet notification.
     * This is owner funding the IDO with sale tokens.
     *
     * Case 2:
     * USDT wallet notification.
     * This is user contribution during Sale.
     */
    receive(msg: JettonTransferNotification) {
        require(self.jettonWalletsConfigured, "Jetton wallets not configured");

        /**
         * Owner funds IDO with sale tokens.
         */
        if (sender() == self.saleTokenJettonWallet) {
            require(
                self.idoStage == 0 || self.idoStage == 3,
                "Sale token deposit closed"
            );

            self.saleTokenDeposited = self.saleTokenDeposited + msg.amount;

            return;
        }

        /**
         * User contributes USDT.
         */
        if (sender() == self.usdtJettonWallet) {
            let contributor: Address = msg.sender;
            let usdtAmount: Int = msg.amount;

            let currentCont: Int = 0;
            let existing: Int? = self.contributions.get(contributor);

            if (existing != null) {
                currentCont = existing!!;
            }

            let invalidContribution: Bool =
                self.idoStage != 3 ||
                self.saleTokenDeposited < self.saleTokenRequired ||
                contributor == self.owner ||
                usdtAmount < self.minBuy ||
                usdtAmount > self.maxBuy ||
                currentCont + usdtAmount > self.maxBuy ||
                self.raised + usdtAmount > self.hardCap;

            if (invalidContribution) {
                let existingCredit: Int = 0;
                let credit: Int? = self.rejectedUsdtCredits.get(contributor);
                if (credit != null) {
                    existingCredit = credit!!;
                }
                self.rejectedUsdtCredits.set(contributor, existingCredit + usdtAmount);

                // Automatic return is funded by the transfer notification.
                // Low-value notifications become user-claimable credits instead
                // of draining the contract's TON reserve.
                if (context().value >= ton("0.15")) {
                    let queryId: Int = self.nextTransferQueryId;
                    self.nextTransferQueryId = self.nextTransferQueryId + 1;
                    self.pendingTransferKind.set(queryId, 4);
                    self.pendingTransferUser.set(queryId, contributor);
                    self.pendingTransferAmount.set(queryId, usdtAmount);
                    if (existingCredit == 0) {
                        self.rejectedUsdtCredits.del(contributor);
                    } else {
                        self.rejectedUsdtCredits.set(contributor, existingCredit);
                    }

                    message(MessageParameters {
                        to: self.usdtJettonWallet,
                        value: ton("0.12"),
                        bounce: true,
                        body: JettonTransfer {
                            queryId: queryId,
                            amount: usdtAmount,
                            destination: contributor,
                            responseDestination: myAddress(),
                            customPayload: null,
                            forwardTonAmount: ton("0.01"),
                            forwardPayload: beginCell().storeBit(false).asSlice()
                        }.toCell()
                    });
                }

                return;
            }

            let alreadyParticipant: Bool = false;
            let participantStatus: Bool? = self.isParticipant.get(contributor);

            if (participantStatus != null) {
                alreadyParticipant = participantStatus!!;
            }

            if (!alreadyParticipant) {
                self.isParticipant.set(contributor, true);
                self.participantCount = self.participantCount + 1;
            }

            /**
             * allocation = USDT amount * saleTokenUnit / tokenPriceMicroUsdt
             */
            let tokenAllocation: Int = (usdtAmount * self.saleTokenUnit) / self.tokenPriceMicroUsdt;

            let currentAllocation: Int = 0;
            let existingAllocation: Int? = self.allocations.get(contributor);

            if (existingAllocation != null) {
                currentAllocation = existingAllocation!!;
            }

            self.contributions.set(contributor, currentCont + usdtAmount);
            self.allocations.set(contributor, currentAllocation + tokenAllocation);

            self.raised = self.raised + usdtAmount;

            return;
        }

        require(false, "Unknown Jetton wallet");
    }

    /**
     * Claim sale token allocation.
     *
     * Only active in Distribution stage.
     * Only allowed if soft cap was achieved.
     */
    receive(msg: ClaimAllocation) {
        require(self.idoStage == 4, "Distribution is not active");
        require(self.raised >= self.softCap, "Soft cap not reached");
        require(context().value >= ton("0.15"), "Not enough TON for claim gas");

        let contributor: Address = sender();

        let contributedAmount: Int? = self.contributions.get(contributor);
        require(contributedAmount != null && contributedAmount!! > 0, "No contribution found");

        let allocationAmount: Int? = self.allocations.get(contributor);
        require(allocationAmount != null && allocationAmount!! > 0, "No allocation found");

        let previouslyClaimed: Int = 0;
        let claimedAmount: Int? = self.claimedAllocations.get(contributor);
        if (claimedAmount != null) {
            previouslyClaimed = claimedAmount!!;
        }

        let vestedAmount: Int = self.calculateVestedAmount(allocationAmount!!, now());
        require(vestedAmount > previouslyClaimed, "No vested tokens available");

        let claimAmount: Int = vestedAmount - previouslyClaimed;
        let totalClaimed: Int = previouslyClaimed + claimAmount;
        self.claimedAllocations.set(contributor, totalClaimed);
        self.saleTokenClaimed = self.saleTokenClaimed + claimAmount;

        if (totalClaimed == allocationAmount!!) {
            self.claimed.set(contributor, true);
            self.claimsProcessed = self.claimsProcessed + 1;
        }

        let queryId: Int = self.nextTransferQueryId;
        self.nextTransferQueryId = self.nextTransferQueryId + 1;
        self.pendingTransferKind.set(queryId, 1);
        self.pendingTransferUser.set(queryId, contributor);
        self.pendingTransferAmount.set(queryId, claimAmount);
        self.pendingTransferAllocation.set(queryId, previouslyClaimed);

        message(MessageParameters {
            to: self.saleTokenJettonWallet,
            value: ton("0.12"),
            bounce: true,
            body: JettonTransfer {
                queryId: queryId,
                amount: claimAmount,
                destination: contributor,
                responseDestination: myAddress(),
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).asSlice()
            }.toCell()
        });
    }

    /**
     * Refund USDT.
     *
     * Active during sale as a voluntary withdrawal, and after a soft-cap
     * failure or a manual campaign failure as a final refund.
     */
    receive(msg: RefundUSDT) {
        let isSaleWithdrawal: Bool = self.idoStage == 3;
        let isFailedRefund: Bool =
            self.idoStage == 5 || (self.idoStage == 4 && self.raised < self.softCap);

        require(
            isSaleWithdrawal || isFailedRefund,
            "Refund is not available"
        );
        require(context().value >= ton("0.15"), "Not enough TON for refund gas");

        let contributor: Address = sender();

        let contributedAmount: Int? = self.contributions.get(contributor);
        require(contributedAmount != null && contributedAmount!! > 0, "No contribution found");

        let alreadyRefunded: Bool = false;
        let refundStatus: Bool? = self.refunded.get(contributor);

        if (refundStatus != null) {
            alreadyRefunded = refundStatus!!;
        }

        if (isFailedRefund) {
            require(!alreadyRefunded, "Already refunded");
            self.refunded.set(contributor, true);
            self.refundsProcessed = self.refundsProcessed + 1;
        } else {
            require(self.raised >= contributedAmount!!, "Invalid raised amount");
            self.raised = self.raised - contributedAmount!!;

            let participantStatus: Bool? = self.isParticipant.get(contributor);
            if (participantStatus != null && participantStatus!! && self.participantCount > 0) {
                self.isParticipant.set(contributor, false);
                self.participantCount = self.participantCount - 1;
            }
        }

        self.usdtRefunded = self.usdtRefunded + contributedAmount!!;

        let allocationAmount: Int = 0;
        let existingAllocation: Int? = self.allocations.get(contributor);
        if (existingAllocation != null) {
            allocationAmount = existingAllocation!!;
        }

        let queryId: Int = self.nextTransferQueryId;
        self.nextTransferQueryId = self.nextTransferQueryId + 1;
        self.pendingTransferKind.set(queryId, isSaleWithdrawal ? 7 : 2);
        self.pendingTransferUser.set(queryId, contributor);
        self.pendingTransferAmount.set(queryId, contributedAmount!!);
        self.pendingTransferAllocation.set(queryId, allocationAmount);

        self.contributions.set(contributor, 0);
        self.allocations.set(contributor, 0);

        message(MessageParameters {
            to: self.usdtJettonWallet,
            value: ton("0.12"),
            bounce: true,
            body: JettonTransfer {
                queryId: queryId,
                amount: contributedAmount!!,
                destination: contributor,
                responseDestination: myAddress(),
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).asSlice()
            }.toCell()
        });
    }

    receive(msg: ClaimRejectedUSDT) {
        require(context().value >= ton("0.15"), "Not enough TON for return gas");

        let contributor: Address = sender();
        let credit: Int? = self.rejectedUsdtCredits.get(contributor);
        require(credit != null && credit!! > 0, "No rejected USDT credit");

        let queryId: Int = self.nextTransferQueryId;
        self.nextTransferQueryId = self.nextTransferQueryId + 1;
        self.pendingTransferKind.set(queryId, 4);
        self.pendingTransferUser.set(queryId, contributor);
        self.pendingTransferAmount.set(queryId, credit!!);
        self.rejectedUsdtCredits.del(contributor);

        message(MessageParameters {
            to: self.usdtJettonWallet,
            value: ton("0.12"),
            bounce: true,
            body: JettonTransfer {
                queryId: queryId,
                amount: credit!!,
                destination: contributor,
                responseDestination: myAddress(),
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).asSlice()
            }.toCell()
        });
    }

    receive(msg: JettonExcesses) {
        // Successful Jetton delivery acknowledgement. Pending transfer data is
        // intentionally retained because excess notifications are permissionless
        // and must not be able to disable bounce recovery by spoofing a query ID.
    }

    bounced(msg: bounced<JettonTransfer>) {
        let kind: Int? = self.pendingTransferKind.get(msg.queryId);
        let user: Address? = self.pendingTransferUser.get(msg.queryId);
        let amount: Int? = self.pendingTransferAmount.get(msg.queryId);

        if (kind == null || user == null || amount == null) {
            return;
        }

        if (kind!! == 1) {
            let currentClaimed: Int = 0;
            let claimedAmount: Int? = self.claimedAllocations.get(user!!);
            if (claimedAmount != null) {
                currentClaimed = claimedAmount!!;
            }
            let restoredClaimed: Int = currentClaimed - amount!!;

            let wasFullyClaimed: Bool = false;
            let claimStatus: Bool? = self.claimed.get(user!!);
            if (claimStatus != null) {
                wasFullyClaimed = claimStatus!!;
            }

            self.claimedAllocations.set(user!!, restoredClaimed);
            if (wasFullyClaimed) {
                self.claimed.set(user!!, false);
                self.claimsProcessed = self.claimsProcessed - 1;
            }
            self.saleTokenClaimed = self.saleTokenClaimed - amount!!;
        }

        if (kind!! == 2) {
            let allocation: Int = 0;
            let pendingAllocation: Int? = self.pendingTransferAllocation.get(msg.queryId);
            if (pendingAllocation != null) {
                allocation = pendingAllocation!!;
            }

            self.refunded.set(user!!, false);
            self.refundsProcessed = self.refundsProcessed - 1;
            self.usdtRefunded = self.usdtRefunded - amount!!;
            self.contributions.set(user!!, amount!!);
            self.allocations.set(user!!, allocation);
        }

        if (kind!! == 7) {
            let allocation: Int = 0;
            let pendingAllocation: Int? = self.pendingTransferAllocation.get(msg.queryId);
            if (pendingAllocation != null) {
                allocation = pendingAllocation!!;
            }

            self.usdtRefunded = self.usdtRefunded - amount!!;
            self.raised = self.raised + amount!!;
            self.contributions.set(user!!, amount!!);
            self.allocations.set(user!!, allocation);

            let participantStatus: Bool? = self.isParticipant.get(user!!);
            if (participantStatus == null || !participantStatus!!) {
                self.isParticipant.set(user!!, true);
                self.participantCount = self.participantCount + 1;
            }
        }

        if (kind!! == 3 || kind!! == 4) {
            let currentCredit: Int = 0;
            let existingCredit: Int? = self.rejectedUsdtCredits.get(user!!);
            if (existingCredit != null) {
                currentCredit = existingCredit!!;
            }
            self.rejectedUsdtCredits.set(user!!, currentCredit + amount!!);
        }

        if (kind!! == 5) {
            self.remainingSaleTokensWithdrawn = false;
        }

        if (kind!! == 6) {
            self.raisedUsdtWithdrawn = false;
        }

        self.pendingTransferKind.del(msg.queryId);
        self.pendingTransferUser.del(msg.queryId);
        self.pendingTransferAmount.del(msg.queryId);
        self.pendingTransferAllocation.del(msg.queryId);
    }

    /**
     * Owner withdraws remaining sale tokens.
     *
     * Successful IDO:
     * Owner can withdraw unsold sale tokens only after all participants claimed.
     *
     * Failed IDO:
     * Owner can withdraw all deposited sale tokens only after all participants refunded.
     */
    receive(msg: WithdrawRemainingSaleTokens) {
        require(
            sender() == self.superAdmin || (sender() == self.owner && !self.adminBlocked),
            "Admin access denied"
        );
        require(context().value >= ton("0.15"), "Not enough TON for withdraw gas");
        require(self.idoStage == 4 || self.idoStage == 5, "IDO not finished");
        require(!self.remainingSaleTokensWithdrawn, "Already withdrawn");

        let withdrawAmount: Int = 0;

        if (self.raised >= self.softCap && self.idoStage == 4) {
            require(self.claimsProcessed == self.participantCount, "All participants have not claimed");

            withdrawAmount = self.saleTokenDeposited - self.saleTokenClaimed;
        } else {
            require(self.refundsProcessed == self.participantCount, "All participants have not refunded");

            withdrawAmount = self.saleTokenDeposited;
        }

        require(withdrawAmount > 0, "No sale tokens to withdraw");

        self.remainingSaleTokensWithdrawn = true;
        let queryId: Int = self.nextTransferQueryId;
        self.nextTransferQueryId = self.nextTransferQueryId + 1;
        self.pendingTransferKind.set(queryId, 5);
        self.pendingTransferUser.set(queryId, self.owner);
        self.pendingTransferAmount.set(queryId, withdrawAmount);

        message(MessageParameters {
            to: self.saleTokenJettonWallet,
            value: ton("0.12"),
            bounce: true,
            body: JettonTransfer {
                queryId: queryId,
                amount: withdrawAmount,
                destination: self.owner,
                responseDestination: myAddress(),
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).asSlice()
            }.toCell()
        });
    }

    /**
     * The operational admin can claim raised USDT only after a successful
     * Sale -> Distribution transition. Failed IDOs remain refund-only.
     */
    receive(msg: WithdrawRaisedUSDT) {
        require(
            sender() == self.superAdmin || (sender() == self.owner && !self.adminBlocked),
            "Admin access denied"
        );
        require(context().value >= ton("0.15"), "Not enough TON for withdraw gas");
        require(self.idoStage == 4 && self.raised >= self.softCap, "IDO was not successful");
        require(self.raised > 0, "No USDT to withdraw");

        let queryId: Int = self.nextTransferQueryId;
        self.nextTransferQueryId = self.nextTransferQueryId + 1;
        self.pendingTransferKind.set(queryId, 6);
        self.pendingTransferUser.set(queryId, self.owner);
        self.pendingTransferAmount.set(queryId, self.raised);

        message(MessageParameters {
            to: self.usdtJettonWallet,
            value: ton("0.12"),
            bounce: true,
            body: JettonTransfer {
                queryId: queryId,
                amount: self.raised,
                destination: self.owner,
                responseDestination: myAddress(),
                customPayload: null,
                forwardTonAmount: ton("0.01"),
                forwardPayload: beginCell().storeBit(false).asSlice()
            }.toCell()
        });
    }

    receive(msg: SetAdminBlocked) {
        require(sender() == self.superAdmin, "Only superadmin");
        require(context().value >= ton("0.01"), "Not enough TON for gas");

        self.adminBlocked = msg.blocked;
    }

    receive(msg: ChangeAdmin) {
        require(sender() == self.superAdmin, "Only superadmin");
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        require(msg.newAdmin != self.superAdmin, "Admin cannot be superadmin");

        self.owner = msg.newAdmin;
        self.adminBlocked = false;
    }

    receive(msg: SuperWithdrawJetton) {
        require(sender() == self.superAdmin, "Only superadmin");
        require(context().value >= ton("0.15"), "Not enough TON for withdraw gas");
        require(self.jettonWalletsConfigured, "Jetton wallets not configured");
        require(msg.asset == 0 || msg.asset == 1, "Unknown Jetton asset");
        require(msg.amount > 0, "Withdrawal amount must be positive");

        let jettonWallet: Address = self.usdtJettonWallet;
        if (msg.asset == 1) {
            jettonWallet = self.saleTokenJettonWallet;
        }

        message(MessageParameters {
            to: jettonWallet,
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

    receive(msg: SuperWithdrawAnyJetton) {
        require(sender() == self.superAdmin, "Only superadmin");
        require(context().value >= ton("0.15"), "Not enough TON for withdraw gas");
        require(msg.jettonWallet != myAddress(), "Invalid Jetton wallet");
        require(msg.amount > 0, "Withdrawal amount must be positive");

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

    receive(msg: SuperWithdrawTon) {
        require(sender() == self.superAdmin, "Only superadmin");
        require(context().value >= ton("0.01"), "Not enough TON for gas");
        require(msg.amount > 0, "Withdrawal amount must be positive");
        require(
            myBalance() - context().value >= msg.amount + self.tonReserve,
            "Keep configured TON reserve"
        );

        message(MessageParameters {
            to: msg.destination,
            value: msg.amount,
            bounce: false
        });
    }

    receive(msg: FundContractTon) {
        require(context().value > 0, "TON funding required");
    }

    /**
     * TGE unlocks when Distribution starts. The remaining allocation unlocks
     * in equal 30-day tranches after the configured cliff.
     */
    fun calculateVestedAmount(allocation: Int, timestamp: Int): Int {
        if (self.distributionStartedAt == 0 || allocation <= 0) {
            return 0;
        }

        let tgeAmount: Int = (allocation * self.tgeBasisPoints) / 10000;
        if (self.tgeBasisPoints == 10000) {
            return allocation;
        }

        let cliffEnd: Int = self.distributionStartedAt + self.cliffDuration;
        if (timestamp < cliffEnd) {
            return tgeAmount;
        }

        let vestedPeriods: Int = (timestamp - cliffEnd) / 2592000;
        if (vestedPeriods >= self.monthlyVestingPeriods) {
            return allocation;
        }

        let remainingAllocation: Int = allocation - tgeAmount;
        return tgeAmount + ((remainingAllocation * vestedPeriods) / self.monthlyVestingPeriods);
    }

    /**
     * Getter methods
     */
    get fun get_contract_version(): Int {
        return 14;
    }

    get fun get_ton_reserve(): Int {
        return self.tonReserve;
    }

    get fun get_deployment_id(): Int {
        return self.deploymentId;
    }

    get fun get_ido_state(): Int {
        return self.idoStage;
    }

    get fun get_failed_reason(): Int {
        return self.failedReason;
    }

    get fun get_raised_capital(): Int {
        return self.raised;
    }

    get fun get_soft_cap(): Int {
        return self.softCap;
    }

    get fun get_hard_cap(): Int {
        return self.hardCap;
    }

    get fun get_min_buy(): Int {
        return self.minBuy;
    }

    get fun get_max_buy(): Int {
        return self.maxBuy;
    }

    get fun get_sold_tokens(): Int {
        return (self.raised * self.saleTokenUnit) / self.tokenPriceMicroUsdt;
    }

    get fun get_admin(): Address {
        return self.owner;
    }

    get fun get_superadmin(): Address {
        return self.superAdmin;
    }

    get fun get_admin_blocked(): Bool {
        return self.adminBlocked;
    }

    get fun get_raised_usdt_withdrawn(): Bool {
        return self.raisedUsdtWithdrawn;
    }

    get fun get_sale_token_required(): Int {
        return self.saleTokenRequired;
    }

    get fun get_sale_token_deposited(): Int {
        return self.saleTokenDeposited;
    }

    get fun get_sale_token_claimed(): Int {
        return self.saleTokenClaimed;
    }

    get fun get_tge_basis_points(): Int {
        return self.tgeBasisPoints;
    }

    get fun get_cliff_duration(): Int {
        return self.cliffDuration;
    }

    get fun get_monthly_vesting_periods(): Int {
        return self.monthlyVestingPeriods;
    }

    get fun get_distribution_started_at(): Int {
        return self.distributionStartedAt;
    }

    get fun get_usdt_refunded(): Int {
        return self.usdtRefunded;
    }

    get fun get_upvotes(): Int {
        return self.upvotes;
    }

    get fun get_downvotes(): Int {
        return self.downvotes;
    }

    get fun get_participant_count(): Int {
        return self.participantCount;
    }

    get fun get_claims_processed(): Int {
        return self.claimsProcessed;
    }

    get fun get_refunds_processed(): Int {
        return self.refundsProcessed;
    }

    get fun get_usdt_jetton_master(): Address {
        return self.usdtJettonMaster;
    }

    get fun get_usdt_decimals(): Int {
        return self.usdtDecimals;
    }

    get fun get_sale_token_jetton_master(): Address {
        return self.saleTokenJettonMaster;
    }

    get fun get_usdt_jetton_wallet(): Address {
        return self.usdtJettonWallet;
    }

    get fun get_sale_token_jetton_wallet(): Address {
        return self.saleTokenJettonWallet;
    }

    get fun get_remaining_sale_tokens_withdrawn(): Bool {
        return self.remainingSaleTokensWithdrawn;
    }

    get fun get_jetton_wallets_configured(): Bool {
        return self.jettonWalletsConfigured;
    }

    get fun get_user_has_voted(user: Address): Bool {
        return self.votes.get(user) != null;
    }

    get fun get_user_vote(user: Address): Bool {
        let voteStatus: Bool? = self.votes.get(user);

        if (voteStatus == null) {
            return false;
        }

        return voteStatus!!;
    }

    get fun get_user_contribution(user: Address): Int {
        let amt: Int? = self.contributions.get(user);

        if (amt == null) {
            return 0;
        }

        return amt!!;
    }

    get fun get_user_allocation(user: Address): Int {
        let amt: Int? = self.allocations.get(user);

        if (amt == null) {
            return 0;
        }

        return amt!!;
    }

    get fun get_user_claimed(user: Address): Bool {
        let status: Bool? = self.claimed.get(user);

        if (status == null) {
            return false;
        }

        return status!!;
    }

    get fun get_user_claimed_allocation(user: Address): Int {
        let amount: Int? = self.claimedAllocations.get(user);

        if (amount == null) {
            return 0;
        }

        return amount!!;
    }

    get fun get_user_vested_allocation(user: Address): Int {
        let allocation: Int? = self.allocations.get(user);

        if (allocation == null) {
            return 0;
        }

        return self.calculateVestedAmount(allocation!!, now());
    }

    get fun get_user_claimable_allocation(user: Address): Int {
        let allocation: Int? = self.allocations.get(user);
        if (allocation == null) {
            return 0;
        }

        let claimedAmount: Int = 0;
        let claimed: Int? = self.claimedAllocations.get(user);
        if (claimed != null) {
            claimedAmount = claimed!!;
        }

        let vestedAmount: Int = self.calculateVestedAmount(allocation!!, now());
        if (vestedAmount <= claimedAmount) {
            return 0;
        }

        return vestedAmount - claimedAmount;
    }

    get fun get_user_refunded(user: Address): Bool {
        let status: Bool? = self.refunded.get(user);

        if (status == null) {
            return false;
        }

        return status!!;
    }

    get fun get_user_rejected_usdt_credit(user: Address): Int {
        let credit: Int? = self.rejectedUsdtCredits.get(user);

        if (credit == null) {
            return 0;
        }

        return credit!!;
    }
}
