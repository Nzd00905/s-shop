
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { FullPageLoader } from '@/components/ui/loader';

const formSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


function ResetPasswordComponent() {
  const { confirmPasswordReset } = useUser();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (oobCode) {
      await confirmPasswordReset(oobCode, values.password);
    }
  };

  if (!oobCode) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-sm text-center">
                 <CardHeader>
                    <CardTitle className="text-2xl">Invalid Link</CardTitle>
                    <CardDescription>The password reset link is missing or invalid. Please request a new one.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button asChild>
                        <Link href="/forgot-password">Request New Link</Link>
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
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Enter a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                Set New Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<FullPageLoader />}>
            <ResetPasswordComponent />
        </Suspense>
    )
}
