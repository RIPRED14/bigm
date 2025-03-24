import { useState, useEffect, useMemo } from 'react';
import { Shift, Employee, ShiftFormValues, ScheduleRules, DaySummary, ScheduleConflict } from '../types';
import { generateWeekSummary, getShiftsForDay, detectScheduleConflicts, isShiftInConflict } from '../utils/shifts';
import { generateOptimalSchedule } from '../utils/schedule';

interface UseShiftsProps {
  initialShifts: Shift[];
  employees: Employee[];
  scheduleRules: ScheduleRules;
}

export const useShifts = ({ initialShifts, employees, scheduleRules }: UseShiftsProps) => {
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);

  // Vérifier les conflits quand les shifts changent
  useEffect(() => {
    // Vérifier tous les jours pour des conflits
    const allConflicts = Array.from({ length: 7 }, (_, day) => {
      return detectScheduleConflicts(shifts, employees, day);
    }).flat();
    
    setConflicts(allConflicts);
  }, [shifts, employees]);

  // Ajouter un nouveau shift
  const addShift = (newShift: Omit<Shift, 'id' | 'status'>) => {
    const id = Math.max(0, ...shifts.map(s => s.id)) + 1;
    const completeShift: Shift = {
      ...newShift,
      id,
      status: 'confirmed'
    };
    setShifts(prev => [...prev, completeShift]);
  };

  // Supprimer un shift
  const deleteShift = (shiftId: number) => {
    setShifts(prev => prev.filter(shift => shift.id !== shiftId));
  };

  // Mettre à jour un shift
  const updateShift = (
    shiftId: number, 
    updates: Partial<Omit<Shift, 'id'>>
  ) => {
    setShifts(prev => 
      prev.map(shift => shift.id === shiftId ? { ...shift, ...updates } : shift)
    );
  };

  // Retirer un employé d'un shift
  const removeEmployeeFromShift = (shiftId: number, employeeId: number) => {
    setShifts(prev => 
      prev.map(shift => {
        if (shift.id === shiftId) {
          const updatedEmployeeIds = shift.employeeIds.filter(id => id !== employeeId);
          
          // Si c'était le dernier employé, supprimer le shift
          if (updatedEmployeeIds.length === 0) {
            return null;
          }
          
          return { ...shift, employeeIds: updatedEmployeeIds };
        }
        return shift;
      }).filter(Boolean) as Shift[]
    );
  };

  // Générer automatiquement un planning pour un jour
  const generateSchedule = (dayIndex: number) => {
    // Supprimer tous les shifts existants pour ce jour
    const shiftsWithoutDay = shifts.filter(shift => shift.day !== dayIndex);
    
    // Générer le planning optimal
    const currentDate = new Date();
    const result = generateOptimalSchedule(
      shiftsWithoutDay,
      employees,
      currentDate, 
      dayIndex,
      scheduleRules,
      Math.max(0, ...shifts.map(s => s.id)) + 1
    );
    
    // Ajouter les nouveaux shifts
    if (result && result.newShifts) {
      setShifts([...shiftsWithoutDay, ...result.newShifts]);
    }
  };

  // Récupérer les shifts pour un jour spécifique
  const getShiftsForSpecificDay = (dayIndex: number) => {
    return shifts.filter(shift => shift.day === dayIndex);
  };

  // Vérifier s'il y a des conflits d'horaires
  const hasConflicts = useMemo(() => conflicts.length > 0, [conflicts]);

  // Générer le résumé de la semaine
  const weekSummary = useMemo(() => {
    return generateWeekSummary(shifts);
  }, [shifts]);

  return {
    shifts,
    addShift,
    deleteShift,
    updateShift,
    removeEmployeeFromShift,
    hasConflicts,
    conflicts,
    weekSummary,
    getShiftsForDay: getShiftsForSpecificDay,
    generateSchedule
  };
}; 