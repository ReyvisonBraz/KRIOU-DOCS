/**
 * ============================================
 * KRIOU DOCS - UI Components (re-export)
 * ============================================
 * Este arquivo mantém retrocompatibilidade com todos os imports
 * existentes do tipo: import { Button } from "../components/UI"
 *
 * A implementação real está em src/components/UI/ (subpastas).
 * Novos imports devem usar diretamente:
 *   import { Button } from "../components/UI"
 */

export {
  Button,
  Card,
  Badge,
  Tag,
  Spinner,
} from "./UI/primitives";

export {
  Input,
  Textarea,
  Select,
} from "./UI/form";

export {
  Navbar,
  GlassPanel,
  AppNavbar,
  AppStepper,
  BottomNavigation,
} from "./UI/layout";

export {
  EmptyState,
  ErrorMessage,
  SaveIndicator,
  SkeletonCard,
  Skeleton,
  SkeletonForm,
  SkeletonStep,
  SkeletonPage,
  ConfirmDialog,
} from "./UI/feedback";

export {
  HelpTooltip,
  FieldWithHelp,
  OptionalFieldButton,
  FieldHint,
  QuickSuggestion,
  ExperienceTypeSelector,
  FieldWithIcon,
  VisualExample,
  QuickFillCard,
} from "./UI/resume-helpers";

export {
  VariantSelector,
  SectionHeader,
  LegalHelpButton,
  OptionalFieldToggle,
  ClientNoteBanner,
  LegalFieldRenderer,
} from "./UI/legal-helpers";

export { DocumentCard } from "./UI/document";

export { default as RequirementsModal } from "./UI/RequirementsModal";
