
import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, CalendarClock, Users, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock notification data
const notificationsData = [
  {
    id: 1,
    title: 'New Schedule Published',
    message: 'The schedule for June 24-30 has been published.',
    time: '2 hours ago',
    type: 'schedule',
    read: false,
  },
  {
    id: 2,
    title: 'Shift Change',
    message: 'Your shift on Friday, June 23 has been updated to 10:00 AM - 6:00 PM.',
    time: '5 hours ago',
    type: 'shift',
    read: false,
  },
  {
    id: 3,
    title: 'Absence Request Approved',
    message: 'Your absence request for June 15-17 has been approved.',
    time: '1 day ago',
    type: 'absence',
    read: true,
  },
  {
    id: 4,
    title: 'New Employee Joined',
    message: 'Welcome Sarah Johnson to the team!',
    time: '2 days ago',
    type: 'employee',
    read: true,
  },
  {
    id: 5,
    title: 'Shift Reminder',
    message: 'You have a shift tomorrow from 9:00 AM to 5:00 PM.',
    time: '2 days ago',
    type: 'reminder',
    read: true,
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [activeTab, setActiveTab] = useState('all');

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'schedule':
        return <Calendar className="h-5 w-5" />;
      case 'shift':
        return <CalendarClock className="h-5 w-5" />;
      case 'absence':
        return <Clock className="h-5 w-5" />;
      case 'employee':
        return <Users className="h-5 w-5" />;
      case 'reminder':
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Get background color for notification type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'bg-blue-500';
      case 'shift':
        return 'bg-purple-500';
      case 'absence':
        return 'bg-green-500';
      case 'employee':
        return 'bg-yellow-500';
      case 'reminder':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Mark a single notification as read
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <PageContainer
      title="Notifications"
      description="Stay updated with the latest changes and announcements."
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="all">
              All
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary text-xs">{notifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary text-xs">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="shift">Shifts</TabsTrigger>
            <TabsTrigger value="absence">Absences</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="w-full sm:w-auto">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="glass-card">
        <div className="divide-y divide-border">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 flex gap-4 transition-colors hover:bg-muted/30',
                  !notification.read && 'bg-muted/50'
                )}
              >
                <div className={cn('p-2 rounded-full text-white', getNotificationColor(notification.type))}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                    {!notification.read && (
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {activeTab === 'all'
                  ? "You don't have any notifications yet."
                  : activeTab === 'unread'
                  ? "You don't have any unread notifications."
                  : `You don't have any ${activeTab} notifications.`}
              </p>
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
};

export default Notifications;
