import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MessagesScreen } from '../screens/messages/messages-screen';
import type { MessagesStackParamList } from './types';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export function MessagesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
    </Stack.Navigator>
  );
}
