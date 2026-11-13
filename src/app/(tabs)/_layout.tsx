import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { colors } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg }, animation: 'fade' }}
      tabBar={({ state, navigation }) => (
        <TabBar index={state.index} routes={state.routes.map((r) => r.name)} onPress={(name) => navigation.navigate(name)} />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="memories" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
