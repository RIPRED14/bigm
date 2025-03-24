import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, UserPlus, AlertCircle, Edit, Copy, Users, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { AddShiftForm, ShiftFormValues } from '@/components/shifts/AddShiftForm';
import { EditShiftForm } from '@/components/shifts/EditShiftForm';
import { EmployeeForm, EmployeeFormValues } from '@/components/employees/EmployeeForm';
import DraggableShift from '@/components/shifts/DraggableShift';
import DroppableCell from '@/components/shifts/DroppableCell';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { 
  validateShift, 
  calculateHours, 
  isNightShift,
  checkDayCoverage,
  getUniqueEmployeesPerDay,
  calculateDayCoveragePercentage
} from '@/utils/shiftValidation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface Shift {
  id: number;
  employeeIds: number[];
  day: number;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'absence';
}

interface Employee {
  id: number;
  name: string;
  avatarUrl?: string;
}

const Planning = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Protection renforcée contre les redirections indésirables
  useEffect(() => {
    // Définition claire du contexte d'interface admin
    if (history && history.replaceState) {
      history.replaceState({ from: 'adminInterface' }, '', location.pathname);
    }
    
    // Si un filtre d'employé est défini dans l'état de navigation, l'appliquer
    if (location.state?.employeeFilter) {
      console.log(`Filtre employé appliqué: ${location.state.employeeFilter}`);
      // Ici on pourrait filtrer les shifts pour ne montrer que ceux de l'employé sélectionné
      // Cette fonctionnalité pourrait être implémentée selon les besoins
    }
    
    // Protection supplémentaire contre la navigation vers l'interface employé
    const handleBeforeUnload = (event: Event) => {
      const newUrl = (event as unknown as { currentTarget: { location: { href: string } } })
        ?.currentTarget?.location?.href;
      
      if (newUrl && newUrl.includes('/employee')) {
        event.preventDefault();
        if (history && history.pushState) {
          history.pushState({ from: 'adminInterface' }, '', '/planning');
        }
        console.log('Tentative de redirection vers l\'interface employé bloquée');
        return false;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname, location.state]);
  
  // State
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [isAddShiftDialogOpen, setIsAddShiftDialogOpen] = useState(false);
  const [isEditShiftDialogOpen, setIsEditShiftDialogOpen] = useState(false);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [showEveningWarning, setShowEveningWarning] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [nextShiftId, setNextShiftId] = useState(11); // Start after sample data
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isDraggingCopy, setIsDraggingCopy] = useState(false);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before activation
      },
    })
  );

  // Sample employees
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: 'John Doe', avatarUrl: '' },
    { id: 2, name: 'Jane Smith', avatarUrl: '' },
    { id: 3, name: 'Michael Johnson', avatarUrl: '' },
    { id: 4, name: 'Emily Wilson', avatarUrl: '' },
    { id: 5, name: 'David Brown', avatarUrl: '' },
  ]);

  // Sample shifts (updated for multiple employees per shift)
  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, employeeIds: [1], day: 0, startTime: '11:00', endTime: '15:00', status: 'confirmed' },
    { id: 2, employeeIds: [2], day: 0, startTime: '15:00', endTime: '22:00', status: 'confirmed' },
    { id: 3, employeeIds: [3, 5], day: 1, startTime: '11:00', endTime: '15:00', status: 'confirmed' },
    { id: 4, employeeIds: [1], day: 2, startTime: '11:00', endTime: '19:00', status: 'confirmed' },
    { id: 5, employeeIds: [4, 2], day: 2, startTime: '18:00', endTime: '01:00', status: 'confirmed' },
    { id: 6, employeeIds: [3], day: 3, startTime: '11:00', endTime: '19:00', status: 'pending' },
    { id: 7, employeeIds: [5, 2, 1], day: 3, startTime: '19:00', endTime: '03:00', status: 'confirmed' },
    { id: 8, employeeIds: [1, 4], day: 4, startTime: '11:00', endTime: '19:00', status: 'confirmed' },
    { id: 9, employeeIds: [3, 5, 4, 2], day: 5, startTime: '18:00', endTime: '02:00', status: 'confirmed' },
    { id: 10, employeeIds: [4, 1], day: 6, startTime: '11:00', endTime: '19:00', status: 'confirmed' },
    // Add an example of multiple shifts in the same day for the same employee
    { id: 11, employeeIds: [1], day: 0, startTime: '20:00', endTime: '23:00', status: 'confirmed' },
  ]);

  // Generate week dates
  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      weekDates.push(nextDate);
    }
    
    return weekDates;
  };

  const weekDates = getWeekDates(new Date(currentWeek));
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Day names
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Navigate to previous/next week
  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  // Get shifts for employee and day
  const getShiftsForEmployeeAndDay = (employeeId: number, day: number): Shift[] => {
    return shifts.filter(shift => 
      shift.employeeIds.includes(employeeId) && shift.day === day
    );
  };

  // Calculate weekly hours for an employee
  const calculateWeeklyHours = (employeeId: number): number => {
    let totalHours = 0;
    
    for (let day = 0; day < 7; day++) {
      const employeeShifts = getShiftsForEmployeeAndDay(employeeId, day);
      
      for (const shift of employeeShifts) {
        totalHours += calculateHours(shift.startTime, shift.endTime);
      }
    }
    
    return Math.round(totalHours * 10) / 10; // Round to 1 decimal place
  };

  // Color classes for different shift statuses with intensity based on employee count
  const getShiftColorClass = (status: string, employeeCount: number) => {
    // Base color classes based on status
    let baseClass = '';
    
    switch (status) {
      case 'confirmed':
        baseClass = 'text-blue-800 border-blue-300';
        break;
      case 'pending':
        baseClass = 'text-yellow-800 border-yellow-300';
        break;
      case 'conflict':
        baseClass = 'text-red-800 border-red-300';
        break;
      case 'absence':
        baseClass = 'text-gray-800 border-gray-300';
        break;
      default:
        baseClass = 'text-blue-800 border-blue-300';
    }
    
    // Choose background intensity based on number of employees
    let bgClass = '';
    
    if (status === 'confirmed') {
      if (employeeCount === 1) {
        bgClass = 'bg-blue-100';
      } else if (employeeCount === 2) {
        bgClass = 'bg-blue-200';
      } else if (employeeCount === 3) {
        bgClass = 'bg-blue-300';
      } else {
        bgClass = 'bg-blue-400';
      }
    } else if (status === 'pending') {
      if (employeeCount === 1) {
        bgClass = 'bg-yellow-100';
      } else if (employeeCount === 2) {
        bgClass = 'bg-yellow-200';
      } else if (employeeCount === 3) {
        bgClass = 'bg-yellow-300';
      } else {
        bgClass = 'bg-yellow-400';
      }
    } else if (status === 'conflict') {
      if (employeeCount === 1) {
        bgClass = 'bg-red-100';
      } else if (employeeCount === 2) {
        bgClass = 'bg-red-200';
      } else if (employeeCount === 3) {
        bgClass = 'bg-red-300';
      } else {
        bgClass = 'bg-red-400';
      }
    } else if (status === 'absence') {
      if (employeeCount === 1) {
        bgClass = 'bg-gray-100';
      } else if (employeeCount === 2) {
        bgClass = 'bg-gray-200';
      } else if (employeeCount === 3) {
        bgClass = 'bg-gray-300';
      } else {
        bgClass = 'bg-gray-400';
      }
    }
    
    return `${bgClass} ${baseClass}`;
  };

  // Add a new employee
  const handleAddEmployee = (data: EmployeeFormValues & { avatarUrl?: string }) => {
    const newEmployee = {
      id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
      name: data.name,
      avatarUrl: data.avatarUrl || '',
    };
    
    setEmployees([...employees, newEmployee]);
    setIsAddEmployeeDialogOpen(false);
    toast.success(`Employee ${data.name} added successfully`);
  };

  // Add a new shift with validation
  const handleAddShift = (data: ShiftFormValues) => {
    // Create a new shift
    const newShift: Shift = {
      id: nextShiftId,
      employeeIds: data.employeeIds,
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'confirmed'
    };
    
    // Validate the shift against business rules
    const warnings = validateShift(newShift);
    
    // If there are evening shift warnings and fewer than 2 employees, show a warning
    const eveningWarning = warnings.find(w => w.type === 'evening' && w.severity === 'warning');
    if (eveningWarning) {
      setShowEveningWarning(true);
      return;
    }
    
    // If there are error-level warnings, show them as toast errors
    const errors = warnings.filter(w => w.severity === 'error');
    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(error.message);
      });
      return;
    }
    
    // If all is good, add the shift
    setShifts([...shifts, newShift]);
    setNextShiftId(nextShiftId + 1);
    setIsAddShiftDialogOpen(false);
    toast.success("Shift added successfully");
  };

  // Edit an existing shift with validation
  const handleEditShift = (data: ShiftFormValues, shiftId: number) => {
    // Create updated shift
    const updatedShift: Shift = {
      id: shiftId,
      employeeIds: data.employeeIds,
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      status: shifts.find(s => s.id === shiftId)?.status || 'confirmed'
    };
    
    // Validate the shift
    const warnings = validateShift(updatedShift);
    
    // Check for errors
    const errors = warnings.filter(w => w.severity === 'error');
    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(error.message);
      });
      return;
    }
    
    // Check for warnings
    const warningMessages = warnings.filter(w => w.severity === 'warning');
    if (warningMessages.length > 0) {
      warningMessages.forEach(warning => {
        toast.warning(warning.message);
      });
    }
    
    // Update the shift
    setShifts(shifts.map(shift => shift.id === shiftId ? updatedShift : shift));
    setIsEditShiftDialogOpen(false);
    setSelectedShift(null);
    toast.success("Shift updated successfully");
  };

  // Delete a shift
  const handleDeleteShift = (shiftId: number) => {
    setShifts(shifts.filter(shift => shift.id !== shiftId));
    setIsEditShiftDialogOpen(false);
    setSelectedShift(null);
    toast.success("Shift deleted successfully");
  };

  // Click on a shift to edit
  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsEditShiftDialogOpen(true);
  };

  // Click on an empty cell to add a shift for that day and employee
  const handleAddShiftForEmployeeDay = (employeeId: number, day: number) => {
    // Pre-select the employee and day
    setSelectedShift({
      id: -1, // Temporary ID
      employeeIds: [employeeId],
      day: day,
      startTime: '11:00',
      endTime: '15:00',
      status: 'confirmed'
    });
    setIsAddShiftDialogOpen(true);
  };

  // Handle confirmation when there's a warning
  const handleConfirmShiftAnyway = () => {
    if (selectedShift?.id === -1) {
      // This is a new shift (from the add shift form)
      const newShift: Shift = {
        id: nextShiftId,
        employeeIds: selectedShift.employeeIds,
        day: selectedShift.day,
        startTime: selectedShift.startTime,
        endTime: selectedShift.endTime,
        status: 'confirmed'
      };
      
      setShifts([...shifts, newShift]);
      setNextShiftId(nextShiftId + 1);
    }
    
    setShowEveningWarning(false);
    setIsAddShiftDialogOpen(false);
    toast.success("Shift added successfully");
  };

  // Get employees assigned to a shift
  const getEmployeesForShift = (employeeIds: number[]): string => {
    const employeeNames = employeeIds.map(id => {
      const employee = employees.find(e => e.id === id);
      return employee ? employee.name : 'Unknown';
    });
    
    return employeeNames.join(', ');
  };

  // Handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id.toString();
    
    if (id.startsWith('shift-')) {
      const shiftId = parseInt(id.replace('shift-', ''));
      const foundShift = shifts.find(s => s.id === shiftId);
      
      if (foundShift) {
        setActiveShift(foundShift);
      }
    }
    
    // Check if CTRL is pressed for copy mode
    if (event.active.data.current?.type === 'shift' && event.activatorEvent instanceof PointerEvent) {
      if ((event.activatorEvent as PointerEvent).ctrlKey) {
        setIsDraggingCopy(true);
        // Show visual indicator for copy mode
        toast.info("Copy mode: Drop to create a copy of this shift", { 
          duration: 2000,
          position: "top-center",
          icon: <Copy className="h-4 w-4" />
        });
      } else {
        setIsDraggingCopy(false);
      }
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset states
    setActiveShift(null);
    
    if (!over) {
      setIsDraggingCopy(false);
      return;
    }
    
    const sourceId = active.id.toString();
    const targetId = over.id.toString();
    
    console.log('Drag end:', {
      sourceId,
      targetId,
      activeData: active.data.current,
      overData: over.data.current,
      isDraggingCopy
    });
    
    // Only proceed if the drag ended over a valid drop target
    if (sourceId.startsWith('shift-') && targetId.startsWith('cell-')) {
      const shiftId = parseInt(sourceId.replace('shift-', ''));
      const [, targetEmployeeId, targetDay] = targetId.split('-').map(Number);
      
      // Find the shift being dragged
      const draggedShift = shifts.find(s => s.id === shiftId);
      
      if (!draggedShift) {
        console.error('Shift not found:', shiftId);
        setIsDraggingCopy(false);
        return;
      }
      
      // Get the current employee ID from the data
      const currentEmployeeId = active.data.current?.currentEmployeeId;
      
      if (isDraggingCopy) {
        // Create a copy of the shift for the new day and/or employee
        const newShift = {
          ...draggedShift,
          id: nextShiftId,
          day: targetDay,
          employeeIds: [...draggedShift.employeeIds]
        };
        
        // Handle employee assignment for the copied shift
        if (targetEmployeeId && !newShift.employeeIds.includes(targetEmployeeId)) {
          newShift.employeeIds.push(targetEmployeeId);
        }
        
        // Validate the new shift
        const warnings = validateShift(newShift);
        const errors = warnings.filter(w => w.severity === 'error');
        
        if (errors.length > 0) {
          errors.forEach(error => {
            toast.error(error.message);
          });
          setIsDraggingCopy(false);
          return;
        }
        
        // Add the new shift
        setShifts([...shifts, newShift]);
        setNextShiftId(nextShiftId + 1);
        toast.success("Shift copied successfully");
      } else {
        // Move existing shift to new day
        const updatedShift = {
          ...draggedShift,
          day: targetDay
        };
        
        // Handle employee assignment for the moved shift
        if (currentEmployeeId && targetEmployeeId && currentEmployeeId !== targetEmployeeId) {
          // If we're dragging from one employee to another
          if (!updatedShift.employeeIds.includes(targetEmployeeId)) {
            updatedShift.employeeIds.push(targetEmployeeId);
          }
          
          // If this is a personal shift (only one employee), replace the employee
          if (draggedShift.employeeIds.length === 1) {
            updatedShift.employeeIds = [targetEmployeeId];
          } else {
            // Otherwise, maintain the team but update the current employee
            updatedShift.employeeIds = updatedShift.employeeIds.filter(id => 
              id === targetEmployeeId || id !== currentEmployeeId
            );
          }
        }
        
        // Validate the updated shift
        const warnings = validateShift(updatedShift);
        const errors = warnings.filter(w => w.severity === 'error');
        
        if (errors.length > 0) {
          errors.forEach(error => {
            toast.error(error.message);
          });
          setIsDraggingCopy(false);
          return;
        }
        
        // Update the shift
        setShifts(shifts.map(s => s.id === shiftId ? updatedShift : s));
        toast.success("Shift moved successfully");
      }
    }
    
    setIsDraggingCopy(false);
  };

  // Handle keyboard shortcut for copying (Ctrl+click)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        document.body.style.cursor = 'copy';
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        document.body.style.cursor = 'default';
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Vérifier la couverture des horaires pour chaque jour
  const getDayCoverageStatus = (day: number) => {
    const { isCovered, uncoveredSlots } = checkDayCoverage(day, shifts);
    const employeeCount = getUniqueEmployeesPerDay(shifts, day);
    const coveragePercentage = calculateDayCoveragePercentage(day, shifts);
    
    return {
      isCovered,
      uncoveredSlots,
      employeeCount,
      coveragePercentage
    };
  };

  // Obtenir la classe de couleur pour une colonne de jour
  const getDayColumnColorClass = (day: number) => {
    const { isCovered, employeeCount } = getDayCoverageStatus(day);
    
    if (!isCovered) {
      return 'bg-red-50 border-red-200';
    }
    
    if (employeeCount < 3) {
      return 'bg-yellow-50 border-yellow-200';
    }
    
    return 'bg-green-50 border-green-200';
  };

  // Fonction pour formater les créneaux horaires non couverts
  const formatUncoveredSlots = (slots: string[]): React.ReactNode => {
    if (slots.length === 0) return (
      <div className="text-green-700 font-medium">
        <span className="inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Tous les créneaux sont couverts
        </span>
      </div>
    );
    
    // Grouper les créneaux consécutifs
    const groupedSlots: string[][] = [];
    let currentGroup: string[] = [];
    
    slots.sort().forEach((slot, index) => {
      const currentHour = parseInt(slot.split(':')[0]);
      const prevHour = index > 0 ? parseInt(slots[index - 1].split(':')[0]) : null;
      
      // Gestion des créneaux de minuit et après (passage à 00:00)
      const isConsecutive = prevHour === null || 
        (currentHour === 0 && prevHour === 23) || // Minuit après 23h
        currentHour === prevHour + 1;
      
      if (isConsecutive) {
        currentGroup.push(slot);
      } else {
        if (currentGroup.length > 0) {
          groupedSlots.push([...currentGroup]);
        }
        currentGroup = [slot];
      }
    });
    
    if (currentGroup.length > 0) {
      groupedSlots.push(currentGroup);
    }
    
    // Calculer le nombre total d'heures non couvertes
    const totalUncoveredHours = slots.length;
    
    return (
      <div className="space-y-2">
        <div className="text-red-700 font-semibold flex items-start gap-1">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{totalUncoveredHours} heure{totalUncoveredHours > 1 ? 's' : ''} non couverte{totalUncoveredHours > 1 ? 's' : ''}</span>
        </div>
        <div className="grid gap-1">
          {groupedSlots.map((group, idx) => {
            const startTime = group[0];
            const endTime = group[group.length - 1];
            const duration = group.length;
            
            // Format différent pour plage vs heure seule
            const timeDisplay = group.length === 1 
              ? startTime 
              : `${startTime} - ${endTime}`;
              
            return (
              <div key={idx} className="bg-red-50 rounded px-2 py-1 border border-red-200 flex justify-between">
                <span className="font-medium">{timeDisplay}</span>
                <span className="text-gray-500 text-[10px] self-end">
                  {duration}h
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <PageContainer
      className="pt-10 max-w-full px-2"
    >
      {/* En-tête ultra-compact avec contrôles intégrés */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-3">Planning Hebdomadaire</h1>
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={previousWeek} className="h-6 w-6">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="mx-1.5 text-sm font-medium whitespace-nowrap">
              {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </span>
            <Button variant="outline" size="icon" onClick={nextWeek} className="h-6 w-6">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex space-x-1.5">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setIsAddShiftDialogOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Ajouter Shift
          </Button>
          <Button variant="secondary" size="sm" className="h-7 px-2 text-xs" onClick={() => setIsAddEmployeeDialogOpen(true)}>
            <UserPlus className="h-3 w-3 mr-1" />
            Nouvel Employé
          </Button>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 gap-2">
        {/* Légende compacte en ligne */}
        <div className="flex flex-wrap items-center justify-between rounded-md bg-muted/20 border px-2 py-1 text-[10px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center" title="Maintenez Ctrl pour copier les shifts">
              <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] mr-1">Ctrl</kbd>
              <span>+ glisser pour copier</span>
            </div>
            <div className="h-3 border-l mx-0.5">&nbsp;</div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-sm bg-green-400 mr-0.5"></div>
                <span>Couvert</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-sm bg-red-400 mr-0.5"></div>
                <span>Non couvert</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-sm bg-blue-200 mr-0.5"></div>
              <span>1 empl.</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-sm bg-blue-300 mr-0.5"></div>
              <span>2+ empl.</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-sm bg-yellow-300 mr-0.5"></div>
              <span>En attente</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-sm bg-red-300 mr-0.5"></div>
              <span>Conflit</span>
            </div>
          </div>
        </div>

        {/* Grille du planning optimisée */}
        <Card className="overflow-hidden border shadow-sm">
          <DndContext 
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/30 h-10">
                    <th className="py-1 px-2 font-medium text-left border-r border-border sticky left-0 bg-muted/30 min-w-[120px]">
                      <span className="text-xs">Employé</span>
                    </th>
                    {dayNames.map((day, index) => {
                      const { isCovered, employeeCount, coveragePercentage, uncoveredSlots } = getDayCoverageStatus(index);
                      
                      return (
                        <th 
                          key={day} 
                          className={`py-1 px-1 font-medium text-center min-w-[120px] border-r border-border ${getDayColumnColorClass(index)}`}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col items-center cursor-help">
                                  <div className="flex items-center justify-between w-full px-1">
                                    <span className="text-xs">{day.substring(0, 3)}</span>
                                    <Badge variant={isCovered ? "outline" : "destructive"} className="text-[9px] px-1 h-3.5">
                                      {employeeCount}<Users className="h-2 w-2 ml-0.5" />
                                    </Badge>
                                  </div>
                                  <div className="text-[9px] text-muted-foreground">
                                    {formatDate(weekDates[index])}
                                  </div>
                                  <div className="w-full mt-0.5 flex items-center gap-0.5">
                                    <Progress value={coveragePercentage} className="h-0.5 flex-1" />
                                    {!isCovered && (
                                      <AlertTriangle className="h-2 w-2 text-red-500 flex-none" />
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="bottom" 
                                align="center" 
                                sideOffset={5}
                                className="max-w-[250px] bg-white border shadow-md p-2 text-xs z-[9999]"
                              >
                                <div className="space-y-1.5">
                                  <div className="font-medium flex items-center justify-between border-b pb-1">
                                    <span className="text-[10px]">État de la couverture</span>
                                    <Badge variant={uncoveredSlots.length === 0 ? "outline" : "destructive"} 
                                      className={`text-[9px] h-4 ${uncoveredSlots.length === 0 ? "bg-green-100 text-green-800 border-green-200" : ""}`}>
                                      {uncoveredSlots.length === 0 ? "100%" : `${Math.round(coveragePercentage)}%`}
                                    </Badge>
                                  </div>
                                  
                                  <div className={`${uncoveredSlots.length > 0 ? 'border-red-200' : 'border-green-200'} rounded-md overflow-hidden text-[10px]`}>
                                    {formatUncoveredSlots(uncoveredSlots)}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-t border-border hover:bg-muted/10 h-10">
                      <td className="py-1 px-2 border-r border-border sticky left-0 bg-white">
                        <div className="font-medium text-xs">{employee.name}</div>
                        <div className="text-[9px] text-muted-foreground">
                          {calculateWeeklyHours(employee.id)} hrs
                        </div>
                      </td>
                      {Array.from({ length: 7 }).map((_, day) => {
                        const employeeShifts = getShiftsForEmployeeAndDay(employee.id, day);
                        
                        return (
                          <td key={day} className="p-0.5 border-r border-border">
                            <DroppableCell
                              day={day}
                              employeeId={employee.id}
                              onAddClick={handleAddShiftForEmployeeDay}
                              hasShifts={employeeShifts.length > 0}
                            >
                              {employeeShifts.map((shift) => (
                                <DraggableShift
                                  key={shift.id}
                                  shift={shift}
                                  currentEmployee={employee}
                                  colorClass={getShiftColorClass(shift.status, shift.employeeIds.length)}
                                  employees={employees}
                                  onClick={handleShiftClick}
                                  getEmployeesForShift={getEmployeesForShift}
                                />
                              ))}
                            </DroppableCell>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DndContext>
        </Card>
        
        {/* Statistiques compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
          <Card className="overflow-hidden h-16">
            <div className="h-full flex items-center p-2">
              <div className="bg-primary/10 p-1.5 rounded-full mr-3">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Personnel total</p>
                <div className="flex gap-2 items-baseline">
                  <p className="text-lg font-semibold">{employees.length}</p>
                  <p className="text-muted-foreground">employés</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="overflow-hidden h-16">
            <div className="h-full flex items-center p-2">
              <div className="bg-blue-100 p-1.5 rounded-full mr-3">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Shifts cette semaine</p>
                <div className="flex gap-2 items-baseline">
                  <p className="text-lg font-semibold">{shifts.length}</p>
                  <p className="text-muted-foreground">planifiés</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="overflow-hidden h-16">
            <div className="h-full flex items-center p-2">
              <div className="bg-yellow-100 p-1.5 rounded-full mr-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Shifts en attente</p>
                <div className="flex gap-2 items-baseline">
                  <p className="text-lg font-semibold">{shifts.filter(s => s.status === 'pending').length}</p>
                  <p className="text-muted-foreground">à confirmer</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="overflow-hidden h-16">
            <div className="h-full flex items-center p-2">
              <div className="bg-green-100 p-1.5 rounded-full mr-3">
                <AlertCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Couverture totale</p>
                <div className="flex gap-2 items-baseline">
                  <p className="text-lg font-semibold">
                    93%
                  </p>
                  <p className="text-muted-foreground">moyenne</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isAddShiftDialogOpen} onOpenChange={setIsAddShiftDialogOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>
              Schedule a shift for one or more employees.
            </DialogDescription>
          </DialogHeader>
          {showEveningWarning ? (
            <div className="py-2">
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Evening Shift Notice</AlertTitle>
                <AlertDescription>
                  We recommend at least 2 employees for shifts starting at or after 18:00.
                  Do you want to proceed anyway?
                </AlertDescription>
              </Alert>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowEveningWarning(false)}>
                  Go Back
                </Button>
                <Button size="sm" onClick={handleConfirmShiftAnyway}>
                  Proceed Anyway
                </Button>
              </div>
            </div>
          ) : (
            <AddShiftForm 
              employees={employees}
              weekDates={weekDates}
              onSubmit={handleAddShift}
              onCancel={() => setIsAddShiftDialogOpen(false)}
              preselectedEmployeeId={selectedShift?.employeeIds[0]}
              preselectedDay={selectedShift?.day}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      {selectedShift && (
        <Dialog open={isEditShiftDialogOpen} onOpenChange={(open) => {
          setIsEditShiftDialogOpen(open);
          if (!open) setSelectedShift(null);
        }}>
          <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-hidden">
            <DialogHeader className="pb-2">
              <DialogTitle>Edit Shift</DialogTitle>
              <DialogDescription>
                Modify or delete this scheduled shift.
              </DialogDescription>
            </DialogHeader>
            <EditShiftForm 
              shift={selectedShift}
              employees={employees}
              weekDates={weekDates}
              onSubmit={handleEditShift}
              onDelete={handleDeleteShift}
              onCancel={() => {
                setIsEditShiftDialogOpen(false);
                setSelectedShift(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details for the new employee.
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm 
            onSubmit={handleAddEmployee}
            onCancel={() => setIsAddEmployeeDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Planning;
