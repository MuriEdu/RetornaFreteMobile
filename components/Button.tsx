import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap; // Garante autocomplete dos ícones
  iconPosition?: 'left' | 'right';       // Define onde o ícone aparece
  isLoading?: boolean;                   // Mostra spinner de carregamento
}

export function Button({ 
  title, 
  icon, 
  iconPosition = 'left', 
  isLoading = false,
  ...rest 
}: ButtonProps) {
  return (
    <TouchableOpacity 
      disabled={isLoading || rest.disabled} // Previne cliques duplos se estiver carregando
      activeOpacity={0.8}
      className={`
        w-full bg-main rounded-lg h-14 
        flex-row items-center justify-center 
        ${isLoading || rest.disabled ? 'opacity-70' : ''} 
      `}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <>
          {/* Renderiza Ícone na ESQUERDA */}
          {icon && iconPosition === 'left' && (
            <View className="mr-2">
              <Ionicons name={icon} size={20} color="#FFF" />
            </View>
          )}

          <Text className="text-white text-center font-bold text-lg">
            {title}
          </Text>

          {/* Renderiza Ícone na DIREITA */}
          {icon && iconPosition === 'right' && (
            <View className="ml-2">
              <Ionicons name={icon} size={20} color="#FFF" />
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}