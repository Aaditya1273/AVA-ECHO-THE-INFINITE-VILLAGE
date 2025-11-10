#![allow(unused)]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec, symbol_short};

#[derive(Clone)]
#[contracttype]
pub struct Pool {
    pub address: Address,
    pub current_apy: i128,  // APY in basis points (1000 = 10%)
    pub risk_score: u32,    // 1-10 scale
    pub max_capacity: u64,
    pub current_tvl: u64,
    pub is_active: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct Allocation {
    pub pool: Address,
    pub amount: u64,
    pub timestamp: u64,
}

const POOL_COUNTER: Symbol = symbol_short!("POOL_CNT");

#[contract]
pub struct YieldRouter;

#[contractimpl]
impl YieldRouter {
    /// Register a new yield pool
    pub fn register_pool(
        env: Env,
        admin: Address,
        pool_address: Address,
        initial_apy: i128,
        risk_score: u32,
        max_capacity: u64,
    ) -> u32 {
        admin.require_auth();
        
        assert!(risk_score >= 1 && risk_score <= 10, "Risk score must be 1-10");

        // Get next pool ID
        let pool_id: u32 = env.storage().instance()
            .get(&POOL_COUNTER)
            .unwrap_or(0);
        
        let new_pool_id = pool_id + 1;
        env.storage().instance().set(&POOL_COUNTER, &new_pool_id);

        // Create pool
        let pool = Pool {
            address: pool_address.clone(),
            current_apy: initial_apy,
            risk_score,
            max_capacity,
            current_tvl: 0,
            is_active: true,
        };

        // Store pool
        let key = (symbol_short!("POOL"), new_pool_id);
        env.storage().persistent().set(&key, &pool);

        env.events().publish(
            (symbol_short!("POOL_REG"), admin),
            (new_pool_id, pool_address),
        );

        new_pool_id
    }

    /// Deposit funds with smart allocation
    pub fn deposit(
        env: Env,
        user: Address,
        token: Address,
        amount: u64,
        max_risk: u32,
    ) -> Vec<Allocation> {
        user.require_auth();
        
        assert!(amount > 0, "Amount must be greater than 0");
        assert!(max_risk >= 1 && max_risk <= 10, "Risk must be 1-10");

        // Get optimal pools based on risk tolerance
        let pools = Self::get_optimal_pools(env.clone(), max_risk, 5);
        
        let mut allocations = Vec::new(&env);
        let mut remaining = amount;
        let timestamp = env.ledger().timestamp();

        // Distribute funds across pools
        for i in 0..pools.len() {
            if remaining == 0 {
                break;
            }

            let pool_id = pools.get(i).unwrap();
            let pool_key = (symbol_short!("POOL"), pool_id);
            let mut pool: Pool = env.storage().persistent()
                .get(&pool_key)
                .expect("Pool not found");

            if !pool.is_active {
                continue;
            }

            // Calculate allocation (simple equal distribution for MVP)
            let allocation_amount = remaining.min(pool.max_capacity - pool.current_tvl);
            
            if allocation_amount > 0 {
                pool.current_tvl += allocation_amount;
                env.storage().persistent().set(&pool_key, &pool);

                let allocation = Allocation {
                    pool: pool.address.clone(),
                    amount: allocation_amount,
                    timestamp,
                };
                allocations.push_back(allocation);
                
                remaining -= allocation_amount;
            }
        }

        // Store user allocation
        let user_key = (symbol_short!("USER_ALL"), user.clone());
        env.storage().persistent().set(&user_key, &allocations);

        env.events().publish(
            (symbol_short!("DEPOSIT"), user),
            (token, amount),
        );

        allocations
    }

