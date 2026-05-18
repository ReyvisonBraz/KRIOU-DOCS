/**
 * ============================================
 * KRIOU DOCS — Analytics Module
 * ============================================
 * Camada de abstração para analytics.
 * Atualmente opera em modo "dry-run" (console.log).
 * Quando VITE_POSTHOG_KEY for configurada, envia para PostHog.
 *
 * PARA ATIVAR:
 *   1. Crie conta em https://posthog.com
 *   2. Copie a API Key do projeto
 *   3. Adicione no .env: VITE_POSTHOG_KEY=phc_xxxxx
 *   4. Instale: npm install posthog-js
 *   5. Descomente as linhas com "posthog" abaixo
 * ============================================
 */

const IS_DEV = import.meta.env.DEV;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || null;

let posthogClient = null;

// Future: initialize PostHog
// async function initPostHog() {
//   if (!POSTHOG_KEY || posthogClient) return;
//   try {
//     const posthog = await import("posthog-js");
//     posthog.default.init(POSTHOG_KEY, {
//       api_host: "https://app.posthog.com",
//       loaded: (ph) => { ph.identify(userId); },
//     });
//     posthogClient = posthog.default;
//   } catch (err) {
//     console.warn("[Analytics] Falha ao inicializar PostHog:", err.message);
//   }
// }

export const analytics = {
  /**
   * Identifica o usuário atual
   */
  identify(userId, traits = {}) {
    if (posthogClient) {
      // posthogClient.identify(userId, traits);
    }
    if (IS_DEV) {
      console.log(`[Analytics] identify:`, { userId, traits });
    }
  },

  /**
   * Dispara um evento de tracking
   *
   * Eventos recomendados:
   *   user_signed_up     - { method: "google" }
   *   user_logged_in     - { is_new: boolean }
   *   template_selected  - { template_id, template_name }
   *   document_created   - { type: "resume"|"legal", doc_type }
   *   document_downloaded - { type, code }
   *   checkout_started   - { document_type }
   *   checkout_completed - { amount, method }
   *   error_occurred     - { error_message, page }
   */
  track(eventName, properties = {}) {
    if (posthogClient) {
      // posthogClient.capture(eventName, properties);
    }
    if (IS_DEV) {
      console.log(`[Analytics] track: ${eventName}`, properties);
    }
  },

  /**
   * Navegação de página
   */
  pageView(page) {
    if (posthogClient) {
      // posthogClient.capture("$pageview", { page });
    }
    if (IS_DEV) {
      console.log(`[Analytics] pageView:`, { page });
    }
  },
};

export default analytics;
