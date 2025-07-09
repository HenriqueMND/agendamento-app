import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabaseClient';
import UploadFotoPerfil from './components/UploadFotoPerfil';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function PerfilPage() {
  const [user, setUser] = useState(null);
  const [nome, setNome] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      Alert.alert('Erro', 'Erro ao buscar usuário: ' + error.message);
    } else {
      setUser(user);
      setNome(user?.user_metadata?.nome || '');
      setFotoPerfilUrl(user?.user_metadata?.fotoPerfil || null);
    }
    setLoading(false);
  };

  const handleUpdateUserMetadata = async (dataToUpdate) => {
    const { error } = await supabase.auth.updateUser({
      data: dataToUpdate,
    });
    if (error) {
      Alert.alert('Erro', 'Erro ao atualizar dados: ' + error.message);
      return false;
    }
    return true;
  };

  const salvarNome = async () => {
    if (await handleUpdateUserMetadata({ nome })) {
      Alert.alert('Sucesso', 'Nome atualizado!');
      router.setParams({ updatedUserName: nome });
    }
  };

  const trocarSenha = async () => {
    if (!senhaNova) {
      Alert.alert('Atenção', 'A nova senha não pode ser vazia.');
      return;
    }
    if (senhaNova.length < 6) { // Adicionado verificação de comprimento mínimo para senha
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: senhaNova });
    if (error) {
      Alert.alert('Erro', 'Erro ao alterar senha: ' + error.message);
    } else {
      Alert.alert('Sucesso', 'Senha atualizada!');
      setSenhaNova('');
    }
  };

  const handleFotoUploadSuccess = (url) => {
    setFotoPerfilUrl(url);
    router.setParams({ updatedUserPhotoUrl: url });
  };

  if (loading) {
    return (
      <BackgroundWrapperAgenda>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8C315D" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </BackgroundWrapperAgenda>
    );
  }

  return (
    <BackgroundWrapperAgenda>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={30} color="#8C315D" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Meu Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profileSection}>
          {fotoPerfilUrl ? (
            <Image source={{ uri: fotoPerfilUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>{nome ? nome.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : '')}</Text>
            </View>
          )}
          <UploadFotoPerfil userId={user?.id} onUploadSuccess={handleFotoUploadSuccess} />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Nome:</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#888"
            value={nome}
            onChangeText={setNome}
          />
          <TouchableOpacity style={styles.botao} onPress={salvarNome}>
            <Text style={styles.botaoTexto}>Salvar Nome</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>Nova Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="*****"
            placeholderTextColor="#888"
            secureTextEntry
            value={senhaNova}
            onChangeText={setSenhaNova}
          />
          <TouchableOpacity style={[styles.botao, { backgroundColor: '#9b59b6' }]} onPress={trocarSenha}>
            <Text style={styles.botaoTexto}>Alterar Senha</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BackgroundWrapperAgenda>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8C315D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#F8F8F8',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 5,
    zIndex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8C315D',
    textAlign: 'center',
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#8C315D',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8C315D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImagePlaceholderText: {
    color: '#fff',
    fontSize: 50,
    fontWeight: 'bold',
  },
  formSection: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botao: {
    backgroundColor: '#2980b9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});