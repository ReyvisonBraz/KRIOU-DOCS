import {
  EnvironmentConfigurationError,
  resolveBuildEnvironment,
  resolveClientEnvironment,
} from "./environment";
import { PRODUCTION_SUPABASE_PROJECT_REF } from "./deployment-trust.js";
import {
  LEGACY_JWT_CLOCK_SKEW_SECONDS,
  LEGACY_JWT_MAX_LIFETIME_SECONDS,
} from "./supabase-public-key.js";
import { describe, expect, it } from "vitest";

const PRODUCTION_REF = PRODUCTION_SUPABASE_PROJECT_REF;
const STAGING_REF = "abcdefghijklmnopqrst";
const PUBLISHABLE_KEY = "sb_publishable_abcdefghijklmnopqrstuvwxyz123456";
const SECRET_KEY_PREFIX = ["sb", "secret"].join("_") + "_";
const FIXED_NOW_SECONDS = Math.floor(Date.UTC(2026, 7, 14) / 1000);
const FIVE_YEARS_SECONDS = 5 * 365 * 24 * 60 * 60;
const CLI_TEN_YEARS_SECONDS = 10 * 365 * 24 * 60 * 60;
const CLOCK_OPTIONS = { nowSeconds: FIXED_NOW_SECONDS };

function remoteEnvironment(overrides = {}) {
  return {
    MODE: "production",
    VITE_APP_ENV: "preview",
    VITE_SUPABASE_ENV: "staging",
    VITE_SUPABASE_URL: `https://${STAGING_REF}.supabase.co`,
    VITE_SUPABASE_ANON_KEY: PUBLISHABLE_KEY,
    ...overrides,
  };
}

function jwtWithPayload(payload, options = {}) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = options.header || { alg: "HS256", typ: "JWT" };
  const signature = options.signature || "synthetic_signature_that_is_long_enough";
  return `${encode(header)}.${encode(payload)}.${signature}`;
}

function hostedAnonJwt(ref) {
  return jwtWithPayload({
    iss: "supabase",
    ...(ref ? { ref } : {}),
    role: "anon",
    iat: FIXED_NOW_SECONDS - 60,
    exp: FIXED_NOW_SECONDS + FIVE_YEARS_SECONDS,
  });
}

function localAnonJwt() {
  return jwtWithPayload({
    role: "anon",
    iss: "supabase-demo",
    exp: FIXED_NOW_SECONDS + CLI_TEN_YEARS_SECONDS,
  });
}

