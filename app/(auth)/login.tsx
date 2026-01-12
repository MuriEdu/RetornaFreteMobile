import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToastManager from "toastify-react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {signIn} = useAuth()

  async function handleSubmit() { 
    await signIn(email, password);
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white p-6">
      <Image
        source={require("../../assets/retornaLogo/MainLogoSVG.svg")}
        style={{ width: 100, height: 100 }}
        contentFit="contain"
      />

      <Text className="text-[#1A1A1A] text-4xl font-bold mb-10 mt-10">Entrar</Text>

      <Input
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Entrar" onPress={handleSubmit} />

      <Link href="/signup" asChild>
        <TouchableOpacity className="mt-6">
          <Text className="text-black">
            Não tem uma conta?{" "}
            <Text className="text-main font-bold">Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </Link>

      <ToastManager/>
    </SafeAreaView>
  );
}