import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Button } from './Button';

// Define the shape of your route data
export interface RouteData {
  origin: string;
  destination: string;
  validUntil: string;
}

interface RouteStatusCardProps {
  route?: RouteData | null;
  onPress: () => void;
  isTrucker?: boolean;
}

export function RouteStatusCard({
  route,
  onPress,
  isTrucker = true
}: RouteStatusCardProps) {

  // Lógica de Validação da Data
  const isRouteActive = React.useMemo(() => {
    if (!route || !route.validUntil ) return false;

    const validUntilDate = new Date(route.validUntil);
    const now = new Date();

    // Verifica se a data de validade é maior (posterior) que agora
    return validUntilDate.getTime() >= now.getDate();
  }, [route]);

  console.log(route)

  // --- RENDERIZAÇÃO PARA EMBARCADOR (isTrucker = false) ---
  if (!isTrucker) {
    // Só exibe o card de carga ativa se existir rota E a data for válida
    if (isRouteActive && route) {
      return (
        <View className="bg-black rounded-xl p-4 shadow-sm">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-white/70 text-sm font-medium">
                Carga Anunciada
              </Text>

              <Text className="text-white text-xl font-bold mt-1" numberOfLines={1}>
                {route.origin} → {route.destination}
              </Text>

              <Text className="text-white/80 text-xs mt-1">
                Data prevista: {new Date(route.validUntil).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </Text>
            </View>

            <Ionicons name="cube-outline" size={32} color="white" />
          </View>

          <View className='m-3'>
            <Button title='GERENCIAR CARGA' activeOpacity={0.8} onPress={onPress} />
          </View>
        </View>
      );
    }

    // 2. EMBARCADOR SEM CARGA OU CARGA EXPIRADA (Empty State)
    return (
      <View className="bg-black rounded-2xl p-6 shadow-sm">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Configurar Frete</Text>
            <Text className="text-white/70 text-sm mt-1">
              {route ? 'Sua carga anterior expirou.' : 'Encontre o caminhão ideal para sua carga.'}
            </Text>
          </View>
          <Ionicons name="add-circle-outline" size={32} color="#EA812E" />
        </View>

        <TouchableOpacity
          className="bg-main rounded-lg py-3 mt-4 items-center"
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold">BUSCAR PROPOSTA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- RENDERIZAÇÃO PARA CAMINHONEIRO (isTrucker = true) ---
  return (
    <View className="bg-main rounded-xl p-4 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          {/* Header Label */}
          <Text className="text-white/80 text-sm font-medium">
            {isRouteActive ? 'Sua rota atual' : 'Status da viagem'}
          </Text>

          {/* Main Content */}
          <Text className="text-white text-xl font-bold mt-1" numberOfLines={1}>
            {isRouteActive
              ? `${route!.origin} → ${route!.destination}`
              : 'Nenhuma rota ativa'}
          </Text>

          {/* Subtext / Date */}
          <Text className="text-white/90 text-xs mt-1">
            {isRouteActive
              ? `Disponível até: ${new Date(route!.validUntil).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
              : 'Defina um destino para encontrar cargas'}
          </Text>
        </View>

        {/* Icon Toggle */}
        <Ionicons
          name={isRouteActive ? "navigate-circle-outline" : "map-outline"}
          size={32}
          color="white"
        />
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-white rounded-lg py-3 mt-4 items-center"
      >
        <Text className="text-main font-bold italic">
          {isRouteActive ? 'ALTERAR ROTA' : 'DEFINIR ROTA'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}