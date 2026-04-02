/**
 * ============================================
 * KRIOU DOCS - Local Storage Utility
 * ============================================
 * Handles data persistence using browser
 * localStorage for user documents and form
 * data.
 * 
 * @module utils/storage
 */

// ─── Storage Keys ───
const STORAGE_KEYS = {
  USER_DOCUMENTS: "kriou_docs_user_documents",
  FORM_DATA: "kriou_docs_form_data",
  LEGAL_FORM_DATA: "kriou_docs_legal_form_data",
  USER_SESSION: "kriou_docs_user_session",
  TEMPLATE_PREFERENCES: "kriou_docs_template_prefs",
};

/**
 * Storage Service - Centralized localStorage management
 */
const StorageService = {
  /**
   * Save user documents to localStorage
   * @param {Array} documents - User documents array
   */
  saveDocuments: (documents) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DOCUMENTS, JSON.stringify(documents));
      return true;
    } catch (error) {
      console.error("Error saving documents:", error);
      return false;
    }
  },

  /**
   * Load user documents from localStorage
   * @returns {Array} User documents or empty array
   */
  loadDocuments: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_DOCUMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading documents:", error);
      return [];
    }
  },

  /**
   * Save form data for auto-recovery
   * @param {Object} formData - Current form data
   */
  saveFormData: (formData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
      return true;
    } catch (error) {
      console.error("Error saving form data:", error);
      return false;
    }
  },

  /**
   * Load saved form data
   * @returns {Object|null} Saved form data or null
   */
  loadFormData: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading form data:", error);
      return null;
    }
  },

  /**
   * Save legal form data for auto-recovery
   * @param {Object} formData - Current legal form data
   */
  saveLegalFormData: (formData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEGAL_FORM_DATA, JSON.stringify(formData));
      return true;
    } catch (error) {
      console.error("Error saving legal form data:", error);
      return false;
    }
  },

  /**
   * Load saved legal form data
   * @returns {Object|null} Saved legal form data or null
   */
  loadLegalFormData: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEGAL_FORM_DATA);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading legal form data:", error);
      return null;
    }
  },

  /**
   * Clear legal form data
   */
  clearLegalFormData: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LEGAL_FORM_DATA);
      return true;
    } catch (error) {
      console.error("Error clearing legal form data:", error);
      return false;
    }
  },

  /**
   * Save user session data
   * @param {Object} session - Session data
   */
  saveSession: (session) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  },

  /**
   * Load user session
   * @returns {Object|null} Session data or null
   */
  loadSession: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading session:", error);
      return null;
    }
  },

  /**
   * Clear user session (logout)
   */
  clearSession: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      return true;
    } catch (error) {
      console.error("Error clearing session:", error);
      return false;
    }
  },

  /**
   * Clear all stored data
   */
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  },

  /**
   * Save template preferences
   * @param {Object} preferences - Template preferences
   */
  saveTemplatePreferences: (preferences) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATE_PREFERENCES, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error("Error saving template preferences:", error);
      return false;
    }
  },

  /**
   * Load template preferences
   * @returns {Object|null} Saved preferences or null
   */
  loadTemplatePreferences: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATE_PREFERENCES);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading template preferences:", error);
      return null;
    }
  },

  /**
   * Check if storage is available
   * @returns {boolean} Storage availability
   */
  isAvailable: () => {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get storage usage info
   * @returns {Object} Storage info
   */
  getStorageInfo: () => {
    let totalSize = 0;
    const items = {};
    
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        const size = new Blob([item]).size;
        items[key] = size;
        totalSize += size;
      }
    });
    
    return {
      totalSize,
      items,
      available: StorageService.isAvailable(),
    };
  },
};

export default StorageService;

// Export individual functions for convenience
export const {
  saveDocuments,
  loadDocuments,
  saveFormData,
  loadFormData,
  saveSession,
  loadSession,
  clearSession,
  clearAll,
  saveTemplatePreferences,
  loadTemplatePreferences,
  isAvailable,
  getStorageInfo,
} = StorageService;