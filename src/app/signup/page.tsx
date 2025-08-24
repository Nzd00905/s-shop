
'use client';

import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { FullPageLoader } from '@/components/ui/loader';
import { MailCheck } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
});


export default function SignUpPage() {
  const { user, signUpWithEmail, isLoaded } = useUser();
  const router = useRouter();
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/account');
    }
  }, [user, isLoaded, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await signUpWithEmail(values.name, values.email, values.password);
    if(success) {
      setShowVerificationMessage(true);
    }
  };


  if (!isLoaded || user) {
    return <FullPageLoader />;
  }

  if (showVerificationMessage) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <MailCheck className='mx-auto h-16 w-16 text-green-500' />
                    <CardTitle className="text-2xl mt-4">Check your email</CardTitle>
                    <CardDescription>
                        We've sent a verification link to your email address. Please click the link to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                Create Account
              </Button>
            </form>
          </Form>
           <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
