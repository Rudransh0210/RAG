import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/auth/auth-form';
import { UserPlus } from 'lucide-react';
import { signUp } from '../lib/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (data: { email: string; password: string; confirmPassword:string; username?: string }) => {
    try {
      setError(null);
      if (!data.username) {
        throw new Error('Name is required');
      }
      if (!data.email) {
        throw new Error('Email is required');
      }
      if (!data.password) {
        throw new Error('Password is required');
      }
      if (!data.confirmPassword) {
        throw new Error('Confirm Password is required');
      }
      await signUp(data.email, data.password, data.username);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <UserPlus className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <AuthForm type="signup" onSubmit={handleSignup} />
        </div>
      </div>
    </div>
  );
}