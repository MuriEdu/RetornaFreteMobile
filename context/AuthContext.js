
import LoadingScreen from "@/components/ui/Loading";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(false)
    const [user, setUser] = useState(false)

    const signin = async () => {}
    const signout = async () => {}

    const contextData = {session, user, signin, signout}
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
