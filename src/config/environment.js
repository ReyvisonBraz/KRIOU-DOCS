import { PRODUCTION_SUPABASE_PROJECT_REF } from "./deployment-trust.js";
import { inspectLegacyAnonJwt } from "./supabase-public-key.js";

const APP_ENVIRONMENTS = new Set(["local", "preview", "production"]);
const REMOTE_SUPABASE_ENVIRONMENTS = {
  preview: "staging",
  production: "production",
};

const PUBLIC_CLIENT_VARIABLES = new Set([
  "VITE_APP_ENV",
  "VITE_SUPABASE_ENV",
  "VITE_ALLOW_OFFLINE",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_ENABLE_PAYMENT_MOCK",
  "VITE_POSTHOG_KEY",
  "VITE_SENTRY_DSN",
  "VITE_LOG_LEVEL",
]);

const PROJECT_REF_PATTERN = /^[a-z0-9]{20}$/;
const PUBLISHABLE_KEY_PATTERN = /^sb_publishable_[A-Za-z0-9_-]{20,200}$/;

export class EnvironmentConfigurationError extends Error {
  constructor(message) {
    super(`[environment] ${message}`);
    this.name = "EnvironmentConfigurationError";
  }
}

function fail(message) {
  throw new EnvironmentConfigurationError(message);
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function requireValue(env, name) {
  const value = clean(env[name]);
  if (!value) fail(`${name} é obrigatória neste ambiente.`);
  return value;
}

function validatePublicKey(value, projectRef, supabaseEnvironment, options) {
  if (/placeholder|change[-_]?me|xxxxx|example/i.test(value)) {
    fail("VITE_SUPABASE_ANON_KEY contém um placeholder.");
  }

  if (PUBLISHABLE_KEY_PATTERN.test(value)) {
    return { keyType: "publishable", keyAssociation: "external-smoke-required" };
  }

  const inspection = value.startsWith("eyJ")
    ? inspectLegacyAnonJwt(value, { nowSeconds: options.nowSeconds })
    : { valid: false };
  if (!inspection.valid) {
    fail("VITE_SUPABASE_ANON_KEY deve ser uma chave anon JWT ou publishable estruturalmente válida.");
  }

  const expectedIssuer = supabaseEnvironment === "local" ? "supabase-demo" : "supabase";
  if (inspection.issuer !== expectedIssuer) {
    fail(`VITE_SUPABASE_ENV=${supabaseEnvironment} não aceita anon JWT com issuer ${inspection.issuer}.`);
  }

  if (projectRef && inspection.projectRef && inspection.projectRef !== projectRef) {
    fail("A anon JWT não pertence ao project-ref de VITE_SUPABASE_URL.");
  }

  return {
    keyType: "legacy-anon-jwt",
    keyIssuer: inspection.issuer,
    keySchema: inspection.schema,
    keyAssociation: projectRef && inspection.projectRef
      ? "jwt-ref-claim-matched"
      : "external-smoke-required",
  };
}

function validateUrlShape(url) {
  if (url.username || url.password) {
    fail("VITE_SUPABASE_URL não pode conter usuário ou senha.");
  }

  if (url.pathname !== "/" || url.search || url.hash) {
    fail("VITE_SUPABASE_URL deve apontar para a raiz do projeto, sem path, query ou hash.");
  }
}

function parseSupabaseUrl(value, supabaseEnvironment) {
  let url;
  try {
    url = new URL(value);
  } catch {
    fail("VITE_SUPABASE_URL não é uma URL válida.");
  }

  validateUrlShape(url);

  if (supabaseEnvironment === "local") {
    const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
    if (!localHosts.has(url.hostname) || !["http:", "https:"].includes(url.protocol)) {
      fail("VITE_SUPABASE_ENV=local só aceita uma URL local do Supabase.");
    }
    return { projectRef: null };
  }

  if (url.protocol !== "https:" || url.port) {
    fail("Preview e produção exigem HTTPS na porta padrão.");
  }

  const match = url.hostname.match(/^([a-z0-9]{20})\.supabase\.co$/);
  if (!match || !PROJECT_REF_PATTERN.test(match[1])) {
    fail("VITE_SUPABASE_URL deve usar um project-ref Supabase válido de 20 caracteres.");
  }

  return { projectRef: match[1] };
}

function validatePublicVariableNames(env) {
  for (const name of Object.keys(env)) {
    if (name.startsWith("VITE_") && !PUBLIC_CLIENT_VARIABLES.has(name)) {
      fail(`${name} não é uma variável pública permitida no bundle.`);
    }
  }
}

export function resolveClientEnvironment(env, options = {}) {
  validatePublicVariableNames(env);

  const mode = clean(env.MODE) || clean(options.mode);
  const isTest = mode === "test";
  const appEnvironment = clean(env.VITE_APP_ENV) || (isTest ? "local" : "");

  if (!APP_ENVIRONMENTS.has(appEnvironment)) {
    fail("VITE_APP_ENV deve ser local, preview ou production.");
  }

  const platformEnvironment = clean(options.platformEnvironment);
  const expectedAppEnvironment = {
    development: "local",
    preview: "preview",
    production: "production",
  }[platformEnvironment];

  if (expectedAppEnvironment && appEnvironment !== expectedAppEnvironment) {
    fail(`VERCEL_ENV=${platformEnvironment} exige VITE_APP_ENV=${expectedAppEnvironment}.`);
  }

  const allowOffline = clean(env.VITE_ALLOW_OFFLINE) === "true";
  const supabaseUrl = clean(env.VITE_SUPABASE_URL);
  const supabaseKey = clean(env.VITE_SUPABASE_ANON_KEY);
  const hasAnyCredential = Boolean(supabaseUrl || supabaseKey);

  if (!hasAnyCredential) {
    if (appEnvironment !== "local" || (!allowOffline && !isTest)) {
      fail("Supabase é obrigatório; modo offline só pode ser habilitado explicitamente no local.");
    }

    return {
      appEnvironment,
      supabaseEnvironment: "offline",
      supabaseConfigured: false,
      supabaseUrl: null,
      supabaseKey: null,
      projectRef: null,
      keyType: null,
      keyIssuer: null,
      keySchema: null,
      keyAssociation: null,
    };
  }

  if (!supabaseUrl || !supabaseKey) {
    fail("VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem ser configuradas juntas.");
  }

  if (allowOffline) {
    fail("VITE_ALLOW_OFFLINE não pode permanecer true quando o Supabase está configurado.");
  }

  const supabaseEnvironment = requireValue(env, "VITE_SUPABASE_ENV");
  const expectedSupabaseEnvironment = appEnvironment === "local"
    ? "local"
    : REMOTE_SUPABASE_ENVIRONMENTS[appEnvironment];

  if (supabaseEnvironment !== expectedSupabaseEnvironment) {
    fail(`VITE_APP_ENV=${appEnvironment} exige VITE_SUPABASE_ENV=${expectedSupabaseEnvironment}.`);
  }

  const { projectRef } = parseSupabaseUrl(supabaseUrl, supabaseEnvironment);
  const {
    keyType,
    keyIssuer,
    keySchema,
    keyAssociation,
  } = validatePublicKey(supabaseKey, projectRef, supabaseEnvironment, options);

  if (appEnvironment === "preview" && projectRef === PRODUCTION_SUPABASE_PROJECT_REF) {
    fail("Preview/homologação não pode usar o project-ref canônico de produção.");
  }

  if (appEnvironment === "production" && projectRef !== PRODUCTION_SUPABASE_PROJECT_REF) {
    fail("Produção deve usar exatamente o project-ref canônico versionado.");
  }

  return {
    appEnvironment,
    supabaseEnvironment,
    supabaseConfigured: true,
    supabaseUrl,
    supabaseKey,
    projectRef,
    keyType,
    keyIssuer: keyIssuer || null,
    keySchema: keySchema || null,
    keyAssociation,
  };
}

export function resolveBuildEnvironment(env) {
  const mode = clean(env.MODE) || "production";
  const qualityMarker = clean(env.KRIOU_QUALITY_BUILD);
  const qualityRequested = mode === "quality" || qualityMarker;

  if (qualityRequested) {
    if (mode !== "quality" || qualityMarker !== "1") {
      fail("Build de qualidade exige mode=quality e KRIOU_QUALITY_BUILD=1.");
    }
    if (clean(env.VERCEL) || clean(env.VERCEL_ENV)) {
      fail("Build de qualidade offline é proibido dentro da Vercel.");
    }

    const resolved = resolveClientEnvironment({
      ...env,
      MODE: mode,
      VITE_APP_ENV: "local",
      VITE_SUPABASE_ENV: "",
      VITE_SUPABASE_URL: "",
      VITE_SUPABASE_ANON_KEY: "",
      VITE_ALLOW_OFFLINE: "true",
    });
    return resolved;
  }

  return resolveClientEnvironment(
    { ...env, MODE: mode },
    { platformEnvironment: env.VERCEL_ENV },
  );
}
