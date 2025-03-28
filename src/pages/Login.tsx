import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Bolt, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { GridBackground } from '@/components/ui/grid-background';
import { imageService } from '@/lib/image-service';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthContext } from '@/App';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'employee' | 'manager'>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const auth = useContext(AuthContext);

  // Rediriger l'utilisateur s'il est déjà connecté
  useEffect(() => {
    if (auth?.isLoggedIn) {
      if (auth.interface === 'admin') {
        navigate('/dashboard');
      } else if (auth.interface === 'employee') {
        navigate('/employee/dashboard');
      }
    }
  }, [auth, navigate]);

  // Préchargement des images au chargement de la page
  useEffect(() => {
    imageService.preloadImages();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      setIsLoading(false);
      return;
    }

    // Simulation d'une requête d'authentification avec délai
    setTimeout(() => {
      // Mock authentication
      if (email === 'reda@burger-staff.com' && password === 'password') {
        // Connexion réussie en tant qu'employé
        console.log('Connexion réussie: EMPLOYÉ');
        auth?.setIsLoggedIn(true);
        auth?.setInterface('employee');
        navigate('/employee/dashboard');
      } else if (email === 'manager@example.com' && password === 'password') {
        // Connexion réussie en tant qu'admin
        console.log('Connexion réussie: MANAGER');
        auth?.setIsLoggedIn(true);
        auth?.setInterface('admin');
        navigate('/dashboard');
      } else {
        setError('Email ou mot de passe incorrect.');
        setIsLoading(false);
      }
    }, 800);
  };

  // Fonction pour l'accès rapide
  const quickAccess = (role: 'manager' | 'employee') => {
    setIsLoading(true);
    setTimeout(() => {
      if (role === 'manager') {
        console.log('Connexion rapide: MANAGER');
        auth?.setIsLoggedIn(true);
        auth?.setInterface('admin');
        navigate('/dashboard');
      } else {
        console.log('Connexion rapide: EMPLOYÉ');
        auth?.setIsLoggedIn(true);
        auth?.setInterface('employee');
        navigate('/employee/dashboard');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-primary/10 to-primary/5">
      {/* Background pattern */}
      <GridBackground />
      
      {/* Panneau d'accès rapide pour développeurs */}
      <div className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="p-1 shadow-xl border-2 border-primary/20">
            <CardContent className={`${isMobile ? 'p-2' : 'p-3'} space-y-2`}>
              <div className="text-sm font-medium flex items-center text-primary mb-2">
                <Bolt className="h-4 w-4 mr-2" />
                Connexion Rapide
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size={isMobile ? "sm" : "default"} 
                  variant="secondary" 
                  onClick={() => quickAccess('manager')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Manager
                </Button>
                <Button 
                  size={isMobile ? "sm" : "default"} 
                  variant="secondary" 
                  onClick={() => quickAccess('employee')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Employé
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Conteneur principal */}
      <div className={`container relative mx-auto px-4 ${isMobile ? 'pt-4 pb-10' : 'pt-8 pb-20'}`}>
        {/* Retour à l'accueil */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`${isMobile ? 'mb-6' : 'mb-12'}`}
        >
          <Button variant="ghost" asChild className="group">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {isMobile ? 'Accueil' : 'Retour à l\'accueil'}
            </Link>
          </Button>
        </motion.div>
        
        {/* Grille pour le login et l'image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Formulaire de connexion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="text-center mb-6">
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-primary`}>BIG M</h1>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-primary/70 mt-1`}>par DAMOUNE</p>
              <p className={`${isMobile ? 'text-sm' : ''} text-muted-foreground mt-2`}>Connexion à votre espace personnel</p>
            </div>

            <Tabs 
              defaultValue="employee" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'employee' | 'manager')}
              className="w-full"
            >
              <TabsList className={`grid grid-cols-2 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                <TabsTrigger value="employee">Employé</TabsTrigger>
                <TabsTrigger value="manager">Manager</TabsTrigger>
              </TabsList>
              
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className={isMobile ? 'p-4 pb-0' : ''}>
                  <CardTitle className={isMobile ? 'text-xl' : ''}>Connexion {activeTab === 'employee' ? 'Employé' : 'Manager'}</CardTitle>
                  <CardDescription className={isMobile ? 'text-sm' : ''}>
                    Entrez vos identifiants pour accéder à votre espace
                  </CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? 'p-4 pt-4' : ''}>
                  <form onSubmit={handleLogin}>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className={isMobile ? 'text-sm' : ''}>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className={isMobile ? 'text-sm' : ''}>Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={activeTab === 'employee' ? 'reda@burger-staff.com' : 'manager@example.com'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className={isMobile ? 'text-sm' : ''}>Mot de passe</Label>
                          <a href="#" className={`${isMobile ? 'text-xs' : 'text-sm'} text-primary hover:underline`}>
                            Mot de passe oublié?
                          </a>
                        </div>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className={`flex justify-center border-t ${isMobile ? 'px-4 py-3 text-xs' : 'px-6 py-4'}`}>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    {activeTab === 'employee' 
                      ? 'Pour la démo: reda@burger-staff.com / password' 
                      : 'Pour la démo: manager@example.com / password'}
                  </div>
                </CardFooter>
              </Card>
            </Tabs>
          </motion.div>
          
          {/* Image illustration - visible uniquement sur desktop */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={activeTab === 'employee' 
                    ? imageService.getImage('employeeLogin') 
                    : imageService.getImage('managerLogin')}
                  alt={activeTab === 'employee' ? "Interface employé" : "Interface manager"}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    // Fallback si l'image ne charge pas
                    console.error("Erreur de chargement de l'image");
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-white text-2xl font-bold mb-2">
                    {activeTab === 'employee' ? 'Espace Employé' : 'Espace Manager'}
                  </h3>
                  <p className="text-white/90">
                    {activeTab === 'employee' 
                      ? 'Accédez à votre planning, demandes d\'absence et échanges de quarts' 
                      : 'Gérez vos équipes, plannings et validez les demandes'}
                  </p>
                </div>
              </div>
              
              {/* Card flottante avec fonctionnalité */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 max-w-xs">
                <h4 className="font-semibold text-primary mb-2">
                  {activeTab === 'employee' ? 'Échanges simplifiés' : 'Planification intelligente'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'employee' 
                    ? 'Proposez et acceptez des échanges de quarts directement depuis l\'application' 
                    : 'Créez des plannings optimisés en tenant compte des disponibilités et compétences'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 