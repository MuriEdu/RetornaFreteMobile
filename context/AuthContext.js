
import LoadingScreen from "@/components/ui/Loading";
import api from "@/services/api";
import { storage } from "@/services/storage";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)


    useEffect(() => {
        async function loadStorageDate() {
            try {
                const token = await storage.getToken()
                if(token){
                    try {
                        const response = await api.get("/users/me")
                        setUser(response.data)
                    } catch (err) {
                        await signOut()
                    }
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }

        loadStorageDate()
    })

async function signIn(email, password) {
    setLoading(true)
    try {
      const response = await api.post('/users/login', { email, password });
      
      const { accessToken, refreshToken, user } = response.data;
      await storage.saveToken(accessToken);
      await storage.saveRefreshToken(refreshToken);

      setUser(user);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    } catch (error) {
      throw error;
    } finally {
        setLoading(false)
    }
  }
async function signOut() {
    setLoading(true)
    await storage.clearTokens();
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    setLoading(false)
  }

    const contextData = {user, signIn, signOut}
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <LoadingScreen/>
            ) : (
                children
            )}
        </AuthContext.Provider>)
}

const useAuth = () => {
    return useContext(AuthContext)
}

export { AuthContext, AuthProvider, useAuth };
