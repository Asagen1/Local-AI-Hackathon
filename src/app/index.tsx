import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import { router } from 'expo-router';

const TEXT = '#455556';
const MUTED = '#7AA8A8';

function Background() {
  return (
    <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <Defs>
        <RadialGradient id="bg" cx="50%" cy="45%" r="75%">
          <Stop offset="0" stopColor="#E6FFFF" />
          <Stop offset="1" stopColor="#B3FFFF" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bg)" />
    </Svg>
  );
}

function AppBar({
  onMenu,
  onSearch,
  onMore,
}: {
  onMenu: () => void;
  onSearch: () => void;
  onMore: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-5 pb-2 flex-row items-center justify-between"
      style={{ paddingTop: insets.top + 8 }}
    >
      <TouchableOpacity onPress={onMenu} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
        <Ionicons name="menu" size={28} color={TEXT} />
      </TouchableOpacity>

      <View className="flex-row items-center">
        <TouchableOpacity onPress={onSearch} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="search" size={24} color={TEXT} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMore} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="ellipsis-vertical" size={22} color={TEXT} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <Background />

      <AppBar
        onMenu={() => console.log('Menu pressed')}
        onSearch={() => console.log('Search pressed')}
        onMore={() => console.log('More pressed')}
      />

      <View className="flex-1 px-6">
        {/* Heading */}
        <Text
          className="mt-20 ml-5"
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 50,
            lineHeight: 50,
            color: TEXT,
            maxWidth: 300,
          }}
        >
          You have no patients yet...
        </Text>

        {/* Glass button */}
        <TouchableOpacity
          onPress={() => console.log('hello')}
          activeOpacity={0.7}
          className="self-center mt-20 flex-row items-center justify-center px-10 py-3 rounded-[20px] border border-[#9CC4C4] bg-white/35"
        >
          <View className="w-9 h-9 rounded-full bg-[#D3EAEA] items-center justify-center mr-3.5">
            <Ionicons name="add" size={22} color={MUTED} />
          </View>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: TEXT }}>
            Add Patients
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}