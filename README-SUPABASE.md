# Configuration de Supabase pour Burger Staff Sync

Ce guide vous aidera à configurer Supabase comme base de données backend pour l'application Burger Staff Sync.

## Étape 1 : Créer un compte et un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com/) et créez un compte si vous n'en avez pas déjà un
2. Connectez-vous à votre compte Supabase
3. Créez un nouveau projet en cliquant sur "New Project"
4. Donnez un nom à votre projet (ex: "burger-staff-sync")
5. Définissez un mot de passe pour la base de données
6. Choisissez la région la plus proche de vous
7. Cliquez sur "Create New Project"

## Étape 2 : Récupérer les informations de connexion

1. Une fois votre projet créé, allez dans les paramètres du projet (icône d'engrenage en bas à gauche)
2. Dans la section "API", vous trouverez :
   - URL : votre URL Supabase
   - anon/public : votre clé publique (anon key)

## Étape 3 : Configurer l'application

1. Dans le répertoire du projet, créez un fichier `.env` à la racine (s'il n'existe pas déjà)
2. Ajoutez les variables d'environnement suivantes :
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   ```
3. Remplacez `votre_url_supabase` et `votre_clé_anon_supabase` par les valeurs obtenues à l'étape 2

## Étape 4 : Initialiser la base de données

1. Dans l'interface Supabase, allez dans la section "SQL Editor"
2. Créez un nouveau script SQL en cliquant sur "New Query"
3. Copiez le contenu du fichier `supabase_init.sql` fourni dans ce projet
4. Exécutez le script SQL en cliquant sur "Run"

Ce script va :
- Créer une table `employees` avec tous les champs nécessaires
- Configurer la sécurité et les permissions
- Insérer quelques données initiales pour tester l'application

## Étape 5 : Lancer l'application

Une fois Supabase configuré, vous pouvez lancer l'application :

```bash
npm run dev
```

L'application devrait maintenant être connectée à votre base de données Supabase !

## Dépannage

Si l'application ne parvient pas à se connecter à Supabase :

1. Vérifiez que les variables d'environnement sont correctement définies dans le fichier `.env`
2. Assurez-vous que l'URL et la clé Supabase sont correctes
3. Vérifiez que la table `employees` a bien été créée dans Supabase
4. Vérifiez que les politiques RLS (Row Level Security) ont été correctement configurées

Si vous voyez des erreurs dans la console du navigateur, elles devraient vous aider à identifier le problème. 