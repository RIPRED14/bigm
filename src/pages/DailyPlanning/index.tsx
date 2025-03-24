import React, { useState } from 'react';
import { 
  Box, Container, Flex, Heading, Button, IconButton, Grid, Badge, Text
} from '@chakra-ui/react';
import { 
  MdAdd, MdToday, MdChevronLeft, MdChevronRight, MdWarning, MdCalendarViewWeek, MdShare
} from 'react-icons/md';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

import WeekSummary from './components/WeekSummary';
import { useIsMobile } from '../../hooks/use-mobile';

// Types simplifiés
type Shift = {
  id: number;
  employeeIds: number[];
  day: number;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict';
};

type Employee = {
  id: number;
  name: string;
  avatarUrl?: string;
  weeklyHours: number;
};

type ShiftFormValues = {
  employeeIds: number[];
  day: number;
  startTime: string;
  endTime: string;
};

// Données mockées réduites
const mockEmployees: Employee[] = [
  { id: 1, name: 'Jean D.', weeklyHours: 35 },
  { id: 2, name: 'Marie D.', weeklyHours: 30 },
  { id: 3, name: 'Paul M.', weeklyHours: 25 }
];

const mockShifts: Shift[] = [
  { id: 1, employeeIds: [1], day: 0, startTime: '11:00', endTime: '15:00', status: 'confirmed' },
  { id: 2, employeeIds: [2, 3], day: 0, startTime: '17:00', endTime: '22:00', status: 'confirmed' }
];

