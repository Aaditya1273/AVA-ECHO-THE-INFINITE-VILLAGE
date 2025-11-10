#![allow(unused)]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec, symbol_short};

#[derive(Clone)]
#[contracttype]
pub enum LockStatus {
    Active,
    Unlocked,
    EmergencyUnlocked,
}

#[derive(Clone)]
#[contracttype]
pub struct Lock {
    pub user: Address,
    pub amount: u64,
    pub unlock_time: u64,
    pub status: LockStatus,
    pub reason: Symbol,
}

#[derive(Clone)]
#[contracttype]
pub struct EmergencyProposal {
    pub lock_id: u32,
    pub proposer: Address,
    pub approvals: Vec<Address>,
    pub required_approvals: u32,
    pub executed: bool,
    pub timestamp: u64,
}

const LOCK_COUNTER: Symbol = symbol_short!("LOCK_CNT");
const PROPOSAL_COUNTER: Symbol = symbol_short!("PROP_CNT");
const MULTISIG_THRESHOLD: u32 = 3; // 3 of 5 for emergency unlock

#[contract]
pub struct LockVault;

#[contractimpl]
impl LockVault {
    /// Initialize vault with governance addresses
    pub fn initialize(env: Env, admin: Address, governors: Vec<Address>) {
        admin.require_auth();
        
        assert!(governors.len() >= 5, "Need at least 5 governors");
        
        env.storage().instance().set(&symbol_short!("GOVS"), &governors);
        env.storage().instance().set(&symbol_short!("ADMIN"), &admin);
    }

    /// Lock funds in the vault
    pub fn lock_funds(
        env: Env,
        user: Address,
        amount: u64,
        unlock_time: u64,
        reason: Symbol,
    ) -> u32 {
        user.require_auth();
        
        assert!(amount > 0, "Amount must be greater than 0");
        assert!(unlock_time > env.ledger().timestamp(), "Unlock time must be in future");

        // Get next lock ID
        let lock_id: u32 = env.storage().instance()
            .get(&LOCK_COUNTER)
            .unwrap_or(0);
        
        let new_lock_id = lock_id + 1;
        env.storage().instance().set(&LOCK_COUNTER, &new_lock_id);

        // Create lock
        let lock = Lock {
            user: user.clone(),
            amount,
            unlock_time,
            status: LockStatus::Active,
            reason,
        };

        // Store lock
        let key = (symbol_short!("LOCK"), new_lock_id);
        env.storage().persistent().set(&key, &lock);

        env.events().publish(
            (symbol_short!("LOCK_NEW"), user),
            (new_lock_id, amount, unlock_time),
        );

        new_lock_id
    }

    /// Withdraw funds after unlock time
    pub fn withdraw_funds(env: Env, lock_id: u32) -> u64 {
        let key = (symbol_short!("LOCK"), lock_id);
        let mut lock: Lock = env.storage().persistent()
            .get(&key)
            .expect("Lock not found");

        lock.user.require_auth();

        // Check if unlock time has passed
        let current_time = env.ledger().timestamp();
        assert!(current_time >= lock.unlock_time, "Lock period not expired");

        match lock.status {
            LockStatus::Active => {
                let amount = lock.amount;
                lock.status = LockStatus::Unlocked;
                lock.amount = 0;
                env.storage().persistent().set(&key, &lock);

                env.events().publish(
                    (symbol_short!("WITHDRAW"), lock.user),
                    (lock_id, amount),
                );

                amount
            },
            _ => panic!("Lock not active"),
        }
    }

    /// Create emergency unlock proposal
    pub fn create_emergency_proposal(
        env: Env,
        proposer: Address,
        lock_id: u32,
    ) -> u32 {
        proposer.require_auth();

        // Verify proposer is a governor
        let governors: Vec<Address> = env.storage().instance()
            .get(&symbol_short!("GOVS"))
            .expect("Vault not initialized");

        let mut is_governor = false;
        for i in 0..governors.len() {
            if governors.get(i).unwrap() == proposer {
                is_governor = true;
                break;
            }
        }
        assert!(is_governor, "Not a governor");

        // Verify lock exists
        let lock_key = (symbol_short!("LOCK"), lock_id);
        let _lock: Lock = env.storage().persistent()
            .get(&lock_key)
            .expect("Lock not found");

        // Get next proposal ID
        let proposal_id: u32 = env.storage().instance()
            .get(&PROPOSAL_COUNTER)
            .unwrap_or(0);
        
        let new_proposal_id = proposal_id + 1;
        env.storage().instance().set(&PROPOSAL_COUNTER, &new_proposal_id);

        // Create proposal with first approval
        let mut approvals = Vec::new(&env);
        approvals.push_back(proposer.clone());

        let proposal = EmergencyProposal {
            lock_id,
            proposer: proposer.clone(),
            approvals,
            required_approvals: MULTISIG_THRESHOLD,
            executed: false,
            timestamp: env.ledger().timestamp(),
        };

        // Store proposal
        let key = (symbol_short!("PROP"), new_proposal_id);
        env.storage().persistent().set(&key, &proposal);

        env.events().publish(
            (symbol_short!("PROP_NEW"), proposer),
            (new_proposal_id, lock_id),
        );

        new_proposal_id
    }

