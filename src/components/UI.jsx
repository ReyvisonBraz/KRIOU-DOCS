/**
 * ============================================
 * KRIOU DOCS - UI Components (re-export)
 * ============================================
 * Este arquivo mantém retrocompatibilidade com todos os imports
 * existentes do tipo: import { Button } from "../components/UI"
 *
 * A implementação real está em src/components/ui/ (subpastas).
 * Novos imports devem usar diretamente:
 *   import { Button } from "../components/ui"
 */

export {
  Button,
  Card,
  Badge,
  Tag,
  Spinner,
} from "./ui/primitives";

export {
  Input,
  Textarea,
  Select,
} from "./ui/form";

export {
  Navbar,
  GlassPanel,
  AppNavbar,
  AppStepper,
  BottomNavigation,
} from "./ui/layout";

export {
  EmptyState,
  ErrorMessage,
  SaveIndicator,
  SkeletonCard,
  ConfirmDialog,
} from "./ui/feedback";

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
} from "./ui/resume-helpers";

export {
  VariantSelector,
  SectionHeader,
  LegalHelpButton,
  OptionalFieldToggle,
  ClientNoteBanner,
  LegalFieldRenderer,
} from "./ui/legal-helpers";

export { DocumentCard } from "./ui/document";
