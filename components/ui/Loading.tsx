import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoadingScreen() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Animação de Rotação Infinita
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Animação de Pulsação Suave
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([rotate, pulse]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center">
      
      {/* CONTAINER DA ANIMAÇÃO (WRAPPER)
         Isolamos o Logo e os efeitos neste View para que o 'center'
         seja calculado apenas entre eles, ignorando o texto abaixo.
      */}
      <View className="items-center justify-center relative">
        
        {/* Anel de Loading Customizado */}
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
            borderTopColor: "#EA812E",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }}
          // w-48 h-48 é maior que o logo, como é absolute e o pai é center/center, ele fica no meio exato
          className="w-48 h-48 rounded-full border-[3px] absolute"
        />

        {/* Círculo de Brilho de Fundo */}
        <Animated.View
          style={{ 
            opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.3] }),
            transform: [{ scale }] // Adicionei scale aqui também para o brilho acompanhar a pulsação
          }}
          className="w-32 h-32 rounded-full bg-main absolute"
        />

        {/* Logo Central (Elemento Relativo que define o tamanho do "miolo") */}
        <Animated.View 
          style={{ transform: [{ scale }] }} 
          className="p-4 bg-white rounded-full z-10"
        >
          <Image
            source={require("../../assets/retornaLogo/MainLogoSVG.svg")}
            style={{ width: 100, height: 100 }}
            contentFit="contain"
          />
        </Animated.View>

      </View>

      {/* TEXTO (FORA DO WRAPPER)
         O texto fica fora do container da animação. Usamos mt-12 para dar o espaçamento
         a partir do centro da animação, sem quebrar o alinhamento do anel.
      */}
      <Animated.View 
        style={{ opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }}
        className="mt-12 absolute bottom-24" // Opcional: fixar no bottom ou deixar fluir com margin
      >
        <Text className="text-black font-light tracking-[4px] text-xs uppercase text-center">
          Carregando
        </Text>
      </Animated.View>

    </SafeAreaView>
  );
}