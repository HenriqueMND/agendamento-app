import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabaseClient';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';
import Contato from './components/contato';

export default function ContatosPage() {
  const router = useRouter();
  const [contatos, setContatos] = useState([]);

  useEffect(() => {
    buscarContatos();
  }, []);

  const buscarContatos = async () => {
    const { data, error } = await supabase.from('contatos').select('*');
    if (error) {
      console.error('Erro ao buscar contatos:', error.message);
    } else {
      setContatos(data);
    }
  };

  const irParaCriarContato = () => {
    router.push('/criarContato');
  };

  const renderItem = ({ item }) => (
    <Contato contato={item} onPress={() => {}} />
  );

  return (
    <BackgroundWrapperAgenda>
      <Text style={styles.titulo}>Contatos</Text>

      {contatos.length === 0 ? (
        <Text style={styles.semContatos}>Nenhum contato cadastrado.</Text>
      ) : (
        <FlatList
          data={contatos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      <TouchableOpacity style={styles.botaoNovo} onPress={irParaCriarContato}>
        <Text style={styles.botaoTexto}>+</Text>
      </TouchableOpacity>
    </BackgroundWrapperAgenda>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  semContatos: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  botaoNovo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#27ae60',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  botaoTexto: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});
