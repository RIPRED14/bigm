import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Select, 
  VStack, 
  HStack, 
  Avatar,
  Text,
  Badge,
  useToast,
  Checkbox,
  Grid,
  GridItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Heading,
  IconButton,
  Divider,
  Flex,
  useDisclosure
} from '@chakra-ui/react';
import { AddShiftFormProps, ShiftFormValues, Employee } from '../types';
import { generateTimeOptions, addHoursToTime, hasExtendedDay } from '../utils/time';
import { useIsMobile } from '../../../hooks/use-mobile';
import { MdPerson, MdCheck, MdAccessTime, MdToday } from 'react-icons/md';

const AddShiftForm: React.FC<AddShiftFormProps> = ({ 
  employees, 
  onSubmit, 
  onCancel, 
  preselectedDay = null,
  preselectedTime = null,
  preselectedEmployeeIds = [],
  isEditMode = false,
  preselectedEndTime = null
}) => {
  const isMobile = useIsMobile();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [formValues, setFormValues] = useState<ShiftFormValues>({
    employeeIds: preselectedEmployeeIds,
    day: preselectedDay !== null ? preselectedDay : 0,
    startTime: preselectedTime || '11:00',
    endTime: preselectedEndTime || (preselectedTime ? addHoursToTime(preselectedTime, 4) : '15:00'),
    isNightShift: false
  });
  
  const daysOfWeek = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
  ];
  
  // Déterminer si on a des jours avec horaires prolongés
  const hasExtendedDays = hasExtendedDay([formValues.day]);
  
  // Générer les options de temps
  const startTimeOptions = generateTimeOptions(hasExtendedDays);
  
  // Calculer les options d'heure de fin basées sur l'heure de début
  const calculateEndTimeOptions = (startTime: string): string[] => {
    const options: string[] = [];
    let currentHour = parseInt(startTime.split(':')[0]);
    const currentMinute = parseInt(startTime.split(':')[1]);
    
    // Toujours avoir au moins 4h de shift
    for (let i = 0; i < 12; i++) {
      currentHour += 1;
      if (currentHour >= 24) {
        currentHour -= 24;
      }
      
      options.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
    }
    
    return options;
  };
  
  const endTimeOptions = calculateEndTimeOptions(formValues.startTime);
  
  const handleEmployeeToggle = (employeeId: number) => {
    setFormValues(prev => {
      const newEmployeeIds = prev.employeeIds.includes(employeeId)
        ? prev.employeeIds.filter(id => id !== employeeId)
        : [...prev.employeeIds, employeeId];
        
      return { ...prev, employeeIds: newEmployeeIds };
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startTime') {
      // Mettre à jour l'heure de fin en fonction de l'heure de début
      const newEndTime = addHoursToTime(value, 4);
      setFormValues(prev => ({ ...prev, [name]: value, endTime: newEndTime }));
    } else if (name === 'day') {
      // Vérifier si c'est un jour avec horaires étendus
      const dayIndex = parseInt(value);
      const isExtendedDay = dayIndex === 3 || dayIndex === 4 || dayIndex === 5; // Jeudi, Vendredi, Samedi
      
      setFormValues(prev => ({
        ...prev,
        [name]: dayIndex,
        // Réinitialiser l'horaire de fin si on change de type de jour
        ...(prev.endTime > '23:00' && !isExtendedDay ? { endTime: '23:00' } : {})
      }));
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formValues.employeeIds.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un employé",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }
    
    onSubmit(formValues);
  };
  
  // Filtrer les employés par disponibilité et préférence de créneau
  const getEmployeeFilteredList = (allEmployees: Employee[]): Employee[] => {
    const hour = parseInt(formValues.startTime.split(':')[0]);
    const isEveningShift = hour >= 17;
    const isMorningShift = hour < 17;
    
    return allEmployees.filter(employee => {
      // Si l'employé a des préférences et qu'elles ne correspondent pas au créneau
      if (employee.preferredTimes && employee.preferredTimes.length > 0) {
        const prefersEvening = employee.preferredTimes.includes('evening');
        const prefersMorning = employee.preferredTimes.includes('morning');
        
        // Si l'employé préfère uniquement un créneau qui ne correspond pas, le filtrer
        if ((isEveningShift && !prefersEvening && prefersMorning) ||
            (isMorningShift && !prefersMorning && prefersEvening)) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Trier les employés: présélectionnés d'abord, puis par préférence de créneau
  const filteredEmployees = getEmployeeFilteredList(employees);
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    // Les employés présélectionnés en premier
    const aIsPreselected = formValues.employeeIds.includes(a.id);
    const bIsPreselected = formValues.employeeIds.includes(b.id);
    
    if (aIsPreselected && !bIsPreselected) return -1;
    if (!aIsPreselected && bIsPreselected) return 1;
    
    // Ensuite par préférence de créneau
    const hour = parseInt(formValues.startTime.split(':')[0]);
    const isEveningShift = hour >= 17;
    
    const aHasPreference = a.preferredTimes && a.preferredTimes.length > 0;
    const bHasPreference = b.preferredTimes && b.preferredTimes.length > 0;
    
    if (aHasPreference && !bHasPreference) return -1;
    if (!aHasPreference && bHasPreference) return 1;
    
    if (aHasPreference && bHasPreference) {
      const aPrefersThisShift = isEveningShift 
        ? a.preferredTimes?.includes('evening')
        : a.preferredTimes?.includes('morning');
        
      const bPrefersThisShift = isEveningShift 
        ? b.preferredTimes?.includes('evening')
        : b.preferredTimes?.includes('morning');
        
      if (aPrefersThisShift && !bPrefersThisShift) return -1;
      if (!aPrefersThisShift && bPrefersThisShift) return 1;
    }
    
    // Finalement par ordre alphabétique
    return a.name.localeCompare(b.name);
  });
  
  // Liste des employés sélectionnés pour affichage
  const selectedEmployees = sortedEmployees.filter(emp => 
    formValues.employeeIds.includes(emp.id)
  );
  
  const renderMobileForm = () => (
    <>
      <Box as="form" onSubmit={handleSubmit} width="100%">
        <VStack spacing={3} align="stretch">
          <FormControl isRequired mb={4}>
            <HStack align="center" mb={1}>
              <MdToday />
              <FormLabel fontSize="sm" mb={0}>Jour</FormLabel>
            </HStack>
            <Select 
              name="day" 
              value={formValues.day}
              onChange={handleChange}
              size="sm"
              borderRadius="md"
            >
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </Select>
          </FormControl>
          
          <HStack spacing={2} mb={4}>
            <FormControl isRequired flex={1}>
              <HStack align="center" mb={1}>
                <MdAccessTime />
                <FormLabel fontSize="sm" mb={0}>Début</FormLabel>
              </HStack>
              <Select 
                name="startTime" 
                value={formValues.startTime}
                onChange={handleChange}
                size="sm"
                borderRadius="md"
              >
                {startTimeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl isRequired flex={1}>
              <HStack align="center" mb={1}>
                <MdAccessTime />
                <FormLabel fontSize="sm" mb={0}>Fin</FormLabel>
              </HStack>
              <Select 
                name="endTime" 
                value={formValues.endTime}
                onChange={handleChange}
                size="sm"
                borderRadius="md"
              >
                {endTimeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </Select>
            </FormControl>
          </HStack>
          
          <FormControl mb={4}>
            <HStack align="center" mb={2} justify="space-between">
              <HStack>
                <MdPerson />
                <FormLabel fontSize="sm" mb={0}>Employés ({formValues.employeeIds.length})</FormLabel>
              </HStack>
              <Button 
                size="xs" 
                colorScheme="blue" 
                variant="outline"
                onClick={onOpen}
              >
                Sélectionner
              </Button>
            </HStack>
            
            {selectedEmployees.length > 0 ? (
              <Flex wrap="wrap" gap={2}>
                {selectedEmployees.map(emp => (
                  <Badge 
                    key={emp.id} 
                    colorScheme="teal" 
                    borderRadius="full" 
                    px={2} py={1}
                    display="flex" 
                    alignItems="center"
                  >
                    {emp.name}
                  </Badge>
                ))}
              </Flex>
            ) : (
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Aucun employé sélectionné
              </Text>
            )}
          </FormControl>
          
          <HStack spacing={3} justify="space-between" mt={2}>
            <Button 
              onClick={onCancel} 
              size="sm" 
              width="45%"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              colorScheme="teal" 
              size="sm"
              width="55%"
            >
              {isEditMode ? "Modifier" : "Ajouter"}
            </Button>
          </HStack>
        </VStack>
      </Box>
      
      <Drawer isOpen={isOpen} onClose={onClose} placement="bottom" size="full">
        <DrawerOverlay />
        <DrawerContent borderTopRadius="xl">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Sélectionner des employés
          </DrawerHeader>
          <DrawerBody p={3}>
            <VStack align="stretch" spacing={2} maxHeight="60vh" overflowY="auto">
              {sortedEmployees.map(employee => (
                <HStack
                  key={employee.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={formValues.employeeIds.includes(employee.id) ? "teal.500" : "gray.200"}
                  bg={formValues.employeeIds.includes(employee.id) ? "teal.50" : "white"}
                  cursor="pointer"
                  onClick={() => handleEmployeeToggle(employee.id)}
                  position="relative"
                >
                  <Avatar 
                    size="sm" 
                    name={employee.name} 
                    src={employee.avatarUrl} 
                    mr={2}
                  />
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="medium" fontSize="sm">{employee.name}</Text>
                    <Text fontSize="xs" color="gray.600">{employee.weeklyHours}h/semaine</Text>
                  </VStack>
                  
                  {employee.preferredTimes && employee.preferredTimes.length > 0 && (
                    <HStack spacing={1}>
                      {employee.preferredTimes.includes('morning') && (
                        <Badge size="sm" colorScheme="yellow" fontSize="2xs">Matin</Badge>
                      )}
                      {employee.preferredTimes.includes('evening') && (
                        <Badge size="sm" colorScheme="purple" fontSize="2xs">Soir</Badge>
                      )}
                      {employee.preferredTimes.includes('night') && (
                        <Badge size="sm" colorScheme="blue" fontSize="2xs">Nuit</Badge>
                      )}
                    </HStack>
                  )}
                  
                  {formValues.employeeIds.includes(employee.id) && (
                    <IconButton
                      icon={<MdCheck />}
                      aria-label="Sélectionné"
                      size="xs"
                      isRound
                      colorScheme="teal"
                      position="absolute"
                      top={2}
                      right={2}
                    />
                  )}
                </HStack>
              ))}
            </VStack>
            
            <Button 
              mt={4} 
              colorScheme="teal" 
              width="100%" 
              onClick={onClose}
            >
              Confirmer la sélection ({formValues.employeeIds.length})
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
  
  const renderDesktopForm = () => (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Jour</FormLabel>
          <Select 
            name="day" 
            value={formValues.day}
            onChange={handleChange}
          >
            {daysOfWeek.map((day, index) => (
              <option key={index} value={index}>{day}</option>
            ))}
          </Select>
        </FormControl>
        
        <Grid templateColumns="1fr 1fr" gap={4}>
          <GridItem>
            <FormControl isRequired>
              <FormLabel>Heure de début</FormLabel>
              <Select 
                name="startTime" 
                value={formValues.startTime}
                onChange={handleChange}
              >
                {startTimeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          
          <GridItem>
            <FormControl isRequired>
              <FormLabel>Heure de fin</FormLabel>
              <Select 
                name="endTime" 
                value={formValues.endTime}
                onChange={handleChange}
              >
                {endTimeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
        </Grid>
        
        <FormControl>
          <FormLabel>Employés</FormLabel>
          <VStack align="stretch" spacing={2} maxHeight="250px" overflowY="auto" px={2} py={1}>
            {sortedEmployees.map(employee => (
              <HStack
                key={employee.id}
                p={2}
                borderWidth="1px"
                borderRadius="md"
                borderColor={formValues.employeeIds.includes(employee.id) ? "teal.500" : "gray.200"}
                bg={formValues.employeeIds.includes(employee.id) ? "teal.50" : "white"}
                cursor="pointer"
                onClick={() => handleEmployeeToggle(employee.id)}
                _hover={{ borderColor: "teal.300" }}
                transition="all 0.2s"
              >
                <Avatar 
                  size="sm" 
                  name={employee.name} 
                  src={employee.avatarUrl} 
                />
                <Text flex={1}>{employee.name}</Text>
                
                {employee.preferredTimes && employee.preferredTimes.length > 0 && (
                  <HStack spacing={1}>
                    {employee.preferredTimes.includes('morning') && (
                      <Badge colorScheme="yellow">Matin</Badge>
                    )}
                    {employee.preferredTimes.includes('evening') && (
                      <Badge colorScheme="purple">Soir</Badge>
                    )}
                    {employee.preferredTimes.includes('night') && (
                      <Badge colorScheme="blue">Nuit</Badge>
                    )}
                  </HStack>
                )}
              </HStack>
            ))}
          </VStack>
        </FormControl>
        
        <HStack spacing={2} justify="flex-end">
          <Button onClick={onCancel} variant="outline">
            Annuler
          </Button>
          <Button type="submit" colorScheme="teal">
            {isEditMode ? "Modifier" : "Ajouter"}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );

  return isMobile ? renderMobileForm() : renderDesktopForm();
}

export default AddShiftForm; 