import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function Header({ left }: { left: ReactNode }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      {left}
      <TouchableOpacity hitSlop={8} onPress={() => router.push('/notifications' as any)}>
        <MaterialIcons name="notifications-none" size={24} color="#11181C" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
});
