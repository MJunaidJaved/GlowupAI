import { api } from '../api/client'
import { useLocation } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await api.get('/api/auth/me');
                return { user, isAuthenticated: !!user };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #FDF0E8, #F5D6D6, #E8D5F0)' }}>
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-6xl mb-2">✦</div>
                <h1 className="font-playfair text-6xl font-bold text-warm-charcoal/20">404</h1>
                <h2 className="font-playfair text-2xl font-semibold text-warm-charcoal">Page Not Found</h2>
                <p className="font-dm text-warm-gray">
                    The page <span className="font-medium text-deep-mauve">"{pageName}"</span> doesn't exist.
                </p>
                
                {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                    <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-3xl">
                        <p className="font-dm text-sm text-warm-gray">
                            Admin: This page may not be implemented yet.
                        </p>
                    </div>
                )}
                
                <div className="pt-4">
                    <button 
                        onClick={() => window.location.href = '/'} 
                        className="px-8 py-3 bg-deep-mauve text-white font-dm text-sm font-medium rounded-pill hover:shadow-glow transition-all duration-300"
                    >
                        Go Home ✦
                    </button>
                </div>
            </div>
        </div>
    )
}