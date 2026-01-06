import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
}

export function Button({ title, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity 
      className="w-full bg-main rounded-lg p-4 active:opacity-80" 
      {...rest}
    >
      <Text className="text-white text-center font-bold text-lg">
        {title}
      </Text>
    </TouchableOpacity>
  );
}