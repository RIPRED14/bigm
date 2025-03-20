
import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import StatsCard from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Clock, Bell, ChevronRight, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  // Mock data for dashboard
  const stats = [
    { 
      title: 'Total Employees', 
      value: '24', 
      icon: Users,
      trend: { value: 12, isPositive: true },
    },
    { 
      title: 'Pending Absences', 
      value: '5', 
      icon: Clock,
      trend: { value: 8, isPositive: false },
    },
    { 
      title: 'This Week Shifts', 
      value: '42', 
      icon: Calendar,
      trend: { value: 5, isPositive: true },
    },
    { 
      title: 'Unread Notifications', 
      value: '7', 
      icon: Bell,
    },
  ];

  // Mock data for upcoming shifts
  const upcomingShifts = [
    { id: 1, employee: 'John Doe', date: 'Today', time: '9:00 AM - 5:00 PM' },
    { id: 2, employee: 'Jane Smith', date: 'Today', time: '4:00 PM - 12:00 AM' },
    { id: 3, employee: 'Mike Johnson', date: 'Tomorrow', time: '9:00 AM - 5:00 PM' },
  ];

  // Mock data for absence requests
  const absenceRequests = [
    { id: 1, employee: 'Alice Williams', startDate: 'Jun 24', endDate: 'Jun 26', reason: 'Personal' },
    { id: 2, employee: 'Robert Brown', startDate: 'Jun 28', endDate: 'Jul 2', reason: 'Vacation' },
  ];

  return (
    <PageContainer
      title="Dashboard"
      description="Get a quick overview of your restaurant staff management."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            className="h-full"
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="glass-card hover:bg-primary/5 border border-slate-200 shadow-sm text-foreground hover:text-primary justify-start" variant="ghost" asChild>
            <Link to="/employees" className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>Manage Employees</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button className="glass-card hover:bg-primary/5 border border-slate-200 shadow-sm text-foreground hover:text-primary justify-start" variant="ghost" asChild>
            <Link to="/planning" className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>View Schedule</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button className="glass-card hover:bg-primary/5 border border-slate-200 shadow-sm text-foreground hover:text-primary justify-start" variant="ghost" asChild>
            <Link to="/absences" className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>Manage Absences</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button className="glass-card hover:bg-primary/5 border border-slate-200 shadow-sm text-foreground hover:text-primary justify-start" variant="ghost" asChild>
            <Link to="/notifications" className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                <span>Check Notifications</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Upcoming Shifts and Absence Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Shifts Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
            <CardDescription>Next shifts scheduled for your staff</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {upcomingShifts.map((shift) => (
                <li key={shift.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">{shift.employee}</p>
                    <p className="text-sm text-muted-foreground">{shift.date}, {shift.time}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Calendar className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/planning" className="flex items-center justify-center">
                View All Shifts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Absence Requests Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Pending Absence Requests</CardTitle>
            <CardDescription>Requests awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {absenceRequests.map((request) => (
                <li key={request.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">{request.employee}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.startDate} - {request.endDate} • {request.reason}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      Deny
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/absences" className="flex items-center justify-center">
                View All Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
