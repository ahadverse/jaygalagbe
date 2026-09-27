import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatThreadScreen } from '../screens/messages/chat-thread-screen';
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
      <Stack.Screen
        name="ChatThread"
        component={ChatThreadScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
}
