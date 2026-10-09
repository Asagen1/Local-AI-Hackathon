import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export default function SpeechTest() {
  const [words, setWords] = useState('');
  const [status, setStatus] = useState('');

  useSpeechRecognitionEvent('start', () => setStatus('Listening...'));
  useSpeechRecognitionEvent('end', () => setStatus('Stopped'));
  useSpeechRecognitionEvent('error', (e) => setStatus(`Error: ${e.error}`));
  useSpeechRecognitionEvent('result', (e) => {
    const t = e.results[0]?.transcript ?? '';
    setWords(t);
    setStatus(e.isFinal ? 'Complete' : 'Recording...');
  });

  const start = async () => {
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setStatus('Permission denied');
        return;
      }
      setWords('');
      setStatus('Starting...');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
      });
    } catch (err: any) {
      setStatus(`Error: ${err?.message ?? err}`);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, paddingTop: 64, backgroundColor: '#fff' }}>
      <TouchableOpacity
        onPress={start}
        style={{ backgroundColor: '#00A3A3', padding: 16, borderRadius: 12, marginBottom: 8 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>START RECORDING</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => ExpoSpeechRecognitionModule.stop()}
        style={{ backgroundColor: '#666', padding: 16, borderRadius: 12, marginBottom: 24 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>STOP</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>{status}</Text>
      <Text style={{ fontSize: 18, lineHeight: 28 }}>{words || 'Speak to see your words here...'}</Text>
    </View>
  );
}