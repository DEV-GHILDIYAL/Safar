import { Tabs } from 'expo-router';
import { ErrorView } from '@/components/ErrorView';
import { TabBar } from '@/components/TabBar';
import { colors } from '@/theme/tokens';

export { ErrorView as ErrorBoundary };

export default function TabsLayout() {
  return (
    <Tabs
      // No navigator `animation`: the native-driver scene fade conflicted with Reanimated entering
      // animations on freshly mounted tabs (app closed on tab switch). Screens animate their own content.
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
      tabBar={({ state, navigation }) => (
        <TabBar
          index={state.index}
          routes={state.routes.map((r) => r.name)}
          onPress={(name) => {
            const route = state.routes.find((r) => r.name === name);
            if (!route) return;
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!event.defaultPrevented) navigation.navigate(route.name, route.params);
          }}
        />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="memories" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
