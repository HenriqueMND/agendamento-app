import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, SafeAreaView, Platform, ScrollView, Image } from 'react-native';
import { supabase } from '../services/supabaseClient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';
import { PlusCircle, ChevronLeft, Eye } from 'lucide-react-native';

const AppColors = {
  primary: '#8C315D',
  secondary: '#FFD700',
  text: '#333',
  background: '#F8F8F8',
  buttonPrimary: '#28a745',
  buttonDanger: '#dc3545',
  buttonCancel: '#6c757d',
};

const Avatar = ({ fotoUrl, nome }) => {
  if (fotoUrl) {
    return <Image source={{ uri: fotoUrl }} style={styles.contactAvatar} />;
  }

  const initial = nome ? nome.charAt(0).toUpperCase() : '';
  return (
    <View style={styles.contactAvatarPlaceholder}>
      <Text style={styles.contactAvatarPlaceholderText}>{initial}</Text>
    </View>
  );
};

const ContactCard = ({ contact, onPress }) => (
  <TouchableOpacity style={styles.ContactCard} onPress={onPress}>
    <Avatar fotoUrl={contact.foto_url} nome={contact.nome} />
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{contact.nome}</Text>
      <Text style={styles.contactPhone}>{contact.telefone}</Text>
    </View>
    <TouchableOpacity style={styles.viewIcon} onPress={onPress}>
      <Eye size={24} color={AppColors.primary} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function VerContatos() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const fetchContatos = useCallback(async () => {
    setRefreshing(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Erro ao carregar usuário:", userError);
      Alert.alert("Erro", "Erro ao carregar dados do usuário: " + userError.message);
      setRefreshing(false);
      setLoading(false);
      return;
    }

    setUser(user);

    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado. Por favor, faça login.");
      setRefreshing(false);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .eq('user_id', user.id)
      .order('nome', { ascending: true });

    if (error) {
      console.error("Erro ao buscar contatos:", error.message);
      Alert.alert("Erro", "Não foi possível carregar os contatos: " + error.message);
    } else {
      setContatos(data);
    }
    setRefreshing(false);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchContatos();
    }, [fetchContatos])
  );

  const onRefresh = useCallback(() => {
    fetchContatos();
  }, [fetchContatos]);

  return (
    <BackgroundWrapperAgenda>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={30} color={AppColors.primary} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Contatos</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Carregando contatos...</Text>
          </View>
        ) : contatos.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppColors.primary]} />
            }
          >
            <Text style={styles.emptyText}>Nenhum contato encontrado.</Text>
            <Text style={styles.emptyText}>Clique no '+' para adicionar um novo!</Text>
          </ScrollView>
        ) : (
          <FlatList
            data={contatos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContactCard
                contact={item}
                onPress={() => router.push({ pathname: "/editarContato", params: item })}
              />
            )}
            contentContainerStyle={styles.listContentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppColors.primary]} />
            }
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/criarContato")}
        >
          <PlusCircle size={30} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
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
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
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
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: AppColors.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ContactCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  contactAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarPlaceholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  contactPhone: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  viewIcon: {
    padding: 5,
  }
});