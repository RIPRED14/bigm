interface Shift {
  id: number;
  employeeIds: number[];
  day: number;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'absence';
}

interface ShiftWarning {
  type: 'evening' | 'closing' | 'opening' | 'overlap';
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Validates a shift against business rules
 * @param shift The shift to validate
 * @returns Array of warnings or errors
 */
export const validateShift = (shift: Shift): ShiftWarning[] => {
  const warnings: ShiftWarning[] = [];

  // Parse times
  const startHour = parseInt(shift.startTime.split(':')[0]);
  const startMinute = parseInt(shift.startTime.split(':')[1]);
  const endHour = parseInt(shift.endTime.split(':')[0]);
  const endMinute = parseInt(shift.endTime.split(':')[1]);

  // Rule 1: Evening shifts (18:00 or later) should have at least 2 employees
  if ((startHour >= 18 || (startHour >= 0 && startHour < 7)) && shift.employeeIds.length < 2) {
    warnings.push({
      type: 'evening',
      message: 'Evening shifts should have at least 2 employees',
      severity: 'warning'
    });
  }

  // Rule 2: Respect opening hours
  const isEarlyMorning = startHour >= 0 && startHour < 11;
  if (isEarlyMorning && startHour !== 0) { // Allow midnight shifts that started the previous day
    warnings.push({
      type: 'opening',
      message: 'The restaurant opens at 11:00 AM',
      severity: 'error'
    });
  }

  // Rule 3: Respect closing hours based on day
  const isExtendedDay = shift.day >= 3 && shift.day <= 5; // Thu (3), Fri (4), Sat (5)
  const maxCloseHour = isExtendedDay ? 7 : 3; // 7 AM for Thu-Sat, 3 AM for others

  // For day shifts (not crossing midnight), we don't need to check closing time
  const isNightShift = endHour < startHour || (endHour === 0 && startHour > 0);
  
  // Only check closing time for night shifts or shifts ending in early morning
  if ((isNightShift || endHour < 11) && 
      ((endHour > maxCloseHour) || (endHour === maxCloseHour && endMinute > 0))) {
    warnings.push({
      type: 'closing',
      message: `This day's closing time is ${maxCloseHour}:00 AM`,
      severity: 'error'
    });
  }

  return warnings;
};

/**
 * Checks if a shift is a night shift (crosses midnight)
 */
export const isNightShift = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return false;
  
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  
  // If end hour is less than start hour, it crosses midnight
  return (endHour < startHour) || (endHour === 0 && startHour > 0);
};

/**
 * Calculate duration between two times in hours, handling overnight shifts
 */
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;
  
  // If end time is earlier than start time, it's an overnight shift
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }
  
  return Math.round((endMinutes - startMinutes) / 60 * 10) / 10; // Round to 1 decimal place
};

/**
 * Check if two shifts overlap
 */
export const doShiftsOverlap = (shift1: Shift, shift2: Shift): boolean => {
  // Different days, no overlap
  if (shift1.day !== shift2.day) return false;

  // Convert times to minutes for comparison
  const start1 = parseTimeToMinutes(shift1.startTime);
  const end1 = parseTimeToMinutes(shift1.endTime);
  const start2 = parseTimeToMinutes(shift2.startTime);
  const end2 = parseTimeToMinutes(shift2.endTime);

  // Handle overnight shifts
  const adjustedEnd1 = end1 < start1 ? end1 + 24 * 60 : end1;
  const adjustedEnd2 = end2 < start2 ? end2 + 24 * 60 : end2;

  // Check for overlap
  return (
    (start1 < adjustedEnd2 && adjustedEnd1 > start2) ||
    (start2 < adjustedEnd1 && adjustedEnd2 > start1)
  );
};

// Helper to convert time to minutes
const parseTimeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Vérifie si un créneau horaire est couvert par des shifts
 */
