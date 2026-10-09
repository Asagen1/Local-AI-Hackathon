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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(true); // Set to true to see debug info

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

  const addDebugLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[${timestamp}] ${msg}`;
    console.log(logMsg);
    setDebugLogs(prev => [...prev.slice(-20), logMsg]); // Keep last 20 logs
  };

  useSpeechRecognitionEvent('result', (e) => {
    const t = e.results[0]?.transcript ?? '';
    addDebugLog(`🎤 Result: ${t.substring(0, 50)}${t.length > 50 ? '...' : ''} (final: ${e.isFinal})`);
    
    if (e.isFinal) {
      committed.current = `${committed.current} ${t}`.trim();
      setTranscript(committed.current);
      addDebugLog(`✅ Committed: ${committed.current.length} chars`);
    } else {
      const interim = `${committed.current} ${t}`.trim();
      setTranscript(interim);
      addDebugLog(`⏳ Interim: ${interim.length} chars`);
    }
  });

  useSpeechRecognitionEvent('error', (e) => {
    addDebugLog(`❌ Error: ${e.error} - ${e.message}`);
    if (['not-allowed', 'service-not-allowed', 'language-not-supported'].includes(e.error)) {
      recording.current = false;
      setStatus('idle');
    }
  });
  
  useSpeechRecognitionEvent('start', () => {
    addDebugLog('🎙️ Started listening');
  });

  const startRecording = async () => {
    addDebugLog(`Available: ${ExpoSpeechRecognitionModule.isRecognitionAvailable()}`);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    addDebugLog(`Permission granted: ${perm.granted}`);
    if (!perm.granted) return;

    committed.current = '';
    setTranscript('');
    recording.current = true;
    setStatus('recording');
    startListening();
  };

  const stopRecording = () => {
    recording.current = false;
    pendingFinish.current = true;
    setStatus('idle'); // Changed from 'processing' to 'idle' to show transcript
    ExpoSpeechRecognitionModule.stop();
  };

  const finish = async (input: string) => {
    if (!input.trim()) {
      setStatus('idle');
      return;
    }
    setStatus('processing');
    try {
      const chart = await generateChart(input);
      addChart(chart); // Save to store
      // Navigate to the newly created patient detail
      router.push(`/patient/${chart.id}`);
    } catch (err) {
      console.warn('Chart generation failed', err);
      setStatus('idle');
    } finally {
      setTranscript('');
    }
  };

  const submitText = () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    finish(value);
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
        <TouchableOpacity className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="menu" size={28} color={TEXT} />
        </TouchableOpacity>

          {/* TEMP: speech test button */}
        <TouchableOpacity
          onPress={() => router.push('/speech-test')}
          className="px-4 py-2 rounded-full bg-[#00A3A3]"
        >
          <Text style={{ color: '#fff' }}>Speech test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="ellipsis-vertical" size={22} color={TEXT} />
        </TouchableOpacity>
      </View>

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
                    finish(transcript);
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

        {showDebug && (
          <View className="mx-6 mb-2 p-2 rounded-xl bg-black/70" style={{ maxHeight: 140 }}>
            <ScrollView>
              {debugLogs.map((l, i) => (
                <Text key={i} style={{ color: '#9FFFE0', fontSize: 10 }}>{l}</Text>
              ))}
            </ScrollView>
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