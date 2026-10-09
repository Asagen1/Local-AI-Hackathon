import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Chart } from '@/types';
import { getRelativeTime } from '@/utils/dateFormat';

const TEXT = '#455556';
const MUTED = '#7AA8A8';

interface PatientCardProps {
  chart: Chart;
  onPress: () => void;
}

export default function PatientCard({ chart, onPress }: PatientCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 px-4 py-4 rounded-[20px] border border-[#9CC4C4] bg-white/35 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text
          style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: TEXT }}
          numberOfLines={1}
        >
          {chart.patientName}
        </Text>
        <Text
          className="mt-1"
          style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: MUTED }}
        >
          {getRelativeTime(chart.createdAt)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={MUTED} />
    </TouchableOpacity>
  );
}
