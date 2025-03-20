
import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const Planning = () => {
  // Sample data for weekly shifts
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

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

  // Sample employees
  const employees = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Michael Johnson' },
    { id: 4, name: 'Emily Wilson' },
    { id: 5, name: 'David Brown' },
  ];

  // Sample shifts
  const shifts = [
    { employeeId: 1, day: 0, startTime: '09:00', endTime: '17:00', status: 'confirmed' },
    { employeeId: 2, day: 0, startTime: '12:00', endTime: '20:00', status: 'confirmed' },
    { employeeId: 3, day: 1, startTime: '09:00', endTime: '17:00', status: 'confirmed' },
    { employeeId: 1, day: 2, startTime: '09:00', endTime: '17:00', status: 'confirmed' },
    { employeeId: 4, day: 2, startTime: '16:00', endTime: '00:00', status: 'confirmed' },
    { employeeId: 5, day: 3, startTime: '09:00', endTime: '17:00', status: 'pending' },
    { employeeId: 2, day: 3, startTime: '12:00', endTime: '20:00', status: 'confirmed' },
    { employeeId: 1, day: 4, startTime: '09:00', endTime: '17:00', status: 'confirmed' },
    { employeeId: 3, day: 5, startTime: '12:00', endTime: '20:00', status: 'absence' },
    { employeeId: 4, day: 6, startTime: '09:00', endTime: '17:00', status: 'confirmed' },
  ];

  // Get shift for employee and day
  const getShift = (employeeId: number, day: number) => {
    return shifts.find(shift => shift.employeeId === employeeId && shift.day === day);
  };

  // Color classes for different shift statuses
  const getShiftColorClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'conflict':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'absence':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <PageContainer
      title="Shift Planning"
      description="Create and manage weekly shift schedules for your staff."
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-base font-medium">
            Week of {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </div>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>
      </div>

      {/* View Options */}
      <Tabs defaultValue="week" className="mb-6">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="employee">Employee View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="week" className="mt-4">
          <Card className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-4 font-medium text-left border-r border-border sticky left-0 bg-muted/50 min-w-[180px]">Employee</th>
                    {dayNames.map((day, index) => (
                      <th key={day} className="p-3 font-medium text-center min-w-[140px] border-r border-border">
                        <div>{day}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(weekDates[index])}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4 font-medium border-r border-border sticky left-0 bg-white">{employee.name}</td>
                      {Array.from({ length: 7 }).map((_, day) => {
                        const shift = getShift(employee.id, day);
                        return (
                          <td key={day} className="p-2 border-r border-border text-center align-middle">
                            {shift ? (
                              <div className={`p-2 rounded-md border ${getShiftColorClass(shift.status)}`}>
                                <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                                </Badge>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="w-full h-12 border border-dashed border-muted-foreground/20">
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="employee" className="mt-4">
          <Card className="glass-card p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Employee View</h3>
              <p className="text-muted-foreground">View shifts organized by employee.</p>
              <Button className="mt-4">Switch to Employee View</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">Confirmed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm">Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm">Conflict</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
          <span className="text-sm">Absence</span>
        </div>
      </div>
    </PageContainer>
  );
};

export default Planning;
