/**
 * ============================================
 * KRIOU DOCS - Local Storage Utility
 * ============================================
 * Handles data persistence using browser
 * localStorage for user documents and form
 * data.
 * 
 * Storage Structure Strategy:
 * - User session: kriou_user_{userId}_session
 * - User documents (finalized): kriou_user_{userId}_documents  
 * - User drafts (unfinished): kriou_user_{userId}_drafts
 * - Current draft (no user): kriou_current_draft
 * - Guest drafts: kriou_guest_draft
 * 
 * @module utils/storage
 */

// ─── Storage Keys (Base) ───
const STORAGE_KEYS = {
  USER_DOCUMENTS: "kriou_user_documents",
  FORM_DATA: "kriou_docs_form_data",
  LEGAL_FORM_DATA: "kriou_docs_legal_form_data",
  USER_SESSION: "kriou_docs_user_session",
  TEMPLATE_PREFERENCES: "kriou_docs_template_prefs",
  CURRENT_PAGE: "kriou_docs_current_page",
};

// ─── Storage Keys with User Context ───
const getUserKey = (baseKey, userId) => `kriou_user_${userId}_${baseKey}`;

/**
 * Generate storage key for user documents
 */
const getUserDocumentsKey = (userId) => userId 
  ? `kriou_user_${userId}_documents` 
  : STORAGE_KEYS.USER_DOCUMENTS;

/**
 * Generate storage key for user drafts
 */
const getUserDraftsKey = (userId) => userId 
  ? `kriou_user_${userId}_drafts` 
  : "kriou_guest_draft";

/**
 * Generate storage key for user session
 */
const getUserSessionKey = (userId) => userId 
  ? `kriou_user_${userId}_session` 
  : STORAGE_KEYS.USER_SESSION;

/**
 * Storage Service - Centralized localStorage management
 */
