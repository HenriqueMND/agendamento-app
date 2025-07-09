import { StyleSheet, Text, TextInput, View } from 'react-native';

const InputCampo = ({ label, value, onChangeText, placeholder, secureTextEntry }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#999"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  label: {
    marginBottom: 4,
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
  },
});

export default InputCampo;
