import React, { useState, useContext, useEffect } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Phone, 
  Mail, 
  Clock, 
  Bell, 
  Save, 
  Upload, 
  AlertTriangle,
  Calendar,
  Check,
  Briefcase,
  Heart,
  Lock,
  BookUser,
  Globe,
  Eye,
  EyeOff,
  FileText,
  LogOut,
  Camera,
  Edit,
  KeyRound,
  UserCog,
  ShieldCheck,
  CreditCard,
  Download,
  ChevronRight,
  CalendarDays,
  CalendarX
} from 'lucide-react';
import { AuthContext } from '@/App';
import useIsMobile from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

// Type pour le profil d'employé
interface EmployeeProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  availability: string;
  startDate: Date;
  restaurant?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  contractType?: string;
  employeeId?: string;
  socialSecurityNumber?: string;
}

// Type pour les préférences de notification
interface NotificationPreferences {
  shiftChanges: boolean;
  absenceUpdates: boolean;
  weeklySchedule: boolean;
  appNotifications: boolean;
  emailNotifications: boolean;
}

// Type pour les données d'heures travaillées
interface WorkHours {
  month: string;
  monthObj: Date;
  data: {
    date: string;
    hours: number;
  }[];
}

// Données mockées
const mockProfile: EmployeeProfile = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '06 12 34 56 78',
  avatarUrl: '',
  availability: 'Lundi - Vendredi: 10h - 22h, Weekend: 18h - 02h',
  startDate: new Date(2023, 0, 15),
  restaurant: 'Burger Central',
  address: '123 Rue de la Paix, 75001 Paris',
  emergencyContact: {
    name: 'Jane Doe',
    phone: '06 98 76 54 32',
    relationship: 'Conjoint'
  },
  contractType: 'CDI',
  employeeId: 'EMP-2023-0042',
  socialSecurityNumber: '1 23 45 67 890 123'
};

const mockNotificationPreferences: NotificationPreferences = {
  shiftChanges: true,
  absenceUpdates: true,
  weeklySchedule: true,
  appNotifications: true,
  emailNotifications: false,
};

// Générer des données d'heures travaillées pour les 3 derniers mois
const generateWorkHoursData = (): WorkHours[] => {
  const currentDate = new Date();
  const months = [];
  
  // Générer les données pour les 6 derniers mois
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date(currentDate);
    monthDate.setMonth(currentDate.getMonth() - i);
    
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthName = format(monthDate, 'MMMM', { locale: fr });
    
    const data = Array.from({ length: daysInMonth }, (_, j) => {
      const isWorkDay = Math.random() > 0.3;
      const hours = isWorkDay ? 4 + Math.random() * 4 : 0;
      
      return {
        date: `${j + 1}`,
        hours: Math.round(hours * 10) / 10
      };
    });
    
    months.push({
      month: monthName,
      monthObj: monthDate,
      data
    });
  }
  
  return months;
};

const mockWorkHours = generateWorkHoursData();

// Calcul des heures totales pour un mois
const calculateTotalHours = (data: { date: string; hours: number }[]): number => {
  return data.reduce((total, day) => total + day.hours, 0);
};

// Formater les données pour le graphique
const formatChartData = (data: { date: string; hours: number }[]): { date: string; hours: number }[] => {
  return data.filter(day => day.hours > 0); // Filtrer les jours sans heures
};