    /// Approve emergency proposal
    pub fn approve_emergency(env: Env, proposal_id: u32, governor: Address) {
        governor.require_auth();

        // Verify governor
        let governors: Vec<Address> = env.storage().instance()
            .get(&symbol_short!("GOVS"))
            .expect("Vault not initialized");

        let mut is_governor = false;
        for i in 0..governors.len() {
            if governors.get(i).unwrap() == governor {
                is_governor = true;
                break;
            }
        }
        assert!(is_governor, "Not a governor");

        // Get proposal
        let key = (symbol_short!("PROP"), proposal_id);
        let mut proposal: EmergencyProposal = env.storage().persistent()
            .get(&key)
            .expect("Proposal not found");

        assert!(!proposal.executed, "Proposal already executed");

        // Check if already approved
        let mut already_approved = false;
        for i in 0..proposal.approvals.len() {
            if proposal.approvals.get(i).unwrap() == governor {
                already_approved = true;
                break;
            }
        }
        assert!(!already_approved, "Already approved");

        // Add approval
        proposal.approvals.push_back(governor.clone());
        env.storage().persistent().set(&key, &proposal);

        env.events().publish(
            (symbol_short!("PROP_APP"), governor),
            (proposal_id, proposal.approvals.len()),
        );
    }

    /// Execute emergency unlock if threshold met
    pub fn execute_emergency_unlock(env: Env, proposal_id: u32) -> u64 {
        let prop_key = (symbol_short!("PROP"), proposal_id);
        let mut proposal: EmergencyProposal = env.storage().persistent()
            .get(&prop_key)
            .expect("Proposal not found");

        assert!(!proposal.executed, "Proposal already executed");
        assert!(
            proposal.approvals.len() >= MULTISIG_THRESHOLD,
            "Not enough approvals"
        );

        // Get lock
        let lock_key = (symbol_short!("LOCK"), proposal.lock_id);
        let mut lock: Lock = env.storage().persistent()
            .get(&lock_key)
            .expect("Lock not found");

        match lock.status {
            LockStatus::Active => {
                let amount = lock.amount;
                lock.status = LockStatus::EmergencyUnlocked;
                lock.amount = 0;
                env.storage().persistent().set(&lock_key, &lock);

                proposal.executed = true;
                env.storage().persistent().set(&prop_key, &proposal);

                env.events().publish(
                    (symbol_short!("EMERG_UNL"), lock.user.clone()),
                    (proposal.lock_id, amount),
                );

                amount
            },
            _ => panic!("Lock not active"),
        }
    }

    /// Get lock details
    pub fn get_lock(env: Env, lock_id: u32) -> Lock {
        let key = (symbol_short!("LOCK"), lock_id);
        env.storage().persistent()
            .get(&key)
            .expect("Lock not found")
    }

    /// Get proposal details
    pub fn get_proposal(env: Env, proposal_id: u32) -> EmergencyProposal {
        let key = (symbol_short!("PROP"), proposal_id);
        env.storage().persistent()
            .get(&key)
            .expect("Proposal not found")
    }

    /// Get user's locks
    pub fn get_user_locks(env: Env, user: Address) -> Vec<u32> {
        let lock_count: u32 = env.storage().instance()
            .get(&LOCK_COUNTER)
            .unwrap_or(0);

        let mut user_locks = Vec::new(&env);

        for lock_id in 1..=lock_count {
            let key = (symbol_short!("LOCK"), lock_id);
            if let Some(lock) = env.storage().persistent().get::<_, Lock>(&key) {
                if lock.user == user {
                    user_locks.push_back(lock_id);
                }
            }
        }

        user_locks
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, Vec};

    #[test]
    fn test_lock_funds() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register_contract(None, LockVault);
        let client = LockVaultClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        
        let mut governors = Vec::new(&env);
        for _ in 0..5 {
            governors.push_back(Address::generate(&env));
        }

        client.initialize(&admin, &governors);

        let unlock_time = env.ledger().timestamp() + 86400; // 1 day
        let lock_id = client.lock_funds(&user, &1000, &unlock_time, &symbol_short!("EMERGENCY"));
        
        assert_eq!(lock_id, 1);

        let lock = client.get_lock(&lock_id);
        assert_eq!(lock.amount, 1000);
    }
}
