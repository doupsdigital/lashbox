import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Cliente do Supabase. Fica `null` quando as variáveis de ambiente não existem:
 * em desenvolvimento o app roda no modo local (sem login), como na Fase 1.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          // "implicit": o link do e-mail funciona mesmo abrindo em outro navegador
          flowType: 'implicit',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

/** Em produção, rodar sem Supabase deixaria o app aberto para qualquer pessoa. */
export const missingConfigInProd = !supabase && import.meta.env.PROD