describe("resolveClientEnvironment", () => {
  it("aceita modo offline apenas quando explicitamente habilitado no local", () => {
    expect(resolveClientEnvironment({
      MODE: "development",
      VITE_APP_ENV: "local",
      VITE_ALLOW_OFFLINE: "true",
    })).toMatchObject({
      appEnvironment: "local",
      supabaseEnvironment: "offline",
      supabaseConfigured: false,
    });
  });

  it("falha no local sem Supabase e sem opt-in offline", () => {
    expect(() => resolveClientEnvironment({ MODE: "development", VITE_APP_ENV: "local" }))
      .toThrow("modo offline só pode ser habilitado explicitamente");
  });

  it("permite o ambiente de teste offline sem configuração externa", () => {
    expect(resolveClientEnvironment({ MODE: "test" }).supabaseConfigured).toBe(false);
  });

  it("aceita Supabase local quando URL e chave publishable estão presentes", () => {
    expect(resolveClientEnvironment({
      MODE: "development",
      VITE_APP_ENV: "local",
      VITE_SUPABASE_ENV: "local",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_ANON_KEY: PUBLISHABLE_KEY,
    })).toMatchObject({
      supabaseConfigured: true,
      supabaseEnvironment: "local",
      projectRef: null,
      keyType: "publishable",
    });
  });

  it("aceita a anon JWT oficial do Supabase CLI/local sem aud nem ref", () => {
    expect(resolveClientEnvironment({
      MODE: "development",
      VITE_APP_ENV: "local",
      VITE_SUPABASE_ENV: "local",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_ANON_KEY: localAnonJwt(),
    }, CLOCK_OPTIONS)).toMatchObject({
      keyType: "legacy-anon-jwt",
      keyIssuer: "supabase-demo",
      keySchema: "cli-local",
      keyAssociation: "external-smoke-required",
    });
  });

  it("exige URL e chave juntas", () => {
    expect(() => resolveClientEnvironment({
      MODE: "development",
      VITE_APP_ENV: "local",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
    })).toThrow("devem ser configuradas juntas");
  });

  it("aceita preview ligado a um projeto de homologação diferente de produção", () => {
    expect(resolveClientEnvironment(remoteEnvironment())).toMatchObject({
      appEnvironment: "preview",
      supabaseEnvironment: "staging",
      projectRef: STAGING_REF,
    });
  });

  it("bloqueia preview apontado para a âncora canônica de produção", () => {
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_URL: `https://${PRODUCTION_REF}.supabase.co`,
    }))).toThrow("project-ref canônico de produção");
  });

  it("bloqueia o ataque que troca URL e âncora VITE juntas", () => {
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_URL: `https://${PRODUCTION_REF}.supabase.co`,
      VITE_PRODUCTION_SUPABASE_PROJECT_REF: STAGING_REF,
    }))).toThrow("VITE_PRODUCTION_SUPABASE_PROJECT_REF não é uma variável pública permitida");
  });

  it("bloqueia produção apontada para outro project-ref", () => {
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_APP_ENV: "production",
      VITE_SUPABASE_ENV: "production",
    }))).toThrow("project-ref canônico versionado");
  });

  it("aceita produção somente com o project-ref canônico", () => {
    expect(resolveClientEnvironment(remoteEnvironment({
      VITE_APP_ENV: "production",
      VITE_SUPABASE_ENV: "production",
      VITE_SUPABASE_URL: `https://${PRODUCTION_REF}.supabase.co`,
    })).projectRef).toBe(PRODUCTION_REF);
  });

  it.each([
    "VITE_E2E_TEST_PASSWORD",
    "VITE_DATABASE_URL",
    "VITE_INTERNAL_API_TOKEN",
    "VITE_ALTERNATIVE_SERVICE_ROLE",
  ])("rejeita nome público não permitido: %s", (name) => {
    expect(() => resolveClientEnvironment(remoteEnvironment({ [name]: "valor-sensivel" })))
      .toThrow(`${name} não é uma variável pública permitida`);
  });

  it("aceita os identificadores públicos opcionais conhecidos", () => {
    expect(resolveClientEnvironment(remoteEnvironment({
      VITE_POSTHOG_KEY: "phc_identificador-publico",
      VITE_SENTRY_DSN: "https://public@example.ingest.sentry.io/123",
      VITE_LOG_LEVEL: "warn",
    })).supabaseConfigured).toBe(true);
  });

  it.each([
    `https://user:pass@${STAGING_REF}.supabase.co`,
    `https://${STAGING_REF}.supabase.co:444`,
    `https://a.supabase.co`,
    `https://${STAGING_REF}.supabase.co/rest`,
    `https://${STAGING_REF}.supabase.co?x=1`,
    `https://${STAGING_REF}.supabase.co#hash`,
  ])("rejeita URL remota fora do formato canônico: %s", (url) => {
    expect(() => resolveClientEnvironment(remoteEnvironment({ VITE_SUPABASE_URL: url })))
      .toThrow(EnvironmentConfigurationError);
  });

  it("aceita anon JWT hosted oficial com ref associado à URL", () => {
    expect(resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: hostedAnonJwt(STAGING_REF),
    }), CLOCK_OPTIONS)).toMatchObject({
      keyType: "legacy-anon-jwt",
      keyIssuer: "supabase",
      keySchema: "hosted",
      keyAssociation: "jwt-ref-claim-matched",
    });
  });

  it("aceita anon JWT hosted oficial sem ref e exige associação por smoke externo", () => {
    expect(resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: hostedAnonJwt(),
    }), CLOCK_OPTIONS)).toMatchObject({
      keyType: "legacy-anon-jwt",
      keyAssociation: "external-smoke-required",
    });
  });

  it("rejeita anon JWT de outro projeto", () => {
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: hostedAnonJwt(PRODUCTION_REF),
    }), CLOCK_OPTIONS)).toThrow("não pertence ao project-ref");
  });

  it("rejeita issuer CLI/local em Preview e issuer hosted na URL local", () => {
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: localAnonJwt(),
    }), CLOCK_OPTIONS)).toThrow("não aceita anon JWT com issuer supabase-demo");

    expect(() => resolveClientEnvironment({
      MODE: "development",
      VITE_APP_ENV: "local",
      VITE_SUPABASE_ENV: "local",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_ANON_KEY: hostedAnonJwt(),
    }, CLOCK_OPTIONS)).toThrow("não aceita anon JWT com issuer supabase");
  });

  it.each([
    {
      name: "hosted expirada",
      environment: "remote",
      payload: {
        iss: "supabase",
        role: "anon",
        iat: FIXED_NOW_SECONDS - 2_000,
        exp: FIXED_NOW_SECONDS - LEGACY_JWT_CLOCK_SKEW_SECONDS - 1,
      },
    },
    {
      name: "hosted emitida no futuro",
      environment: "remote",
      payload: {
        iss: "supabase",
        role: "anon",
        iat: FIXED_NOW_SECONDS + LEGACY_JWT_CLOCK_SKEW_SECONDS + 1,
        exp: FIXED_NOW_SECONDS + 10_000,
      },
    },
    {
      name: "hosted com exp <= iat",
      environment: "remote",
      payload: {
        iss: "supabase",
        role: "anon",
        iat: FIXED_NOW_SECONDS - 100,
        exp: FIXED_NOW_SECONDS - 100,
      },
    },
    {
      name: "hosted com lifetime superior a dez anos",
      environment: "remote",
      payload: {
        iss: "supabase",
        role: "anon",
        iat: FIXED_NOW_SECONDS - 100,
        exp: FIXED_NOW_SECONDS - 100 + LEGACY_JWT_MAX_LIFETIME_SECONDS + 1,
      },
    },
    {
      name: "CLI expirada sem iat",
      environment: "local",
      payload: {
        iss: "supabase-demo",
        role: "anon",
        exp: FIXED_NOW_SECONDS - LEGACY_JWT_CLOCK_SKEW_SECONDS - 1,
      },
    },
    {
      name: "CLI com exp impossível para o gerador atual",
      environment: "local",
      payload: {
        iss: "supabase-demo",
        role: "anon",
        exp: FIXED_NOW_SECONDS
          + LEGACY_JWT_MAX_LIFETIME_SECONDS
          + LEGACY_JWT_CLOCK_SKEW_SECONDS
          + 1,
      },
    },
  ])("rejeita validade temporal inválida: $name", ({ environment, payload }) => {
    const env = environment === "remote"
      ? remoteEnvironment({ VITE_SUPABASE_ANON_KEY: jwtWithPayload(payload) })
      : {
          MODE: "development",
          VITE_APP_ENV: "local",
          VITE_SUPABASE_ENV: "local",
          VITE_SUPABASE_URL: "http://127.0.0.1:54321",
          VITE_SUPABASE_ANON_KEY: jwtWithPayload(payload),
        };
    expect(() => resolveClientEnvironment(env, CLOCK_OPTIONS))
      .toThrow(EnvironmentConfigurationError);
  });

  it("aceita exatamente os limites do skew de cinco minutos", () => {
    const localAtExpirationBoundary = jwtWithPayload({
      iss: "supabase-demo",
      role: "anon",
      exp: FIXED_NOW_SECONDS - LEGACY_JWT_CLOCK_SKEW_SECONDS,
    });
    expect(resolveClientEnvironment({
      MODE: "development",
      VITE_APP_ENV: "local",
      VITE_SUPABASE_ENV: "local",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_ANON_KEY: localAtExpirationBoundary,
    }, CLOCK_OPTIONS).keySchema).toBe("cli-local");

    const hostedAtIssuedBoundary = jwtWithPayload({
      iss: "supabase",
      role: "anon",
      iat: FIXED_NOW_SECONDS + LEGACY_JWT_CLOCK_SKEW_SECONDS,
      exp: FIXED_NOW_SECONDS + 10_000,
    });
    expect(resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: hostedAtIssuedBoundary,
    }), CLOCK_OPTIONS).keySchema).toBe("hosted");
  });

  it.each([
    {
      iss: "supabase",
      role: "service_role",
      ref: STAGING_REF,
      iat: 1645192800,
      exp: 1960768800,
    },
    {
      iss: `https://${STAGING_REF}.supabase.co/auth/v1`,
      role: "authenticated",
      aud: "authenticated",
      sub: "00000000-0000-0000-0000-000000000001",
      iat: 1645192800,
      exp: 1960768800,
    },
    {
      iss: "issuer-invalido",
      role: "anon",
      ref: STAGING_REF,
      iat: 1645192800,
      exp: 1960768800,
    },
    {
      iss: "supabase",
      role: "anon",
      aud: "authenticated",
      ref: STAGING_REF,
      iat: 1645192800,
      exp: 1960768800,
    },
    {
      iss: "supabase-demo",
      role: "anon",
      ref: STAGING_REF,
      iat: 1645192800,
      exp: 1960768800,
    },
  ])("rejeita service_role, usuário, issuer/claims inválidos e shape local adulterado", (payload) => {
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: jwtWithPayload(payload),
    }), CLOCK_OPTIONS)).toThrow(EnvironmentConfigurationError);
  });

  it.each([
    { header: { alg: "none", typ: "JWT" } },
    { header: { alg: "HS256", typ: "JWT", kid: "inesperado" } },
    { signature: "curta" },
  ])("rejeita header ou assinatura compacta fora do shape oficial", (options) => {
    const key = jwtWithPayload({
      iss: "supabase",
      ref: STAGING_REF,
      role: "anon",
      iat: 1645192800,
      exp: 1960768800,
    }, options);
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: key,
    }), CLOCK_OPTIONS)).toThrow(EnvironmentConfigurationError);
  });

  it("rejeita chave publishable malformada ou secret", () => {
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: "sb_publishable_curta",
    }))).toThrow("estruturalmente válida");
    expect(() => resolveClientEnvironment(remoteEnvironment({
      VITE_SUPABASE_ANON_KEY: `${SECRET_KEY_PREFIX}abcdefghijklmnopqrstuvwxyz123456`,
    }))).toThrow("estruturalmente válida");
  });

  it("não inclui valores sensíveis na mensagem de erro", () => {
    const secret = `${SECRET_KEY_PREFIX}valor-que-nao-pode-vazar`;
    try {
      resolveClientEnvironment(remoteEnvironment({ VITE_SUPABASE_ANON_KEY: secret }));
      throw new Error("esperava falha");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentConfigurationError);
      expect(error.message).not.toContain(secret);
    }
  });
});

