import { useAuth } from "@/context/AuthContext"
import { Redirect } from "expo-router"


export default function AppLayput() {
    const {session} = useAuth()

    return !session ? <Redirect href={"/login"} /> : <Redirect href={"/home"} />
}