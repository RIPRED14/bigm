import React from 'react';
import { 
  Box, 
  Text, 
  Flex, 
  Badge, 
  Tooltip, 
  Avatar, 
  AvatarGroup, 
  HStack, 
  Icon,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { Shift, Employee } from '../types';
import { MdWarning } from 'react-icons/md';
import { timeToMinutes, isWithinOpeningHours } from '../utils/time';

interface TimeSlotProps {
  time: string;
  dayIndex: number;
  shifts: Shift[];
  employees: Employee[];
  isSelected: boolean;
  onSelect: (time: string) => void;
  isMobile: boolean;
  isConflict: boolean;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ 
  time, 
  dayIndex, 
  shifts, 
  employees, 
  isSelected, 
  onSelect,
  isMobile,
  isConflict
}) => {
  const timeInMinutes = timeToMinutes(time);
  const isOpen = isWithinOpeningHours(time, dayIndex);
  
  // Récupérer les shifts qui couvrent ce créneau horaire
  const shiftsForTimeSlot = shifts.filter(shift => {
    const shiftStartMinutes = timeToMinutes(shift.startTime);
    const shiftEndMinutes = timeToMinutes(shift.endTime);
    
    if (shiftEndMinutes < shiftStartMinutes) {
      // Le shift dépasse minuit
      return shift.day === dayIndex && 
             (timeInMinutes >= shiftStartMinutes || timeInMinutes < shiftEndMinutes);
    } else {
      return shift.day === dayIndex && 
             timeInMinutes >= shiftStartMinutes && 
             timeInMinutes < shiftEndMinutes;
    }
  });
  
  // Récupérer les IDs uniques des employés pour ce créneau
  const employeeIds = [...new Set(shiftsForTimeSlot.flatMap(shift => shift.employeeIds))];
  
  // Récupérer les détails des employés
  const employeesForTimeSlot = employees.filter(emp => employeeIds.includes(emp.id));
  
  // Définir les couleurs en fonction de l'état
  const getBgColor = () => {
    if (isSelected) return "blue.100";
    if (!isOpen) return "gray.100";
    if (isConflict) return "red.100";
    if (employeeIds.length === 0) return "white";
    
    const isRushHour = (time.startsWith('12:') || time.startsWith('13:') || 
                        time.startsWith('19:') || time.startsWith('20:'));
    
    const isEvening = parseInt(time.split(':')[0]) >= 17 && parseInt(time.split(':')[0]) < 22;
    const minEmployees = isRushHour ? 3 : (isEvening ? 2 : 1);
    
    if (employeeIds.length < minEmployees) return "orange.100";
    return "green.100";
  };
  
  const getBorderColor = () => {
    if (isSelected) return "blue.500";
    if (!isOpen) return "gray.300";
    if (isConflict) return "red.500";
    if (employeeIds.length === 0) return "gray.300";
    
    const isRushHour = (time.startsWith('12:') || time.startsWith('13:') || 
                        time.startsWith('19:') || time.startsWith('20:'));
    
    const isEvening = parseInt(time.split(':')[0]) >= 17 && parseInt(time.split(':')[0]) < 22;
    const minEmployees = isRushHour ? 3 : (isEvening ? 2 : 1);
    
    if (employeeIds.length < minEmployees) return "orange.500";
    return "green.500";
  };
  
  const bgColor = getBgColor();
  const borderColor = getBorderColor();
  
  // Calcul de la couverture du créneau
  const getTimeSlotStatus = () => {
    if (!isOpen) return { status: 'closed', message: 'Restaurant fermé' };
    
    const isRushHour = (time.startsWith('12:') || time.startsWith('13:') || 
                        time.startsWith('19:') || time.startsWith('20:'));
    
    const isEvening = parseInt(time.split(':')[0]) >= 17 && parseInt(time.split(':')[0]) < 22;
    const minEmployees = isRushHour ? 3 : (isEvening ? 2 : 1);
    
    if (employeeIds.length === 0) return { 
      status: 'empty', 
      message: `Aucun employé assigné (${minEmployees} requis)` 
    };
    
    if (employeeIds.length < minEmployees) return { 
      status: 'insufficient', 
      message: `Personnel insuffisant: ${employeeIds.length}/${minEmployees}` 
    };
    
    return { 
      status: 'valid', 
      message: `Couverture correcte: ${employeeIds.length}/${minEmployees}` 
    };
  };
  
  const timeSlotStatus = getTimeSlotStatus();
  
  return (
    <Tooltip 
      label={timeSlotStatus.message} 
      placement="top" 
      hasArrow
    >
      <Box
        onClick={() => isOpen && onSelect(time)}
        borderWidth="1px"
        borderRadius="md"
        p={2}
        bg={bgColor}
        borderColor={borderColor}
        cursor={isOpen ? "pointer" : "default"}
        opacity={isOpen ? 1 : 0.6}
        transition="all 0.2s"
        _hover={isOpen ? { transform: 'scale(1.05)', shadow: 'sm' } : {}}
        minH={isMobile ? "60px" : "80px"}
        position="relative"
      >
        <VStack spacing={1} align="stretch">
          <HStack justifyContent="space-between">
            <Text 
              fontSize={isMobile ? "xs" : "sm"} 
              fontWeight="bold"
              color={!isOpen ? "gray.500" : "inherit"}
            >
              {time}
            </Text>
            
            {isOpen && (
              <Badge 
                colorScheme={
                  timeSlotStatus.status === 'valid' ? 'green' : 
                  timeSlotStatus.status === 'insufficient' ? 'orange' : 'gray'
                }
                fontSize="2xs"
                variant="solid"
                borderRadius="full"
              >
                {employeeIds.length}
              </Badge>
            )}
          </HStack>
          
          {!isMobile && employeesForTimeSlot.length > 0 && (
            <VStack spacing={0} align="stretch" mt={1}>
              {employeesForTimeSlot.slice(0, 3).map(employee => (
                <Text key={employee.id} fontSize="xs" noOfLines={1}>
                  {employee.name}
                </Text>
              ))}
              {employeesForTimeSlot.length > 3 && (
                <Text fontSize="xs" color="gray.500">
                  +{employeesForTimeSlot.length - 3} autres
                </Text>
              )}
            </VStack>
          )}
        </VStack>
      </Box>
    </Tooltip>
  );
};

export default TimeSlot; 