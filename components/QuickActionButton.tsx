import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap; // Garante tipagem correta dos ícones
    label: string;
    badge?: number;
    onPress?: () => void;
}

export default function QuickActionButton({ icon, label, badge, onPress }: QuickActionButtonProps) {

    const isLargeBadge = badge && badge > 9;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-1 aspect-square bg-white rounded-[24px] p-3 justify-between items-start shadow-sm border border-main relative overflow-hidden"
        >
            {/* Badge Flutuante no canto superior direito */}
            {badge ? (
                <View
                    className={`
            absolute top-2 right-2 z-20 
            bg-rose-500 border-[2px] border-white 
            items-center justify-center shadow-sm
            ${isLargeBadge ? 'px-1.5 min-w-[22px] h-[22px] rounded-full' : 'w-[20px] h-[20px] rounded-full'}
          `}
                >
                    <Text className="text-white text-[10px] font-extrabold leading-3 text-center">
                        {badge > 99 ? '99+' : badge}
                    </Text>
                </View>
            ) : null}

            {/* Container do Ícone com fundo suave para destaque */}
            <View className="bg-[#FFF4EB] w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name={icon} size={22} color="#EA812E" />
            </View>

            {/* Label agora interno, alinhado à esquerda e embaixo */}
            <View className="w-full">
                <Text
                    numberOfLines={1}
                    className="ml-1 text-gray-700 text-sm font-bold tracking-tight"
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}