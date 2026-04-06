import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    login as loginService,
    logout as logoutService,
    getSession,
} from '@/services/authService';
import { useCreateUser } from '@/hooks/user/useCreateUser';
import type { CreateUserInput, User } from '@/types';
import { DEFAULT_QUERY_OPTIONS, QUERY_KEYS } from '@/lib/api/constants';

interface IAuthContext {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    createAccount: (data: CreateUserInput) => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const qc = useQueryClient();

    // 1) GET /auth/me, manejando errores internamente
    const {
        data: user,
        refetch: _refetch,
    } = useQuery<User | null, Error, User | null>({
        queryKey: QUERY_KEYS.ME,
        queryFn: async () => {
            try {
                return await getSession();
            } catch {
                // si falla, devolvemos null en lugar de lanzar
                return null;
            }
        },
        ...DEFAULT_QUERY_OPTIONS,
        staleTime: 1000 * 60 * 60,      // 1 h
    });

    // Wrap de refetch para devolver Promise<void>
    const refreshSession = async (): Promise<void> => {
        await _refetch();
    };

    //  Mutación login → refetch de sesión
    const loginMutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            loginService({ email, password }),
        onSuccess: () => refreshSession(),
    });

    //  Mutación logout → limpiar caché
    const logoutMutation = useMutation({
        mutationFn: logoutService,
        onSuccess: () => qc.setQueryData(['me'], null),
    });

    //  Crear cuenta → refetch de sesión
    const { createUser } = useCreateUser();
    const createAccount = async (data: CreateUserInput): Promise<void> => {
        await createUser(data);
        await refreshSession();
    };

    // Funciones del contexto
    const login = async (email: string, password: string): Promise<void> => {
        await loginMutation.mutateAsync({ email, password });
    };
    const logout = async (): Promise<void> => {
        await logoutMutation.mutateAsync();
        window.location.assign('/');
    };

    const value: IAuthContext = {
        user: user ?? null,
        login,
        logout,
        createAccount,
        refreshSession,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): IAuthContext => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must usarse dentro de AuthProvider');
    return ctx;
};
