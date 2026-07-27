export interface LegalFieldOption {
  value: string;
  label: string;
}

export interface LegalField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'currency' | 'cpf' | 'cnpj' | 'phone' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: LegalFieldOption[];
  defaultValue?: string;
  hint?: string;
}

export interface LegalSection {
  id: string;
  title: string;
  description?: string;
  fields: LegalField[];
}

export interface LegalVariant {
  id: string;
  name: string;
  description?: string;
  sections?: LegalSection[];
}

export interface LegalDocumentType {
  id: string;
  name: string;
  description: string;
  icon?: string;
  available: boolean;
  defaultVariant?: string;
  variants: LegalVariant[];
  commonSections?: LegalSection[];
}

export type LegalFormData = Record<string, any>;
