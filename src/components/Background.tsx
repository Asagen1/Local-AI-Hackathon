import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

export default function Background() {
  return (
    <View 
      style={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%',
        backgroundColor: '#E6FFFF' // Fallback color
      }}
    >
      <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="45%" r="75%">
            <Stop offset="0" stopColor="#E6FFFF" />
            <Stop offset="1" stopColor="#B3FFFF" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bg)" />
      </Svg>
    </View>
  );
}
