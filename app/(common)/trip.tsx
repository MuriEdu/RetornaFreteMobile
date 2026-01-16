import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { RouteCitiesSheet } from "@/components/RouteCitiesSheet";
import { Select, SelectItem } from "@/components/Select";
import { useAuth } from "@/context/AuthContext";
import { useVehicles } from "@/hooks/useVehicles";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import Mapbox from "@rnmapbox/maps";
import axios from 'axios';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- CONFIGURAÇÕES ---
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
Mapbox.setAccessToken(MAPBOX_TOKEN || '');

const SUGGESTED_PRICE_CONFIG = { enabled: true, value: "4,50" };

export default function Trip() {
  const { user, refreshUserContext } = useAuth();
  const isTrucker = user?.roles?.includes("TRUCKER") ?? true;
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraRef = useRef<Mapbox.Camera>(null);

  // --- MODO EDIÇÃO ---
  const isEditing = !!params.id;
  
  // --- HOOKS DE DADOS ---
  const { vehicles, types } = useVehicles();

  // --- MEMOS PARA O SELECT ---
  const myVehicleOptions: SelectItem[] = useMemo(() => {
    return vehicles.map(v => ({
      id: v.id,
      name: `${v.brand} ${v.model} (${v.licensePlate})\n${v.typeName}`
    }));
  }, [vehicles]);

  const vehicleTypeOptions: SelectItem[] = useMemo(() => {
    return types.map(t => ({
      id: t.id.toString(),
      name: t.name
    }));
  }, [types]);

  // --- ESTADOS ---
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [cities, setCities] = useState<any[]>([]);
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ origin: number[]; dest: number[] } | null>(null);
  const [tripDate, setTripDate] = useState("");

  // Estados Caminhoneiro
  const [price, setPrice] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<SelectItem | null>(null);
  const [useSuggestion, setUseSuggestion] = useState(false);

  // Estados Embarcador
  const [cargoName, setCargoName] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [requiredVehicleType, setRequiredVehicleType] = useState<SelectItem | null>(null);

  const [showCitiesSheet, setShowCitiesSheet] = useState(false);
  const [cameraConfig, setCameraConfig] = useState({ centerCoordinate: [-50.0, -15.0], zoomLevel: 3 });

  // --- EFEITO: CARREGAR DADOS DE EDIÇÃO ---
  useEffect(() => {
    if (isEditing && params.data) {
      try {
        const data = JSON.parse(params.data as string);
        
        setOrigin(data.origin || "");
        setDest(data.destination || "");
        setTripDate(data.date || "");

        if (isTrucker) {
          setPrice(data.price ? String(data.price) : "");
          // Tenta encontrar o veículo na lista para pré-selecionar
          if (data.vehicleId && vehicles.length > 0) {
            const v = myVehicleOptions.find(opt => opt.id === data.vehicleId);
            if (v) setSelectedVehicle(v);
          }
        } else {
          setCargoName(data.product || "");
          setCargoWeight(data.weight ? String(data.weight) : "");
          if (data.typeId && types.length > 0) {
            const t = vehicleTypeOptions.find(opt => opt.id === String(data.typeId));
            if (t) setRequiredVehicleType(t);
          }
        }
      } catch (e) {
        console.log("Erro ao parsear dados de edição", e);
      }
    }
  }, [isEditing, params.data, vehicles, types, myVehicleOptions, vehicleTypeOptions]);

  // --- EFEITO: CALCULAR ROTA AUTOMATICAMENTE AO EDITAR ---
  // Necessário para preencher 'coords' e 'cities' que são exigidos no save
  useEffect(() => {
    if (isEditing && origin && dest && !coords && !loading) {
       // Pequeno delay para garantir que estados assentaram
       const timer = setTimeout(() => {
         handleCalculateRoute();
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [isEditing, origin, dest]);


  // --- FUNÇÕES ---
  const geocodeCity = async (cityName: string) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${MAPBOX_TOKEN}&country=br&types=place`;
      const response = await axios.get(url);
      const feature = response.data.features[0];
      if (!feature) throw new Error(`Cidade não encontrada: ${cityName}`);
      return feature.center;
    } catch (error) { throw error; }
  };

  const handleCalculateRoute = async () => {
    if (!origin || !dest) { 
      if(!isEditing) Alert.alert("Atenção", "Preencha origem e destino."); 
      return; 
    }
    setLoading(true);
    Keyboard.dismiss();

    try {
      const originCoords = await geocodeCity(origin);
      const destCoords = await geocodeCity(dest);
      setCoords({ origin: originCoords, dest: destCoords });
      
      const payload = { originLat: originCoords[1], originLon: originCoords[0], destLat: destCoords[1], destLon: destCoords[0] };
      const response = await api.post("/api/routes/calculate", payload);
      setCities(response.data.cities);

      const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords};${destCoords}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
      const routeResp = await axios.get(routeUrl);
      
      setRouteGeoJson({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: routeResp.data.routes[0].geometry }]
      });
      setCameraConfig({ centerCoordinate: originCoords, zoomLevel: 7 });

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao calcular rota. Verifique os nomes das cidades.');
    } finally { setLoading(false); }
  };

  const handleSuggestionToggle = (value: boolean) => {
    setUseSuggestion(value);
    setPrice(value ? SUGGESTED_PRICE_CONFIG.value : "");
  };

  const handleSave = async () => {
    if (!origin || !dest || !tripDate || !coords) {
      Alert.alert("Campos Obrigatórios", "A rota precisa ser calculada e a data preenchida.");
      return;
    }
    setLoading(true);

    try {
      const basePayload = {
        originCity: cities[0]?.name || origin, 
        destCity: cities[cities.length-1]?.name || dest,
        originLat: coords.origin[1], originLon: coords.origin[0],
        destLat: coords.dest[1], destLon: coords.dest[0],
        tripDate: tripDate,
      };

      if (isTrucker) {
        if (!selectedVehicle || !price) {
          Alert.alert("Atenção", "Selecione o veículo e defina o preço.");
          setLoading(false); return;
        }

        const payload = {
          ...basePayload,
          pricePerKm: price.replace(',', '.'),
          vehicleId: selectedVehicle.id 
        };

        if (isEditing) {
           await api.put(`/api/trips/${params.id}`, payload);
        } else {
           await api.post("/api/trips", payload);
        }

      } else {
        if (!cargoName || !cargoWeight || !requiredVehicleType) {
          Alert.alert("Atenção", "Preencha os dados da carga.");
          setLoading(false); return;
        }
        
        const payload = {
          ...basePayload,
          productName: cargoName,
          weightKg: cargoWeight,
          requiredVehicleType: requiredVehicleType.id
        };

        if (isEditing) {
           await api.put(`/api/cargos/${params.id}`, payload);
        } else {
           await api.post("/api/cargos", payload);
        }
      }

      await refreshUserContext();
      
      Alert.alert("Sucesso", isEditing ? "Atualizado com sucesso!" : "Criado com sucesso!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
       console.log(error);
       Alert.alert("Erro", "Não foi possível salvar.");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-6 py-4 bg-white flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-gray-50 p-2 rounded-full">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Text className="text-gray-500 text-sm font-medium">
             {isEditing ? "Gerenciamento" : "Logística"}
          </Text>
          <Text className="text-black text-xl font-bold">
            {isEditing 
              ? (isTrucker ? "Editar Oferta" : "Editar Carga") 
              : (isTrucker ? "Oferecer Frete" : "Configurar Carga")
            }
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* MAPA */}
        <View className="mx-6 mt-6 h-64 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm relative">
          <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Street}>
            <Mapbox.Camera ref={cameraRef} {...cameraConfig} animationMode={'flyTo'} animationDuration={2000} />
            {routeGeoJson && (
              <Mapbox.ShapeSource id="routeSource" shape={routeGeoJson}>
                <Mapbox.LineLayer id="routeFill" style={{ lineColor: '#EA812E', lineWidth: 4, lineCap: 'round', lineJoin: 'round' }} />
              </Mapbox.ShapeSource>
            )}
          </Mapbox.MapView>
        </View>

        {/* BUSCA */}
        <View className="px-6 mt-6">
          <Text className="text-black text-lg font-bold mb-4">Definir Trajeto</Text>
          <Input placeholder="Cidade de Saída" value={origin} onChangeText={setOrigin} icon="ellipse-outline"/>
          <Input placeholder="Cidade de Destino" value={dest} onChangeText={setDest} icon="location"/>
          <Button 
            title={loading ? "CALCULANDO..." : "CALCULAR ROTA"} 
            onPress={handleCalculateRoute} 
            icon="search" iconPosition="left" disabled={loading} isLoading={loading}
            style={!isTrucker ? { backgroundColor: '#1E293B' } : undefined} 
          />
        </View>

        {/* RESULTADOS */}
        {/* Mostra o formulário se tiver cidades CALCULADAS ou se estiver EDITANDO (e carregando mapa) */}
        {(cities.length > 0 || isEditing) && (
          <View className="px-6 mt-8 space-y-6">
            
            {/* Botão Ver Cidades */}
            {cities.length > 0 && (
              <TouchableOpacity 
                onPress={() => setShowCitiesSheet(true)}
                activeOpacity={0.7}
                className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-4 flex-row justify-between items-center"
              >
                 <View className="flex-row items-center gap-3">
                    <View className={`w-10 h-10 rounded-full items-center justify-center 'bg-orange-50'`}>
                      <Ionicons name="map" size={20} color={"#EA812E"} />
                    </View>
                    <View>
                      <Text className="text-gray-900 font-bold text-base">Ver Rota Completa</Text>
                    </View>
                 </View>

                 <View className="flex-row items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Text className="text-xs font-bold text-gray-700">{cities.length} Cidades</Text>
                    <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                 </View>
              </TouchableOpacity>
            )}

            <View className="h-[1px] bg-gray-100 w-full" />

            {/* FORMULÁRIO DINÂMICO */}
            <View className="mt-4">
              <Text className="text-black text-lg font-bold mb-4">
                {isTrucker ? "Detalhes da Oferta" : "Detalhes da Carga"}
              </Text>
              
              <Input placeholder="Data (DD/MM/AAAA)" value={tripDate} onChangeText={setTripDate} icon="calendar-outline" maxLength={10} type="date"/>

              {isTrucker ? (
                // --- CAMINHONEIRO ---
                <>
                  <Select 
                    title="Selecione seu Veículo"
                    placeholder="Selecione o Veículo"
                    data={myVehicleOptions}
                    value={selectedVehicle}
                    onSelect={setSelectedVehicle}
                    icon="car-outline"
                    colorTheme="#EA812E"
                  />

                  <Input 
                    placeholder="Preço por KM (R$)" 
                    value={price} 
                    onChangeText={(t) => { setPrice(t); if (t !== SUGGESTED_PRICE_CONFIG.value) setUseSuggestion(false); }} 
                    icon="cash-outline"
                    keyboardType="numeric"
                    type="currency"
                  />    

                  {SUGGESTED_PRICE_CONFIG.enabled && (
                    <View className="flex-row items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100 mt-[-8] mb-4">
                      <View className="flex-1 mr-2">
                        <Text className="text-blue-700 font-bold text-xs uppercase">Sugestão Retorna Frete</Text>
                        <Text className="text-blue-600 text-xs mt-0.5">R$ {SUGGESTED_PRICE_CONFIG.value}/km</Text>
                      </View>
                      <Switch trackColor={{ false: "#D1D5DB", true: "#93C5FD" }} thumbColor={useSuggestion ? "#2563EB" : "#f4f3f4"} onValueChange={handleSuggestionToggle} value={useSuggestion} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                    </View>
                  )}
                </>
              ) : (
                // --- EMBARCADOR ---
                <>
                   <Input placeholder="Produto (Ex: Soja)" value={cargoName} onChangeText={setCargoName} icon="cube-outline" />
                   <Input placeholder="Peso (kg)" value={cargoWeight} onChangeText={setCargoWeight} icon="barbell-outline" keyboardType="numeric" />
                   
                   <Select 
                    title="Tipo de Veículo Necessário"
                    placeholder="Selecione o Tipo de Veículo"
                    data={vehicleTypeOptions}
                    value={requiredVehicleType}
                    onSelect={setRequiredVehicleType}
                    icon="construct-outline"
                    colorTheme="#EA812E"
                  />
                </>
              )}

              <Button 
                title={isEditing ? "SALVAR ALTERAÇÕES" : (isTrucker ? "DISPONIBILIZAR CAMINHÃO" : "SALVAR CARGA")} 
                onPress={handleSave} 
                icon="checkmark-circle" 
                iconPosition="left"
                style={!isTrucker ? { backgroundColor: '#1E293B' } : undefined}
                isLoading={loading}
              />
            </View>
          </View>
        )}
      </ScrollView>
      <RouteCitiesSheet 
          isVisible={showCitiesSheet}
          onClose={() => setShowCitiesSheet(false)}
          cities={cities}
          colorTheme={"#EA812E"}
       />
    </SafeAreaView>
  );
}