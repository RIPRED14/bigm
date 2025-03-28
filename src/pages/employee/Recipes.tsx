import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  Utensils,
  ChefHat,
  BookOpen,
  Clock3,
  AlarmClock,
  User
} from 'lucide-react';
import useIsMobile from '@/hooks/useIsMobile';

// Interface for recipe data
interface Ingredient {
  name: string;
  quantity: string;
  optional?: boolean;
}

interface RecipeStep {
  title: string;
  description: string;
  imageUrl?: string;
  tip?: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'burger' | 'side' | 'sauce' | 'dessert';
  difficulty: 'easy' | 'medium' | 'hard';
  preparationTime: number; // in minutes
  cookingTime: number; // in minutes
  servings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  createdBy: string;
  lastUpdated: Date;
  featured?: boolean;
}

// Mock data for recipes
const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Burger Classique',
    description: 'Notre burger signature avec steak haché, cheddar fondant, laitue croquante et sauce spéciale.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200',
    category: 'burger',
    difficulty: 'easy',
    preparationTime: 15,
    cookingTime: 10,
    servings: 1,
    ingredients: [
      { name: 'Pain à burger', quantity: '1 unité' },
      { name: 'Steak haché 150g', quantity: '1 unité' },
      { name: 'Cheddar', quantity: '1 tranche' },
      { name: 'Laitue', quantity: '2 feuilles' },
      { name: 'Tomate', quantity: '2 tranches' },
      { name: 'Oignon rouge', quantity: '2 rondelles' },
      { name: 'Cornichons', quantity: '3 tranches', optional: true },
      { name: 'Sauce spéciale', quantity: '15ml' }
    ],
    steps: [
      {
        title: 'Préparation du steak',
        description: 'Former une boule avec le steak haché et l\'aplatir pour former une galette d\'environ 1,5 cm d\'épaisseur. Assaisonner avec du sel et du poivre des deux côtés.',
        tip: 'Ne pas trop manipuler la viande pour garder un steak tendre'
      },
      {
        title: 'Cuisson',
        description: 'Dans une poêle chaude, cuire le steak 3-4 minutes de chaque côté pour une cuisson à point. Ajouter la tranche de cheddar sur le steak pendant la dernière minute de cuisson.'
      },
      {
        title: 'Toaster le pain',
        description: 'Couper le pain en deux et le faire toaster légèrement.'
      },
      {
        title: 'Montage',
        description: 'Tartiner la sauce spéciale sur les deux faces du pain. Placer la laitue et les tranches de tomate sur la base, puis ajouter le steak avec le fromage fondu. Ajouter les rondelles d\'oignon, les cornichons, et refermer avec la partie supérieure du pain.'
      }
    ],
    createdBy: 'Manager',
    lastUpdated: new Date(2023, 5, 15)
  },
  {
    id: '2',
    name: 'Burger Spécial Maison',
    description: 'Un délice gourmand avec double steak, bacon croustillant et sauce BBQ fumée.',
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=1200',
    category: 'burger',
    difficulty: 'medium',
    preparationTime: 20,
    cookingTime: 15,
    servings: 1,
    ingredients: [
      { name: 'Pain brioché', quantity: '1 unité' },
      { name: 'Steaks hachés 100g', quantity: '2 unités' },
      { name: 'Bacon', quantity: '3 tranches' },
      { name: 'Cheddar', quantity: '2 tranches' },
      { name: 'Oignons caramélisés', quantity: '30g' },
      { name: 'Sauce BBQ maison', quantity: '20ml' },
      { name: 'Laitue', quantity: '1 feuille' }
    ],
    steps: [
      {
        title: 'Préparation du bacon',
        description: 'Faire cuire les tranches de bacon dans une poêle jusqu\'à ce qu\'elles soient croustillantes. Réserver sur du papier absorbant.'
      },
      {
        title: 'Cuisson des steaks',
        description: 'Assaisonner les steaks avec du sel et du poivre. Les cuire dans la même poêle que le bacon pendant 2-3 minutes de chaque côté. Ajouter une tranche de cheddar sur chaque steak en fin de cuisson.'
      },
      {
        title: 'Préparation du pain',
        description: 'Toaster légèrement le pain brioché. Tartiner la sauce BBQ sur la base du pain.'
      },
      {
        title: 'Montage',
        description: 'Sur la base du pain, placer la feuille de laitue, puis le premier steak avec son fromage, ajouter les oignons caramélisés, le bacon, puis le deuxième steak. Terminer en ajoutant le chapeau du pain.'
      }
    ],
    createdBy: 'Manager',
    lastUpdated: new Date(2023, 6, 10)
  },
  {
    id: '3',
    name: 'Burger Vegetarien',
    description: 'Un burger savoureux à base de légumes et de protéines végétales.',
    imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1200',
    category: 'burger',
    difficulty: 'medium',
    preparationTime: 25,
    cookingTime: 10,
    servings: 1,
    featured: true,
    ingredients: [
      { name: 'Pain multi-céréales', quantity: '1 unité' },
      { name: 'Steak végétal', quantity: '1 unité' },
      { name: 'Avocat', quantity: '1/2 unité' },
      { name: 'Tomate', quantity: '2 tranches' },
      { name: 'Roquette', quantity: '1 poignée' },
      { name: 'Oignon rouge', quantity: '3 rondelles' },
      { name: 'Sauce au yaourt', quantity: '15ml' }
    ],
    steps: [
      {
        title: 'Préparation du steak végétal',
        description: 'Cuire le steak végétal selon les instructions du packaging, généralement 3-4 minutes de chaque côté dans une poêle avec un peu d\'huile d\'olive.'
      },
      {
        title: 'Préparation de l\'avocat',
        description: 'Couper l\'avocat en tranches fines ou l\'écraser pour en faire une purée.'
      },
      {
        title: 'Préparation du pain',
        description: 'Toaster légèrement le pain multi-céréales.'
      },
      {
        title: 'Montage',
        description: 'Tartiner la sauce au yaourt sur la base du pain. Ajouter la roquette, les tranches de tomate, le steak végétal, l\'avocat et les rondelles d\'oignon. Refermer avec la partie supérieure du pain.'
      }
    ],
    createdBy: 'Manager',
    lastUpdated: new Date(2023, 7, 5)
  }
];

const RecipesPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(mockRecipes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter recipes based on search and category
  useEffect(() => {
    let results = recipes;
    
    if (searchQuery) {
      results = results.filter(recipe => 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeCategory !== 'all') {
      results = results.filter(recipe => recipe.category === activeCategory);
    }
    
    setFilteredRecipes(results);
  }, [searchQuery, activeCategory, recipes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const openRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
  };

  // Get unique categories from recipes
  const categories = ['all', ...Array.from(new Set(recipes.map(recipe => recipe.category)))];

  return (
    <PageContainer className={isMobile ? "px-3 py-3" : "px-6 py-4"}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-9 w-24 flex-shrink-0" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className={`font-bold ${isMobile ? "text-xl" : "text-2xl"} tracking-tight`}>
                  Livre de Recettes
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Consultez toutes nos recettes pour préparer des burgers parfaits
                </p>
              </div>
              
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une recette..."
                    className={`pl-8 ${isMobile ? "w-full" : "w-[250px]"}`}
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Categories tabs */}
            <Tabs defaultValue="all" value={activeCategory} 
              onValueChange={handleCategoryChange}
              className="mb-6">
              <ScrollArea className="w-full whitespace-nowrap pb-2">
                <TabsList className="mb-2">
                  <TabsTrigger value="all" className="text-[13px]">
                    Toutes les recettes
                  </TabsTrigger>
                  <TabsTrigger value="burger" className="text-[13px]">
                    <Utensils className="h-3.5 w-3.5 mr-1.5" />
                    Burgers
                  </TabsTrigger>
                  <TabsTrigger value="side" className="text-[13px]">
                    <Utensils className="h-3.5 w-3.5 mr-1.5" />
                    Accompagnements
                  </TabsTrigger>
                  <TabsTrigger value="sauce" className="text-[13px]">
                    <Utensils className="h-3.5 w-3.5 mr-1.5" />
                    Sauces
                  </TabsTrigger>
                  <TabsTrigger value="dessert" className="text-[13px]">
                    <Utensils className="h-3.5 w-3.5 mr-1.5" />
                    Desserts
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
              
              {filteredRecipes.length === 0 && (
                <div className="text-center p-8 border rounded-lg bg-muted/10">
                  <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">Aucune recette trouvée</h3>
                  <p className="text-muted-foreground text-sm">
                    Essayez avec d'autres mots-clés ou catégories
                  </p>
                </div>
              )}
            </Tabs>
            
            {/* Featured Recipe (if any) */}
            {filteredRecipes.find(r => r.featured) && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Recette à la une
                </h2>
                
                {filteredRecipes
                  .filter(recipe => recipe.featured)
                  .map(recipe => (
                    <Card key={recipe.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openRecipeDetail(recipe)}>
                      <div className="md:flex">
                        <div className="relative md:w-2/5 h-48 md:h-auto">
                          <img
                            src={recipe.imageUrl}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                            À la une
                          </Badge>
                        </div>
                        <div className="p-5 md:w-3/5">
                          <h3 className="font-semibold text-xl mb-2">{recipe.name}</h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            {recipe.description}
                          </p>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                              <Clock className="h-3 w-3 mr-1" />
                              {recipe.preparationTime + recipe.cookingTime} min
                            </Badge>
                            <Badge variant="outline" className={
                              recipe.difficulty === 'easy' 
                                ? 'bg-green-50 text-green-800 border-green-200'
                                : recipe.difficulty === 'medium' 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                            }>
                              {recipe.difficulty === 'easy' ? 'Facile' : recipe.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                            </Badge>
                          </div>
                          <Button variant="secondary" size="sm" className="mt-2">
                            Voir la recette <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
            
            {/* Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map(recipe => (
                <Card key={recipe.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openRecipeDetail(recipe)}>
                  <div className="relative h-48">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{recipe.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {recipe.preparationTime + recipe.cookingTime} min
                      </Badge>
                      <Badge variant="outline" className={
                        recipe.difficulty === 'easy' 
                          ? 'bg-green-50 text-green-800 border-green-200'
                          : recipe.difficulty === 'medium' 
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                      }>
                        {recipe.difficulty === 'easy' ? 'Facile' : recipe.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Recipe Detail Dialog */}
            <Dialog open={showRecipeDetail} onOpenChange={setShowRecipeDetail}>
              <DialogContent className={`${isMobile ? "w-full p-3" : "max-w-4xl"} overflow-y-auto max-h-[90vh]`}>
                {selectedRecipe && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-xl md:text-2xl font-bold">
                        {selectedRecipe.name}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedRecipe.description}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="relative h-56 md:h-72 mt-2 mb-4 rounded-md overflow-hidden">
                      <img
                        src={selectedRecipe.imageUrl}
                        alt={selectedRecipe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                      <div className="flex flex-col items-center justify-center bg-muted/20 rounded-md p-3">
                        <Clock3 className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">{selectedRecipe.preparationTime} min</span>
                        <span className="text-xs text-muted-foreground">Préparation</span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-muted/20 rounded-md p-3">
                        <AlarmClock className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">{selectedRecipe.cookingTime} min</span>
                        <span className="text-xs text-muted-foreground">Cuisson</span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-muted/20 rounded-md p-3">
                        <User className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">{selectedRecipe.servings}</span>
                        <span className="text-xs text-muted-foreground">Portion{selectedRecipe.servings > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center bg-muted/20 rounded-md p-3">
                        <ChefHat className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">
                          {selectedRecipe.difficulty === 'easy' ? 'Facile' : 
                           selectedRecipe.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </span>
                        <span className="text-xs text-muted-foreground">Difficulté</span>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        Ingrédients
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedRecipe.ingredients.map((ingredient, idx) => (
                          <div key={idx} className="flex justify-between py-1.5 px-3 rounded-md bg-muted/10 text-sm">
                            <span className="font-medium">{ingredient.name}</span>
                            <div className="flex items-center">
                              <span className="text-muted-foreground">{ingredient.quantity}</span>
                              {ingredient.optional && (
                                <Badge variant="outline" className="ml-2 px-1.5 text-[9px] h-4">
                                  Optionnel
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        Instructions
                      </h3>
                      
                      <div className="space-y-6">
                        {selectedRecipe.steps.map((step, idx) => (
                          <div key={idx} className="relative">
                            <div className="flex items-start gap-4">
                              <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                                  {idx + 1}
                                </div>
                                {idx < selectedRecipe.steps.length - 1 && (
                                  <div className="absolute top-8 left-1/2 w-0.5 h-full -translate-x-1/2 bg-muted" />
                                )}
                              </div>
                              <div className="flex-1 pb-6">
                                <h4 className="font-medium text-base mb-1">{step.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                                {step.tip && (
                                  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-2 mt-2 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs">{step.tip}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                      <div>Créé par: {selectedRecipe.createdBy}</div>
                      <div>Mis à jour: {format(selectedRecipe.lastUpdated, 'd MMMM yyyy', { locale: fr })}</div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default RecipesPage; 