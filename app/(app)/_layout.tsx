import { useAuth } from "@/context/AuthContext"
import { Redirect } from "expo-router"


export default function AppLayput() {
    const {user} = useAuth()

    return !user ? <Redirect href={"/login"} /> : <Redirect href={"/home"} />
}