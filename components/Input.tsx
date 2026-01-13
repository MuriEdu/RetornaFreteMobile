import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, Text, TextInput, TextInputProps, View } from "react-native";

// Tipos suportados pelo Input
type InputType = 'text' | 'date' | 'currency';

interface InputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  type?: InputType; // Nova prop
}

export function Input({ icon, type = 'text', onChangeText, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
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

  // --- Lógica de Máscaras ---
  const handleChangeText = (text: string) => {
    if (!onChangeText) return;

    let formatted = text;

    if (type === 'date') {
      // Remove tudo que não é número
      formatted = text.replace(/\D/g, "");
      // Aplica máscara DD/MM/AAAA
      if (formatted.length > 2) formatted = formatted.replace(/^(\d{2})(\d)/, "$1/$2");
      if (formatted.length > 5) formatted = formatted.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
      // Limita tamanho
      if (formatted.length > 10) formatted = formatted.substring(0, 10);
    
    } else if (type === 'currency') {
      // Remove não numéricos
      const cleanValue = text.replace(/\D/g, "");
      
      // Converte para valor decimal (ex: 123 -> 1.23)
      const numberValue = Number(cleanValue) / 100;
      
      // Formata para moeda BRL (ex: 0,00)
      formatted = numberValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    onChangeText(formatted);
  };

  // Determina o teclado correto com base no tipo
  const getKeyboardType = () => {
    if (rest.keyboardType) return rest.keyboardType; // Respeita prop explicita
    if (type === 'date' || type === 'currency') return 'numeric';
    return 'default';
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5E7EB", "#EA812E"],
  });

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
      className="w-full bg-white rounded-lg mb-4 flex-row items-center overflow-hidden"
    >
      {icon && (
        <View className="pl-4">
          <Ionicons name={icon} size={20} color="#EA812E" />
        </View>
      )}

      <TextInput
        className="flex-1 text-black px-4 py-3"
        placeholderTextColor="#9CA3AF"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={handleChangeText} // Intercepta para aplicar máscara
        keyboardType={getKeyboardType()}
        {...rest}
      />
      
      {/* Prefixo visual para moeda (opcional, ajuda na UX) */}
      {type === 'currency' && (
        <View className="pr-4">
          <Text className="text-gray-400 font-bold">R$</Text>
        </View>
      )}
    </Animated.View>
  );
}