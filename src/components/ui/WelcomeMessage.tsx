import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, CheckCircle2, Sun, Cloud, CloudRain, Moon } from 'lucide-react';

interface WelcomeMessageProps {
  userName: string;
  avatarUrl?: string;
  onClose?: () => void;
  showWeather?: boolean;
  nextShift?: {
    day: string;
    time: string;
  } | null;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  userName,
  avatarUrl,
  onClose,
  showWeather = true,
  nextShift
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy' | 'night'>('sunny');
  
  // Mettre à jour l'heure toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Effet pour simuler une météo aléatoire
  useEffect(() => {
    const hour = currentTime.getHours();
    
    // Simuler la météo en fonction de l'heure
    if (hour >= 21 || hour < 6) {
      setWeather('night');
    } else {
      const weathers: Array<'sunny' | 'cloudy' | 'rainy'> = ['sunny', 'cloudy', 'rainy'];
      const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setWeather(randomWeather);
    }
  }, [currentTime]);
  
  // Détermine le message de salutation en fonction de l'heure
  const getGreeting = (): string => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Bonjour';
    } else if (hour >= 12 && hour < 18) {
      return 'Bon après-midi';
    } else {
      return 'Bonsoir';
    }
  };
  
  // Rendu de l'icône météo
  const renderWeatherIcon = () => {
    switch (weather) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-amber-500" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      case 'night':
        return <Moon className="h-5 w-5 text-indigo-400" />;
    }
  };
  
  // Description de la météo
  const getWeatherDescription = (): string => {
    switch (weather) {
      case 'sunny':
        return 'ensoleillé';
      case 'cloudy':
        return 'nuageux';
      case 'rainy':
        return 'pluvieux';
      case 'night':
        return 'nuit';
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white">
                  <AvatarImage src={avatarUrl} alt={userName} />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {getGreeting()}, {userName.split(' ')[0]}
                    {showWeather && (
                      <span className="flex items-center text-sm font-normal text-muted-foreground gap-1">
                        {renderWeatherIcon()}
                        <span className="text-xs">Temps {getWeatherDescription()}</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {format(currentTime, "EEEE d MMMM, HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
              
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={onClose}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {nextShift && (
              <div className="mt-3 bg-background/80 backdrop-blur-sm p-2 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Prochain service: <span className="font-medium">{nextShift.day}</span>
                  </span>
                </div>
                <span className="text-sm font-medium">{nextShift.time}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeMessage; 