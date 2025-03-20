import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Sun, 
  Moon, 
  Bell, 
  Mail, 
  UserCog, 
  Shield, 
  Globe, 
  CalendarDays,
  Clock
} from 'lucide-react';

const Settings = () => {
  return (
    <PageContainer title="Settings" description="Manage your account settings and preferences.">
      <div className="grid gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings. Set your preferred language and time zone.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="johndoe" className="col-span-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="john.doe@example.com" type="email" className="col-span-2" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Account</Button>
          </CardFooter>
        </Card>

        <Separator />

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure your notification preferences. Choose which notifications you want to receive.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch id="push-notifications" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Notifications</Button>
          </CardFooter>
        </Card>

        <Separator />

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of your application.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Appearance</Button>
          </CardFooter>
        </Card>

        <Separator />

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" className="col-span-2" placeholder="Write a short bio about yourself" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Your location" className="col-span-2" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Profile</Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Settings;
