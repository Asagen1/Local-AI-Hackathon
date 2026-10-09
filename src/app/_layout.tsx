import '../../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect, useState } from 'react';
import { isSetupComplete } from '@/utils/storage';
import { llmService } from '@/services/llm';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Pre-initialize ONNX model in background
  useEffect(() => {
    console.log('Pre-initializing ONNX model...');
    llmService.initialize()
      .then(() => {
        console.log('ONNX model ready!');
        setModelLoading(false);
      })
      .catch(err => {
        console.error('ONNX model initialization failed:', err);
        setModelLoading(false); // Continue anyway with fallback
      });
  }, []);

  // Check setup status periodically to detect changes
  useEffect(() => {
    const checkSetup = () => {
      const complete = isSetupComplete();
      setSetupComplete(complete);
    };
    
    checkSetup();
    
    // Check every 500ms to detect storage changes
    const interval = setInterval(checkSetup, 500);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!fontsLoaded || setupComplete === null) return;

    // Navigate to appropriate screen based on setup status
    const inSetup = segments[0] === 'setup';
    
    if (!setupComplete && !inSetup) {
      // Not setup, navigate to setup
      router.replace('/setup');
    } else if (setupComplete && inSetup) {
      // Setup complete but on setup screen, navigate to home
      router.replace('/');
    }
  }, [fontsLoaded, setupComplete, segments]);

  if (!fontsLoaded || setupComplete === null) {
    return null; // Show nothing while loading
  }

  return (
    <PaperProvider>
      <Stack 
        screenOptions={{ headerShown: false }}
        initialRouteName={setupComplete ? 'index' : 'setup'}
      >
        <Stack.Screen name="setup" />
        <Stack.Screen name="index" />
      </Stack>
    </PaperProvider>
  );
}
