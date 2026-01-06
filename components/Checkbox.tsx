import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
}

export function Checkbox({ label, value, onChange }: CheckboxProps) {
  return (
    <TouchableOpacity 
      className="flex-row items-center w-full mb-6 active:opacity-70" 
      onPress={() => onChange(!value)}
    >
      <View 
        className={`
          w-7 h-7 rounded-md items-center justify-center mr-3
          ${value 
            ? "bg-main border-main border-2" 
            : "bg-gray-50 border-gray-300 border"} 
        `}
      >
        {value && <Ionicons name="checkmark" size={20} color="white" />}
      </View>
      
      <Text className="text-black text-md font-light">
        {label}
      </Text>
    </TouchableOpacity>
  );
}