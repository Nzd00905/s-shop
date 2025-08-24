
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MailCheck, ShieldX } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

function AuthActionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');

    if (!mode || !actionCode) {
        setStatus('error');
        setMessage('Invalid request. Please try again from your email link.');
        return;
    }
    
    handleAction(mode, actionCode);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleAction = async (mode: string, actionCode: string) => {
    try {
        await checkActionCode(auth, actionCode);
        switch (mode) {
            case 'verifyEmail':
                await handleVerifyEmail(actionCode);
                break;
            case 'resetPassword':
                // This will redirect to a password reset page if we decide to build one.
                router.push(`/reset-password?oobCode=${actionCode}`);
                break;
            default:
                 setStatus('error');
                 setMessage('Invalid action. Please try again.');
        }
    } catch (error) {
        setStatus('error');
        setMessage('The link is invalid or has expired. Please request a new one.');
        console.error(error);
    }
  };

  const handleVerifyEmail = async (actionCode: string) => {
    try {
      await applyActionCode(auth, actionCode);
      setStatus('success');
      setMessage('You can now sign in with your new account.');
      toast({
          title: 'Email Verified!',
          description: 'You can now log in to your account.',
          variant: 'success'
      });
      // Optional: redirect after a delay
      // setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage('The verification link is invalid or has expired. Please try again.');
      console.error(error);
    }
  };

  const PageStatus = () => {
    switch (status) {
        case 'loading':
            return (
                <>
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <CardTitle className="text-2xl mt-4">Verification in Progress</CardTitle>
                </>
            );
        case 'success':
            return (
                 <>
                    <MailCheck className="mx-auto h-16 w-16 text-green-500" />
                    <CardTitle className="text-2xl mt-4">Your email has been verified</CardTitle>
                </>
            );
        case 'error':
             return (
                 <>
                    <ShieldX className="mx-auto h-12 w-12 text-destructive" />
                    <CardTitle className="text-2xl mt-4">Verification Failed</CardTitle>
                </>
            );
        default:
            return null;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="p-6">
            <div className='mb-4'>
                <PageStatus />
            </div>
            <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        {status !== 'loading' && (
          <CardContent className="p-6 pt-0">
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Proceed to Login</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}


export default function AuthActionPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <AuthActionHandler />
        </Suspense>
    )
}
