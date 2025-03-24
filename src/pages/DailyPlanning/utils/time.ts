/**
 * Convertit une heure au format HH:MM en minutes depuis minuit
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Ajoute des heures à une heure au format HH:MM
 */
export const addHoursToTime = (time: string, hoursToAdd: number): string => {
  const [hours, minutes] = time.split(':').map(Number);
  
  const totalMinutes = hours * 60 + minutes + Math.round(hoursToAdd * 60);
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

/**
 * Calcule le nombre d'heures entre deux heures, en gérant les shifts qui dépassent minuit
 */
export const calculateHours = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Gérer les shifts qui dépassent minuit
  if (endHour < startHour) {
    const hoursBeforeMidnight = 24 - startHour - (startMinute / 60);
    const hoursAfterMidnight = endHour + (endMinute / 60);
    return Math.round((hoursBeforeMidnight + hoursAfterMidnight) * 10) / 10;
  }
  
  const start = startHour + startMinute / 60;
  const end = endHour + endMinute / 60;
  
  return Math.round((end - start) * 10) / 10; // Arrondir à 1 décimale
};

/**
 * Renvoie l'indice du jour de la semaine (0 = lundi, 6 = dimanche)
 */
export const getDayIndex = (date: Date): number => {
  // 0 = dimanche dans JS, mais on veut 0 = lundi
  return (date.getDay() + 6) % 7;
};

/**
 * Formate une date au format JJ/MM/YYYY
 */
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Génère les options d'heure pour l'affichage (toujours de 11h à 7h)
 */
export const generateTimeOptions = (hasExtendedDay: boolean): string[] => {
  const options = [];
  
  // Générer les heures de 11h à minuit
  for (let hour = 11; hour < 24; hour++) {
    for (const minute of ['00', '30']) {
      const formattedHour = hour.toString().padStart(2, '0');
      options.push(`${formattedHour}:${minute}`);
    }
  }
  
  // Générer les heures de minuit à 7h du matin
  for (let hour = 0; hour <= 7; hour++) {
    for (const minute of ['00', '30']) {
      // Ne pas ajouter 7:30
      if (hour === 7 && minute === '30') continue;
      const formattedHour = hour.toString().padStart(2, '0');
      options.push(`${formattedHour}:${minute}`);
    }
  }
  
  return options;
};

/**
 * Vérifie si un créneau horaire est dans la période d'ouverture du restaurant
 */
export const isWithinOpeningHours = (time: string, dayIndex: number): boolean => {
  const timeInMinutes = timeToMinutes(time);
  const isExtendedDay = dayIndex === 3 || dayIndex === 4 || dayIndex === 5; // jeu, ven, sam
  
  // Heures d'ouverture: 11h00 - 02h00 (ou 07h00 pour jeu/ven/sam)
  const openingMinutes = timeToMinutes('11:00');
  const closingMinutes = timeToMinutes(isExtendedDay ? '07:00' : '02:00');
  
  if (closingMinutes < openingMinutes) {
    // Période traversant minuit
    return timeInMinutes >= openingMinutes || timeInMinutes <= closingMinutes;
  } else {
    return timeInMinutes >= openingMinutes && timeInMinutes <= closingMinutes;
  }
};

/**
 * Vérifie si au moins un jour dans le tableau est un jour étendu (jeudi, vendredi, samedi)
 */
export const hasExtendedDay = (days: number[]): boolean => {
  return days.some(day => day === 3 || day === 4 || day === 5); // 3=jeudi, 4=vendredi, 5=samedi
}; 