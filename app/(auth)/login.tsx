import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import api from "@/services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const TOKEN_KEY = process.env.EXPO_PUBLIC_TOKEN_KEY || "@retorna_token";

  async function handleSubmit() {
    if (!email || !password) return;

    try {
      const response = await api.post("/users/login", {
        email,
        password
      });

      const { token } = response.data;

      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        alert("Login realizado com sucesso, token: " + token)
      }
    } catch (err) {
      alert("Email ou senha incorretos")
      console.log(err);
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
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

    </View>
  );
}