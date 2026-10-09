// app/screens/RecordScreen.tsx
import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import Background from '../components/Background';
import Sidebar from '@/components/navigation/Sidebar';
import PatientCard from '@/components/patient/PatientCard';
import { generateChart, type Chart } from '../services/generateChart';
import { usePatientsStore } from '@/hooks/stores/usePatientsStore';
import { clearSetup } from '@/utils/storage';

const TEXT = '#455556';
const MUTED = '#7AA8A8';

type Status = 'idle' | 'recording' | 'processing';

export default function RecordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [text, setText] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [generatedChart, setGeneratedChart] = useState<Chart | null>(null);

  const { addChart, loadCharts, getLatestCharts, searchCharts, charts } = usePatientsStore();
  
  // Get filtered charts based on search
  const displayedPatients = searchQuery.trim() ? searchCharts(searchQuery) : getLatestCharts(3);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  const committed = useRef('');        // finalized speech
  const recording = useRef(false);     // true until the user presses stop
  const pendingFinish = useRef(false); // stop pressed, waiting for final result

  const startListening = () =>
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: true,
    });

  useSpeechRecognitionEvent('result', (e) => {
    const t = e.results[0]?.transcript ?? '';
    
    if (e.isFinal) {
      committed.current = `${committed.current} ${t}`.trim();
      setTranscript(committed.current);
    } else {
      const interim = `${committed.current} ${t}`.trim();
      setTranscript(interim);
    }
  });

  useSpeechRecognitionEvent('error', (e) => {
    console.error('Speech recognition error:', e.error, e.message);
    if (['not-allowed', 'service-not-allowed', 'language-not-supported'].includes(e.error)) {
      recording.current = false;
      setStatus('idle');
    }
  });

  useSpeechRecognitionEvent('end', () => {
    recording.current = false;
    
    if (pendingFinish.current) {
      pendingFinish.current = false;
      finishRecording();
    }
  });

  const startRecording = async () => {
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      if (!perm.granted) {
        return;
      }

      committed.current = '';
      setTranscript('');
      setStatus('recording');
      recording.current = true;
      pendingFinish.current = false;
      startListening();
    } catch (err: any) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (!recording.current) {
      return;
    }
    pendingFinish.current = true;
    ExpoSpeechRecognitionModule.stop();
  };

  const discardRecording = () => {
    committed.current = '';
    setTranscript('');
    setStatus('idle');
  };

  const handleOpenChart = () => {
    if (generatedChart) {
      router.push(`/patient/${generatedChart.id}`);
      setGeneratedChart(null);
    }
  };

  const handleResetSetup = () => {
    Alert.alert(
      'Reset Setup',
      'This will clear all configured parameters and return to setup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearSetup();
            router.replace('/setup');
          },
        },
      ]
    );
  };

  const finishRecording = async () => {
    const finalTranscript = committed.current;
    
    if (!finalTranscript.trim()) {
      setStatus('idle');
      return;
    }

    setStatus('processing');

    try {
      const chart = await generateChart(finalTranscript);
      addChart(chart);
      setGeneratedChart(chart);
    } catch (error) {
      console.error('Failed to generate chart:', error);
    } finally {
      setStatus('idle');
      committed.current = '';
      setTranscript('');
    }
  };

  const submitText = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setStatus('processing');
    setText('');

    try {
      const chart = await generateChart(trimmed);
      addChart(chart);
      setGeneratedChart(chart);
    } catch (error) {
      console.error('Failed to generate chart:', error);
    } finally {
      setStatus('idle');
    }
  };

  const handleSelectPatient = (id: string) => {
    router.push(`/patient/${id}`);
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <Background />

      {/* App bar */}
      <View
        className="px-5 pb-2 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity onPress={() => setSidebarVisible(true)} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="menu" size={24} color={TEXT} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: TEXT }}>Record</Text>
        <TouchableOpacity onPress={() => setMoreMenuVisible(!moreMenuVisible)} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="ellipsis-horizontal" size={24} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* More Menu Dropdown */}
      {moreMenuVisible && (
        <View className="absolute right-5 bg-white rounded-2xl border border-[#9CC4C4] shadow-lg z-50" style={{ top: insets.top + 56, minWidth: 180 }}>
          <TouchableOpacity
            onPress={() => {
              setMoreMenuVisible(false);
              router.back();
            }}
            className="px-5 py-3 border-b border-[#E0E0E0]"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="arrow-back-outline" size={20} color={TEXT} />
              <Text className="ml-3" style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: TEXT }}>
                Go Back
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setMoreMenuVisible(false);
              handleResetSetup();
            }}
            className="px-5 py-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="refresh-outline" size={20} color="#B00020" />
              <Text className="ml-3" style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: '#B00020' }}>
                Reset Setup
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chart cards */}
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 16 }}
        >
          {/* Show latest/searched patients if they exist */}
          {displayedPatients.length > 0 && (
            <View className="mb-6">
              <Text
                className="mb-3 ml-2"
                style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: TEXT }}
              >
                {searchQuery ? 'Search Results' : 'Recent Patients'}
              </Text>
              {displayedPatients.map((chart) => (
                <PatientCard
                  key={chart.id}
                  chart={chart}
                  onPress={() => handleSelectPatient(chart.id)}
                />
              ))}
            </View>
          )}

          {/* Show "no results" when searching with no matches */}
          {searchQuery && displayedPatients.length === 0 && (
            <View className="py-8 items-center">
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}>
                No patients found
              </Text>
            </View>
          )}

          {/* Live transcript */}
          {status === 'recording' && (
            <View className="px-4 py-3 rounded-[24px] border border-[#9CC4C4] bg-white/35 mb-4">
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: MUTED, marginBottom: 8 }}>
                LISTENING...
              </Text>
              <Text className="mt-1" style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: TEXT, lineHeight: 20 }}>
                {transcript || 'Start speaking...'}
              </Text>
            </View>
          )}

          {/* Show transcript after recording with action buttons */}
          {status === 'idle' && transcript && (
            <View className="mb-6">
              <View className="px-4 py-3 rounded-[24px] border border-[#9CC4C4] bg-white/35 mb-3">
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: MUTED, marginBottom: 8 }}>
                  LAST RECORDING:
                </Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: TEXT, lineHeight: 20 }}>
                  {transcript}
                </Text>
              </View>
              
              {/* Action buttons */}
              <View className="flex-row justify-end space-x-2 px-2">
                <TouchableOpacity
                  onPress={() => {
                    console.log('Processing transcript:', transcript);
                    finishRecording();
                  }}
                  className="px-5 py-2 rounded-full bg-[#00A3A3] mr-2"
                  activeOpacity={0.7}
                >
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>
                    Generate Chart
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    console.log('Clearing transcript');
                    setTranscript('');
                    committed.current = '';
                  }}
                  className="px-5 py-2 rounded-full border border-[#9CC4C4] bg-white/35"
                  activeOpacity={0.7}
                >
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: TEXT }}>
                    Discard
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {status === 'processing' && (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator color={MUTED} />
              <Text className="ml-2" style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}>
                Generating chart...
              </Text>
            </View>
          )}

          {/* Empty state when idle and no patients */}
          {status === 'idle' && !searchQuery && displayedPatients.length === 0 && (
            <View className="items-center px-6">
              <Ionicons name="mic-outline" size={64} color={MUTED} />
              <Text
                className="mt-4 text-center"
                style={{ fontFamily: 'Inter_600SemiBold', fontSize: 18, color: TEXT }}
              >
                Ready to record
              </Text>
              <Text
                className="mt-2 text-center"
                style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}
              >
                Tap the microphone or type to add your first patient note
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Success card after chart generation */}
        {generatedChart && (
          <View className="mx-6 mb-4 p-5 rounded-2xl border border-[#00A3A3] bg-white/90">
            <View className="flex-row items-center mb-3">
              <Ionicons name="checkmark-circle" size={24} color="#00A3A3" />
              <Text className="ml-2" style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: TEXT }}>
                Chart Generated
              </Text>
            </View>
            <Text className="mb-4" style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}>
              Patient chart for {generatedChart.patientName} has been created successfully.
            </Text>
            <TouchableOpacity
              onPress={handleOpenChart}
              className="bg-[#00A3A3] py-3 rounded-full items-center"
              activeOpacity={0.7}
            >
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#FFFFFF' }}>
                Open Chart
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mic + input */}
        <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
          <TouchableOpacity
            onPress={status === 'recording' ? stopRecording : startRecording}
            disabled={status === 'processing'}
            activeOpacity={0.7}
            className={`self-end mb-3 w-14 h-14 rounded-full items-center justify-center border ${
              status === 'recording'
                ? 'bg-[#00A3A3] border-[#00A3A3]'
                : 'bg-white/35 border-[#9CC4C4]'
            }`}
          >
            <Ionicons
              name={status === 'recording' ? 'stop' : 'mic'}
              size={28}
              color={status === 'recording' ? '#FFFFFF' : TEXT}
            />
          </TouchableOpacity>

          <TextInput
            className="px-5 py-4 rounded-[28px] border border-[#9CC4C4] bg-white/35"
            style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: TEXT }}
            placeholder="Enter message"
            placeholderTextColor={MUTED}
            value={text}
            onChangeText={setText}
            onSubmitEditing={submitText}
            returnKeyType="send"
            editable={status === 'idle'}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Sidebar - No search bar on recording screen */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onSelectPatient={handleSelectPatient}
        showSearch={false}
      />
    </View>
  );
}