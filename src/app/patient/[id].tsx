import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Background from '@/components/Background';
import { usePatientsStore } from '@/hooks/stores/usePatientsStore';
import { formatFullDate } from '@/utils/dateFormat';

const TEXT = '#455556';
const MUTED = '#7AA8A8';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getChart, removeChart } = usePatientsStore();
  const [chart, setChart] = useState(getChart(id));

  useEffect(() => {
    if (!chart) {
      router.back();
    }
  }, [chart]);

  if (!chart) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${chart.patientName}'s record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeChart(id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <Background />

      <View className="px-5 pb-2 flex-row items-center justify-between" style={{ paddingTop: insets.top + 8 }}>
        <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: TEXT }}>Patient Details</Text>
        <TouchableOpacity onPress={handleDelete} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="trash-outline" size={22} color="#B00020" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 16 }}>
        <View className="mb-6">
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 38, color: TEXT }}>{chart.patientName}</Text>
          <Text className="mt-1" style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}>Created {formatFullDate(chart.createdAt)}</Text>
        </View>

        <View className="mb-6">
          <Text className="mb-3 ml-2" style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: TEXT }}>Patient Information</Text>
          <View className="px-5 py-4 rounded-[24px] border border-[#9CC4C4] bg-white/35">
            {Object.entries(chart.parameters).map(([key, value], index) => (
              <View key={key} className={index > 0 ? 'mt-3' : ''}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: MUTED }}>{key}</Text>
                <Text className="mt-0.5" style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: TEXT }}>{value || 'Not provided'}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-3 ml-2" style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: TEXT }}>Clinical Notes</Text>
          <View className="px-5 py-4 rounded-[24px] border border-[#9CC4C4] bg-white/35">
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: TEXT }}>{chart.notes}</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Edit functionality will be added soon.')} activeOpacity={0.7} className="flex-1 flex-row items-center justify-center px-6 py-3 rounded-[20px] border border-[#9CC4C4] bg-white/35">
            <Ionicons name="create-outline" size={20} color={TEXT} />
            <Text className="ml-2" style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: TEXT }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Share functionality will be added soon.')} activeOpacity={0.7} className="flex-1 flex-row items-center justify-center px-6 py-3 rounded-[20px] border border-[#9CC4C4] bg-white/35">
            <Ionicons name="share-outline" size={20} color={TEXT} />
            <Text className="ml-2" style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: TEXT }}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
