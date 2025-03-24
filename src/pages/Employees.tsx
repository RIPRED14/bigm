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
  Eye,
  ChevronLeft,
  ChevronRight,
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
  const isMobileHook = useIsMobile();
  // Définir un état local pour éviter les problèmes de référence
  const [isMobile, setIsMobile] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // Synchroniser l'état local avec le hook
  useEffect(() => {
    setIsMobile(isMobileHook);
  }, [isMobileHook]);

  // Debug - afficher dans la console
  useEffect(() => {
    console.log('État mobile dans Employees:', isMobile, window.innerWidth);
  }, [isMobile]);

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
    <PageContainer className={isMobile ? "pt-0 px-0" : "pt-6"}>
      <div className={`flex ${isMobile ? 'flex-col gap-1.5' : 'items-center justify-between mb-4'}`}>
        <div className={isMobile ? "bg-gradient-to-r from-primary/10 to-primary/5 p-2 rounded-lg mx-1" : ""}>
          <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>Gestion des Employés</h1>
          <p className={`text-sm text-muted-foreground ${isMobile ? "mt-0.5 text-xs" : ""}`}>
            {employees.length} employés enregistrés
          </p>
        </div>
        
        {isMobile ? (
          <div className="px-1 w-full mt-2">
            <div className="relative w-full mb-2">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                className="pl-8 h-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full bg-muted/30 rounded-md p-0.5 h-8">
              <Button 
                variant={showFilters ? "default" : "ghost"} 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 h-7 text-xs rounded-sm px-1"
              >
                <Filter className="h-3 w-3 mr-1" />
                Filtres
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate('/planning-viewer')} 
                className="flex-1 h-7 text-xs rounded-sm px-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Voir
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)} 
                className="flex-1 h-7 text-xs rounded-sm px-1"
              >
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary/90' : ''}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtres
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/planning-viewer')} 
            >
              <Eye className="h-4 w-4 mr-1" />
              Voir Plannings
            </Button>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouvel Employé
            </Button>
          </div>
        )}
      </div>

      {/* Filtres optimisés */}
      {showFilters && (
        <Card className={`${isMobile ? 'mb-2 mx-1 shadow-none border border-border/40' : 'mb-3 shadow-sm'} overflow-hidden`}>
          <CardContent className={`p-0 ${isMobile ? 'animate-in fade-in-50 zoom-in-95' : ''}`}>
            <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gradient-to-b from-primary/5 to-transparent`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium mb-1 text-muted-foreground">Statut</p>
                  <select className={`w-full ${isMobile ? 'h-7 text-xs' : 'h-9 text-sm'} rounded-md border border-input bg-background px-3 py-1 focus:outline-none focus:ring-2 focus:ring-ring`}>
                    <option value="">Tous</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button variant="secondary" size="sm" className={`w-full sm:w-auto ${isMobile ? 'h-7 text-xs' : ''}`}>
                    <Search className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-3.5 w-3.5 mr-1.5'}`} />
                    Appliquer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forcer la vue mobile si sur téléphone */}
      {isMobile ? (
        <div className="space-y-1.5 px-1">
          {currentEmployees.length === 0 ? (
            <Card className="py-5 px-3">
              <div className="flex flex-col items-center justify-center text-center">
                <UserPlus className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <h3 className="font-medium text-sm">Aucun employé trouvé</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Ajoutez votre premier employé ou modifiez vos filtres</p>
                <Button 
                  className="mt-3 text-xs h-8" 
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1.5" />
                  Ajouter un employé
                </Button>
              </div>
            </Card>
          ) : (
            currentEmployees.map((employee) => (
              <Card 
                key={employee.id} 
                className="overflow-hidden shadow-sm border-border/40 hover:bg-muted/30 active:bg-muted/50 transition-colors"
              >
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 gap-1">
                    {/* Informations de l'employé */}
                    <div className="flex items-center p-2.5">
                      <Avatar className="h-9 w-9 mr-2.5 border border-primary/10">
                        <AvatarImage src={employee.avatarUrl} />
                        <AvatarFallback className="bg-primary/5 text-xs">{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate max-w-[230px]">{employee.name}</h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[230px]">{employee.email}</p>
                        <p className="text-xs text-muted-foreground">{employee.phone}</p>
                      </div>
                    </div>
                    
                    {/* Boutons d'action en bas */}
                    <div className="flex justify-between border-t border-border/30 px-0.5">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 flex-1 rounded-none text-xs py-1"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <div className="w-px h-8 bg-border/30" />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 flex-1 rounded-none text-xs py-1"
                        onClick={() => navigate(`/planning-viewer?employeeId=${employee.id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                      <div className="w-px h-8 bg-border/30" />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 flex-1 rounded-none text-destructive text-xs py-1"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Suppr.
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Vue desktop - tableau - suppression de la colonne Disponibilité */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Photo</TableHead>
                <TableHead className="w-[200px]">Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[150px]">Téléphone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-center">
                      <UserPlus className="h-10 w-10 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground mb-2">Aucun employé trouvé</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Ajouter un employé
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={employee.avatarUrl} />
                        <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/planning-viewer?employeeId=${employee.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/employee-planning/${employee.id}`)}>
                              <CalendarDays className="h-4 w-4 mr-2" />
                              Voir planning
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination optimisée */}
      {totalPages > 1 && (
        <div className={`${isMobile ? 'flex justify-center items-center mt-2 py-2' : 'mt-3'}`}>
          {isMobile ? (
            <div className="flex items-center bg-muted/20 rounded-full px-2 py-1 border border-border/30 shadow-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-6 w-6 p-0 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="mx-2 text-xs font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-6 w-6 p-0 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Dialogues pour ajouter/éditer/supprimer optimisés */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[380px] p-3 pt-5 rounded-lg' : 'sm:max-w-[500px]'}`}>
          <DialogHeader className={isMobile ? 'text-center mb-2' : ''}>
            <DialogTitle className={isMobile ? "text-base" : ""}>{isMobile ? 'Nouvel employé' : 'Ajouter un nouvel employé'}</DialogTitle>
            <DialogDescription className={isMobile ? 'text-center text-xs' : ''}>
              {isMobile ? 'Complétez les informations ci-dessous' : 'Entrez les informations du nouvel employé ci-dessous.'}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm 
            onSubmit={handleAddEmployee}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[380px] p-3 pt-5 rounded-lg' : 'sm:max-w-[500px]'}`}>
          <DialogHeader className={isMobile ? 'text-center mb-2' : ''}>
            <DialogTitle className={isMobile ? "text-base" : ""}>{isMobile ? 'Modifier' : 'Modifier l\'employé'}</DialogTitle>
            <DialogDescription className={isMobile ? 'text-center text-xs' : ''}>
              {isMobile ? 'Modifiez les informations' : 'Modifiez les informations de l\'employé ci-dessous.'}
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
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[380px] p-3 pt-5 rounded-lg' : 'sm:max-w-[425px]'}`}>
          <DialogHeader className={isMobile ? 'text-center mb-2' : ''}>
            <DialogTitle className="text-red-600 flex items-center justify-center gap-2">
              <Trash2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {isMobile ? 'Supprimer' : 'Confirmer la suppression'}
            </DialogTitle>
            <DialogDescription className={`${isMobile ? 'text-center text-xs' : ''} mt-2`}>
              Êtes-vous sûr de vouloir supprimer cet employé ?
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="my-2 p-2.5 border rounded-md bg-muted/30 flex items-center gap-2.5">
              <Avatar className="h-8 w-8 border border-primary/10">
                <AvatarImage src={selectedEmployee.avatarUrl} />
                <AvatarFallback className="bg-primary/5 text-xs">{selectedEmployee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{selectedEmployee.name}</p>
                <p className="text-xs text-muted-foreground">{selectedEmployee.email}</p>
              </div>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mb-3">Cette action est irréversible et supprimera toutes les données associées à cet employé.</p>
          
          <div className={`${isMobile ? 'flex flex-col' : 'flex justify-end'} gap-2 mt-3`}>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className={`${isMobile ? 'w-full order-2 h-8 text-xs' : ''}`}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEmployee}
              className={`${isMobile ? 'w-full order-1 h-8 text-xs' : ''}`}
            >
              <Trash2 className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-1.5'}`} />
              {isMobile ? 'Supprimer' : 'Supprimer définitivement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Employees;
