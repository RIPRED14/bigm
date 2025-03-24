import { supabase, Employee } from './supabase';

// Fonctions pour les employés
export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('id', { ascending: true });
    
  if (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    return [];
  }
  
  return data || [];
};

export const getEmployee = async (id: number): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Erreur lors de la récupération de l'employé ${id}:`, error);
    return null;
  }
  
  return data;
};

export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
    .single();
    
  if (error) {
    console.error('Erreur lors de l\'ajout de l\'employé:', error);
    return null;
  }
  
  return data;
};

export const updateEmployee = async (id: number, updates: Partial<Employee>): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Erreur lors de la mise à jour de l'employé ${id}:`, error);
    return null;
  }
  
  return data;
};

export const deleteEmployee = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Erreur lors de la suppression de l'employé ${id}:`, error);
    return false;
  }
  
  return true;
}; 