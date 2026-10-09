import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';


export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleMorePress = () => {
    console.log('More pressed');
  };

  const handleAddPress = () => {
    console.log('Add patient pressed');
  };
  
  function AppBar(){
    return (
      <View 
        className="bg-[#B1FFFF] pb-4 px-5 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 12 }}
      >
        <TouchableOpacity
          onPress={handleMenuPress}
          className="w-11 h-11 items-center justify-center"
          activeOpacity={0.6}
        >
          <Ionicons name="menu" size={28} color="#000000" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={handleSearchPress}
            className="w-11 h-11 items-center justify-center"
            activeOpacity={0.6}
          >
            <Ionicons name="search" size={24} color="#000000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMorePress}
            className="w-11 h-11 items-center justify-center"
            activeOpacity={0.6}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#FFFFFF','#B1FFFF']}
        start={{ x: 1, y: 1 }}
        end={{ x:0.5, y:0.5 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}      
      />

      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* App Bar */}
      <AppBar />

      {/* No Patient Screen */}
      <View className="flex-1 items-center justify-center px-6">
        <Text 
        className="text-2xl font-bold text-gray-600 mb-6"
        style={{ 
            fontFamily: 'Inter_700Bold',
            fontSize: 40
          }}
        >
          You have
        </Text>

        <Text 
        className="text-2xl font-bold text-gray-600 mb-6"
        style={{ 
            fontFamily: 'Inter_700Bold',
            fontSize: 40
          }}
        >
          no patients
        </Text>

        <Text 
        className="text-2xl font-bold text-gray-600 mb-6"
        style={{ 
            fontFamily: 'Inter_700Bold',
            fontSize: 40
          }}
        >
          yet...
        </Text>



        <TouchableOpacity
          onPress={handleAddPress}
          activeOpacity={0.7}
          className="bg-[#00A3A3] rounded-2xl flex-row items-center justify-center px-6 py-3"
        >

          <Ionicons name="add" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />

          <Text className="text-white text-base font-medium"
          style={{ fontFamily: 'Inter_500Medium'}}>
            Add Patients
          </Text>
          
        </TouchableOpacity>
      </View>

    
      
    </View>
  );
}
