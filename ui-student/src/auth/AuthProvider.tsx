import React, { createContext, useContext, useEffect, useState } from 'react';
import { apolloClient } from '../lib/apollo-client';
import { type GetUserQuery, type GetUserQueryVariables, GetUserDocument, type GetUserByUsernameQueryVariables, type GetUserByUsernameQuery, GetUserByUsernameDocument } from '../generated';

type User = any;

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const raw = localStorage.getItem('authUser');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (user) localStorage.setItem('authUser', JSON.stringify(user));
        else localStorage.removeItem('authUser');
    }, [user]);

    // refresh user on load
    useEffect(() => {
        const tryRefresh = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            console.log(GetUserDocument.loc?.source.body);

            setLoading(true);

            try {
                const { data } = await apolloClient.query<GetUserQuery, GetUserQueryVariables>({
                    query: GetUserDocument,
                    variables: { id: user.id },
                    fetchPolicy: 'network-only',
                });

                if (!data?.getUser) {
                    console.warn('User refresh failed: no user returned');
                    setUser(null); // 🔥 important
                    return;
                }

                setUser(data.getUser);
            } catch (err) {
                console.error('Failed to refresh auth user', err);
                setUser(null); // 🔥 important or you'll loop
            } finally {
                setLoading(false);
            }
        };

        tryRefresh();
    }, []);

    const login = async (username: string, password: string) => {
        console.log('🔐 LOGIN START');
        console.log('username:', username);
        console.log('password length:', password?.length);

        setLoading(true);

        try {
            const { data, error } = await apolloClient.query<
                GetUserByUsernameQuery,
                GetUserByUsernameQueryVariables
            >({
                query: GetUserByUsernameDocument,
                variables: { username },
                fetchPolicy: 'network-only',
            });

            console.log('📦 LOGIN RESPONSE RAW:', { data, error });

            const found = data?.getUsers?.[0] || null;

            console.log('👤 FOUND USER:', found);

            if (!found) {
                console.warn('❌ No user found for username');
                return false;
            }

            console.log('🔑 PASSWORD CHECK:');
            console.log('stored:', found.password);
            console.log('input :', password);
            console.log('match :', found.password === password);

            if (found.password === password) {
                console.log('✅ LOGIN SUCCESS');

                setUser(found);
                localStorage.setItem('authToken', found.id ?? username);
                localStorage.setItem('authUser', JSON.stringify(found));

                return true;
            }

            console.warn('❌ PASSWORD MISMATCH');
            return false;

        } catch (err) {
            console.error('🔥 LOGIN ERROR:', err);
            return false;
        } finally {
            setLoading(false);
            console.log('🔐 LOGIN END');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthProvider;