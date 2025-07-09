import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Contato = ({ contato }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.nome}>{contato.nome}</Text>
      <Text style={styles.telefone}>{contato.telefone}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  telefone: {
    fontSize: 14,
    color: '#555',
  },
});

export default Contato;
