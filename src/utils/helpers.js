/**
 * Format a number with commas as thousands separators
 * @param {number} number - The number to format
 * @returns {string} - Formatted number with commas
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(Number(number))) {
    return "0";
  }
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
  // Check for null or undefined
  if (date === null || date === undefined) {
    return "Invalid Date";
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  const options = { year: "numeric", month: "long", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options);
};
