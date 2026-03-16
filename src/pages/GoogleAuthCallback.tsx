import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';

export const GoogleAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state') || 'signin';
                const mode = state; // 'signin' or 'signup'

                if (!code) {
                    setError('Authorization code not found');
                    setLoading(false);
                    return;
                }

                // Send code to backend
                const response = await api.post('/auth/google/callback', { code, mode });

                if (response.data.requiresSchoolInfo) {
                    // Need to collect school information
                    const { email, name, googleId } = response.data;
                    navigate('/register/school', {
                        state: { email, name, googleId, mode: 'google' }
                    });
                    return;
                }

                // Success - user is authenticated
                const { token, user } = response.data;
                loginWithGoogle(token, user);

                // Redirect based on role
                if (user.role === 'school') {
                    navigate('/school/dashboard');
                } else if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } catch (err: any) {
                console.error('Google OAuth callback error:', err);
                const errorMessage = err.response?.data?.error || 'Authentication failed. Please try again.';
                setError(errorMessage);
                setLoading(false);
            }
        };

        handleCallback();
    }, [searchParams, navigate, loginWithGoogle]);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white border border-rose-200 rounded-xl p-8 max-w-md w-full text-center">
                    <h2 className="text-xl font-semibold text-rose-700 mb-2">Authentication Error</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/login/school')}
                        className="ui-button-primary"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full text-center">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Completing sign in...</h2>
                    <p className="text-sm text-slate-500">Please wait while we authenticate your account.</p>
                </div>
            </div>
        );
    }

    return null;
};

