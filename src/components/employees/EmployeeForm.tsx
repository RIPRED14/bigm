import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCog } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the validation schema
const employeeFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string()
    .min(7, { message: "Phone number must be at least 7 characters." })
    .max(20, { message: "Phone number is too long." })
    .refine(
      (value) => {
        // Accepte les formats: (123) 456-7890, 123-456-7890, 123.456.7890, ou 1234567890
        const phoneRegex = /^(\+\d{1,3}\s?)?(\(\d{3}\)\s?|\d{3}[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
        return phoneRegex.test(value);
      },
      { message: "Please enter a valid phone number format." }
    ),
  availability: z.string().min(1, {
    message: "Please specify availability.",
  }),
});

// Availability options
const availabilityOptions = [
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Weekends Only", label: "Weekends Only" },
  { value: "Evenings Only", label: "Evenings Only" },
  { value: "Mornings Only", label: "Mornings Only" },
  { value: "On-Call", label: "On-Call" },
];

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues> & { avatarUrl?: string };
  onSubmit: (data: EmployeeFormValues & { avatarUrl?: string }) => void;
  onCancel: () => void;
}

export function EmployeeForm({ defaultValues, onSubmit, onCancel }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      phone: '',
      availability: '',
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Avatar Upload Section - more compact */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt="Avatar" />
            <AvatarFallback className="text-lg bg-primary/10">
              {form.watch('name') ? form.watch('name').charAt(0).toUpperCase() : <UserCog className="h-5 w-5 text-primary/60" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <Label htmlFor="avatar" className="text-sm font-medium block">
              Employee Photo
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Label htmlFor="avatar" className="cursor-pointer inline-flex w-full sm:w-auto">
                <div className="flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                  Upload Image
                </div>
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  className="sr-only" 
                  onChange={handleImageUpload}
                />
              </Label>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG (max 5MB)
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} />
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
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(555) 123-4567" 
                    value={field.value}
                    onChange={handlePhoneChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Availability Field */}
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Availability</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Specify when this employee is available to work
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions - sticky at bottom */}
        <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-background pb-2">
          <Button type="button" variant="outline" onClick={onCancel} size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Employee
          </Button>
        </div>
      </form>
    </Form>
  );
}
