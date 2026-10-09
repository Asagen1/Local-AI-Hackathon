import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export default function SpeechTest() {
  const [words, setWords] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const log = (m: string) => setEvents((p) => [...p.slice(-30), m]);

  useSpeechRecognitionEvent('start', () => log('start'));
  useSpeechRecognitionEvent('audiostart', () => log('audiostart (mic open)'));
  useSpeechRecognitionEvent('speechstart', () => log('speechstart (heard voice)'));
  useSpeechRecognitionEvent('nomatch', () => log('nomatch'));
  useSpeechRecognitionEvent('end', () => log('end'));
  useSpeechRecognitionEvent('error', (e) => log(`ERROR: ${e.error} - ${e.message}`));
  useSpeechRecognitionEvent('result', (e) => {
    const t = e.results[0]?.transcript ?? '';
    setWords(t);
    log(`result (final=${e.isFinal}): ${t}`);
  });

  const start = async () => {
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      log(`permission: ${perm.granted}`);
      if (!perm.granted) return;
      setWords('');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false, // simplest mode first
      });
      log('start() called');
    } catch (err: any) {
      log(`THREW: ${err?.message ?? err}`);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, paddingTop: 64, backgroundColor: '#fff' }}>
      <TouchableOpacity
        onPress={start}
        style={{ backgroundColor: '#00A3A3', padding: 16, borderRadius: 12, marginBottom: 8 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>START (speak, then wait)</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => ExpoSpeechRecognitionModule.stop()}
        style={{ backgroundColor: '#999', padding: 16, borderRadius: 12 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>STOP</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 24, marginVertical: 24 }}>{words || '(your words appear here)'}</Text>

      <ScrollView style={{ backgroundColor: '#111', padding: 8, borderRadius: 8 }}>
        {events.map((e, i) => (
          <Text key={i} style={{ color: '#9FFFE0', fontSize: 12 }}>{e}</Text>
        ))}
      </ScrollView>
    </View>
  );
}