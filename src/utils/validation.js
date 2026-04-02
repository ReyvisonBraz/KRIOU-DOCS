/**
 * ============================================
 * KRIOU DOCS - Form Validation Utilities
 * ============================================
 * Centralized form validation rules and
 * validation functions for the application.
 * 
 * @module utils/validation
 */

// ─── Validation Rules ───
export const VALIDATION_RULES = {
  /**
   * Required field validation
   * @param {any} value - Value to validate
   * @returns {boolean} Is valid
   */
  required: (value) => {
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== undefined;
  },

  /**
   * Email validation
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Phone validation (Brazilian format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Is valid phone
   */
  phone: (phone) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length >= 10 && numbers.length <= 11;
  },

  /**
   * Minimum length validation
   * @param {number} min - Minimum length
   * @returns {Function} Validation function
   */
  minLength: (min) => (value) => {
    return value && value.length >= min;
  },

  /**
   * Maximum length validation
   * @param {number} max - Maximum length
   * @returns {Function} Validation function
   */
  maxLength: (max) => (value) => {
    return value && value.length <= max;
  },
};

// ─── Step Validation Configurations ───
export const STEP_VALIDATIONS = {
  /**
   * Step 0: Personal Data validation
   */
  0: {
    nome: {
      rules: [VALIDATION_RULES.required, VALIDATION_RULES.minLength(3)],
      message: "Nome completo é obrigatório (mínimo 3 caracteres)",
    },
    email: {
      rules: [VALIDATION_RULES.required, VALIDATION_RULES.email],
      message: "E-mail válido é obrigatório",
    },
    telefone: {
      rules: [VALIDATION_RULES.required, VALIDATION_RULES.phone],
      message: "Telefone válido é obrigatório",
    },
  },

  /**
   * Step 1: Objective validation
   */
  1: {
    objetivo: {
      rules: [VALIDATION_RULES.required, VALIDATION_RULES.minLength(20)],
      message: "Objetivo profissional é obrigatório (mínimo 20 caracteres)",
    },
  },

  /**
   * Step 2: Experience validation (at least one required if filled)
   */
  2: {
    experiencias: {
      rules: [],
      custom: (experiencias) => {
        // If any field is filled, validate it
        const hasContent = experiencias.some(
          (exp) => exp.empresa || exp.cargo || exp.descricao
        );
        if (!hasContent) return { valid: true }; // Optional
        return {
          valid: experiencias.every((exp) => exp.empresa && exp.cargo),
          message: "Empresa e cargo são obrigatórios para experiências preenchidas",
        };
      },
    },
  },

  /**
   * Step 3: Education validation
   */
  3: {
    formacoes: {
      rules: [],
      custom: (formacoes) => {
        const hasContent = formacoes.some((f) => f.instituicao || f.curso);
        if (!hasContent) return { valid: true }; // Optional
        return {
          valid: formacoes.every((f) => f.instituicao && f.curso),
          message: "Instituição e curso são obrigatórios para formações preenchidas",
        };
      },
    },
  },

  // Steps 4, 5, 6 are optional
  4: {},
  5: {},
  6: {},
};

/**
 * Validate a specific field
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result { valid: boolean, message?: string }
 */
export const validateField = (field, value, rules) => {
  if (!rules || !rules.rules) {
    return { valid: true };
  }

  // Run standard rules
  for (const rule of rules.rules) {
    if (!rule(value)) {
      return { valid: false, message: rules.message };
    }
  }

  // Run custom validation if exists
  if (rules.custom) {
    return rules.custom(value);
  }

  return { valid: true };
};

/**
 * Validate an entire step
 * @param {number} step - Step number
 * @param {Object} formData - Form data object
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
export const validateStep = (step, formData) => {
  const stepValidation = STEP_VALIDATIONS[step];
  if (!stepValidation) {
    return { valid: true, errors: {} };
  }

  const errors = {};

  for (const [field, rules] of Object.entries(stepValidation)) {
    const value = formData[field];
    const result = validateField(field, value, rules);

    if (!result.valid) {
      errors[field] = result.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate entire form
 * @param {Object} formData - Full form data
 * @returns {Object} Validation result
 */
export const validateForm = (formData) => {
  const allErrors = {};

  for (let step = 0; step <= 6; step++) {
    const result = validateStep(step, formData);
    Object.assign(allErrors, result.errors);
  }

  return {
    valid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
};

/**
 * Get step completion status
 * @param {number} step - Step number
 * @param {Object} formData - Form data
 * @returns {Object} Completion status
 */
export const getStepStatus = (step, formData) => {
  const result = validateStep(step, formData);
  return {
    isValid: result.valid,
    isComplete: Object.values(formData).some((v) => v && (Array.isArray(v) ? v.length > 0 : v.toString().trim().length > 0)),
    errors: result.errors,
  };
};

export default {
  VALIDATION_RULES,
  STEP_VALIDATIONS,
  validateField,
  validateStep,
  validateForm,
  getStepStatus,
};