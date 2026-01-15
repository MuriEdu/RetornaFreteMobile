
import LoadingScreen from "@/components/ui/Loading";
import api from "@/services/api";
import { storage } from "@/services/storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";


const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    const routeData = useMemo(() => {
        if (!user) return null;

        // Prioridade 1: Se for Caminhoneiro com Viagem Ativa
        if (user.activeTrip) {
            return {
                origin: user.activeTrip.originName,
                destination: user.activeTrip.destinationName,
                validUntil: user.activeTrip.tripDate, // Data da viagem
            };
        }

        // Prioridade 2: Se for Embarcador com Carga Ativa
        if (user.activeCargo) {
            return {
                origin: user.activeCargo.originName,
                destination: user.activeCargo.destinationName,
                validUntil: user.activeCargo.tripDate, // Data desejada
            };
        }

        return null;
    }, [user]);

    async function refreshUserContext() {
        try {
            const response = await api.get("/users/me");
            setUser(response.data);
        } catch (error) {
            console.error("Erro ao atualizar contexto do usuário:", error);
            // Não fazemos signOut aqui para evitar deslogar por erro de conexão temporário
        }
    }

    useEffect(() => {
        async function loadStorageData() {
            try {
                const token = await storage.getToken();

                if (token) {
                    // Configura o token ANTES de fazer a chamada
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    try {
                        await refreshUserContext();
                    } catch (err) {
                        // Se der erro 401/403 aqui, aí sim deslogamos
                        console.log("Token inválido ou expirado");
                        await signOut();
                    }
                }
            } catch (err) {
                console.log("Erro no storage:", err);
            } finally {
                setLoading(false);
            }
        }

        loadStorageData();
    }, []);

    async function signIn(email, password) {
        setLoading(true)
        try {
            const response = await api.post('/users/login', { email, password });

            const { accessToken, refreshToken, user } = response.data;
            await storage.saveToken(accessToken);
            await storage.saveRefreshToken(refreshToken);

            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            setUser(user)
            await refreshUserContext();


        } catch (error) {
            throw error;
        } finally {
            setLoading(false)
        }
    }
async function signOut() {
        setLoading(true);
        try {
            await storage.clearTokens();
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        } catch (error) {
            console.log("Erro ao sair", error);
        } finally {
            setLoading(false);
        }
    }

    const contextData = { 
        user,
        signIn,
        signOut,
        refreshUserContext,
        activeTrip: user?.activeTrip,
        activeCargo: user?.activeCargo,
        routeData
    }
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <LoadingScreen />
            ) : (
                children
            )}
        </AuthContext.Provider>)
}

const useAuth = () => {
    return useContext(AuthContext)
}

export { AuthContext, AuthProvider, useAuth };
