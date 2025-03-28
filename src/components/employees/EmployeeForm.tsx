import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCog, Camera, User, Mail, Phone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Define the validation schema
const employeeFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string()
    .min(7, { message: "Le numéro de téléphone doit contenir au moins 7 caractères." })
    .max(20, { message: "Le numéro de téléphone est trop long." })
    .refine(
      (value) => {
        // Accepte les formats: (123) 456-7890, 123-456-7890, 123.456.7890, ou 1234567890
        const phoneRegex = /^(\+\d{1,3}\s?)?(\(\d{3}\)\s?|\d{3}[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
        return phoneRegex.test(value);
      },
      { message: "Veuillez entrer un format de numéro de téléphone valide." }
    ),
  // On définit une valeur par défaut pour availability pour éviter les erreurs de validation
  availability: z.string().default("Full-Time"),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues> & { avatarUrl?: string };
  onSubmit: (data: EmployeeFormValues & { avatarUrl?: string }) => void;
  onCancel: () => void;
}

export function EmployeeForm({ defaultValues, onSubmit, onCancel }: EmployeeFormProps) {
  const isMobile = useIsMobile();
  const [formStep, setFormStep] = useState<'photo' | 'details'>('details');
  
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      phone: '',
      availability: 'Full-Time', // Valeur par défaut
    },
  });

  const [avatarUrl, setAvatarUrl] = React.useState<string>(defaultValues?.avatarUrl || '');

  // Format phone number while typing
  const formatPhoneNumber = (value: string) => {
    // Retirer tout ce qui n'est pas un chiffre
    const digits = value.replace(/\D/g, '');

    // Appliquer le format selon le nombre de chiffres
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  // Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    form.setValue('phone', formattedValue, { shouldValidate: true });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
      // Si nous sommes sur mobile, passons automatiquement aux détails
      if (isMobile) {
        setFormStep('details');
      }
    }
  };

  // Handle form submission with avatar
  const handleSubmit = (data: EmployeeFormValues) => {
    onSubmit({
      ...data,
      avatarUrl: avatarUrl
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {isMobile && (
          <div className="flex justify-center mb-2">
            {formStep === 'photo' ? (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setFormStep('details')}
                className="text-xs"
              >
                Passer à l'étape suivante →
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setFormStep('photo')}
                className="text-xs"
              >
                ← Modifier la photo
              </Button>
            )}
          </div>
        )}
        
        {/* Avatar Upload Section - redesigned for mobile */}
        {(!isMobile || formStep === 'photo') && (
          <div className="flex flex-col items-center gap-3 p-4 bg-muted/20 rounded-lg border">
            <div className="relative">
              <Avatar className={`${isMobile ? 'h-24 w-24' : 'h-16 w-16'} border-2 border-primary/20`}>
                <AvatarImage src={avatarUrl} alt="Avatar" />
                <AvatarFallback className="text-lg bg-primary/10">
                  {form.watch('name') ? form.watch('name').charAt(0).toUpperCase() : <UserCog className="h-5 w-5 text-primary/60" />}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="avatar" className="absolute -bottom-1 -right-1 cursor-pointer bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  className="sr-only" 
                  onChange={handleImageUpload}
                />
              </Label>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Cliquez sur l'icône pour ajouter une photo
              </p>
            </div>
          </div>
        )}

        {/* Informations de l'employé */}
        {(!isMobile || formStep === 'details') && (
          <div className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Nom complet
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Reda" 
                      {...field}
                      className={`${isMobile ? 'h-11' : ''}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="reda@burger-staff.com" 
                      {...field}
                      className={`${isMobile ? 'h-11' : ''}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-sm flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Numéro de téléphone
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(+212) 601-234567" 
                      value={field.value}
                      onChange={handlePhoneChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className={`${isMobile ? 'h-11' : ''}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Form Actions - redesigned */}
        <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} gap-3 pt-4 sticky bottom-0 bg-background pb-2`}>
          {isMobile ? (
            <>
              <Button type="submit" size="lg" className="w-full h-12">
                Enregistrer
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} size="lg" className="w-full">
                Annuler
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onCancel} size="sm">
                Annuler
              </Button>
              <Button type="submit" size="sm">
                Enregistrer
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