export const isTimeSlotCovered = (
  timeSlot: string,
  shifts: Shift[],
  day: number
): boolean => {
  // Pour les heures après minuit (0h à 7h), nous devons vérifier les shifts 
  // qui commencent le jour précédent et se terminent le jour actuel
  const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
  const isAfterMidnight = slotHour >= 0 && slotHour < 11;
  
  // Convertir le créneau en minutes depuis minuit
  const slotMinutes = slotHour * 60 + slotMinute;
  
  // Filtrer les shifts pertinents pour ce créneau
  const relevantShifts = shifts.filter(shift => {
    // Pour les créneaux après minuit, vérifier aussi les shifts du jour précédent
    if (isAfterMidnight && shift.day === (day - 1 + 7) % 7) {
      // Vérifier que c'est un shift de nuit (se terminant après minuit)
      return isNightShift(shift.startTime, shift.endTime);
    }
    // Pour tous les créneaux, vérifier les shifts du jour actuel
    return shift.day === day;
  });

  // Vérifier si au moins un shift couvre ce créneau
  return relevantShifts.some(shift => {
    const [startHour, startMinute] = shift.startTime.split(':').map(Number);
    const [endHour, endMinute] = shift.endTime.split(':').map(Number);
    
    // Convertir en minutes depuis minuit
    const startMinutes = startHour * 60 + startMinute;
    let endMinutes = endHour * 60 + endMinute;
    
    // Gestion des shifts de nuit (qui passent minuit)
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60; // Ajouter 24 heures pour les comparaisons
    }
    
    // Ajuster le créneau pour la comparaison si nécessaire
    let adjustedSlotMinutes = slotMinutes;
    
    // Si le créneau est après minuit (0h-10h) et que nous vérifions un shift du jour précédent,
    // nous devons ajouter 24h au créneau pour le comparer correctement
    if (isAfterMidnight && shift.day === (day - 1 + 7) % 7) {
      adjustedSlotMinutes += 24 * 60;
    }
    
    // Un créneau est couvert s'il est entre le début et la fin du shift (inclus début, exclus fin)
    return adjustedSlotMinutes >= startMinutes && adjustedSlotMinutes < endMinutes;
  });
};

/**
 * Formate les créneaux horaires non couverts de manière lisible
 */
const formatUncoveredSlots = (slots: string[]): string => {
  if (slots.length === 0) return "Tous les créneaux sont couverts";
  
  // Trier les créneaux en tenant compte des heures après minuit
  const sortedSlots = [...slots].sort((a, b) => {
    const hourA = parseInt(a.split(':')[0]);
    const hourB = parseInt(b.split(':')[0]);
    
    // Convertir les heures pour que 0h-10h viennent après 11h-23h
    const adjustedHourA = hourA < 11 ? hourA + 24 : hourA;
    const adjustedHourB = hourB < 11 ? hourB + 24 : hourB;
    
    return adjustedHourA - adjustedHourB;
  });
  
  const formattedSlots: string[] = [];
  let currentStart = sortedSlots[0];
  let currentEnd = sortedSlots[0];
  
  for (let i = 1; i <= sortedSlots.length; i++) {
    const currentSlot = sortedSlots[i];
    const prevSlot = sortedSlots[i - 1];
    
    if (!currentSlot) {
      // Dernier élément, ajouter la plage actuelle
      if (currentStart === currentEnd) {
        formattedSlots.push(currentStart);
      } else {
        formattedSlots.push(`${currentStart} - ${currentEnd}`);
      }
    } else {
      const currentHour = parseInt(currentSlot.split(':')[0]);
      const prevHour = parseInt(prevSlot.split(':')[0]);
      
      // Convertir les heures pour gérer le passage à minuit
      const adjustedCurrentHour = currentHour < 11 ? currentHour + 24 : currentHour;
      const adjustedPrevHour = prevHour < 11 ? prevHour + 24 : prevHour;
      
      if (adjustedCurrentHour - adjustedPrevHour > 1) {
        // Il y a un écart, ajouter la plage actuelle
        if (currentStart === currentEnd) {
          formattedSlots.push(currentStart);
        } else {
          formattedSlots.push(`${currentStart} - ${currentEnd}`);
        }
        currentStart = currentSlot;
        currentEnd = currentSlot;
      } else {
        // Les créneaux sont consécutifs
        currentEnd = currentSlot;
      }
    }
  }
  
  return formattedSlots.join(", ");
};

/**
 * Vérifie la couverture complète des horaires d'ouverture pour un jour
 */
