
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

// Define the validation schema
const employeeFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(7, {
    message: "Please enter a valid phone number.",
  }),
  availability: z.string().min(1, {
    message: "Please specify availability.",
  }),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>;
  onSubmit: (data: EmployeeFormValues) => void;
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

  const [avatarUrl, setAvatarUrl] = React.useState<string>('');

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/30 rounded-lg border">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt="Avatar" />
            <AvatarFallback className="text-lg bg-primary/10">
              {form.watch('name') ? form.watch('name').charAt(0).toUpperCase() : <UserCog className="h-6 w-6 text-primary/60" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <Label htmlFor="avatar" className="text-base font-medium block mb-1">
              Employee Photo
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Label htmlFor="avatar" className="cursor-pointer inline-flex w-full sm:w-auto">
                <div className="flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
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
                Upload a professional photo (JPEG, PNG, max 5MB)
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
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
                  <Input placeholder="(555) 123-4567" {...field} />
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
                <FormControl>
                  <Input placeholder="Full-Time, Weekends Only, etc." {...field} />
                </FormControl>
                <FormDescription>
                  Specify when this employee is available to work (e.g., Full-Time, Weekends Only, Evenings)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Employee
          </Button>
        </div>
      </form>
    </Form>
  );
}
