import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Input } from "@/components/Input";

export default function Signup() {
  const [isTrucker, setIsTrucker] = useState(false);

  return (
    // Usamos ScrollView para garantir que usuários com telas menores consigam rolar o formulário
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      className="bg-white"
    >
      <Image 
        source={require("../../assets/retornaLogo/MainLogoSVG.svg")}
        style={{ width: 80, height: 80 }}
        contentFit="contain"
      />
      
      <Text className="text-[#1A1A1A] text-4xl font-bold mb-8 mt-6 text-center">
        Criar Conta
      </Text>
      
      <Input
        placeholder="Nome completo"
        autoCapitalize="words"
      />

      <Input
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        placeholder="Senha"
        secureTextEntry
      />

      <Checkbox 
        label="Sou caminhoneiro" 
        value={isTrucker} 
        onChange={setIsTrucker} 
      />

      <Button title="Cadastrar" onPress={() => console.log('Cadastro', { isTrucker })} />

      <Link href="/login" asChild>
        <TouchableOpacity className="mt-6">
          <Text className="text-black">
            Já possui uma conta?{" "}
            <Text className="text-[#EA812E] font-bold">Entrar</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}