export const checkDayCoverage = (
  day: number,
  shifts: Shift[]
): { isCovered: boolean; uncoveredSlots: string[]; formattedMessage: string } => {
  const isExtendedDay = day >= 3 && day <= 5; // Thu (3), Fri (4), Sat (5)
  const closingHour = isExtendedDay ? 7 : 3; // 7 AM pour Thu-Sat, 3 AM pour les autres
  
  // Filtrer seulement les shifts ayant le statut "confirmed" pour le calcul de la couverture
  // Les absences et les shifts en attente ne devraient pas être comptés comme des couvertures
  const confirmedShifts = shifts.filter(shift => 
    shift.status === 'confirmed' || shift.status === 'conflict'
  );
  
  const uncoveredSlots: string[] = [];
  
  // Pour vérifier la couverture complète, nous avons besoin de considérer:
  // 1. Les shifts du jour actuel (pour 11h-23h)
  // 2. Les shifts du jour précédent qui couvrent les heures après minuit

  // Vérifier s'il y a des shifts pour ce jour
  const dayShifts = confirmedShifts.filter(shift => shift.day === day);
  const previousDayShifts = confirmedShifts.filter(shift => shift.day === (day - 1 + 7) % 7);
  
  // Si aucun shift pertinent, tous les créneaux sont non couverts
  if (dayShifts.length === 0 && previousDayShifts.every(shift => !isNightShift(shift.startTime, shift.endTime))) {
    for (let hour = 11; hour < 24; hour++) {
      uncoveredSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    for (let hour = 0; hour < closingHour; hour++) {
      uncoveredSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return {
      isCovered: false,
      uncoveredSlots,
      formattedMessage: "Aucun créneau n'est couvert ce jour"
    };
  }
  
  // Vérifier chaque créneau horaire de 11h jusqu'à minuit (jour actuel)
  for (let hour = 11; hour < 24; hour++) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    if (!isTimeSlotCovered(timeSlot, confirmedShifts, day)) {
      uncoveredSlots.push(timeSlot);
    }
  }
  
  // Vérifier les heures après minuit jusqu'à l'heure de fermeture (considérées comme faisant partie du jour actuel)
  for (let hour = 0; hour < closingHour; hour++) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    if (!isTimeSlotCovered(timeSlot, confirmedShifts, day)) {
      uncoveredSlots.push(timeSlot);
    }
  }
  
  return {
    isCovered: uncoveredSlots.length === 0,
    uncoveredSlots,
    formattedMessage: formatUncoveredSlots(uncoveredSlots)
  };
};

/**
 * Calcule le nombre d'employés uniques par jour
 */
export const getUniqueEmployeesPerDay = (shifts: Shift[], day: number): number => {
  // Filtrer seulement les shifts ayant le statut "confirmed" ou "conflict"
  const confirmedShifts = shifts.filter(shift => 
    shift.status === 'confirmed' || shift.status === 'conflict'
  );
  
  // Trouver tous les shifts du jour demandé
  const dayShifts = confirmedShifts.filter(shift => shift.day === day);
  
  // Trouver les shifts de la veille qui s'étendent sur ce jour (shifts de nuit)
  const previousDayNightShifts = confirmedShifts.filter(shift => 
    shift.day === (day - 1 + 7) % 7 && isNightShift(shift.startTime, shift.endTime)
  );
  
  // Fusionner les shifts pertinents
  const relevantShifts = [...dayShifts, ...previousDayNightShifts];
  
  // Extraire les IDs uniques des employés
  const uniqueEmployeeIds = new Set(
    relevantShifts.flatMap(shift => shift.employeeIds)
  );
  
  return uniqueEmployeeIds.size;
};

/**
 * Calcule le pourcentage de couverture des horaires pour un jour
 */
export const calculateDayCoveragePercentage = (
  day: number,
  shifts: Shift[]
): number => {
  const isExtendedDay = day >= 3 && day <= 5; // Thu, Fri, Sat
  const closingHour = isExtendedDay ? 7 : 3; // 7 AM pour Thu-Sat, 3 AM pour les autres
  
  // Filtrer seulement les shifts ayant le statut "confirmed" ou "conflict" pour le calcul de la couverture
  const confirmedShifts = shifts.filter(shift => 
    shift.status === 'confirmed' || shift.status === 'conflict'
  );
  
  // Calcul correct du nombre total de créneaux à couvrir
  // De 11:00 à 23:00 (13 créneaux) + de 00:00 à closingHour:00 (3 ou 7 créneaux)
  const totalSlots = (24 - 11) + closingHour;
  
  const { uncoveredSlots } = checkDayCoverage(day, confirmedShifts);
  const coveredSlots = totalSlots - uncoveredSlots.length;
  
  return Math.round((coveredSlots / totalSlots) * 100);
}; 