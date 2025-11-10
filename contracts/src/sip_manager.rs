#![allow(unused)]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec, symbol_short};

#[derive(Clone)]
#[contracttype]
pub enum Frequency {
    Daily,
    Weekly,
    Monthly,
}

#[derive(Clone)]
#[contracttype]
pub enum Status {
    Active,
    Paused,
    Cancelled,
    Completed,
}

#[derive(Clone)]
#[contracttype]
pub struct Sip {
    pub user: Address,
    pub token: Address,
    pub amount: u64,
    pub frequency: Frequency,
    pub start_time: u64,
    pub last_executed: u64,
    pub total_deposits: u64,
    pub execution_count: u32,
    pub max_executions: u32,
    pub status: Status,
    pub penalty_bps: u32, // Basis points (100 = 1%)
}

const SIP_COUNTER: Symbol = symbol_short!("SIP_CNT");
const MAX_PENALTY: u32 = 1000; // 10% max

#[contract]
pub struct SIPManager;

#[contractimpl]
impl SIPManager {
    /// Create a new SIP
    /// Returns the SIP ID
    pub fn create_sip(
        env: Env,
        user: Address,
        token: Address,
        amount: u64,
        frequency: Frequency,
        max_executions: u32,
        penalty_bps: u32,
    ) -> u32 {
        user.require_auth();
        
        assert!(amount > 0, "Amount must be greater than 0");
        assert!(penalty_bps <= MAX_PENALTY, "Penalty too high");

        // Get next SIP ID
        let sip_id: u32 = env.storage().instance()
            .get(&SIP_COUNTER)
            .unwrap_or(0);
        
        let new_sip_id = sip_id + 1;
        env.storage().instance().set(&SIP_COUNTER, &new_sip_id);

        // Create SIP
        let sip = Sip {
            user: user.clone(),
            token,
            amount,
            frequency,
            start_time: env.ledger().timestamp(),
            last_executed: 0,
            total_deposits: 0,
            execution_count: 0,
            max_executions,
            status: Status::Active,
            penalty_bps,
        };

        // Store SIP
        let key = (symbol_short!("SIP"), new_sip_id);
        env.storage().persistent().set(&key, &sip);

        // Emit event
        env.events().publish(
            (symbol_short!("SIP_NEW"), user),
            (new_sip_id, amount),
        );

        new_sip_id
    }

    /// Execute a SIP deposit
    pub fn execute_sip(env: Env, sip_id: u32) -> bool {
        let key = (symbol_short!("SIP"), sip_id);
        let mut sip: Sip = env.storage().persistent()
            .get(&key)
            .expect("SIP not found");

        // Check if SIP is active
        match sip.status {
            Status::Active => {},
            _ => panic!("SIP not active"),
        }

        // Check if max executions reached
        if sip.max_executions > 0 && sip.execution_count >= sip.max_executions {
            sip.status = Status::Completed;
            env.storage().persistent().set(&key, &sip);
            return false;
        }

        // Check frequency timing
        let current_time = env.ledger().timestamp();
        let time_diff = current_time - sip.last_executed;
        
        let required_interval = match sip.frequency {
            Frequency::Daily => 86400,    // 1 day in seconds
            Frequency::Weekly => 604800,  // 7 days
            Frequency::Monthly => 2592000, // 30 days
        };

        if sip.last_executed > 0 && time_diff < required_interval {
            return false;
        }

        // Update SIP state
        sip.last_executed = current_time;
        sip.execution_count += 1;
        sip.total_deposits += sip.amount;
        
        env.storage().persistent().set(&key, &sip);

        // Emit execution event
        env.events().publish(
            (symbol_short!("SIP_EXEC"), sip.user.clone()),
            (sip_id, sip.amount),
        );

        true
    }

    /// Pause a SIP
    pub fn pause_sip(env: Env, sip_id: u32) {
        let key = (symbol_short!("SIP"), sip_id);
        let mut sip: Sip = env.storage().persistent()
            .get(&key)
            .expect("SIP not found");

        sip.user.require_auth();
        sip.status = Status::Paused;
        env.storage().persistent().set(&key, &sip);

        env.events().publish(
            (symbol_short!("SIP_PAUS"), sip.user),
            sip_id,
        );
    }

    /// Resume a paused SIP
    pub fn resume_sip(env: Env, sip_id: u32) {
        let key = (symbol_short!("SIP"), sip_id);
        let mut sip: Sip = env.storage().persistent()
            .get(&key)
            .expect("SIP not found");

        sip.user.require_auth();
        
        match sip.status {
            Status::Paused => {
                sip.status = Status::Active;
                env.storage().persistent().set(&key, &sip);
                
                env.events().publish(
                    (symbol_short!("SIP_RESM"), sip.user),
                    sip_id,
                );
            },
            _ => panic!("SIP not paused"),
        }
    }

    /// Cancel a SIP
    pub fn cancel_sip(env: Env, sip_id: u32) {
        let key = (symbol_short!("SIP"), sip_id);
        let mut sip: Sip = env.storage().persistent()
            .get(&key)
            .expect("SIP not found");

        sip.user.require_auth();
        sip.status = Status::Cancelled;
        env.storage().persistent().set(&key, &sip);

        env.events().publish(
            (symbol_short!("SIP_CANC"), sip.user),
            sip_id,
        );
    }

    /// Get SIP details
    pub fn get_sip(env: Env, sip_id: u32) -> Sip {
        let key = (symbol_short!("SIP"), sip_id);
        env.storage().persistent()
            .get(&key)
            .expect("SIP not found")
    }

    /// Get all SIP IDs for a user
    pub fn get_user_sips(env: Env, user: Address) -> Vec<u32> {
        let mut user_sips = Vec::new(&env);
        
        // Get total SIP count
        let sip_count: u32 = env.storage().instance()
            .get(&SIP_COUNTER)
            .unwrap_or(0);
        
        // Iterate through all SIPs and find user's SIPs
        for sip_id in 1..=sip_count {
            let key = (symbol_short!("SIP"), sip_id);
            if let Some(sip) = env.storage().persistent().get::<_, Sip>(&key) {
                if sip.user == user {
                    user_sips.push_back(sip_id);
                }
            }
        }
        
        user_sips
    }

    /// Early withdrawal with penalty
    pub fn early_withdrawal(env: Env, sip_id: u32) -> u64 {
        let key = (symbol_short!("SIP"), sip_id);
        let mut sip: Sip = env.storage().persistent()
            .get(&key)
            .expect("SIP not found");

        sip.user.require_auth();

        let total = sip.total_deposits;
        let penalty = (total * sip.penalty_bps as u64) / 10000;
        let withdrawal_amount = total - penalty;

        sip.status = Status::Cancelled;
        sip.total_deposits = 0;
        env.storage().persistent().set(&key, &sip);

        env.events().publish(
            (symbol_short!("SIP_WDRW"), sip.user),
            (sip_id, withdrawal_amount, penalty),
        );

        withdrawal_amount
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_create_sip() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SIPManager);
        let client = SIPManagerClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        let token = Address::generate(&env);

        let sip_id = client.create_sip(&user, &token, &100, &Frequency::Weekly, &12, &500);
        assert_eq!(sip_id, 1);

        let sip = client.get_sip(&sip_id);
        assert_eq!(sip.amount, 100);
        assert_eq!(sip.execution_count, 0);
    }
}