describe("resolveBuildEnvironment", () => {
  it("falha quando o escopo Vercel e VITE_APP_ENV divergem", () => {
    expect(() => resolveBuildEnvironment({
      ...remoteEnvironment(),
      VERCEL_ENV: "production",
    })).toThrow("VERCEL_ENV=production exige VITE_APP_ENV=production");
  });

  it("aceita somente o modo de qualidade com marcador explícito", () => {
    expect(resolveBuildEnvironment({ MODE: "quality", KRIOU_QUALITY_BUILD: "1" }))
      .toMatchObject({
        appEnvironment: "local",
        supabaseConfigured: false,
      });
    expect(() => resolveBuildEnvironment({ MODE: "quality" }))
      .toThrow("KRIOU_QUALITY_BUILD=1");
  });

  it("proíbe o modo offline de qualidade em qualquer build Vercel", () => {
    expect(() => resolveBuildEnvironment({
      MODE: "quality",
      KRIOU_QUALITY_BUILD: "1",
      VERCEL: "1",
      VERCEL_ENV: "preview",
    })).toThrow("proibido dentro da Vercel");
  });

  it("GITHUB_ACTIONS sozinho não habilita bypass", () => {
    expect(() => resolveBuildEnvironment({ GITHUB_ACTIONS: "true" }))
      .toThrow("VITE_APP_ENV deve ser local, preview ou production");
  });
});
