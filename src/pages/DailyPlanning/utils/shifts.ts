import { Shift, Employee, DaySummary } from '../types';
import { timeToMinutes, calculateHours } from './time';

/**
 * Récupère les shifts pour un jour spécifique
 */
export const getShiftsForDay = (shifts: Shift[], dayIndex: number): Shift[] => {
  return shifts.filter(shift => shift.day === dayIndex);
};

/**
 * Récupère les employés uniques assignés pour un jour spécifique
 */
export const getUniqueEmployeesForDay = (shifts: Shift[], dayIndex: number): number[] => {
  const employeeIds = shifts
    .filter(shift => shift.day === dayIndex)
    .flatMap(shift => shift.employeeIds);
  
  return [...new Set(employeeIds)];
};

/**
 * Vérifie si un employé est disponible sur un créneau horaire
 */
export const isEmployeeAvailable = (
  shifts: Shift[],
  employeeId: number, 
  day: number, 
  startTime: string, 
  endTime: string,
  excludeShiftId?: number
): boolean => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const isNightShift = endMinutes < startMinutes;
  
  // Trouver tous les shifts actuels de l'employé pour ce jour
  const employeeShifts = shifts.filter(shift => 
    shift.employeeIds.includes(employeeId) && shift.day === day && 
    (excludeShiftId === undefined || shift.id !== excludeShiftId)
  );
  
  // Vérifier les conflits
  for (const shift of employeeShifts) {
    const shiftStartMinutes = timeToMinutes(shift.startTime);
    const shiftEndMinutes = timeToMinutes(shift.endTime);
    const isShiftNightShift = shiftEndMinutes < shiftStartMinutes;
    
    // Gérer les shifts de nuit (qui dépassent minuit)
    if (isNightShift && isShiftNightShift) {
      // Les deux shifts dépassent minuit, ils se chevauchent forcément
      return false;
    } else if (isNightShift) {
      // Le nouveau shift dépasse minuit
      if (shiftStartMinutes < endMinutes || shiftEndMinutes > startMinutes) {
        return false;
      }
    } else if (isShiftNightShift) {
      // Le shift existant dépasse minuit
      if (startMinutes < shiftEndMinutes || endMinutes > shiftStartMinutes) {
        return false;
      }
    } else {
      // Aucun des shifts ne dépasse minuit, vérification standard
      if (startMinutes < shiftEndMinutes && shiftStartMinutes < endMinutes) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Calcule les heures totales travaillées par un employé dans la semaine
 */
export const getEmployeeWeeklyHours = (shifts: Shift[], employeeId: number): number => {
  return shifts
    .filter(shift => shift.employeeIds.includes(employeeId))
    .reduce((total, shift) => {
      return total + calculateHours(shift.startTime, shift.endTime);
    }, 0);
};

/**
 * Calcule les heures travaillées par un employé sur un jour spécifique
 */
export const getEmployeeDailyHours = (shifts: Shift[], employeeId: number, dayIndex: number): number => {
  return shifts
    .filter(shift => shift.day === dayIndex && shift.employeeIds.includes(employeeId))
    .reduce((total, shift) => {
      return total + calculateHours(shift.startTime, shift.endTime);
    }, 0);
};

/**
 * Récupère le nom d'un employé par son ID
 */
export const getEmployeeName = (employees: Employee[], employeeId: number): string => {
  const employee = employees.find(emp => emp.id === employeeId);
  return employee ? employee.name : `Employé #${employeeId}`;
};

/**
 * Calcule les heures totales pour un jour spécifique
 */
export const getDayTotalHours = (shifts: Shift[], dayIndex: number): number => {
  return getShiftsForDay(shifts, dayIndex).reduce((total, shift) => {
    return total + (calculateHours(shift.startTime, shift.endTime) * shift.employeeIds.length);
  }, 0);
};

/**
 * Vérifie la validité de la couverture des créneaux du soir
 */
export const validateEveningCoverage = (
  shifts: Shift[], 
  dayIndex: number, 
  minEmployees: number = 2
): 'valid' | 'warning' | 'incomplete' => {
  const eveningShifts = shifts.filter(shift => {
    const startHour = parseInt(shift.startTime.split(':')[0]);
    return shift.day === dayIndex && startHour >= 17 && startHour < 22;
  });
  
  if (eveningShifts.length === 0) return 'incomplete';
  
  // Vérifier si tous les créneaux du soir (17h-22h) ont au moins le minimum d'employés
  const eveningHours = [17, 18, 19, 20, 21];
  let insufficientHours = 0;
  let totalHours = 0;
  
  for (const hour of eveningHours) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    const employeesAtThisHour = shifts
      .filter(shift => {
        const shiftStartMinutes = timeToMinutes(shift.startTime);
        const shiftEndMinutes = timeToMinutes(shift.endTime);
        const timeSlotMinutes = timeToMinutes(timeSlot);
        
        if (shiftEndMinutes < shiftStartMinutes) {
          // Le shift dépasse minuit
          return shift.day === dayIndex && 
                (timeSlotMinutes >= shiftStartMinutes || timeSlotMinutes < shiftEndMinutes);
        } else {
          return shift.day === dayIndex && 
                 timeSlotMinutes >= shiftStartMinutes && 
                 timeSlotMinutes < shiftEndMinutes;
        }
      })
      .flatMap(shift => shift.employeeIds);
    
    const uniqueEmployees = new Set(employeesAtThisHour).size;
    totalHours++;
    
    if (uniqueEmployees === 0) return 'incomplete';
    if (uniqueEmployees < minEmployees) insufficientHours++;
  }
  
  // Si plus de 30% des heures ont un personnel insuffisant, retourner un warning
  return insufficientHours > (totalHours * 0.3) ? 'warning' : 'valid';
};

/**
 * Vérifie la validité de la couverture des créneaux de pointe (midi et soir)
 */
export const validateRushHourCoverage = (
  shifts: Shift[], 
  dayIndex: number,
  minEmployees: number = 3
): 'valid' | 'warning' | 'incomplete' => {
  // Heures de pointe: 12h-14h et 19h-21h
  const rushHours = [12, 13, 19, 20];
  let insufficientHours = 0;
  let totalHours = 0;
  
  for (const hour of rushHours) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    const employeesAtThisHour = shifts
      .filter(shift => {
        const shiftStartMinutes = timeToMinutes(shift.startTime);
        const shiftEndMinutes = timeToMinutes(shift.endTime);
        const timeSlotMinutes = timeToMinutes(timeSlot);
        
        if (shiftEndMinutes < shiftStartMinutes) {
          // Le shift dépasse minuit
          return shift.day === dayIndex && 
                (timeSlotMinutes >= shiftStartMinutes || timeSlotMinutes < shiftEndMinutes);
        } else {
          return shift.day === dayIndex && 
                 timeSlotMinutes >= shiftStartMinutes && 
                 timeSlotMinutes < shiftEndMinutes;
        }
      })
      .flatMap(shift => shift.employeeIds);
    
    const uniqueEmployees = new Set(employeesAtThisHour).size;
    totalHours++;
    
    if (uniqueEmployees === 0) return 'incomplete';
    if (uniqueEmployees < minEmployees) insufficientHours++;
  }
  
  // Si au moins 50% des heures de pointe ont un personnel insuffisant, retourner un warning
  return insufficientHours >= (totalHours * 0.5) ? 'warning' : 'valid';
};

