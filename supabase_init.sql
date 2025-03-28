-- Création de la table des employés
CREATE TABLE IF NOT EXISTS public.employees (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    availability TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sécurise la table avec RLS (Row Level Security)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Création des politiques pour permettre l'accès public 
-- Note: Dans un environnement de production, vous voudriez restreindre 
-- ces politiques pour n'autoriser que les utilisateurs authentifiés
CREATE POLICY "Allow select for all users" ON public.employees
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users" ON public.employees
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users" ON public.employees
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete for all users" ON public.employees
    FOR DELETE USING (true);

-- Permet la recherche par le titre ou la description
CREATE INDEX IF NOT EXISTS idx_employee_name ON public.employees USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_employee_email ON public.employees USING GIN (email gin_trgm_ops);

-- Données initiales
INSERT INTO public.employees (name, email, phone, availability, avatar_url)
VALUES
    ('John Doe', 'john.doe@example.com', '(555) 123-4567', 'Full-Time', ''),
    ('Jane Smith', 'jane.smith@example.com', '(555) 987-6543', 'Part-Time', ''),
    ('Michael Johnson', 'michael.j@example.com', '(555) 456-7890', 'Weekends Only', ''),
    ('Emily Wilson', 'emily.w@example.com', '(555) 789-0123', 'Full-Time', ''),
    ('David Brown', 'david.b@example.com', '(555) 234-5678', 'Evenings Only', '')
ON CONFLICT (email) DO NOTHING;

-- Création d'une fonction pour mettre à jour automatically updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajout du trigger pour mettre à jour la colonne updated_at
DROP TRIGGER IF EXISTS set_employees_updated_at ON public.employees;
CREATE TRIGGER set_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 