
import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Check, X, Clock } from 'lucide-react';

// Mock absence requests data
const absenceRequests = [
  {
    id: 1,
    employee: 'John Doe',
    startDate: new Date(2023, 5, 15),
    endDate: new Date(2023, 5, 17),
    reason: 'Family emergency',
    status: 'approved',
    createdAt: new Date(2023, 5, 10),
  },
  {
    id: 2,
    employee: 'Jane Smith',
    startDate: new Date(2023, 5, 20),
    endDate: new Date(2023, 5, 24),
    reason: 'Vacation',
    status: 'pending',
    createdAt: new Date(2023, 5, 12),
  },
  {
    id: 3,
    employee: 'Mike Johnson',
    startDate: new Date(2023, 6, 5),
    endDate: new Date(2023, 6, 7),
    reason: 'Medical appointment',
    status: 'pending',
    createdAt: new Date(2023, 5, 28),
  },
  {
    id: 4,
    employee: 'Emily Wilson',
    startDate: new Date(2023, 5, 25),
    endDate: new Date(2023, 5, 25),
    reason: 'Personal day',
    status: 'denied',
    createdAt: new Date(2023, 5, 18),
  },
];

const Absences = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{status}</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PageContainer
      title="Absence Management"
      description="Submit and manage absence requests."
    >
      <Tabs defaultValue="list" className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">Absence Requests</TabsTrigger>
          <TabsTrigger value="new">Submit New Request</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {absenceRequests.map((request) => (
              <Card key={request.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">Request #{request.id}</p>
                      <CardTitle className="mt-1">{request.employee}</CardTitle>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CalendarIcon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {formatDate(request.startDate)}
                          {!request.startDate.toDateString().includes(request.endDate.toDateString()) && 
                            ` - ${formatDate(request.endDate)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.startDate.toDateString() === request.endDate.toDateString()
                            ? '1 day'
                            : `${Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days`}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Reason:</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Submitted on {formatDate(request.createdAt)}
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex space-x-2 pt-3">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                          <X className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {absenceRequests.length === 0 && (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No absence requests</h3>
                <p className="text-muted-foreground mb-4">There are no absence requests to display.</p>
                <Button>Submit New Request</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Submit Absence Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <FormField
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Absence Period</FormLabel>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full sm:w-[200px] justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Start date</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full sm:w-[200px] justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>End date</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormDescription>
                        Select the start and end dates for your absence request.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <Textarea placeholder="Please describe the reason for your absence" />
                      <FormDescription>
                        Provide a brief explanation for your absence request.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact (Optional)</FormLabel>
                      <Input placeholder="Phone number or email" />
                      <FormDescription>
                        Contact information during your absence if needed.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit Request</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default Absences;
