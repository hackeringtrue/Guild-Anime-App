import { View, Text } from 'react-native';

export default function TestPage() {
  return (
    <View style={{ flex: 1, backgroundColor: 'yellow', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: 'black' }}>TEST PAGE - If you see this, React is working!</Text>
      <Text style={{ fontSize: 18, color: 'red', marginTop: 20 }}>Current time: {new Date().toLocaleTimeString()}</Text>
    </View>
  );
}