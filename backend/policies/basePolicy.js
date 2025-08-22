/**
 * Base Policy Class
 * All policies should extend this class to ensure consistent behavior
 */
class BasePolicy {
  constructor() {
    if (this.constructor === BasePolicy) {
      throw new Error('BasePolicy cannot be instantiated directly');
    }
  }

  /**
   * Check if the policy allows the action
   * @param {Object} context - Context object containing user, resource, etc.
   * @param {string} action - Action being performed
   * @returns {boolean} True if allowed, false otherwise
   */
  async can(context, action) {
    throw new Error('can() method must be implemented by subclass');
  }

  /**
   * Check if the policy denies the action
   * @param {Object} context - Context object containing user, resource, etc.
   * @param {string} action - Action being performed
   * @returns {boolean} True if denied, false otherwise
   */
  async cannot(context, action) {
    return !(await this.can(context, action));
  }

  /**
   * Get policy name
   * @returns {string} Policy name
   */
  getPolicyName() {
    return this.constructor.name;
  }

  /**
   * Validate context object
   * @param {Object} context - Context object to validate
   * @param {Array} requiredFields - Required fields in context
   * @returns {boolean} True if valid, false otherwise
   */
  validateContext(context, requiredFields = []) {
    if (!context || typeof context !== 'object') {
      return false;
    }

    for (const field of requiredFields) {
      if (!(field in context)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get policy metadata
   * @returns {Object} Policy metadata
   */
  getMetadata() {
    return {
      name: this.getPolicyName(),
      description: this.description || 'No description provided',
      version: this.version || '1.0.0',
      author: this.author || 'System'
    };
  }
}

module.exports = BasePolicy;