/**
 * Vérifie la validité de la couverture des créneaux du matin
 */
export const validateMorningCoverage = (
  shifts: Shift[], 
  dayIndex: number, 
  minEmployees: number = 2
): 'valid' | 'warning' | 'incomplete' => {
  const morningHours = [11, 12, 13, 14, 15, 16];
  let insufficientHours = 0;
  let totalHours = 0;
  
  for (const hour of morningHours) {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    const employeesAtThisHour = shifts
      .filter(shift => {
        const shiftStartMinutes = timeToMinutes(shift.startTime);
        const shiftEndMinutes = timeToMinutes(shift.endTime);
        const timeSlotMinutes = timeToMinutes(timeSlot);
        
        if (shiftEndMinutes < shiftStartMinutes) {
          // Le shift dépasse minuit
          return shift.day === dayIndex && 
                (timeSlotMinutes >= shiftStartMinutes || timeSlotMinutes < shiftEndMinutes);
        } else {
          return shift.day === dayIndex && 
                 timeSlotMinutes >= shiftStartMinutes && 
                 timeSlotMinutes < shiftEndMinutes;
        }
      })
      .flatMap(shift => shift.employeeIds);
    
    const uniqueEmployees = new Set(employeesAtThisHour).size;
    totalHours++;
    
    if (uniqueEmployees === 0 && hour >= 11 && hour <= 14) return 'incomplete';
    if (uniqueEmployees < minEmployees && hour >= 11 && hour <= 14) insufficientHours++;
  }
  
  // Les heures 11-14 sont plus importantes
  return insufficientHours >= 2 ? 'warning' : 'valid';
};