const StorageService = {
  // ─── User Session Management (DEPRECATED — sessão gerenciada pelo Supabase Auth) ───
  /**
   * @deprecated Sessão agora é gerenciada pelo Supabase Auth. Não usar.
   */
  saveSession: (session) => {
    try {
      const key = getUserSessionKey(session.userId);
      localStorage.setItem(key, JSON.stringify({
        ...session,
        lastActive: new Date().toISOString(),
      }));
      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  },

  /**
   * @deprecated Sessão agora é gerenciada pelo Supabase Auth. Não usar.
   */
  loadSession: (userId = null) => {
    try {
      if (userId) {
        const key = getUserSessionKey(userId);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }

      // Scan for any active session (boot-time discovery)
      let latest = null;
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("kriou_user_") && key.endsWith("_session")) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data?.userId && data?.isAuthenticated) {
              if (!latest || (data.lastActive > (latest.lastActive || ""))) {
                latest = data;
              }
            }
          } catch {
            // ignore malformed entries
          }
        }
      });
      return latest;
    } catch (error) {
      console.error("Error loading session:", error);
      return null;
    }
  },

  /**
   * @deprecated Sessão agora é gerenciada pelo Supabase Auth. Não usar.
   */
  clearSession: (userId = null) => {
    try {
      const key = getUserSessionKey(userId);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error clearing session:", error);
      return false;
    }
  },

  // ─── User Documents Management ───
  /**
   * Save user documents to localStorage with user isolation
   * @param {Array} documents - User documents array
   * @param {string} userId - User ID for isolation
   */
  saveDocuments: (documents, userId = null) => {
    try {
      const key = getUserDocumentsKey(userId);
      localStorage.setItem(key, JSON.stringify(documents));
      return true;
    } catch (error) {
      console.error("Error saving documents:", error);
      return false;
    }
  },

  /**
   * Load user documents from localStorage
   * @param {string} userId - User ID for isolation
   * @returns {Array} User documents or empty array
   */
  loadDocuments: (userId = null) => {
    try {
      const key = getUserDocumentsKey(userId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading documents:", error);
      return [];
    }
  },

  /**
   * Add a single document to user's document list
   * @param {Object} document - Document to add
   * @param {string} userId - User ID
   * @returns {Object} The added document with ID
   */
  addDocument: (document, userId = null) => {
    const documents = StorageService.loadDocuments(userId);
    const newDoc = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      ...document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    documents.push(newDoc);
    StorageService.saveDocuments(documents, userId);
    return newDoc;
  },

  /**
   * Update an existing document
   * @param {string} documentId - Document ID to update
   * @param {Object} updates - Fields to update
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  updateDocument: (documentId, updates, userId = null) => {
    try {
      const documents = StorageService.loadDocuments(userId);
      const index = documents.findIndex(doc => doc.id === documentId);
      if (index !== -1) {
        documents[index] = {
          ...documents[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        StorageService.saveDocuments(documents, userId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating document:", error);
      return false;
    }
  },

  /**
   * Delete a document
   * @param {string} documentId - Document ID to delete
   * @param {string} userId - User ID
   * @returns {boolean} Success status
   */
  deleteDocument: (documentId, userId = null) => {
    try {
      const documents = StorageService.loadDocuments(userId);
      const filtered = documents.filter(doc => doc.id !== documentId);
      StorageService.saveDocuments(filtered, userId);
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  },

  // ─── Draft/Autosave Management ───
  /**
   * Save draft data for auto-recovery
   * @param {Object} draftData - Current draft data
   * @param {string} userId - User ID (optional, for guest use null)
   * @param {string} draftType - Type of draft ('resume' or 'legal')
   */
  saveDraft: (draftData, userId = null, draftType = "resume") => {
    try {
      const key = userId 
        ? `kriou_user_${userId}_draft_${draftType}`
        : `kriou_guest_draft_${draftType}`;
      localStorage.setItem(key, JSON.stringify({
        ...draftData,
        draftType,
        savedAt: new Date().toISOString(),
      }));
      return true;
    } catch (error) {
      console.error("Error saving draft:", error);
      return false;
    }
  },

  /**
   * Load saved draft data
   * @param {string} userId - User ID (optional)
   * @param {string} draftType - Type of draft ('resume' or 'legal')
   * @returns {Object|null} Saved draft or null
   */
  loadDraft: (userId = null, draftType = "resume") => {
    try {
      const key = userId 
        ? `kriou_user_${userId}_draft_${draftType}`
        : `kriou_guest_draft_${draftType}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading draft:", error);
      return null;
    }
  },

  /**
   * Clear draft data
   * @param {string} userId - User ID (optional)
   * @param {string} draftType - Type of draft
   */
  clearDraft: (userId = null, draftType = "resume") => {
    try {
      const key = userId 
        ? `kriou_user_${userId}_draft_${draftType}`
        : `kriou_guest_draft_${draftType}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error clearing draft:", error);
      return false;
    }
  },

  // ─── Legacy Support (Guest/Mixed) ───
  /**
   * Save form data for auto-recovery (legacy)
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
   * Load saved form data (legacy)
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
   * Save legal form data for auto-recovery (legacy)
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
   * Load saved legal form data (legacy)
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

  // ─── Current Page Persistence ───
  savePage: (page) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, page);
      return true;
    } catch { return false; }
  },

  loadPage: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE) || null;
    } catch { return null; }
  },

  clearPage: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE);
      return true;
    } catch { return false; }
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

  // ─── Utility Functions ───
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
    
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("kriou_")) {
        const item = localStorage.getItem(key);
        if (item) {
          const size = new Blob([item]).size;
          items[key] = size;
          totalSize += size;
        }
      }
    });
    
    return {
      totalSize,
      items,
      available: StorageService.isAvailable(),
    };
  },

  /**
   * @deprecated Migração de dados legados não é mais necessária. Não usar.
   */
  migrateLegacyData: (userId) => {
    try {
      const legacyFormData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      const legacyLegalData = localStorage.getItem(STORAGE_KEYS.LEGAL_FORM_DATA);
      const legacyDocs = localStorage.getItem(STORAGE_KEYS.USER_DOCUMENTS);
      
      if (legacyFormData) {
        StorageService.saveDraft(JSON.parse(legacyFormData), userId, "resume");
      }
      if (legacyLegalData) {
        StorageService.saveDraft(JSON.parse(legacyLegalData), userId, "legal");
      }
      if (legacyDocs) {
        StorageService.saveDocuments(JSON.parse(legacyDocs), userId);
      }
      
      return true;
    } catch (error) {
      console.error("Error migrating legacy data:", error);
      return false;
    }
  },

  /**
   * Get all user data for cleanup/export
   * @param {string} userId - User ID
   * @returns {Object} All user data
   */
  getUserData: (userId) => {
    return {
      session: StorageService.loadSession(userId),
      documents: StorageService.loadDocuments(userId),
      draftResume: StorageService.loadDraft(userId, "resume"),
      draftLegal: StorageService.loadDraft(userId, "legal"),
    };
  },

  /**
   * Clear all user data (account deletion)
   * @param {string} userId - User ID
   */
  clearUserData: (userId) => {
    try {
      const prefixes = [
        `kriou_user_${userId}_documents`,
        `kriou_user_${userId}_draft_resume`,
        `kriou_user_${userId}_draft_legal`,
        `kriou_user_${userId}_session`,
      ];
      
      Object.keys(localStorage).forEach((key) => {
        if (prefixes.some(prefix => key.startsWith(prefix))) {
          localStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error clearing user data:", error);
      return false;
    }
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