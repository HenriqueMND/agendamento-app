import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const Botao = ({ titulo, onPress, cor = '#72284B' }) => {
  return (
    <TouchableOpacity style={[styles.botao, { backgroundColor: cor }]} onPress={onPress}>
      <Text style={styles.texto}>{titulo}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  botao: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  texto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Botao;
