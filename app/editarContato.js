import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabaseClient';
import { ChevronLeft } from 'lucide-react-native';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';

const AppColors = {
  primary: '#8C315D',
  secondary: '#f6f4c2',
  text: '#333',
  background: '#F8F8F8',
  buttonPrimary: '#8dc9b5',
  buttonDanger: '#ff695c',
  buttonCancel: '#f6f4c2',
};

const Avatar = ({ fotoUrl, nome, email }) => {
  if (fotoUrl) {
    return <Image source={{ uri: fotoUrl }} style={styles.profileImage} />;
  }

  const initial = nome ? nome.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '');
  return (
    <View style={styles.profileImagePlaceholder}>
      <Text style={styles.profileImagePlaceholderText}>{initial}</Text>
    </View>
  );
};

export default function EditarContato() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [fotoUrl, setFotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      if (params) {
        setNome(params.nome || '');
        setTelefone(params.telefone || '');
        setFotoUrl(params.foto_url || null);
      }
      carregarUsuario();
      isMounted.current = true;
    }
  }, []);

  const carregarUsuario = async () => {
    setLoading(true);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error) {
      setUser(user);
    } else {
      Alert.alert("Erro", "Erro ao carregar dados do usuário: " + error.message);
    }
    setLoading(false);
  };

  const handleSalvar = async () => {
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado. Por favor, faça login novamente.");
      setLoading(false);
      return;
    }
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert("Atenção", "Por favor, preencha nome e telefone.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('contatos')
      .update({ nome, telefone })
      .eq('id', params.id)
      .eq('user_id', user.id);

    setLoading(false);

    if (!error) {
      Alert.alert("Sucesso", "Contato atualizado com sucesso!");
      router.back();
    } else {
      Alert.alert("Erro", `Não foi possível atualizar o contato: ${error.message}`);
    }
  };

  const handleDeletar = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja apagar este contato?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Apagar",
          onPress: async () => {
            if (!user || !user.id) {
              Alert.alert("Erro", "Usuário não autenticado. Não é possível apagar o contato.");
              setLoading(false);
              return;
            }
            if (!params.id) {
              Alert.alert("Erro", "ID do contato não encontrado. Não é possível apagar.");
              setLoading(false);
              return;
            }

            setLoading(true);
            const { error } = await supabase
              .from('contatos')
              .delete()
              .eq('id', params.id)
              .eq('user_id', user.id);

            setLoading(false);

            if (!error) {
              Alert.alert("Sucesso", "Contato apagado com sucesso!");
              router.back();
            } else {
              Alert.alert("Erro", `Não foi possível apagar o contato: ${error.message}. Isso pode ser devido a permissões de segurança (RLS) ou dados inconsistentes.`);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleCancelar = () => {
    router.back();
  };

  if (loading) {
    return (
      <BackgroundWrapperAgenda>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Carregando contato...</Text>
        </View>
      </BackgroundWrapperAgenda>
    );
  }

  return (
    <BackgroundWrapperAgenda>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={30} color={AppColors.primary} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Editar Contato</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.avatarContainer}>
            <Avatar fotoUrl={fotoUrl} nome={nome} email={user?.email} />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Nome do Contato:</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={text => setNome(text)}
              placeholder="Nome do Contato"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Telefone:</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={text => setTelefone(text)}
              placeholder="Telefone"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </ScrollView>

        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity style={[styles.button, { backgroundColor: AppColors.buttonPrimary }]} onPress={handleSalvar}>
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: AppColors.buttonDanger }]} onPress={handleDeletar}>
            <Text style={styles.buttonText}>Apagar Contato</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: AppColors.buttonCancel }]} onPress={handleCancelar}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundWrapperAgenda>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: AppColors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 5,
    zIndex: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.primary,
    textAlign: 'center',
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 100 : 90,
    paddingBottom: 220, 
  },
  avatarContainer: {
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: AppColors.text,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    gap: 10, 
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0, 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});