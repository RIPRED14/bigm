import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthContext } from '@/App';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Bell, 
  User, 
  Save,
  ChevronLeft,
  Store,
  Briefcase,
  CalendarClock,
  LogOut,
  Trash2,
  Globe, 
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

const Settings = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('general');
  
  // État pour les différentes options de réglages
  const [settings, setSettings] = useState({
    restaurantName: 'Burger Staff',
    restaurantAddress: '123 Rue de la Restauration',
    phoneNumber: '06 12 34 56 78',
    defaultShiftDuration: '8',
    language: 'fr',
    timezone: 'Europe/Paris',
    enableNotifications: true,
    enableShiftReminders: true,
    enableWeeklyReport: true,
    darkMode: false,
    advancedPlanning: true,
  });

  // Gérer les changements dans les champs
  const handleChange = (field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Sauvegarder les réglages
  const handleSave = () => {
    // Logique pour sauvegarder les réglages
    console.log('Saving settings:', settings);
    toast({
      title: "Réglages sauvegardés",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    console.log("Déconnexion en cours...");
    
    // Supprimer toutes les données d'authentification
    localStorage.clear(); // Supprime toutes les données du localStorage
    
    // Spécifiquement cibler les clés d'authentification connues
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('interface');
    
    // Mettre à jour le contexte d'authentification
    if (auth) {
      auth.setIsLoggedIn(false);
      auth.setInterface(null);
    }
    
    console.log("localStorage après déconnexion:", localStorage);
    console.log("Contexte d'authentification après déconnexion:", auth);
    
    // Rediriger vers la page de connexion
    console.log("Redirection vers la page de connexion...");
    navigate('/login', { replace: true });
  };

  return (
    <PageContainer className={isMobile ? "px-2 pt-2" : "pt-6"}>
      {/* En-tête et retour */}
      <div className={`flex items-center ${isMobile ? "mb-3" : "mb-6"}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`mr-2 ${isMobile ? "h-8 w-8" : ""}`}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
        </Button>
        <div>
          <h1 className={`font-bold ${isMobile ? "text-lg" : "text-2xl"}`}>Réglages</h1>
          <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
            Configurez votre application
          </p>
        </div>
      </div>

      {/* Onglets de navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid grid-cols-${isMobile ? "3" : "4"} w-full mb-4`}>
          <TabsTrigger value="general" className={isMobile ? "text-xs py-1.5" : ""}>
            <Store className={`${isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-2"}`} />
            {!isMobile && "Établissement"}
          </TabsTrigger>
          <TabsTrigger value="planning" className={isMobile ? "text-xs py-1.5" : ""}>
            <CalendarClock className={`${isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-2"}`} />
            {!isMobile && "Planning"}
          </TabsTrigger>
          <TabsTrigger value="notifications" className={isMobile ? "text-xs py-1.5" : ""}>
            <Bell className={`${isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-2"}`} />
            {!isMobile && "Notifications"}
          </TabsTrigger>
          {!isMobile && (
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Compte
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="mt-0">
          <Card className={isMobile ? "border-muted/50 shadow-sm" : ""}>
            <CardHeader className={isMobile ? "pb-2 pt-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Informations générales</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Personnalisez les informations de votre établissement
              </CardDescription>
          </CardHeader>
            <CardContent className={`grid gap-4 ${isMobile ? "py-2 px-3" : ""}`}>
              {/* Logo et nom du restaurant */}
              <div className="flex flex-col items-center justify-center gap-3 border rounded-lg p-4 bg-muted/20">
                <Avatar className={isMobile ? "h-16 w-16" : "h-20 w-20"}>
                  <AvatarImage src="/logo.png" alt="Logo" />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    BS
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size={isMobile ? "sm" : "default"} className={isMobile ? "text-xs h-8" : ""}>
                  Changer le logo
                </Button>
              </div>

              {/* Informations du restaurant */}
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="restaurantName" className={isMobile ? "text-xs" : ""}>
                    Nom de l'établissement
                  </Label>
                  <Input 
                    id="restaurantName" 
                    value={settings.restaurantName}
                    onChange={(e) => handleChange('restaurantName', e.target.value)}
                    className={isMobile ? "h-8 text-sm" : ""}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="restaurantAddress" className={isMobile ? "text-xs" : ""}>
                    Adresse
                  </Label>
                  <Input 
                    id="restaurantAddress" 
                    value={settings.restaurantAddress}
                    onChange={(e) => handleChange('restaurantAddress', e.target.value)}
                    className={isMobile ? "h-8 text-sm" : ""}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber" className={isMobile ? "text-xs" : ""}>
                    Téléphone
                  </Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel"
                    value={settings.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className={isMobile ? "h-8 text-sm" : ""}
                  />
                </div>
              </div>

              {/* Paramètres régionaux */}
              <div className="space-y-3">
                <h3 className={`font-medium ${isMobile ? "text-sm" : ""}`}>Paramètres régionaux</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="language" className={isMobile ? "text-xs" : ""}>
                      Langue
                    </Label>
                    <Select 
                      value={settings.language}
                      onValueChange={(value) => handleChange('language', value)}
                    >
                      <SelectTrigger id="language" className={isMobile ? "h-8 text-sm" : ""}>
                        <SelectValue placeholder="Sélectionner une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className={isMobile ? "text-xs" : ""}>
                      Fuseau horaire
                    </Label>
                    <Select 
                      value={settings.timezone}
                      onValueChange={(value) => handleChange('timezone', value)}
                    >
                      <SelectTrigger id="timezone" className={isMobile ? "h-8 text-sm" : ""}>
                        <SelectValue placeholder="Sélectionner un fuseau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
            </div>
            </div>
          </CardContent>
            <CardFooter className={isMobile ? "pt-0 pb-3 px-3" : ""}>
              <Button 
                onClick={handleSave}
                className={isMobile ? "h-8 text-xs w-full" : ""}
              >
                <Save className={`${isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-2"}`} />
                Enregistrer les modifications
              </Button>
          </CardFooter>
        </Card>
        </TabsContent>

        <TabsContent value="planning" className="mt-0">
          <Card className={isMobile ? "border-muted/50 shadow-sm" : ""}>
            <CardHeader className={isMobile ? "pb-2 pt-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Paramètres du planning</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Configurez les paramètres de gestion du planning
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-4 ${isMobile ? "py-2 px-3" : ""}`}>
              {/* Paramètres des shifts */}
              <div className="space-y-3">
                <h3 className={`font-medium ${isMobile ? "text-sm" : ""}`}>Paramètres des shifts</h3>
                
                <div className="grid gap-2">
                  <Label htmlFor="defaultShiftDuration" className={isMobile ? "text-xs" : ""}>
                    Durée par défaut des shifts (heures)
                  </Label>
                  <Select 
                    value={settings.defaultShiftDuration}
                    onValueChange={(value) => handleChange('defaultShiftDuration', value)}
                  >
                    <SelectTrigger id="defaultShiftDuration" className={isMobile ? "h-8 text-sm" : ""}>
                      <SelectValue placeholder="Sélectionner une durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 heures</SelectItem>
                      <SelectItem value="6">6 heures</SelectItem>
                      <SelectItem value="8">8 heures</SelectItem>
                      <SelectItem value="12">12 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
            <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="advancedPlanning" className={isMobile ? "text-xs" : ""}>
                      Planification avancée
                    </Label>
                    <p className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
                      Activer les fonctionnalités de planification avancée
                    </p>
                  </div>
                  <Switch 
                    id="advancedPlanning" 
                    checked={settings.advancedPlanning}
                    onCheckedChange={(checked) => handleChange('advancedPlanning', checked)}
                  />
                </div>
              </div>

              {/* Horaires d'ouverture */}
              <div className="space-y-3">
                <h3 className={`font-medium ${isMobile ? "text-sm" : ""}`}>Horaires d'ouverture typiques</h3>
                
                <div className="border rounded-lg divide-y overflow-hidden">
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, index) => (
                    <div key={index} className={`flex items-center justify-between ${isMobile ? "p-2 text-xs" : "p-3"}`}>
                      <span className={isMobile ? "w-24" : "w-32"}>{day}</span>
                      <div className="flex gap-2 items-center">
                        <Select defaultValue="09:00">
                          <SelectTrigger className={isMobile ? "h-7 text-xs w-16" : "w-24"}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['08:00', '09:00', '10:00', '11:00'].map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>-</span>
                        <Select defaultValue="22:00">
                          <SelectTrigger className={isMobile ? "h-7 text-xs w-16" : "w-24"}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['20:00', '21:00', '22:00', '23:00', '00:00'].map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
            </div>
            </div>
          </CardContent>
            <CardFooter className={isMobile ? "pt-0 pb-3 px-3" : ""}>
              <Button 
                onClick={handleSave}
                className={isMobile ? "h-8 text-xs w-full" : ""}
              >
                <Save className={`${isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-2"}`} />
                Enregistrer les modifications
              </Button>
          </CardFooter>
        </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <Card className={isMobile ? "border-muted/50 shadow-sm" : ""}>
            <CardHeader className={isMobile ? "pb-2 pt-3" : ""}>
              <CardTitle className={isMobile ? "text-base" : ""}>Notifications</CardTitle>
              <CardDescription className={isMobile ? "text-xs" : ""}>
                Gérez vos préférences de notifications
              </CardDescription>
            </CardHeader>
            <CardContent className={`space-y-4 ${isMobile ? "py-2 px-3" : ""}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableNotifications" className={isMobile ? "text-xs" : ""}>
                      Notifications générales
                    </Label>
                    <p className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
                      Recevoir toutes les notifications de l'application
                    </p>
                  </div>
                  <Switch 
                    id="enableNotifications" 
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleChange('enableNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableShiftReminders" className={isMobile ? "text-xs" : ""}>
                      Rappels de shifts
                    </Label>
                    <p className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
                      Recevoir un rappel avant le début de chaque shift
                    </p>
                  </div>
                  <Switch 
                    id="enableShiftReminders" 
                    checked={settings.enableShiftReminders}
                    onCheckedChange={(checked) => handleChange('enableShiftReminders', checked)}
                  />
                </div>
                
            <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableWeeklyReport" className={isMobile ? "text-xs" : ""}>
                      Rapports hebdomadaires
                    </Label>
                    <p className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
                      Recevoir un rapport hebdomadaire par email
                    </p>
                  </div>
                  <Switch 
                    id="enableWeeklyReport" 
                    checked={settings.enableWeeklyReport}
                    onCheckedChange={(checked) => handleChange('enableWeeklyReport', checked)}
                  />
                </div>
            </div>
          </CardContent>
            <CardFooter className={isMobile ? "pt-0 pb-3 px-3" : ""}>
              <Button 
                onClick={handleSave}
                className={isMobile ? "h-8 text-xs w-full" : ""}
              >
                <Save className={`${isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-2"}`} />
                Enregistrer les modifications
              </Button>
          </CardFooter>
        </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-0">
        <Card>
          <CardHeader>
              <CardTitle>Mon compte</CardTitle>
              <CardDescription>
                Gérez les informations de votre compte
              </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-sm text-muted-foreground">Administrateur</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Changer la photo
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="account-email">Email</Label>
                  <Input id="account-email" defaultValue="john.doe@example.com" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="account-name">Nom complet</Label>
                  <Input id="account-name" defaultValue="John Doe" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="account-password">Mot de passe</Label>
                  <Input id="account-password" type="password" defaultValue="********" />
            </div>
            </div>
          </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleSave}>
                Mettre à jour le profil
              </Button>
              <Button variant="destructive">
                Supprimer le compte
              </Button>
          </CardFooter>
        </Card>
        </TabsContent>
      </Tabs>

      {/* Section du compte pour mobile - affichée en bas de page */}
      {isMobile && (
        <div className="mt-6 space-y-4">
          <Card className="border-muted/50 shadow-sm">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-base">Mon compte</CardTitle>
              <CardDescription className="text-xs">
                Gérez votre compte et préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2 px-3 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-primary/10">
                  <AvatarFallback className="bg-primary/10">JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">John Doe</p>
                  <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-medium text-sm px-1">Actions du compte</h3>
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-9 text-sm"
              onClick={() => {/* Action pour changer de mot de passe */}}
            >
              <User className="h-4 w-4 mr-2 text-blue-500" />
              Modifier mon profil
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-9 text-sm"
              onClick={() => {/* Action pour aide */}}
            >
              <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
              Aide et support
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-9 text-sm text-amber-600 border-amber-100 bg-amber-50"
              onClick={() => {/* Action pour données */}}
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
              Exporter mes données
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-9 text-sm text-red-600 border-red-100 bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 text-red-600" />
              Se déconnecter
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-9 text-sm border-destructive/30 mt-2"
              onClick={() => {/* Action pour supprimer le compte */}}
            >
              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
              Supprimer mon compte
            </Button>
          </div>
      </div>
      )}
    </PageContainer>
  );
};

export default Settings;
