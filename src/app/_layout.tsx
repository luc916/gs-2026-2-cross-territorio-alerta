import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TerritorioProvider } from '../context/TerritorioContext';
import { cores } from '../components/UI';

export default function Layout() {
  return <TerritorioProvider><StatusBar style="dark" /><Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: cores.verde, tabBarInactiveTintColor: cores.cinza, tabBarStyle: { minHeight: 66, paddingTop: 6 }, tabBarLabelStyle: { fontSize: 11 } }}>
    <Tabs.Screen name="index" options={{ title: 'Painel', tabBarIcon: ({ color }) => <Text style={{ color, fontWeight: '800' }}>▥</Text> }} />
    <Tabs.Screen name="alertas" options={{ title: 'Alertas', tabBarIcon: ({ color }) => <Text style={{ color, fontWeight: '800' }}>!</Text> }} />
    <Tabs.Screen name="leituras" options={{ title: 'Leituras', tabBarIcon: ({ color }) => <Text style={{ color, fontWeight: '800' }}>≡</Text> }} />
    <Tabs.Screen name="territorio" options={{ title: 'Território', tabBarIcon: ({ color }) => <Text style={{ color, fontWeight: '800' }}>◎</Text> }} />
  </Tabs></TerritorioProvider>;
}
