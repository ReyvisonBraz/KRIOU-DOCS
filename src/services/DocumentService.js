/**
 * ============================================
 * KRIOU DOCS - Document Service
 * ============================================
 * Fachada para operações de documentos e perfil no Supabase.
 */

import { supabase } from "../lib/supabase";

export const DocumentService = {
  /**
   * Busca todos os documentos do usuário autenticado.
   */
  async fetchAll() {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((row) => ({
      id:               row.id,
      type:             row.type,
      title:            row.title,
      template:         row.template,
      status:           row.status,
      formData:         row.form_data,
      legalData:        row.legal_data,
      documentTypeName: row.document_type_name,
      date:             new Date(row.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      createdAt:        row.created_at,
      userId:           row.user_id,
    }));
  },

  /**
   * Insere um documento finalizado.
   */
  async insert(doc, userId) {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id:            userId,
        type:               doc.type,
        title:              doc.title || "Sem título",
        template:           doc.template || null,
        status:             doc.status || "finalizado",
        form_data:          doc.formData   || null,
        legal_data:         doc.legalData  || null,
        document_type_name: doc.documentTypeName || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...doc,
      id:        data.id,
      createdAt: data.created_at,
      date:      new Date(data.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    };
  },

  /**
   * Remove um documento pelo ID.
   */
  async remove(documentId) {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (error) throw error;
    return true;
  },

  /**
   * Busca o perfil do usuário autenticado.
   */
  async fetchProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  /**
   * Atualiza nome, sobrenome e CPF do perfil.
   */
  async updateProfile({ nome, sobrenome, cpf }) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ nome, sobrenome, cpf })
      .eq("id", (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Verifica se o perfil está completo (nome, sobrenome e CPF preenchidos).
   */
  isProfileComplete(profile) {
    return !!(profile?.nome?.trim() && profile?.sobrenome?.trim() && profile?.cpf?.trim());
  },

  /**
   * Verifica se o onboarding foi concluído.
   */
  isOnboardingDone(profile) {
    return !!profile?.onboarding_done;
  },

  /**
   * Marca o onboarding como concluído no perfil do usuário.
   */
  async markOnboardingDone() {
    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_done: true })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
    return true;
  },
};
