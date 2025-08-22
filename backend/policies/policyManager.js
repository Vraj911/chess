const UserPolicy = require('./userPolicy');
const GamePolicy = require('./gamePolicy');
const { logger } = require('../utils/logger');

/**
 * Policy Manager
 * Coordinates all policies and provides a unified interface for authorization
 */
class PolicyManager {
  constructor() {
    this.policies = new Map();
    this.initializePolicies();
  }

  /**
   * Initialize all available policies
   */
  initializePolicies() {
    this.policies.set('user', new UserPolicy());
    this.policies.set('game', new GamePolicy());
    
    logger.info('Policy Manager initialized', {
      policies: Array.from(this.policies.keys()),
      count: this.policies.size
    });
  }

  /**
   * Check if user can perform action using appropriate policy
   * @param {string} policyType - Type of policy to use
   * @param {Object} context - Context object for the policy
   * @param {string} action - Action being performed
   * @returns {Promise<boolean>} True if allowed
   */
  async can(policyType, context, action) {
    try {
      const policy = this.policies.get(policyType);
      
      if (!policy) {
        logger.warn('Policy not found', { policyType, action });
        return false;
      }

      const result = await policy.can(context, action);
      
      logger.debug('Policy check result', {
        policyType,
        action,
        result,
        userId: context.user?._id,
        resourceId: context.game?._id || context.targetUser?._id
      });

      return result;
    } catch (error) {
      logger.error('Policy check failed', {
        policyType,
        action,
        error: error.message,
        context: JSON.stringify(context)
      });
      return false;
    }
  }

  /**
   * Check if user cannot perform action
   * @param {string} policyType - Type of policy to use
   * @param {Object} context - Context object for the policy
   * @param {string} action - Action being performed
   * @returns {Promise<boolean>} True if denied
   */
  async cannot(policyType, context, action) {
    return !(await this.can(policyType, context, action));
  }

  /**
   * Check multiple permissions at once
   * @param {Array} checks - Array of permission checks
   * @returns {Promise<Object>} Results of all checks
   */
  async checkMultiple(checks) {
    const results = {};
    
    for (const check of checks) {
      const { policyType, context, action, key } = check;
      results[key] = await this.can(policyType, context, action);
    }

    return results;
  }

  /**
   * Get policy metadata
   * @param {string} policyType - Type of policy
   * @returns {Object|null} Policy metadata
   */
  getPolicyMetadata(policyType) {
    const policy = this.policies.get(policyType);
    return policy ? policy.getMetadata() : null;
  }

  /**
   * Get all available policies
   * @returns {Array} Array of policy names
   */
  getAvailablePolicies() {
    return Array.from(this.policies.keys());
  }

  /**
   * Add custom policy
   * @param {string} name - Policy name
   * @param {BasePolicy} policy - Policy instance
   */
  addPolicy(name, policy) {
    if (this.policies.has(name)) {
      logger.warn('Policy already exists, overwriting', { name });
    }
    
    this.policies.set(name, policy);
    logger.info('Custom policy added', { name, totalPolicies: this.policies.size });
  }

  /**
   * Remove policy
   * @param {string} name - Policy name
   */
  removePolicy(name) {
    if (this.policies.has(name)) {
      this.policies.delete(name);
      logger.info('Policy removed', { name, totalPolicies: this.policies.size });
    }
  }

  /**
   * Validate policy context
   * @param {string} policyType - Type of policy
   * @param {Object} context - Context object
   * @param {Array} requiredFields - Required fields
   * @returns {boolean} True if valid
   */
  validateContext(policyType, context, requiredFields = []) {
    const policy = this.policies.get(policyType);
    return policy ? policy.validateContext(context, requiredFields) : false;
  }

  /**
   * Get policy statistics
   * @returns {Object} Policy statistics
   */
  getStatistics() {
    const stats = {
      totalPolicies: this.policies.size,
      policies: {}
    };

    for (const [name, policy] of this.policies) {
      stats.policies[name] = {
        name: policy.getPolicyName(),
        description: policy.description,
        version: policy.version,
        author: policy.author
      };
    }

    return stats;
  }

  /**
   * Health check for policy manager
   * @returns {Object} Health status
   */
  healthCheck() {
    const stats = this.getStatistics();
    const isHealthy = stats.totalPolicies > 0;
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      policies: stats.totalPolicies,
      details: stats
    };
  }
}

// Create singleton instance
const policyManager = new PolicyManager();

module.exports = policyManager;
