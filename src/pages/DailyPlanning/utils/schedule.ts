import { Shift, Employee, ScheduleRules } from '../types';
import { timeToMinutes, addHoursToTime, calculateHours, hasExtendedDay, isWithinOpeningHours } from './time';
import { getShiftsForDay, getEmployeeWeeklyHours, isEmployeeAvailable } from './shifts';

/**
 * Suggère un employé à assigner pour un créneau horaire spécifique
 */
export const suggestEmployeeForTimeSlot = (
  employees: Employee[],
  shifts: Shift[],
  timeSlot: string
): Employee | null => {
  // Extraire l'heure du créneau
  const hour = parseInt(timeSlot.split(':')[0]);
  const isEveningSlot = hour >= 16; // Après 16h
  const isMorningSlot = hour < 12; // Avant midi
  
  // Trier les employés par nombre d'heures déjà travaillées
  const sortedEmployees = [...employees].sort((a, b) => {
    const aHours = getEmployeeWeeklyHours(shifts, a.id);
    const bHours = getEmployeeWeeklyHours(shifts, b.id);
    return aHours - bHours; // Les employés avec moins d'heures d'abord
  });
  
  // Filtrer les employés par préférences et disponibilité
  const availableEmployees = sortedEmployees.filter(employee => {
    // Si l'employé a des préférences de créneau
    if (employee.preferredTimes && employee.preferredTimes.length > 0) {
      const prefersMorning = employee.preferredTimes.includes('morning');
      const prefersEvening = employee.preferredTimes.includes('evening');
      
      // Vérifier si les préférences correspondent au créneau
      if ((isMorningSlot && !prefersMorning) || (isEveningSlot && !prefersEvening)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Trouver le premier employé disponible
  for (const employee of availableEmployees) {
    // Vérifier si l'employé est disponible pour ce créneau (avec un shift de 4h par défaut)
    const endTime = addHoursToTime(timeSlot, 4);
    
    if (isEmployeeAvailable(shifts, employee.id, 0, timeSlot, endTime)) {
      return employee;
    }
  }
  
  return null;
};

/**
 * Récupère les employés recommandés pour un créneau horaire
 */
export const getRecommendedEmployees = (
  employees: Employee[],
  shifts: Shift[],
  timeSlot: string
): Employee[] => {
  // Extraire l'heure du créneau
  const hour = parseInt(timeSlot.split(':')[0]);
  const isEveningSlot = hour >= 16;
  const isMorningSlot = hour < 12;
  
  // Trier tous les employés par priorité pour ce créneau
  const sortedEmployees = [...employees].sort((a, b) => {
    // Priorité basée sur les préférences
    const aScore = getEmployeePriorityScore(a, timeSlot);
    const bScore = getEmployeePriorityScore(b, timeSlot);
    
    if (aScore !== bScore) return bScore - aScore; // Scores plus élevés en premier
    
    // Si égalité, trier par nombre d'heures (moins d'heures d'abord)
    const aHours = getEmployeeWeeklyHours(shifts, a.id);
    const bHours = getEmployeeWeeklyHours(shifts, b.id);
    return aHours - bHours;
  });
  
  // Limiter aux 3 employés les plus recommandés
  return sortedEmployees.slice(0, 3);
};

/**
 * Calcule un score de priorité pour un employé sur un créneau
 */
export const getEmployeePriorityScore = (employee: Employee, timeSlot: string | null): number => {
  if (!timeSlot) return 0;
  
  const hour = parseInt(timeSlot.split(':')[0]);
  const isEvening = hour >= 16;
  const isMorning = hour < 12;
  
  // Pas de préférences définies
  if (!employee.preferredTimes || employee.preferredTimes.length === 0) {
    return 1; // Score de base
  }
  
  // Préférences définies
  const prefersEvening = employee.preferredTimes.includes('evening');
  const prefersMorning = employee.preferredTimes.includes('morning');
  
  if ((isEvening && prefersEvening) || (isMorning && prefersMorning)) {
    return 3; // Haute priorité si préférences correspondent
  }
  
  if ((isEvening && prefersMorning) || (isMorning && prefersEvening)) {
    return 0; // Faible priorité si préférences opposées
  }
  
  return 1; // Priorité par défaut
};

/**
 * Génère un planning optimal pour un jour de la semaine
 */
export const generateOptimalSchedule = (
  currentShifts: Shift[],
  employees: Employee[],
  currentDate: Date,
  dayIndex: number,
  scheduleRules: ScheduleRules,
  nextId: number
): { newShifts: Shift[], nextId: number } => {
  // Configuration de base
  const isMorningHeavy = [0, 1, 2, 6].includes(dayIndex); // Lundi, mardi, mercredi, dimanche
  const isWeekend = [3, 4, 5].includes(dayIndex); // Jeudi, vendredi, samedi
  const isExtendedDay = isWeekend;

  // Options de shifts possibles
  const shiftOptions = [
    // Shift de matinée
    { start: '11:00', end: '15:00', importance: isMorningHeavy ? 5 : 3 },
    // Shift d'après-midi
    { start: '14:30', end: '18:30', importance: 2 },
    // Shift de soirée standard
    { start: '17:30', end: '22:30', importance: isWeekend ? 5 : 4 },
    // Shift tardif (uniquement jeu/ven/sam)
    ...(isExtendedDay ? [{ start: '22:00', end: '03:00', importance: 3 }] : []),
    // Shift de nuit (uniquement jeu/ven/sam)
    ...(isExtendedDay ? [{ start: '01:00', end: '07:00', importance: 2 }] : [])
  ];

  // Trier les employés par nombre d'heures attribuées (croissant)
  const sortedEmployees = [...employees].sort((a, b) => {
    const hoursA = getEmployeeWeeklyHours(currentShifts, a.id);
    const hoursB = getEmployeeWeeklyHours(currentShifts, b.id);
    // Priorité aux employés qui ont moins d'heures
    return hoursA - hoursB;
  });

  const newShifts: Shift[] = [];
  let currentNextId = nextId;

  // Pour chaque option de shift, attribuer des employés
  for (const shiftOption of shiftOptions) {
    // Calculer combien d'employés assigner à ce shift
    const employeesToAssign = isWeekend && 
                           (shiftOption.start === '17:30' || 
                            shiftOption.start === '11:00') 
      ? 3  // Plus d'employés pour les shifts chargés du weekend
      : 2; // Valeur par défaut

    const assignedEmployees: number[] = [];

    // Trouver les employés disponibles pour ce shift
    for (const employee of sortedEmployees) {
      // Vérifier si l'employé a des préférences horaires
      const preferredTimes = employee.preferredTimes || [];
      const startHour = parseInt(shiftOption.start.split(':')[0]);
      
      // Déterminer si ce shift correspond aux préférences de l'employé
      const isMorningShift = startHour >= 9 && startHour < 13;
      const isEveningShift = startHour >= 17 && startHour < 22;
      const isNightShift = startHour >= 22 || startHour < 9;
      
      const matchesPreference = preferredTimes.length === 0 || 
                               (isMorningShift && preferredTimes.includes('morning')) ||
                               (isEveningShift && preferredTimes.includes('evening')) ||
                               (isNightShift && preferredTimes.includes('night'));
      
      // Vérifier la disponibilité
      const isAvailable = isEmployeeAvailable(
        currentShifts.concat(newShifts),
        employee.id,
        dayIndex,
        shiftOption.start,
        shiftOption.end
      );
      
      // Calculer le nombre d'heures actuelles
      const weeklyHours = getEmployeeWeeklyHours(
        currentShifts.concat(newShifts),
        employee.id
      );
      
      // Ne pas dépasser les heures maximales de l'employé
      const shiftHours = calculateHours(shiftOption.start, shiftOption.end);
      const wouldExceedHours = weeklyHours + shiftHours > employee.weeklyHours;
      
      if (isAvailable && !wouldExceedHours && matchesPreference) {
        assignedEmployees.push(employee.id);
        
        // Arrêter quand on a atteint le nombre requis d'employés
        if (assignedEmployees.length === employeesToAssign) {
          break;
        }
      }
    }
    
    // Créer le shift s'il y a au moins un employé assigné
    if (assignedEmployees.length > 0) {
      newShifts.push({
        id: currentNextId++,
        day: dayIndex,
        startTime: shiftOption.start,
        endTime: shiftOption.end,
        employeeIds: assignedEmployees,
        status: 'confirmed'
      });
    }
  }
  
  return {
    newShifts,
    nextId: currentNextId
  };
}; 