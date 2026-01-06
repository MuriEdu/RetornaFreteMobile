import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Input } from "@/components/Input";
import api from "@/services/api";

export default function Signup() {
  const [isTrucker, setIsTrucker] = useState(false);
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit() {

    const data = {
      fullname,
      email,
      password,
      role: isTrucker ? "TRUCKER" : "SHIPPER"
    }

    await api.post("/users", data).then(
      res => console.log(res.status)
    ).catch(
      err => console.log(err)
    )

  }

  return (
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
        value={fullname}
        onChangeText={text => setFullname(text)}
      />

      <Input
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={text => setEmail(text)}
      />
      
      <Input
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={text => setPassword(text)}
      />

      <Checkbox 
        label="Sou caminhoneiro" 
        value={isTrucker} 
        onChange={setIsTrucker} 
      />

      <Button title="Cadastrar" onPress={handleSubmit} />

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