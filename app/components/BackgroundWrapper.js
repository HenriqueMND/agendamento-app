// components/BackgroundWrapper.js
import { ImageBackground, StyleSheet, View } from 'react-native';

const BackgroundWrapper = ({ children }) => {
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackgroundWrapper;