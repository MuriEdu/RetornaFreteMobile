import React, { useRef, useState } from "react";
import { Animated, TextInput, TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Valor da animação (0 para desativado, 1 para focado)
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false, // borderColor não suporta native driver
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Interpolação para mudar a cor da borda
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#EA812E"], // Cinza para Laranja
  });

  // Interpolação para um leve aumento de tamanho
  const scale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.01],
  });

  return (
    <Animated.View
      style={{
        borderColor,
        borderWidth: 2,
        transform: [{ scale }],
      }}
      className="w-full bg-white rounded-lg mb-4"
    >
      <TextInput
        className="w-full text-black px-4 py-3"
        placeholderTextColor="#666666"
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </Animated.View>
  );
}