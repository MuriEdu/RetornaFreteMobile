import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import axios from 'axios';
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  LayoutAnimation,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Configuração do Token
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
Mapbox.setAccessToken(MAPBOX_TOKEN || '');

// --- DADOS MOCKADOS (Com UUIDs para bater com o Backend) ---
const USER_VEHICLES_MOCK = [
  { 
    id: '123e4567-e89b-12d3-a456-426614174000', // UUID Válido
    name: 'Scania R450 (Placa ABC-1234)', 
    type: 'Carreta LS',
    icon: 'truck' 
  },
  { 
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // UUID Válido
    name: 'Volvo FH (Placa XYZ-9876)', 
    type: 'Caminhão Truck',
    icon: 'truck'
  },
];

const SUGGESTED_PRICE_CONFIG = {
  enabled: true, 
  value: "4,50",
};

export default function Trip() {
  const router = useRouter();
  const cameraRef = useRef<Mapbox.Camera>(null);

  // Estados da Rota
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [cities, setCities] = useState<any[]>([]);
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Estado para armazenar as coordenadas para o save final
  const [coords, setCoords] = useState<{ origin: number[]; dest: number[] } | null>(null);

  // Estados do Formulário de Cadastro
  const [tripDate, setTripDate] = useState("");
  const [price, setPrice] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [useSuggestion, setUseSuggestion] = useState(false);

  // Estado da Camera
  const [cameraConfig, setCameraConfig] = useState({
    centerCoordinate: [-50.0, -15.0], 
    zoomLevel: 3,
  });

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // --- LÓGICA DE BACKEND E MAPA ---
  const geocodeCity = async (cityName: string) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${MAPBOX_TOKEN}&country=br&types=place`;
      const response = await axios.get(url);
      const feature = response.data.features[0];
      if (!feature) throw new Error(`Cidade não encontrada: ${cityName}`);
      return feature.center; // Retorna [lon, lat]
    } catch (error) {
      throw error;
    }
  };

  const handleCalculateRoute = async () => {
    if (!origin || !dest) {
      Alert.alert("Atenção", "Preencha origem e destino.");
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const originCoords = await geocodeCity(origin);
      const destCoords = await geocodeCity(dest);
      
      setCoords({ origin: originCoords, dest: destCoords });
      
      const payload = {
        originLat: originCoords[1],
        originLon: originCoords[0],
        destLat: destCoords[1],
        destLon: destCoords[0]
      };

      const response = await api.post("/api/routes/calculate", payload);
      setCities(response.data.cities);

      const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords};${destCoords}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
      const routeResp = await axios.get(routeUrl);
      const routeData = routeResp.data.routes[0];
      
      setRouteGeoJson({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: routeData.geometry
        }]
      });

      setCameraConfig({
        centerCoordinate: originCoords,
        zoomLevel: 7,
      });

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao calcular rota. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Lógica da Sugestão de Preço
  const handleSuggestionToggle = (value: boolean) => {
    setUseSuggestion(value);
    if (value) {
      setPrice(SUGGESTED_PRICE_CONFIG.value);
    } else {
      setPrice("");
    }
  };

  const handleSaveTrip = async () => {
    // Validação
    if (!origin || !dest || !tripDate || !price || !selectedVehicle || !coords) {
      Alert.alert("Campos Obrigatórios", "Por favor, calcule a rota e preencha todos os dados.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        originCity: origin,
        destCity: dest,
        
        // Dados Geográficos (Vindos do estado coords)
        originLat: coords.origin[1], 
        originLon: coords.origin[0],
        destLat: coords.dest[1],
        destLon: coords.dest[0],
        
        // Dados do Form
        tripDate: tripDate,
        pricePerKm: price,
        
        // Dados do Veículo (Envia o ID como string para o UUID do Java)
        vehicleId: selectedVehicle.id 
      };

      await api.post("/api/trips", payload);

      Alert.alert("Sucesso", "Viagem cadastrada com sucesso!", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error) {
       console.log(error.response);
       Alert.alert("Erro", "Não foi possível salvar a viagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- HEADER --- */}
      <View className="px-6 py-4 bg-white flex-row items-center border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4 bg-gray-50 p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Text className="text-gray-500 text-sm font-medium">Logística</Text>
          <Text className="text-black text-xl font-bold">Nova Rota</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- MAPA --- */}
        <View className="mx-6 mt-6 h-64 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm relative">
          <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Street}>
            <Mapbox.Camera
              ref={cameraRef}
              zoomLevel={cameraConfig.zoomLevel}
              centerCoordinate={cameraConfig.centerCoordinate}
              animationMode={'flyTo'}
              animationDuration={2000}
            />
            {routeGeoJson && (
              <Mapbox.ShapeSource id="routeSource" shape={routeGeoJson}>
                <Mapbox.LineLayer
                  id="routeFill"
                  style={{ lineColor: '#EA812E', lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
                />
              </Mapbox.ShapeSource>
            )}
          </Mapbox.MapView>
        </View>

        {/* --- FORMULÁRIO DE BUSCA --- */}
        <View className="px-6 mt-6">
          <Text className="text-black text-lg font-bold mb-4">Definir Trajeto</Text>
          <Input placeholder="Cidade de Saída" value={origin} onChangeText={setOrigin} icon="ellipse-outline"/>
          <Input placeholder="Cidade de Destino" value={dest} onChangeText={setDest} icon="location"/>
          <Button title="BUSCAR CIDADES NA ROTA" onPress={handleCalculateRoute} icon="search" iconPosition="left" disabled={loading} isLoading={loading}/>
        </View>

        {/* --- RESULTADOS E CADASTRO --- */}
        {cities.length > 0 && (
          <View className="px-6 mt-8 space-y-6">
            
            {/* 1. Lista de Cidades (Acordeão) */}
            <View className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <TouchableOpacity 
                onPress={toggleDropdown}
                activeOpacity={0.7}
                className={`flex-row justify-between items-center p-4 ${isExpanded ? 'bg-gray-50 border-b border-gray-100' : 'bg-white'}`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-main/10 w-8 h-8 rounded-full items-center justify-center">
                    <Ionicons name="map" size={16} color="#EA812E" />
                  </View>
                  <Text className="text-gray-800 text-base font-bold">Cidades Próximas</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                    <Text className="text-xs font-bold text-gray-600">{cities.length}</Text>
                  </View>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View className="bg-white">
                  {cities.map((city, index) => (
                    <View key={index} className={`flex-row items-center p-4 ${index < cities.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <View className="w-10 h-10 bg-[#FFF4EB] rounded-full items-center justify-center mr-3">
                        <Ionicons name="business-outline" size={20} color="#EA812E" />
                      </View>
                      <View>
                        <Text className="text-gray-900 font-semibold text-base leading-tight">{city.name}</Text>
                        <Text className="text-gray-400 text-xs font-medium mt-0.5">{city.state} • Brasil</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* divider visual */}
            <View className="h-[1px] bg-gray-100 w-full" />

            {/* 2. Formulário de Cadastro da Viagem */}
            <View className="mt-4">
              <Text className="text-black text-lg font-bold mb-4">Dados da Viagem</Text>
              
              {/* Data da Viagem */}
              <Input 
                placeholder="Data da Viagem (DD/MM/AAAA)" 
                value={tripDate} 
                onChangeText={setTripDate} 
                icon="calendar-outline" 
                maxLength={10} 
              />

              {/* Dropdown de Veículo (Custom Select) */}
              <TouchableOpacity 
                onPress={() => setShowVehicleModal(true)}
                className="w-full h-14 bg-gray-50 border-[#E5E7EB] border-2 rounded-xl px-4 flex-row items-center mb-4"
              >
                <Ionicons name="car-outline" size={20} color="#EA812E" style={{ marginRight: 8 }} />
                <Text className={`flex-1 text-base ${selectedVehicle ? 'text-black' : 'text-[#9CA3AF]'}`}>
                  {selectedVehicle ? selectedVehicle.name : "Selecione o Veículo"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Preço por KM + Sugestão */}
              <View>
                <Input 
                  placeholder="Preço por KM" 
                  value={price} 
                  onChangeText={(t) => {
                    setPrice(t);
                    if (t !== SUGGESTED_PRICE_CONFIG.value) setUseSuggestion(false);
                  }} 
                  icon="cash-outline"
                />    

                {/* Área da Sugestão Configurável */}
                {SUGGESTED_PRICE_CONFIG.enabled && (
                  <View className="flex-row items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 mt-[-8] mb-4">
                    <View className="flex-1 mr-2">
                      <Text className="text-blue-700 font-bold text-xs uppercase">Sugestão Retorna Frete</Text>
                      <Text className="text-blue-600 text-xs mt-0.5">
                        Utilizar valor de mercado: R$ {SUGGESTED_PRICE_CONFIG.value}/km
                      </Text>
                    </View>
                    <Switch
                      trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                      thumbColor={useSuggestion ? "#2563EB" : "#f4f3f4"}
                      onValueChange={handleSuggestionToggle}
                      value={useSuggestion}
                      style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
                    />
                  </View>
                )}
              </View>

              <Button 
                title="FINALIZAR CADASTRO" 
                onPress={handleSaveTrip} 
                icon="checkmark-circle" 
                iconPosition="left"
              />
            </View>

          </View>
        )}
      </ScrollView>

      {/* --- MODAL DE SELEÇÃO DE VEÍCULO --- */}
      <Modal
        visible={showVehicleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowVehicleModal(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl h-[50%] p-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-gray-900">Selecione o Veículo</Text>
                  <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={USER_VEHICLES_MOCK} // FIX: Usando a lista de mocks correta
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      className={`p-4 border-b border-gray-100 flex-row items-center ${selectedVehicle?.id === item.id ? 'bg-orange-50' : ''}`}
                      onPress={() => {
                        setSelectedVehicle(item);
                        setShowVehicleModal(false);
                      }}
                    >
                      <View className={`w-4 h-4 rounded-full border mr-3 items-center justify-center ${selectedVehicle?.id === item.id ? 'border-orange-500' : 'border-gray-300'}`}>
                        {selectedVehicle?.id === item.id && <View className="w-2 h-2 rounded-full bg-orange-500" />}
                      </View>
                      <View>
                        <Text className={`text-base ${selectedVehicle?.id === item.id ? 'text-orange-700 font-bold' : 'text-gray-700'}`}>
                            {item.name}
                        </Text>
                        <Text className="text-xs text-gray-400">{item.type}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}