/**
 * Calcule le pourcentage de remplissage pour un jour spécifique
 */
export const calculateFillingPercentage = (
  shifts: Shift[], 
  dayIndex: number, 
  requiredHoursPerDay: number
): number => {
  // Créneaux d'ouverture typiques
  const openingTimes = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  
  // Pour chaque créneau d'ouverture, vérifier le nombre d'employés présents
  let totalEmployeeHours = 0;
  let validTimeSlots = 0;
  
  for (const time of openingTimes) {
    const hour = parseInt(time.split(':')[0]);
    
    // Ne compter que pendant les heures d'ouverture du restaurant
    const isExtendedDay = dayIndex === 3 || dayIndex === 4 || dayIndex === 5; // jeu, ven, sam
    
    // Heures d'ouverture: 11h-2h (ou 7h pour jeu/ven/sam)
    if ((hour >= 11 && hour < 24) || 
        (hour >= 0 && hour < (isExtendedDay ? 7 : 2))) {
      
      validTimeSlots++;
      
      const employeesAtThisHour = shifts
        .filter(shift => {
          const shiftStartMinutes = timeToMinutes(shift.startTime);
          const shiftEndMinutes = timeToMinutes(shift.endTime);
          const timeSlotMinutes = timeToMinutes(time);
          
          if (shiftEndMinutes < shiftStartMinutes) {
            // Le shift dépasse minuit
            return shift.day === dayIndex && 
                   (timeSlotMinutes >= shiftStartMinutes || timeSlotMinutes < shiftEndMinutes);
          } else {
            return shift.day === dayIndex && 
                   timeSlotMinutes >= shiftStartMinutes && 
                   timeSlotMinutes < shiftEndMinutes;
          }
        })
        .flatMap(shift => shift.employeeIds);
      
      const uniqueEmployees = new Set(employeesAtThisHour).size;
      totalEmployeeHours += uniqueEmployees;
    }
  }
  
  // Calculer le pourcentage basé sur les heures d'employés requises
  const percentFilled = validTimeSlots > 0 
    ? Math.round((totalEmployeeHours / (requiredHoursPerDay * 2)) * 100) 
    : 0;
  
  return Math.min(100, percentFilled);
};

/**
 * Détermine le statut global d'un jour
 */
export const getDayStatus = (
  shifts: Shift[], 
  dayIndex: number
): 'good' | 'warning' | 'critical' | 'incomplete' => {
  const eveningStatus = validateEveningCoverage(shifts, dayIndex);
  const morningStatus = validateMorningCoverage(shifts, dayIndex);
  const rushHourStatus = validateRushHourCoverage(shifts, dayIndex);
  
  // Si n'importe quel créneau est incomplet, le jour est incomplet
  if (eveningStatus === 'incomplete' || rushHourStatus === 'incomplete') {
    return 'incomplete';
  }
  
  // Si les heures de pointe ont un warning, c'est un problème critique
  if (rushHourStatus === 'warning') {
    return 'critical';
  }
  
  // Si le soir a un warning, c'est un warning général
  if (eveningStatus === 'warning' || morningStatus === 'warning') {
    return 'warning';
  }
  
  return 'good';
};

