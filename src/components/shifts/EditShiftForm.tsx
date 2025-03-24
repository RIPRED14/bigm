import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Trash2,
  Users,
  Calendar,
  Clock,
  Info,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types
interface Employee {
  id: number;
  name: string;
  avatarUrl?: string;
}

interface Shift {
  id: number;
  employeeIds: number[];
  day: number;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'absence';
}

interface EditShiftFormProps {
  shift: Shift;
  employees: Employee[];
  weekDates: Date[];
  onSubmit: (data: ShiftFormValues, id: number) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
}

// Schema for form validation
const shiftFormSchema = z.object({
  employeeIds: z.array(z.number()).min(1, {
    message: "Select at least one employee.",
  }),
  day: z.number(),
  startTime: z.string().min(1, {
    message: "Select a start time.",
  }),
  endTime: z.string().min(1, {
    message: "Select an end time.",
  }),
  isNightShift: z.boolean().default(false),
}).refine((data) => {
  // Allow night shifts to cross midnight
  if (data.isNightShift) return true;
  
  const start = parseTimeToMinutes(data.startTime);
  const end = parseTimeToMinutes(data.endTime);
  return start < end;
}, {
  message: "For day shifts, end time must be after start time.",
  path: ["endTime"],
});

export type ShiftFormValues = z.infer<typeof shiftFormSchema>;

// Helper function to convert time string to minutes for comparison
function parseTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Generate time options from 11:00 AM to 7:00 AM next day in 30-minute intervals
function generateTimeOptions(day: number): { value: string; label: string }[] {
  const options = [];
  const isExtendedDay = day >= 3 && day <= 5; // Thursday (3), Friday (4), Saturday (5)
  const endHour = isExtendedDay ? 7 : 3; // 7:00 AM for Thu-Sat, 3:00 AM otherwise
  
  // Start at 11:00 AM
  for (let hour = 11; hour <= 23; hour++) {
    for (let minute = 0; minute <= 30; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({
        value: timeString,
        label: timeString,
      });
    }
  }
  
  // Add hours from midnight to end time
  for (let hour = 0; hour <= endHour; hour++) {
    for (let minute = 0; minute <= 30; minute += 30) {
      // Skip the 7:30 AM option for extended days
      if (hour === endHour && minute > 0) continue;
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({
        value: timeString,
        label: timeString,
      });
    }
  }
  
  return options;
}

// Day names for display
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Check if shift crosses midnight
const isNightShift = (startTime: string, endTime: string): boolean => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  
  // If end hour is less than start hour, it crosses midnight
  return (endHour < startHour) || (endHour === 0 && startHour > 0);
};

