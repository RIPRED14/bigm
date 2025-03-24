import { createClient } from '@supabase/supabase-js';

// Idéalement, ces variables devraient venir d'un fichier .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Vérifier si les valeurs sont des URLs valides et non les placeholders
const isValidUrl = (url: string): boolean => {
  try {
    // Si c'est un placeholder, on considère que ce n'est pas valide
    if (url.includes('votre_url_supabase') || url === '') {
      return false;
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// On crée un client fictif si les informations ne sont pas valides
export const supabase = isValidUrl(supabaseUrl) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => ({ 
          order: () => ({ data: [], error: new Error('Supabase not configured') }) 
        }),
        insert: () => ({ 
          select: () => ({ 
            single: () => ({ data: null, error: new Error('Supabase not configured') }) 
          }) 
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => ({ data: null, error: new Error('Supabase not configured') })
            })
          })
        }),
        delete: () => ({
          eq: () => ({ error: new Error('Supabase not configured') })
        })
      })
    };

// Types pour la base de données
export type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string;
  availability: string;
  avatarUrl: string;
  created_at?: string;
}; 