    /// Rebalance portfolio based on current APYs
    pub fn rebalance(env: Env, user: Address, max_risk: u32) -> bool {
        user.require_auth();

        // Get current allocations
        let user_key = (symbol_short!("USER_ALL"), user.clone());
        let current_allocations: Vec<Allocation> = env.storage().persistent()
            .get(&user_key)
            .unwrap_or(Vec::new(&env));

        if current_allocations.is_empty() {
            return false;
        }

        // Calculate total value
        let mut total_value: u64 = 0;
        for i in 0..current_allocations.len() {
            let alloc = current_allocations.get(i).unwrap();
            total_value += alloc.amount;
        }

        // Get new optimal pools
        let optimal_pools = Self::get_optimal_pools(env.clone(), max_risk, 5);
        
        // Emit rebalance event (actual rebalancing logic would move funds)
        env.events().publish(
            (symbol_short!("REBAL"), user),
            total_value,
        );

        true
    }

    /// Harvest yield from all allocations
    pub fn harvest_yield(env: Env, user: Address) -> u64 {
        user.require_auth();

        let user_key = (symbol_short!("USER_ALL"), user.clone());
        let allocations: Vec<Allocation> = env.storage().persistent()
            .get(&user_key)
            .unwrap_or(Vec::new(&env));

        let mut total_yield: u64 = 0;

        // Calculate yield (simplified for MVP)
        for i in 0..allocations.len() {
            let alloc = allocations.get(i).unwrap();
            // Simple 1% yield calculation for demo
            let yield_amount = alloc.amount / 100;
            total_yield += yield_amount;
        }

        env.events().publish(
            (symbol_short!("HARVEST"), user),
            total_yield,
        );

        total_yield
    }

    /// Get optimal pools based on risk tolerance
    pub fn get_optimal_pools(env: Env, max_risk: u32, limit: u32) -> Vec<u32> {
        let pool_count: u32 = env.storage().instance()
            .get(&POOL_COUNTER)
            .unwrap_or(0);

        let mut optimal_pools = Vec::new(&env);
        let mut count = 0;

        // Find pools within risk tolerance, sorted by APY (simplified)
        for pool_id in 1..=pool_count {
            if count >= limit {
                break;
            }

            let key = (symbol_short!("POOL"), pool_id);
            if let Some(pool) = env.storage().persistent().get::<_, Pool>(&key) {
                if pool.is_active && pool.risk_score <= max_risk {
                    optimal_pools.push_back(pool_id);
                    count += 1;
                }
            }
        }

        optimal_pools
    }

    /// Update pool APY (admin only)
    pub fn update_pool_apy(env: Env, admin: Address, pool_id: u32, new_apy: i128) {
        admin.require_auth();

        let key = (symbol_short!("POOL"), pool_id);
        let mut pool: Pool = env.storage().persistent()
            .get(&key)
            .expect("Pool not found");

        pool.current_apy = new_apy;
        env.storage().persistent().set(&key, &pool);

        env.events().publish(
            (symbol_short!("APY_UPD"), admin),
            (pool_id, new_apy),
        );
    }

    /// Get pool details
    pub fn get_pool(env: Env, pool_id: u32) -> Pool {
        let key = (symbol_short!("POOL"), pool_id);
        env.storage().persistent()
            .get(&key)
            .expect("Pool not found")
    }

    /// Get user allocations
    pub fn get_user_allocations(env: Env, user: Address) -> Vec<Allocation> {
        let user_key = (symbol_short!("USER_ALL"), user);
        env.storage().persistent()
            .get(&user_key)
            .unwrap_or(Vec::new(&env))
    }

    /// Calculate risk-adjusted return
    pub fn calculate_risk(env: Env, pool_id: u32) -> u32 {
        let key = (symbol_short!("POOL"), pool_id);
        let pool: Pool = env.storage().persistent()
            .get(&key)
            .expect("Pool not found");

        pool.risk_score
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_register_pool() {
        let env = Env::default();
        let contract_id = env.register_contract(None, YieldRouter);
        let client = YieldRouterClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let pool_addr = Address::generate(&env);

        let pool_id = client.register_pool(&admin, &pool_addr, &1500, &5, &1000000);
        assert_eq!(pool_id, 1);

        let pool = client.get_pool(&pool_id);
        assert_eq!(pool.current_apy, 1500);
        assert_eq!(pool.risk_score, 5);
    }
}