// Format pour afficher les heures avec précision
const formatHours = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h${minutes}m`;
};

// Sections rapides d'accès pour mobile
const quickAccessSections = [
  {
    id: 'personal',
    icon: <User className="h-4 w-4 text-violet-500" />,
    label: 'Informations',
    color: 'bg-violet-100'
  },
  {
    id: 'security',
    icon: <Lock className="h-4 w-4 text-amber-500" />,
    label: 'Sécurité',
    color: 'bg-amber-100'
  },
  {
    id: 'notifications',
    icon: <Bell className="h-4 w-4 text-sky-500" />,
    label: 'Alertes',
    color: 'bg-sky-100'
  },
  {
    id: 'stats',
    icon: <Clock className="h-4 w-4 text-rose-500" />,
    label: 'Statistiques',
    color: 'bg-rose-100'
  }
];

const EmployeeProfile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'personal';
  
  const [profile, setProfile] = useState<EmployeeProfile>(mockProfile);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(mockNotificationPreferences);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(0);
  
  // Simuler un chargement initial
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Mettre à jour l'URL lorsque l'onglet change
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // En production, envoi du fichier au serveur puis mise à jour de l'URL
      // Simulation d'une URL locale pour la démo
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProfile(prev => ({
            ...prev,
            avatarUrl: reader.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveProfile = () => {
    setIsSubmitting(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setIsSubmitting(false);
    setIsEditing(false);
    
    toast({
      title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    }, 1500);
  };
  
  const handleSaveNotifications = () => {
    setIsSubmitting(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setIsSubmitting(false);
      
    toast({
      title: "Préférences mises à jour",
      description: "Vos préférences de notification ont été enregistrées.",
      });
    }, 1500);
  };
  
  const calculateProfileCompleteness = (): number => {
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.avatarUrl,
      profile.availability,
      profile.address,
      profile.emergencyContact?.name,
      profile.emergencyContact?.phone,
      profile.emergencyContact?.relationship
    ];
    
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };
  
  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setProfile(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact!,
        [name]: value
      }
    }));
  };
  
  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setIsSubmitting(false);
    setNewPassword('');
    setConfirmPassword('');
      
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
    }, 1500);
  };
  
  const handleLogout = () => {
    if (auth) {
      auth.setIsLoggedIn(false);
    }
    navigate('/login');
  };
  
  const completionPercentage = calculateProfileCompleteness();
  
  return (
    <PageContainer>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pb-16"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-12 w-48 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pb-16"
          >
            {/* En-tête du profil */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Mon Profil</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérez vos informations personnelles et préférences
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full md:w-auto flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" /> Se déconnecter
              </Button>
            </div>
            
            {/* Carte de profil principale */}
            <Card className="overflow-hidden">
              <div className="relative h-32 md:h-40 bg-gradient-to-r from-primary/20 to-primary/5">
                <div className={cn(
                  "absolute -bottom-16 left-4 md:left-8",
                  isMobile && "w-full flex justify-center left-0 -bottom-12"
                )}>
                  <div className="relative group">
                    <Avatar className={cn(
                      "border-4 border-background shadow-md",
                      isMobile ? "h-24 w-24" : "h-32 w-32"
                    )}>
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                      <AvatarFallback className={isMobile ? "text-2xl" : "text-4xl"}>
                        {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Camera className="h-8 w-8 text-white" />
                        <input 
                          type="file" 
                          id="avatar-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="absolute right-4 top-4">
                  <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="sr-only md:not-sr-only">Modifier la couverture</span>
                  </Button>
                </div>
              </div>
              
              <CardContent className={cn(
                "px-4 md:px-8",
                isMobile ? "pt-16 pb-4" : "pt-20"
              )}>
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                  <div className={isMobile ? "text-center" : ""}>
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <div className={cn(
                      "flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-muted-foreground mt-1",
                      isMobile && "items-center"
                    )}>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>{profile.restaurant || "Non assigné"}</span>
                      </div>
                      <div className="hidden md:block">•</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Depuis {format(profile.startDate, 'MMMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-2",
                    isMobile && "justify-center"
                  )}>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Actif
                  </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {profile.contractType || "Contrat standard"}
                  </Badge>
                </div>
              </div>
              
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Complétude du profil</h3>
                    <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>
                  <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
            
            {/* Navigation rapide pour mobile */}
            {isMobile && (
              <div className="grid grid-cols-4 gap-2">
                {quickAccessSections.map((section) => (
                  <Button
                    key={section.id}
                    variant="outline"
                    className={`flex flex-col items-center py-3 h-auto ${section.color} border-transparent ${activeTab === section.id ? 'ring-2 ring-primary/30' : ''}`}
                    onClick={() => setActiveTab(section.id)}
                  >
                    {section.icon}
                    <span className="text-xs mt-1">{section.label}</span>
                  </Button>
                ))}
      </div>
            )}
            
            {/* Conteneur principal pour les onglets */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6 hidden md:grid">
                <TabsTrigger value="personal" className="gap-2">
                  <User className="h-4 w-4" /> Informations
          </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="h-4 w-4" /> Sécurité
          </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <Clock className="h-4 w-4" /> Statistiques
          </TabsTrigger>
        </TabsList>
        
        {/* Onglet Profil */}
              <TabsContent value="personal">
          <Card>
                  <CardHeader className={isMobile ? "pb-2" : "pb-3"}>
                    <div className="flex items-center justify-between">
                      <CardTitle className={isMobile ? "text-base" : ""}>Informations personnelles</CardTitle>
                <Button 
                        variant="ghost"
                        size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                        className="h-8 text-primary"
                >
                        {isEditing ? "Annuler" : "Modifier"}
                </Button>
              </div>
                    <CardDescription>
                      Vos coordonnées et informations personnelles
                    </CardDescription>
            </CardHeader>
                  <CardContent className={isMobile ? "p-3" : ""}>
                    <div className="space-y-6">
                      <div className={cn(
                        "grid gap-6",
                        isMobile ? "grid-cols-1" : "md:grid-cols-2"
                      )}>
                        <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                        <Input
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                        />
                      </div>
                          
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                        />
                      </div>
                          
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                              type="tel"
                          value={profile.phone}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                        
                        <div className="space-y-4">
                    <div className="space-y-2">
                            <Label htmlFor="address">Adresse</Label>
                        <Input
                              id="address"
                              name="address"
                              value={profile.address}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                        />
                      </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="avatarUpload">Photo de profil</Label>
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {isEditing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="relative"
                                  asChild
                                >
                                  <label htmlFor="avatarUpload">
                                    <Upload className="h-4 w-4 mr-1" />
                                    <span>{isMobile ? "Photo" : "Changer d'image"}</span>
                                    <input
                                      type="file"
                                      id="avatarUpload"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleFileChange}
                                    />
                                  </label>
                                </Button>
                              )}
                    </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="availability">Disponibilités</Label>
                        <Input
                              id="availability"
                              name="availability"
                              value={profile.availability}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                      <div>
                        <h3 className="font-medium mb-4">Contact d'urgence</h3>
                        <div className={cn(
                          "grid gap-4",
                          isMobile ? "grid-cols-1" : "md:grid-cols-3"
                        )}>
                    <div className="space-y-2">
                            <Label htmlFor="emergencyName">Nom du contact</Label>
                      <Input
                        id="emergencyName"
                        name="name"
                        value={profile.emergencyContact?.name || ''}
                        onChange={handleEmergencyContactChange}
                        disabled={!isEditing}
                      />
                    </div>
                          
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Téléphone</Label>
                      <Input
                        id="emergencyPhone"
                        name="phone"
                        value={profile.emergencyContact?.phone || ''}
                        onChange={handleEmergencyContactChange}
                        disabled={!isEditing}
                      />
                    </div>
                          
                    <div className="space-y-2">
                            <Label htmlFor="emergencyRelationship">Lien</Label>
                      <Input
                        id="emergencyRelationship"
                        name="relationship"
                        value={profile.emergencyContact?.relationship || ''}
                        onChange={handleEmergencyContactChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
                  <CardFooter className={cn(
                    isMobile ? "px-3 pt-0 pb-3" : "",
                    "flex justify-end"
                  )}>
            {isEditing && (
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-1">●</span>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                  <Save className="h-4 w-4 mr-1" />
                  Enregistrer
                          </>
                        )}
                        </Button>
                    )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Onglet Sécurité */}
        <TabsContent value="security">
          <Card>
                  <CardHeader className={isMobile ? "pb-2" : ""}>
                    <CardTitle className={isMobile ? "text-base" : ""}>Sécurité du compte</CardTitle>
              <CardDescription>
                Gérez vos informations de connexion et sécurité
              </CardDescription>
            </CardHeader>
                  <CardContent className={isMobile ? "p-3" : ""}>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Modifier le mot de passe
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                                placeholder="Entrez votre mot de passe actuel"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    
                    {newPassword && newPassword.length < 8 && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Mot de passe trop court</AlertTitle>
                        <AlertDescription>
                          Le mot de passe doit contenir au moins 8 caractères.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Les mots de passe ne correspondent pas</AlertTitle>
                        <AlertDescription>
                          Assurez-vous que les deux mots de passe sont identiques.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <BookUser className="h-4 w-4 text-primary" />
                    Sessions actives
                  </h3>
                  
                        <div className="space-y-3">
                          <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium">Session actuelle</span>
                      </div>
                              <span className={cn(
                                "text-sm text-muted-foreground",
                                isMobile && "text-xs"
                              )}>
                        Commencée il y a 2 heures
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Windows • Chrome • Paris, France
                    </div>
                  </div>
                  
                          <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium">Application mobile</span>
                      </div>
                              <span className={cn(
                                "text-sm text-muted-foreground",
                                isMobile && "text-xs"
                              )}>
                        Commencée il y a 1 jour
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      iPhone • BurgerStaffSync App • Paris, France
                            </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
                  <CardFooter className={cn(
                    isMobile ? "p-3" : "pt-2",
                    "flex justify-end"
                  )}>
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={!newPassword || !confirmPassword || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-1">●</span>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-1" />
                Mettre à jour le mot de passe
                        </>
                      )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
              
              {/* Onglet Notifications */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader className={isMobile ? "pb-2" : ""}>
                    <CardTitle className={isMobile ? "text-base" : ""}>Préférences de notification</CardTitle>
                    <CardDescription>
                      Gérez les notifications que vous souhaitez recevoir
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={isMobile ? "p-3" : ""}>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className={cn(
                          "grid gap-4",
                          isMobile ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="shiftChanges" className="flex-1">
                                Changements de planning
                              </Label>
                            </div>
                            <Switch
                              id="shiftChanges"
                              checked={notificationPrefs.shiftChanges}
                              onCheckedChange={() => handleNotificationChange('shiftChanges')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CalendarX className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="absenceUpdates" className="flex-1">
                                Réponses aux absences
                              </Label>
                            </div>
                            <Switch
                              id="absenceUpdates"
                              checked={notificationPrefs.absenceUpdates}
                              onCheckedChange={() => handleNotificationChange('absenceUpdates')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="weeklySchedule" className="flex-1">
                                Planning hebdomadaire
                              </Label>
                            </div>
                            <Switch
                              id="weeklySchedule"
                              checked={notificationPrefs.weeklySchedule}
                              onCheckedChange={() => handleNotificationChange('weeklySchedule')}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Méthodes de notification</h3>
                        
                        <div className={cn(
                          "grid gap-4",
                          isMobile ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="appNotifications" className="flex-1">
                                Notifications de l'application
                              </Label>
                            </div>
                            <Switch
                              id="appNotifications"
                              checked={notificationPrefs.appNotifications}
                              onCheckedChange={() => handleNotificationChange('appNotifications')}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor="emailNotifications" className="flex-1">
                                Notifications par email
                              </Label>
                            </div>
                            <Switch
                              id="emailNotifications"
                              checked={notificationPrefs.emailNotifications}
                              onCheckedChange={() => handleNotificationChange('emailNotifications')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className={cn(
                    isMobile ? "p-3" : "",
                    "flex justify-end"
                  )}>
                    <Button 
                      onClick={handleSaveNotifications}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-1">●</span>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Enregistrer les préférences
                        </>
                      )}
        </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Onglet Statistiques */}
              <TabsContent value="stats">
                <Card>
                  <CardHeader className={isMobile ? "pb-2" : "pb-2"}>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className={isMobile ? "text-base" : ""}>Heures travaillées</CardTitle>
                        <CardDescription>
                          Consultez vos heures sur les derniers mois
                        </CardDescription>
      </div>
                      <div className={cn("flex gap-1 overflow-x-auto", isMobile && "max-w-[120px]")}>
                        {mockWorkHours.map((month, index) => (
                          <Button
                            key={index}
                            variant={activeMonthIndex === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveMonthIndex(index)}
                            className={isMobile ? "px-2 py-1 h-7 text-xs" : ""}
                          >
                            {format(month.monthObj, 'MMM', { locale: fr })}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="pt-1 pb-4">
                      <h3 className="text-lg font-medium">{mockWorkHours[activeMonthIndex].month}</h3>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground">
                          Total: {formatHours(calculateTotalHours(mockWorkHours[activeMonthIndex].data))}
                        </p>
                        <Badge variant="outline">
                          {formatChartData(mockWorkHours[activeMonthIndex].data).length} jours travaillés
                        </Badge>
                      </div>
                    </div>
                    
                    <div className={cn("w-full", isMobile ? "h-56" : "h-72")}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={formatChartData(mockWorkHours[activeMonthIndex].data)}
                          margin={{ top: 5, right: 15, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: isMobile ? 10 : 12 }}
                            tickMargin={5}
                            interval={isMobile ? 1 : 0}
                          />
                          <YAxis 
                            tick={{ fontSize: isMobile ? 10 : 12 }}
                            tickMargin={5}
                            domain={[0, 10]}
                            width={isMobile ? 20 : 30}
                          />
                          <Tooltip 
                            contentStyle={isMobile ? { fontSize: '12px' } : {}}
                          />
                          <Bar 
                            dataKey="hours" 
                            name="Heures" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Ces données représentent vos heures de travail enregistrées dans le système.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default EmployeeProfile;