const DailyPlanning: React.FC = () => {
  const isMobile = useIsMobile();
  
  // États de base
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [showForm, setShowForm] = useState<boolean>(false);
  
  // Index du jour (0 = Lundi, 6 = Dimanche)
  const dayIndex = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
  
  // Créneaux horaires simplifiés
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  
  // Fonctions utilitaires minimales
  const getShiftsForDay = (day: number) => shifts.filter(shift => shift.day === day);
  
  const isTimeInShift = (time: string, shift: Shift) => {
    const [timeHour, timeMin] = time.split(':').map(Number);
    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const [endHour, endMin] = shift.endTime.split(':').map(Number);
    
    const timeValue = timeHour * 60 + timeMin;
    const startValue = startHour * 60 + startMin;
    const endValue = endHour * 60 + endMin;
    
    return timeValue >= startValue && timeValue < endValue;
  };
  
  // Handler simplifié
  const handleAddShift = (values: ShiftFormValues) => {
    const newShift: Shift = {
      id: Math.max(0, ...shifts.map(s => s.id)) + 1,
      employeeIds: values.employeeIds,
      day: values.day,
      startTime: values.startTime,
      endTime: values.endTime,
      status: 'confirmed'
    };
    
    setShifts([...shifts, newShift]);
    setShowForm(false);
  };
  
  // Générer résumé de la semaine simplifié
  const weekSummary = [0, 1, 2, 3, 4, 5, 6].map(day => ({
    dayIndex: day,
    employeeCount: getShiftsForDay(day).flatMap(s => s.employeeIds).length,
    totalHours: getShiftsForDay(day).reduce((total, shift) => {
      const [startHour, startMin] = shift.startTime.split(':').map(Number);
      const [endHour, endMin] = shift.endTime.split(':').map(Number);
      return total + ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;
    }, 0),
    status: getShiftsForDay(day).length < 2 ? 'incomplete' : 'valid'
  }));
  
  return (
    <Container maxW="container.xl" p={isMobile ? 2 : 4}>
      <Flex direction="column" gap={3}>
        {/* En-tête avec navigation */}
        <Flex justify="space-between" wrap="wrap" gap={2}>
          <Heading size={isMobile ? "md" : "lg"} display="flex" alignItems="center">
            <Box as={MdCalendarViewWeek} mr={2} />Planning
          </Heading>
          
          <Flex>
            <IconButton aria-label="Précédent" onClick={() => setCurrentDate(d => subDays(d, 1))} size="sm" icon={<MdChevronLeft />} />
            <Button size="sm" onClick={() => setCurrentDate(new Date())} colorScheme="blue">
              {format(currentDate, isMobile ? 'dd/MM' : 'dd MMM yyyy', { locale: fr })}
            </Button>
            <IconButton aria-label="Suivant" onClick={() => setCurrentDate(d => addDays(d, 1))} size="sm" icon={<MdChevronRight />} />
          </Flex>
        </Flex>

        {/* Boutons d'action */}
        <Flex justify="flex-end">
          <Flex gap={2}>
            <Button size="sm" colorScheme="green" variant="outline" leftIcon={<MdShare />}>Partager</Button>
            <Button size="sm" colorScheme="blue" onClick={() => setShowForm(true)} leftIcon={<MdAdd />}>Ajouter</Button>
          </Flex>
        </Flex>

        {/* Vue semaine */}
        <WeekSummary 
          summary={weekSummary} 
          shifts={shifts}
          employees={mockEmployees}
          isMobile={isMobile}
          currentDate={currentDate}
        />
        
        {/* Grille des horaires */}
        <Box p={3} bg="white" borderRadius="lg" boxShadow="sm" overflowX="auto">
          <Heading size="sm" mb={3}>
            <Box as={MdToday} display="inline" mr={1} />
            {format(currentDate, 'EEEE d MMMM', { locale: fr })}
          </Heading>
          
          <Grid templateColumns="auto repeat(8, minmax(70px, 1fr))" gap={1} minWidth={isMobile ? "700px" : "auto"}>
            {/* En-tête avec les heures */}
            <Box w="60px"></Box>
            {timeSlots.map(time => (
              <Box key={time} p={1} textAlign="center" fontSize="xs" fontWeight="bold" bg="gray.100" borderRadius="sm">
                {time}
              </Box>
            ))}
            
            {/* Rangée des shifts */}
            <Box p={1} fontWeight="bold" fontSize="sm" bg="gray.100" borderRadius="sm">Shifts</Box>
            
            {timeSlots.map(time => {
              // Trouver les shifts pour ce créneau
              const shiftsForTime = shifts.filter(s => s.day === dayIndex && isTimeInShift(time, s));
              
              return (
                <Box
                  key={time}
                  p={1}
                  bg={shiftsForTime.length ? "blue.50" : "white"}
                  borderRadius="sm"
                  cursor="pointer"
                  onClick={() => setShowForm(true)}
                  border="1px solid"
                  borderColor="gray.200"
                  h="40px"
                  overflow="hidden"
                >
                  {shiftsForTime.length > 0 ? (
                    <Flex wrap="wrap" justify="center" fontSize="10px">
                      {shiftsForTime.flatMap(s => s.employeeIds).map(empId => {
                        const emp = mockEmployees.find(e => e.id === empId);
                        return (
                          <Text key={empId} fontWeight="bold" mx={0.5} color="blue.700" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                            {emp?.name.split(' ')[0]}
                          </Text>
                        );
                      })}
                    </Flex>
                  ) : (
                    <Text textAlign="center" fontSize="xs" color="gray.400">+</Text>
                  )}
                </Box>
              );
            })}
          </Grid>
        </Box>
      </Flex>
      
      {/* Formulaire d'ajout de shift en version simplifiée */}
      {showForm && (
        <Box
          position="fixed"
          top="0"
          right="0"
          height="100vh"
          width={isMobile ? "100%" : "350px"}
          bg="white"
          boxShadow="-2px 0 10px rgba(0,0,0,0.1)"
          zIndex={1000}
          p={3}
          overflowY="auto"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="sm">Ajouter un shift</Heading>
            <Box 
              as="button" 
              onClick={() => setShowForm(false)} 
              cursor="pointer"
              w="24px"
              h="24px"
              borderRadius="full"
              bg="gray.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="sm"
            >
              ✕
            </Box>
          </Flex>
          
          <Flex direction="column" gap={3}>
            <Button colorScheme="blue" size="sm" onClick={() => {
              handleAddShift({
                employeeIds: [1],
                day: dayIndex,
                startTime: '11:00',
                endTime: '15:00'
              });
            }}>
              Ajouter Shift Matin
            </Button>
            
            <Button colorScheme="blue" size="sm" onClick={() => {
              handleAddShift({
                employeeIds: [2, 3],
                day: dayIndex,
                startTime: '17:00',
                endTime: '22:00'
              });
            }}>
              Ajouter Shift Soir
            </Button>
          </Flex>
        </Box>
      )}
    </Container>
  );
};

export default DailyPlanning; 