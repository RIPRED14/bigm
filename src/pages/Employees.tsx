import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  MoreHorizontal, 
  CalendarDays,
  UserPlus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmployeeForm, EmployeeFormValues } from '@/components/employees/EmployeeForm';
import { Employee } from '@/lib/supabase';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

// Données mockées pour le fallback si Supabase n'est pas configuré
const employeesData: Employee[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    availability: 'Full-Time',
    avatarUrl: '',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    availability: 'Part-Time',
    avatarUrl: '',
  },
  {
    id: 3,
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    phone: '(555) 456-7890',
    availability: 'Weekends Only',
    avatarUrl: '',
  },
  {
    id: 4,
    name: 'Emily Wilson',
    email: 'emily.w@example.com',
    phone: '(555) 789-0123',
    availability: 'Full-Time',
    avatarUrl: '',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.b@example.com',
    phone: '(555) 234-5678',
    availability: 'Evenings Only',
    avatarUrl: '',
  },
];

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>(employeesData);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const isMobile = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // Vérification renforcée que nous sommes bien dans l'interface manager
  useEffect(() => {
    console.log('Composant Employees chargé correctement dans l\'interface admin');
    // Nous ne modifions plus l'état de navigation ici,
    // laissons le système de navigation fonctionner normalement
  }, []);

  // Charger les employés depuis Supabase au chargement de la page
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        
        // Commenté temporairement jusqu'à la configuration correcte de Supabase
        // const fetchedEmployees = await getEmployees();
        // if (fetchedEmployees.length > 0) {
        //   setEmployees(fetchedEmployees);
        // } else {
        //   // Fallback aux données mockées si aucun employé n'est trouvé
        //   // (peut se produire si la table n'est pas encore créée ou si Supabase n'est pas configuré)
        //   setEmployees(employeesData);
        // }
        
        // Utiliser directement les données mockées pour l'instant
        setEmployees(employeesData);
        
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les employés. Utilisation des données locales.",
          variant: "destructive",
        });
        // En cas d'erreur, on utilise aussi les données mockées
        setEmployees(employeesData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [toast]);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone.includes(searchTerm)
  );

  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleAddEmployee = async (data: EmployeeFormValues & { avatarUrl?: string }) => {
    try {
      setIsLoading(true);
      
      const newEmployeeData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        availability: data.availability,
        avatarUrl: data.avatarUrl || '',
      };

      const newEmployee = await addEmployee(newEmployeeData);
      
      if (newEmployee) {
        setEmployees([...employees, newEmployee]);
        toast({
          title: "Succès",
          description: "Employé ajouté avec succès",
        });
      } else {
        // Fallback si Supabase n'est pas configuré
        const fallbackEmployee: Employee = {
          ...newEmployeeData,
          id: employees.length + 1,
        };
        setEmployees([...employees, fallbackEmployee]);
      }
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'employé",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = async (data: EmployeeFormValues & { avatarUrl?: string }) => {
    if (!selectedEmployee) return;
    
    try {
      setIsLoading(true);
      
      const updatedData = { 
        name: data.name,
        email: data.email,
        phone: data.phone,
        availability: data.availability,
        avatarUrl: data.avatarUrl || selectedEmployee.avatarUrl,
      };
      
      const updatedEmployee = await updateEmployee(selectedEmployee.id, updatedData);
      
      if (updatedEmployee) {
        // Mise à jour réussie dans Supabase
        setEmployees(employees.map(emp => 
          emp.id === selectedEmployee.id ? updatedEmployee : emp
        ));
        toast({
          title: "Succès",
          description: "Employé mis à jour avec succès",
        });
      } else {
        // Fallback si Supabase n'est pas configuré
        setEmployees(employees.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, ...updatedData } 
            : emp
        ));
      }
      
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'employé",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      setIsLoading(true);
      
      const success = await deleteEmployee(selectedEmployee.id);
      
      if (success) {
        // Suppression réussie dans Supabase
        setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
        toast({
          title: "Succès",
          description: "Employé supprimé avec succès",
        });
      } else {
        // Fallback si Supabase n'est pas configuré
        setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
      }
      
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'employé",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions pour les actions sur les employés
  const handleViewSchedule = (employeeId: number) => {
    // Rediriger vers le planning avec un filtre sur l'employé sélectionné
    // Note: Nous utilisons state pour rester dans l'interface admin
    navigate('/planning', { 
      state: { 
        from: 'adminInterface',
        employeeFilter: employeeId 
      } 
    });
  };

  return (
    <PageContainer className={isMobile ? "pt-4" : "pt-6"}>
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between mb-4'}`}>
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>Gestion des Employés</h1>
          {!isMobile && <p className="text-sm text-muted-foreground">Gérez votre équipe et leurs disponibilités</p>}
        </div>
        
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-3'}`}>
          <div className={`relative ${isMobile ? 'w-full' : 'w-64'}`}>
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={() => setShowFilters(!showFilters)}>
              <Filter className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} mr-1`} />
              Filtres
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} size={isMobile ? "sm" : "default"}>
              <Plus className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} mr-1`} />
              {isMobile ? 'Ajouter' : 'Nouvel Employé'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filtres - affiché uniquement si showFilters est vrai */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-medium mb-1">Disponibilité</p>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Toutes</option>
                  <option value="Full-Time">Temps plein</option>
                  <option value="Part-Time">Temps partiel</option>
                  <option value="Weekends Only">Weekends seulement</option>
                  <option value="Evenings Only">Soirs seulement</option>
                </select>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Statut</p>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Tous</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="secondary" size="sm" className="w-full sm:w-auto">Appliquer</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vue mobile - cartes au lieu de tableau */}
      {isMobile ? (
        <div className="space-y-2">
          {currentEmployees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-3">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src={employee.avatarUrl} />
                    <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{employee.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                  </div>
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedEmployee(employee);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/employee-planning/${employee.id}`)}>
                          <CalendarDays className="h-4 w-4 mr-2" />
                          Planning
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="px-3 pb-3 pt-0 flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">{employee.availability}</Badge>
                  <span className="text-xs text-muted-foreground">{employee.phone}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Vue desktop - tableau */
        <div className="rounded-md border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Disponibilité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : currentEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Aucun employé trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                currentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={employee.avatarUrl} />
                          <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {employee.name}
                      </div>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.availability}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/employee-planning/${employee.id}`)}
                        >
                          <CalendarDays className="h-4 w-4" />
                          <span className="sr-only">Planning</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination - adapté pour mobile */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {isMobile ? (
              <PaginationItem>
                <PaginationLink>
                  {currentPage} / {totalPages}
                </PaginationLink>
              </PaginationItem>
            ) : (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    isActive={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialogues pour ajouter/éditer/supprimer - inchangés */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details for the new employee below.
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm 
            onSubmit={handleAddEmployee}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the employee's information below.
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeForm 
              defaultValues={{
                name: selectedEmployee.name,
                email: selectedEmployee.email,
                phone: selectedEmployee.phone,
                availability: selectedEmployee.availability,
                avatarUrl: selectedEmployee.avatarUrl,
              }}
              onSubmit={handleEditEmployee}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Employees;
