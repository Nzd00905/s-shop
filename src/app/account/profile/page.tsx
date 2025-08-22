
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FullPageLoader } from '@/components/ui/loader';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
});

export default function ProfilePage() {
  const { user, updateUser, isLoaded } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
    if (user) {
        form.reset({ name: user.name || '' });
        setAvatarPreview(user.avatar || '');
    }
  }, [isLoaded, user, router, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateUser({ name: values.name, avatar: avatarPreview });
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
      variant: 'success',
    });
    router.push('/account');
  }

  if (!isLoaded || !user) {
    return <FullPageLoader />;
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold mb-6 text-center">Edit Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your name and profile picture.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview} alt="User" />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                      <Camera className="h-4 w-4" />
                      <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input value={user.email || ''} disabled />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