export function EditShiftForm({ shift, employees, weekDates, onSubmit, onDelete, onCancel }: EditShiftFormProps) {
  const [selectedDay, setSelectedDay] = useState<number>(shift.day);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>(shift.employeeIds);
  const [selectedStartTime, setSelectedStartTime] = useState<string>(shift.startTime);
  const [selectedEndTime, setSelectedEndTime] = useState<string>(shift.endTime);
  const [showEveningWarning, setShowEveningWarning] = useState<boolean>(false);
  const [isNightShiftChecked, setIsNightShiftChecked] = useState<boolean>(
    isNightShift(shift.startTime, shift.endTime)
  );
  
  const timeOptions = generateTimeOptions(selectedDay);
  
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      employeeIds: shift.employeeIds,
      day: shift.day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isNightShift: isNightShift(shift.startTime, shift.endTime),
    },
  });

  // Handle employee selection change
  const handleEmployeeChange = (employeeId: string) => {
    const id = parseInt(employeeId);
    
    // If employee already selected, remove them
    if (selectedEmployees.includes(id)) {
      const updatedEmployees = selectedEmployees.filter(empId => empId !== id);
      setSelectedEmployees(updatedEmployees);
      form.setValue('employeeIds', updatedEmployees);
    } else {
      // Otherwise add them
      const updatedEmployees = [...selectedEmployees, id];
      setSelectedEmployees(updatedEmployees);
      form.setValue('employeeIds', updatedEmployees);
    }
    
    // Check if warning should be shown
    checkEveningWarning();
  };
  
  // Handle day change
  const handleDayChange = (value: string) => {
    const day = parseInt(value);
    setSelectedDay(day);
    form.setValue('day', day);
    
    // Check if warning should be shown
    checkEveningWarning();
  };
  
  // Handle time change
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    if (field === 'startTime') {
      setSelectedStartTime(value);
    } else {
      setSelectedEndTime(value);
    }
    form.setValue(field, value);
    
    // Auto-detect if it's a night shift
    if (field === 'endTime') {
      const startTime = form.getValues('startTime');
      if (startTime) {
        const isNight = isNightShift(startTime, value);
        setIsNightShiftChecked(isNight);
        form.setValue('isNightShift', isNight);
      }
    }
    
    // Check if warning should be shown
    checkEveningWarning();
  };
  
  // Handle night shift toggle
  const handleNightShiftToggle = (checked: boolean) => {
    setIsNightShiftChecked(checked);
    form.setValue('isNightShift', checked);
  };
  
  // Check if evening shift warning should be shown
  const checkEveningWarning = () => {
    const values = form.getValues();
    const startHour = values.startTime ? parseInt(values.startTime.split(':')[0]) : 0;
    
    // Check if shift starts at or after 18:00 and has fewer than 2 employees
    if (
      ((startHour >= 18) || (startHour >= 0 && startHour < 7)) &&
      selectedEmployees.length < 2
    ) {
      setShowEveningWarning(true);
    } else {
      setShowEveningWarning(false);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Handle form submission
  const handleSubmit = (data: ShiftFormValues) => {
    onSubmit(data, shift.id);
  };
  
  // Handle delete click
  const handleDelete = () => {
    onDelete(shift.id);
  };
  
  // Get shift duration
  const getShiftDuration = () => {
    const start = parseTimeToMinutes(selectedStartTime);
    let end = parseTimeToMinutes(selectedEndTime);
    
    // If it's a night shift (end time is before start time)
    if (end < start) {
      end += 24 * 60; // Add 24 hours
    }
    
    const durationMinutes = end - start;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}h${minutes ? minutes : ''}`;
  };
  
  // Get number of selected employees
  const selectedEmployeeCount = selectedEmployees.length;
  
  // Check evening warning on mount
  useEffect(() => {
    checkEveningWarning();
  }, []);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Edit Shift #{shift.id}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">
              <span className="bg-primary/10 px-2 py-1 rounded text-primary font-medium">
                {getShiftDuration()}
              </span>
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this shift from the schedule.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Form Content - Wrapped in ScrollArea with fixed height */}
        <div className="h-[320px] relative">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Day Field */}
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Day</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Select the day of the week for this shift
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select 
                        onValueChange={(value) => handleDayChange(value)}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dayNames.map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {day} ({weekDates[index] ? formatDate(weekDates[index]) : ''})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quick Staff Selection */}
                <FormField
                  control={form.control}
                  name="employeeIds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Staff Count</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {selectedEmployeeCount === 0 
                                ? "Select at least one employee" 
                                : `${selectedEmployeeCount} employee${selectedEmployeeCount > 1 ? 's' : ''} selected`}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="text-muted-foreground h-4 w-4 mr-1" />
                        {selectedEmployeeCount > 0 ? (
                          <div className="flex -space-x-2">
                            {selectedEmployees.slice(0, 3).map((id) => {
                              const employee = employees.find(e => e.id === id);
                              return (
                                <Avatar key={id} className="h-6 w-6 border border-white">
                                  <AvatarImage src={employee?.avatarUrl} alt={employee?.name} />
                                  <AvatarFallback className="text-xs">{employee?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              );
                            })}
                            {selectedEmployeeCount > 3 && (
                              <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                                +{selectedEmployeeCount - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No staff selected</span>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Start Time</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Select when the shift starts
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select 
                        onValueChange={(value) => handleTimeChange('startTime', value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* End Time */}
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>End Time</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Select when the shift ends
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select 
                        onValueChange={(value) => handleTimeChange('endTime', value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Employee Selection */}
              <FormField
                control={form.control}
                name="employeeIds"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Select Employees</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        {selectedEmployeeCount} selected
                      </span>
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted/20 p-2 border-b flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Staff List</span>
                      </div>
                      <ScrollArea className="h-[150px]">
                        <div className="p-2 space-y-1">
                          {employees.map((employee) => (
                            <div
                              key={employee.id}
                              className={`flex items-center p-2 rounded-md transition-colors ${
                                selectedEmployees.includes(employee.id)
                                  ? "bg-primary/10 border-l-4 border-primary"
                                  : "hover:bg-muted cursor-pointer"
                              }`}
                              onClick={() => handleEmployeeChange(employee.id.toString())}
                            >
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                <div className="font-medium">{employee.name}</div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedEmployees.includes(employee.id)
                                  ? "border-primary bg-primary text-white"
                                  : "border-muted-foreground"
                              }`}>
                                {selectedEmployees.includes(employee.id) && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Night Shift Option */}
              <FormField
                control={form.control}
                name="isNightShift"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <FormLabel className="text-base mb-0">Night Shift</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Enable if this shift continues past midnight
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormDescription className="text-xs">
                        Continues past midnight
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={isNightShiftChecked}
                        onCheckedChange={handleNightShiftToggle}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Evening Shift Warning */}
              {showEveningWarning && (
                <Alert variant="warning" className="p-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">Evening Shift Notice</AlertTitle>
                  <AlertDescription className="text-xs">
                    We recommend at least 2 employees for shifts starting at or after 18:00.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Form Actions - Fixed at bottom with shadow for visibility */}
        <div className="flex justify-end gap-3 pt-3 mt-2 border-t bg-white sticky bottom-0 z-10 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
} 