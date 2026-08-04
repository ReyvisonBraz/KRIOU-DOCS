import StorageService from "../../utils/storage";

export const LOCAL_DATA_CLEANUP_COPY = Object.freeze({
  trigger: "Limpar dados deste dispositivo",
  title: "Limpar dados locais?",
  description:
    "Isso remove rascunhos e preferências salvos neste navegador e desconecta sua conta. Seus documentos, perfil e conta continuam armazenados no servidor.",
  confirm: "Limpar e sair",
  cancel: "Manter dados",
});

export function clearLocalAccountData({
  userId,
  storageService = StorageService,
  browserStorage = globalThis.localStorage,
}) {
  if (!userId) return false;

  const cleared = storageService.clearUserData(userId);
  if (!cleared) return false;

  browserStorage?.removeItem(`kriou_onboarding_${userId}_seen`);
  return true;
}
