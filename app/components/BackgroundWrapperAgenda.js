import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BackgroundWrapperAgenda({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      <SafeAreaView style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
  },
});