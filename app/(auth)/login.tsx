import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ToastManager from "toastify-react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false)

  const {signIn, user} = useAuth()

  async function handleSubmit() {
    setIsButtonLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro ao fazer login";
      ToastManager.show({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsButtonLoading(false);
    }
  }

  if(user) return <Redirect href={"/home"} />

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

      <Button title="Entrar" onPress={handleSubmit} isLoading={isButtonLoading} />

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