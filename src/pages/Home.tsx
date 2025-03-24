import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GridBackground } from '@/components/ui/grid-background';
import { imageService } from '@/lib/image-service';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Users, 
  Calendar, 
  Clock, 
  Bell, 
  BarChart4, 
  Smartphone,
  Shield, 
  Zap,
  ChevronRight,
  LogIn
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manager' | 'employee'>('manager');
  const isMobile = useIsMobile();

  // Préchargement des images au chargement de la page
  useEffect(() => {
    imageService.preloadImages();
  }, []);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Fonction pour l'accès rapide
  const quickAccess = (role: 'manager' | 'employee') => {
    if (role === 'manager') {
      navigate('/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Panneau d'accès rapide pour développeurs */}
      <div className={`fixed ${isMobile ? 'bottom-4 right-4 z-40' : 'bottom-6 right-6'} z-50`}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="p-1 shadow-xl border-2 border-primary/20">
            <CardContent className={`${isMobile ? 'p-2' : 'p-3'} space-y-2`}>
              <div className="text-sm font-medium flex items-center text-primary mb-2">
                <LogIn className="h-4 w-4 mr-2" />
                Accès Rapide
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size={isMobile ? "sm" : "default"} 
                  variant="secondary" 
                  onClick={() => quickAccess('manager')}
                  className="w-full"
                >
                  <span className={isMobile ? "text-xs" : ""}>Mode Manager</span>
                </Button>
                <Button 
                  size={isMobile ? "sm" : "default"} 
                  variant="secondary" 
                  onClick={() => quickAccess('employee')}
                  className="w-full"
                >
                  <span className={isMobile ? "text-xs" : ""}>Mode Employé</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <GridBackground />
        
        <div className={`container relative mx-auto px-4 ${isMobile ? 'pt-8 pb-6' : 'py-20'} sm:px-6 lg:px-8 flex flex-col items-center text-center`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`${isMobile ? 'text-3xl font-extrabold tracking-tight' : 'text-4xl md:text-6xl font-bold'} bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-3`}>
              BIG M
            </h1>
            <p className={`${isMobile ? 'text-base px-1' : 'text-xl md:text-2xl'} text-muted-foreground max-w-2xl mx-auto mb-6`}>
              Planification des équipes et gestion du personnel pour les restaurants, simple et efficace.
            </p>
          </motion.div>

          <motion.div 
            className={`flex flex-col ${isMobile ? 'gap-3 w-full' : 'sm:flex-row gap-4'} mb-12`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button size={isMobile ? "lg" : "default"} asChild className={`${isMobile ? 'text-base py-6 shadow-lg' : 'text-md px-8'} w-full`}>
              <Link to="/login">
                Se connecter
              </Link>
            </Button>
            <Button size={isMobile ? "lg" : "default"} variant="outline" onClick={() => window.location.href = '#features'} className={`${isMobile ? 'text-base py-6' : 'text-md px-8'} w-full`}>
              Découvrir
            </Button>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="relative w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden border border-primary/20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <img 
              src={imageService.getImage('dashboardPreview')}
              alt="Dashboard Preview"
              className="w-full h-auto"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                console.error("Erreur de chargement de l'image");
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className={`${isMobile ? 'p-4' : 'p-6'} text-white`}>
                <h3 className={`${isMobile ? 'text-lg font-bold' : 'text-2xl font-bold'} mb-1`}>Tableau de bord intuitif</h3>
                <p className={isMobile ? 'text-sm' : ''}>Gérez votre équipe facilement avec notre interface moderne</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className={`container mx-auto px-4 ${isMobile ? 'py-8' : 'py-24'} sm:px-6 lg:px-8`}>
        <div className="text-center mb-10">
          <h2 className={`${isMobile ? 'text-2xl font-bold' : 'text-3xl md:text-4xl font-bold'} mb-3`}>Fonctionnalités principales</h2>
          <p className={`${isMobile ? 'text-sm px-2' : 'text-xl'} text-muted-foreground max-w-2xl mx-auto`}>
            Tout ce dont vous avez besoin pour gérer efficacement votre équipe
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <FeatureCard 
            icon={<Calendar className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'} text-primary`} />}
            title="Planning intuitif"
            description="Créez des plannings hebdomadaires ou mensuels en quelques clics."
            variants={itemVariants}
            isMobile={isMobile}
          />
          <FeatureCard 
            icon={<Users className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'} text-primary`} />}
            title="Gestion des employés"
            description="Ajoutez, modifiez et gérez facilement tous vos employés."
            variants={itemVariants}
            isMobile={isMobile}
          />
          <FeatureCard 
            icon={<Clock className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'} text-primary`} />}
            title="Demandes d'absence"
            description="Processus simple pour la gestion des demandes de congés."
            variants={itemVariants}
            isMobile={isMobile}
          />
          <FeatureCard 
            icon={<Bell className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'} text-primary`} />}
            title="Notifications"
            description="Notifications en temps réel pour les changements de planning."
            variants={itemVariants}
            isMobile={isMobile}
          />
          <FeatureCard 
            icon={<BarChart4 className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'} text-primary`} />}
            title="Rapports et statistiques"
            description="Visualisez les heures travaillées et les absences."
            variants={itemVariants}
            isMobile={isMobile}
          />
          <FeatureCard 
            icon={<Smartphone className={`${isMobile ? 'w-6 h-6' : 'w-10 h-10'} text-primary`} />}
            title="Accessible partout"
            description="Interface responsive accessible sur tous vos appareils."
            variants={itemVariants}
            isMobile={isMobile}
          />
        </motion.div>
      </div>

      {/* Interface Tabs Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 py-8 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className={`${isMobile ? 'text-2xl font-bold' : 'text-3xl md:text-4xl font-bold'} mb-3`}>Une interface pour chaque besoin</h2>
            <p className={`${isMobile ? 'text-sm px-2' : 'text-xl'} text-muted-foreground max-w-2xl mx-auto`}>
              Découvrez les fonctionnalités spécifiques pour managers et employés
            </p>
          </div>

          <Tabs 
            defaultValue="manager" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'manager' | 'employee')}
            className="w-full max-w-4xl mx-auto"
          >
            <TabsList className={`grid grid-cols-2 w-full ${isMobile ? 'max-w-full' : 'max-w-md'} mx-auto mb-6`}>
              <TabsTrigger value="manager" className={`${isMobile ? 'text-base py-3' : 'text-lg py-3'}`}>Interface Manager</TabsTrigger>
              <TabsTrigger value="employee" className={`${isMobile ? 'text-base py-3' : 'text-lg py-3'}`}>Interface Employé</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manager" className="mt-0">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="order-2 md:order-1">
                  <h3 className={`${isMobile ? 'text-xl font-bold' : 'text-2xl font-bold'} mb-4`}>Pour les gérants de restaurant</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <div className="bg-primary/10 rounded-full p-1 h-7 w-7 flex items-center justify-center mt-0.5">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Contrôle total</p>
                        <p className={`${isMobile ? 'text-xs' : ''} text-muted-foreground`}>Gérez tous les aspects de votre personnel</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-primary/10 rounded-full p-1 h-7 w-7 flex items-center justify-center mt-0.5">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Planification intelligente</p>
                        <p className={`${isMobile ? 'text-xs' : ''} text-muted-foreground`}>Créez des plannings optimisés</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-primary/10 rounded-full p-1 h-7 w-7 flex items-center justify-center mt-0.5">
                        <BarChart4 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Tableau de bord analytique</p>
                        <p className={`${isMobile ? 'text-xs' : ''} text-muted-foreground`}>Suivez les performances clés</p>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-5">
                    <Button asChild variant="default" className={`group ${isMobile ? 'w-full py-5 text-sm' : ''}`}>
                      <Link to="/login">
                        Essayer l'interface manager
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="order-1 md:order-2 rounded-lg shadow-xl overflow-hidden border border-primary/10">
                  <img 
                    src={imageService.getImage('managerInterface')}
                    alt="Interface Manager"
                    className="w-full h-auto"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      console.error("Erreur de chargement de l'image");
                    }}
                  />
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="employee" className="mt-0">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="order-2 md:order-1">
                  <h3 className={`${isMobile ? 'text-xl font-bold' : 'text-2xl font-bold'} mb-4`}>Pour les membres de l'équipe</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <div className="bg-primary/10 rounded-full p-1 h-7 w-7 flex items-center justify-center mt-0.5">
                        <Smartphone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Accès mobile</p>
                        <p className={`${isMobile ? 'text-xs' : ''} text-muted-foreground`}>Consultez votre planning partout</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-primary/10 rounded-full p-1 h-7 w-7 flex items-center justify-center mt-0.5">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Demandes d'absence simplifiées</p>
                        <p className={`${isMobile ? 'text-xs' : ''} text-muted-foreground`}>En quelques clics seulement</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-primary/10 rounded-full p-1 h-7 w-7 flex items-center justify-center mt-0.5">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Échanges de quarts</p>
                        <p className={`${isMobile ? 'text-xs' : ''} text-muted-foreground`}>Échangez avec vos collègues</p>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-5">
                    <Button asChild variant="default" className={`group ${isMobile ? 'w-full py-5 text-sm' : ''}`}>
                      <Link to="/login">
                        Essayer l'interface employé
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="order-1 md:order-2 rounded-lg shadow-xl overflow-hidden border border-primary/10">
                  <img 
                    src={imageService.getImage('employeeInterface')}
                    alt="Interface Employé"
                    className="w-full h-auto"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      console.error("Erreur de chargement de l'image");
                    }}
                  />
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`container mx-auto px-4 ${isMobile ? 'py-8' : 'py-24'} sm:px-6 lg:px-8`}>
        <motion.div 
          className={`bg-gradient-to-r from-primary/90 to-primary rounded-2xl ${isMobile ? 'p-6' : 'p-8 md:p-12'} shadow-xl text-white text-center`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className={`${isMobile ? 'text-xl font-bold' : 'text-3xl md:text-4xl font-bold'} mb-3`}>Prêt à optimiser la gestion de votre équipe ?</h2>
          <p className={`${isMobile ? 'text-sm' : 'text-xl'} opacity-90 max-w-2xl mx-auto mb-6`}>
            Commencez dès aujourd'hui et découvrez comment BIG M peut simplifier votre quotidien.
          </p>
          <Button 
            size={isMobile ? "lg" : "default"} 
            variant="secondary" 
            asChild
            className={`${isMobile ? 'w-full py-5 shadow-lg' : 'text-primary px-8 text-lg font-medium'}`}
          >
            <Link to="/login">
              Commencer maintenant
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 md:grid-cols-4 gap-8'}`}>
            <div className={`${isMobile ? '' : 'col-span-2 md:col-span-2'}`}>
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold mb-3`}>BIG M</h3>
              <p className={`${isMobile ? 'text-xs' : ''} text-slate-300 mb-4 max-w-md`}>
                Solution complète pour la gestion du personnel de restaurant.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Navigation</h4>
              <ul className={`${isMobile ? 'text-xs' : 'text-sm'} space-y-2 text-slate-300`}>
                <li><a href="#" className="hover:text-primary transition-colors">Accueil</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Légal</h4>
              <ul className={`${isMobile ? 'text-xs' : 'text-sm'} space-y-2 text-slate-300`}>
                <li><a href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-6 sm:mt-12 pt-6 text-center text-slate-400">
            <p className={isMobile ? 'text-xs' : ''}>© {new Date().getFullYear()} BIG M. Tous droits réservés.</p>
            <p className={`${isMobile ? 'text-xs' : ''} mt-1`}>Créé par DAMOUNE</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, variants, isMobile }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  variants: Variants;
  isMobile?: boolean;
}) => {
  return (
    <motion.div 
      variants={variants}
      className={`glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${isMobile ? 'p-3' : 'p-6'} rounded-xl shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className={`bg-primary/10 ${isMobile ? 'w-10 h-10' : 'w-16 h-16'} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className={`${isMobile ? 'text-base font-bold' : 'text-xl font-bold'} mb-1`}>{title}</h3>
      <p className={`${isMobile ? 'text-xs' : ''} text-muted-foreground`}>{description}</p>
    </motion.div>
  );
};

export default Home; 