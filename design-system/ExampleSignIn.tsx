import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { SignInForm } from '../components/auth/SignInForm';
import { SocialSignIn } from '../components/auth/SocialSignIn';
import { AuthHeader } from '../components/auth/AuthHeader';
import { MatrixBackground } from '../components/auth/MatrixBackground';
import { Link } from 'react-router-dom';
import { trackInfluencer } from '../utils/auth/userVerification';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-toastify';
import { logger } from '../utils/logger';
import { useCreateUser } from '../hooks/useAuthQueries';

/**
 * SignIn Component
 * Handles user authentication through email/password and social providers
 */
export function SignIn() {
  // State and hooks
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const createUser = useCreateUser();

  // Extract influencer ID from URL if present
  const searchParams = new URLSearchParams(location.search);
  const influencerId = searchParams.get('Idinfluencer');
  const isInfluencerLogin = location.pathname === '/login/influencer';

  /**
   * Redirect authenticated users to dashboard
   */
  useEffect(() => {
    if (user) {
      // Verificar se há um parâmetro redirect na URL
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      const destination = redirect || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, navigate, location.search]);

  /**
   * Handle successful authentication
   * @param userId User's ID
   */
  const handleAuthenticationSuccess = async (userId: string) => {
    // Track influencer if ID is present
    if ((influencerId || isInfluencerLogin) && userId) {
      await trackInfluencer(userId, influencerId);
    }

    // Verificar se há um parâmetro redirect na URL
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect');
    const destination = redirect || '/dashboard';
    navigate(destination, { replace: true });
  };

  /**
   * Handle email/password sign in
   * @param email User's email
   * @param password User's password
   */
  const handleEmailSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthenticationSuccess(result.user.uid);
    } catch (error: any) {
      logger.error('Login error', error);
      toast.error('Falha ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle social media sign in
   * @param provider Social auth provider (Google or Facebook)
   */
  const handleSocialSignIn = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    setIsLoading(true);
    try {
      if (provider instanceof GoogleAuthProvider) {
        provider.setCustomParameters({ prompt: 'select_account' });
      }
      
      const result = await signInWithPopup(auth, provider);

      // Create or update user data
      const nameParts = result.user.displayName?.split(' ') || ['User'];
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';
      
      const userData = {
        user_id: result.user.uid,
        email: result.user.email,
        first_name: firstName,
        last_name: lastName,
        user_level: 'basic',
        recaptchaToken: 'GOOGLE_OAUTH_LOGIN'
      };

      try {
        await createUser.mutateAsync(userData);
      } catch (error) {
        // If user already exists, this error is expected
      }

      await handleAuthenticationSuccess(result.user.uid);
    } catch (error: any) {
      logger.error('Social sign-in error', error);
      toast.error('Falha ao fazer login social');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* Animated background */}
      <MatrixBackground />
      
      <div className="w-full max-w-md relative z-10">
        {/* Auth header with logo */}
        <AuthHeader />
        
        {/* Main auth container */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-2xl p-8 transition-colors duration-300">
          {/* Email/password sign in form */}
          <SignInForm 
            onSubmit={handleEmailSignIn} 
            isLoading={isLoading} 
          />
          
          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">Não tem uma conta?</span>
            <Link
              to="/signup"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Cadastre-se
            </Link>
          </div>
          
          {/* Social sign in options */}
          <div className="mt-6">
            <SocialSignIn 
              onGoogleSignIn={() => handleSocialSignIn(new GoogleAuthProvider())}
              onFacebookSignIn={() => handleSocialSignIn(new FacebookAuthProvider())}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Version indicator */}
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8 transition-colors duration-300">
          Guia Seller - Gestão de Vendas
        </p>
      </div>
    </main>
  );
}