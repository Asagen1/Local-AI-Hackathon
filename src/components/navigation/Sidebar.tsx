import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePatientsStore } from '@/hooks/stores/usePatientsStore';
import PatientCard from '@/components/patient/PatientCard';

const TEXT = '#455556';
const MUTED = '#7AA8A8';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onSelectPatient: (id: string) => void;
  showSearch?: boolean; // Hide search on recording screen
}

export default function Sidebar({ visible, onClose, onSelectPatient, showSearch = true }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const { charts, loadCharts } = usePatientsStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Load charts when sidebar opens
  useEffect(() => {
    if (visible) {
      loadCharts();
      setSearchQuery('');
    }
  }, [visible, loadCharts]);

  // Filter charts based on search
  const filteredCharts = useMemo(() => {
    if (!searchQuery.trim()) return charts;
    const query = searchQuery.toLowerCase();
    return charts.filter(
      (chart) =>
        chart.patientName.toLowerCase().includes(query) ||
        chart.notes.toLowerCase().includes(query)
    );
  }, [charts, searchQuery]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      accessible={false}
    >
      <View className="flex-1 flex-row">
        {/* Sidebar - LEFT SIDE */}
        <View
          className="w-[300px] bg-[#F0FBFB] shadow-lg"
          style={{ paddingTop: insets.top }}
          accessible={true}
        >
          {/* Header */}
          <View className="px-5 py-4 flex-row items-center justify-between border-b border-[#9CC4C4]/30">
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: TEXT }}>
              Patients
            </Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.6}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={24} color={TEXT} />
            </TouchableOpacity>
          </View>

          {/* Search Bar - Only show if showSearch is true */}
          {showSearch && (
            <View className="px-5 py-3">
              <View className="flex-row items-center px-3 py-2 rounded-full border border-[#9CC4C4] bg-white/50">
                <Ionicons name="search" size={18} color={MUTED} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search patients..."
                  placeholderTextColor={MUTED}
                  className="flex-1 ml-2"
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: TEXT }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.6}>
                    <Ionicons name="close-circle" size={18} color={MUTED} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Patient List */}
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 16 }}
          >
            {filteredCharts.length > 0 ? (
              filteredCharts.map((chart) => (
                <PatientCard
                  key={chart.id}
                  chart={chart}
                  onPress={() => {
                    onSelectPatient(chart.id);
                    onClose();
                  }}
                />
              ))
            ) : (
              <View className="mt-16 items-center px-6">
                <Ionicons name="document-text-outline" size={48} color={MUTED} />
                <Text
                  className="mt-4 text-center"
                  style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: TEXT }}
                >
                  {searchQuery ? 'No patients found' : 'No patients yet'}
                </Text>
                <Text
                  className="mt-2 text-center"
                  style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}
                >
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Record your first patient note to get started'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Backdrop - RIGHT SIDE */}
        <Pressable 
          className="flex-1 bg-black/50" 
          onPress={onClose}
          accessible={false}
          importantForAccessibility="no"
        />
      </View>
    </Modal>
  );
}
