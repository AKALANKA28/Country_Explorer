/**
 * Format a number with commas as thousands separators
 * @param {number} number - The number to format
 * @returns {string} - Formatted number with commas
 */
export const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  /**
   * Debounce function for performance optimization
   * @param {Function} func - The function to debounce
   * @param {number} wait - Milliseconds to wait
   * @returns {Function} - Debounced function
   */
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Format a date to a readable string
   * @param {Date|string} date - Date object or date string
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };