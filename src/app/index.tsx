import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Background from '@/components/Background';
import Sidebar from '@/components/navigation/Sidebar';
import PatientCard from '@/components/patient/PatientCard';
import { usePatientsStore } from '@/hooks/stores/usePatientsStore';
import { clearSetup } from '@/utils/storage';

const TEXT = '#455556';
const MUTED = '#7AA8A8';

function AppBar({
  onMenu,
  onSearch,
  onMore,
  searchVisible,
  searchQuery,
  onSearchChange,
}: {
  onMenu: () => void;
  onSearch: () => void;
  onMore: () => void;
  searchVisible: boolean;
  searchQuery: string;
  onSearchChange: (text: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const searchAnim = new Animated.Value(searchVisible ? 1 : 0);

  useEffect(() => {
    Animated.spring(searchAnim, {
      toValue: searchVisible ? 1 : 0,
      useNativeDriver: false,
      damping: 20,
      stiffness: 300,
    }).start();
  }, [searchVisible]);

  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View
      className="px-5 pb-2 flex-row items-center justify-between"
      style={{ paddingTop: insets.top + 8 }}
    >
      <TouchableOpacity onPress={onMenu} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
        <Ionicons name="menu" size={28} color={TEXT} />
      </TouchableOpacity>

      <View className="flex-1 flex-row items-center justify-end">
        {/* Animated Search Bar */}
        <Animated.View
          style={{
            width: searchWidth,
            opacity: searchOpacity,
            overflow: 'hidden',
          }}
        >
          {searchVisible && (
            <View className="flex-row items-center px-4 py-2 rounded-full border border-[#9CC4C4] bg-white/50 mr-2">
              <Ionicons name="search" size={18} color={MUTED} />
              <TextInput
                value={searchQuery}
                onChangeText={onSearchChange}
                placeholder="Search patients..."
                placeholderTextColor={MUTED}
                autoFocus
                className="flex-1 ml-2"
                style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: TEXT }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => onSearchChange('')} activeOpacity={0.6}>
                  <Ionicons name="close-circle" size={18} color={MUTED} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>

        <TouchableOpacity onPress={onSearch} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name={searchVisible ? "close" : "search"} size={24} color={TEXT} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMore} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="ellipsis-vertical" size={22} color={TEXT} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { charts, loadCharts, getLatestCharts, searchCharts } = usePatientsStore();
  const hasPatients = charts.length > 0;
  
  // Get filtered charts based on search
  const displayedCharts = searchQuery.trim() ? searchCharts(searchQuery) : getLatestCharts(3);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  const handleSelectPatient = (id: string) => {
    router.push(`/patient/${id}`);
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery(''); // Clear search when closing
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <Background />

      <AppBar
        onMenu={() => setSidebarVisible(true)}
        onSearch={toggleSearch}
        onMore={() => console.log('More pressed')}
        searchVisible={searchVisible}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
      >
        {hasPatients ? (
          <>
            <Text className="mt-8 ml-5" style={{ fontFamily: 'Inter_700Bold', fontSize: 42, lineHeight: 48, color: TEXT, maxWidth: 300 }}>
              Your Patients
            </Text>
            <Text className="mt-2 ml-5" style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: MUTED }}>
              {charts.length} {charts.length === 1 ? 'patient' : 'patients'} total
            </Text>

            <View className="mt-8">
              <View className="flex-row items-center justify-between mb-4 px-2">
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: TEXT }}>
                  {searchQuery ? 'Search Results' : 'Recent'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity onPress={() => setSidebarVisible(true)} activeOpacity={0.6}>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}>View all →</Text>
                  </TouchableOpacity>
                )}
              </View>

              {displayedCharts.length > 0 ? (
                displayedCharts.map((chart) => (
                  <PatientCard key={chart.id} chart={chart} onPress={() => handleSelectPatient(chart.id)} />
                ))
              ) : (
                <View className="py-8 items-center">
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}>
                    No patients found
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={() => router.push('/recording')} activeOpacity={0.7} className="self-center mt-8 flex-row items-center justify-center px-10 py-3 rounded-[20px] border border-[#9CC4C4] bg-white/35">
              <View className="w-9 h-9 rounded-full bg-[#D3EAEA] items-center justify-center mr-3.5">
                <Ionicons name="add" size={22} color={MUTED} />
              </View>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: TEXT }}>Add Patient</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="mt-20 ml-5" style={{ fontFamily: 'Inter_700Bold', fontSize: 50, lineHeight: 50, color: TEXT, maxWidth: 300 }}>
              You have no patients yet...
            </Text>
            <TouchableOpacity onPress={() => router.push('/recording')} activeOpacity={0.7} className="self-center mt-20 flex-row items-center justify-center px-10 py-3 rounded-[20px] border border-[#9CC4C4] bg-white/35">
              <View className="w-9 h-9 rounded-full bg-[#D3EAEA] items-center justify-center mr-3.5">
                <Ionicons name="add" size={22} color={MUTED} />
              </View>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: TEXT }}>Add Patients</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => { clearSetup(); router.replace('/setup'); }} activeOpacity={0.7} className="self-center mt-6 px-6 py-2 rounded-[20px] border border-red-400 bg-red-100/50">
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#B00020' }}>Reset Setup (Debug)</Text>
        </TouchableOpacity>
      </ScrollView>

      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} onSelectPatient={handleSelectPatient} showSearch={true} />
    </View>
  );
}