/**
 * Génère un résumé pour chaque jour de la semaine
 */
export const generateWeekSummary = (
  shifts: Shift[]
): DaySummary[] => {
  return Array.from({ length: 7 }, (_, index) => {
    const dayShifts = getShiftsForDay(shifts, index);
    const uniqueEmployees = getUniqueEmployeesForDay(shifts, index);
    const totalHours = getDayTotalHours(shifts, index);
    
    // Paramètres adaptés au type de jour
    const isExtendedDay = index === 3 || index === 4 || index === 5; // jeu, ven, sam
    const requiredHoursPerDay = isExtendedDay ? 60 : 45; // Plus d'heures requises les jours étendus
    
    const fillingPercentage = calculateFillingPercentage(shifts, index, requiredHoursPerDay);
    const status = getDayStatus(shifts, index);
    
    return {
      dayIndex: index,
      fillingPercentage,
      employeeCount: uniqueEmployees.length,
      totalHours,
      status
    };
  });
};

/**
 * Détecte les conflits d'horaires
 */
export const detectScheduleConflicts = (
  shifts: Shift[], 
  employees: Employee[], 
  dayIndex: number
): { employeeId: number, shifts: Shift[] }[] => {
  const conflicts: { employeeId: number, shifts: Shift[] }[] = [];
  
  // Parcourir chaque employé pour vérifier s'il a des shifts qui se chevauchent
  employees.forEach(employee => {
    const employeeShifts = shifts.filter(
      shift => shift.day === dayIndex && shift.employeeIds.includes(employee.id)
    );
    
    if (employeeShifts.length <= 1) return; // Pas de conflit possible avec un seul shift
    
    const conflictingShifts: Shift[] = [];
    
    // Vérifier les chevauchements entre les shifts
    for (let i = 0; i < employeeShifts.length; i++) {
      for (let j = i + 1; j < employeeShifts.length; j++) {
        const shift1 = employeeShifts[i];
        const shift2 = employeeShifts[j];
        
        // Conversion en minutes pour faciliter la comparaison
        const start1 = timeToMinutes(shift1.startTime);
        const end1 = timeToMinutes(shift1.endTime);
        const start2 = timeToMinutes(shift2.startTime);
        const end2 = timeToMinutes(shift2.endTime);
        
        // Gestion des shifts qui dépassent minuit
        let overlap = false;
        if (end1 < start1 && end2 < start2) {
          // Les deux shifts dépassent minuit
          overlap = true; // Ils se chevauchent forcément quelque part
        } else if (end1 < start1) {
          // Shift1 dépasse minuit
          overlap = start2 < end1 || start2 >= start1;
        } else if (end2 < start2) {
          // Shift2 dépasse minuit
          overlap = start1 < end2 || start1 >= start2;
        } else {
          // Cas normal sans dépassement de minuit
          overlap = (start1 < end2 && start2 < end1);
        }
        
        if (overlap) {
          if (!conflictingShifts.includes(shift1)) conflictingShifts.push(shift1);
          if (!conflictingShifts.includes(shift2)) conflictingShifts.push(shift2);
        }
      }
    }
    
    if (conflictingShifts.length > 0) {
      conflicts.push({
        employeeId: employee.id,
        shifts: conflictingShifts
      });
    }
  });
  
  return conflicts;
};

/**
 * Vérifie si un shift spécifique est en conflit
 */
export const isShiftInConflict = (
  shift: Shift, 
  shifts: Shift[], 
  employees: Employee[]
): boolean => {
  const conflicts = detectScheduleConflicts(shifts, employees, shift.day);
  
  return conflicts.some(conflict => 
    conflict.shifts.some(conflictShift => conflictShift.id === shift.id)
  );
}; 