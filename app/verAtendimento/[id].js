import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../services/supabaseClient';
import BackgroundWrapperAgenda from '../components/BackgroundWrapperAgenda';
import { ChevronLeft } from 'lucide-react-native';

export default function VerAtendimento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [agendamento, setAgendamento] = useState(null);
  const [contato, setContato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Erro ao carregar usuário:", userError.message);
      Alert.alert("Erro", "Não foi possível obter dados do usuário.");
      setLoading(false);
      return;
    }
    setUser(user);

    if (!user) {
      Alert.alert("Acesso Negado", "Você precisa estar logado para ver atendimentos.");
      router.replace('/login');
      setLoading(false);
      return;
    }

    const { data: agendamentoData, error: agendamentoError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (agendamentoError) {
      console.error("Erro ao carregar agendamento:", agendamentoError.message);
      Alert.alert('Erro', 'Não foi possível carregar o atendimento ou você não tem permissão para vê-lo.');
      setAgendamento(null);
      setLoading(false);
      return;
    }
    setAgendamento(agendamentoData);

    if (agendamentoData.id_contato) {
      const { data: contatoData, error: contatoError } = await supabase
        .from('contatos')
        .select('*')
        .eq('id', agendamentoData.id_contato)
        .eq('user_id', user.id)
        .single();
      
      if (contatoError) {
          console.error("Erro ao carregar contato:", contatoError.message);
      }
      setContato(contatoData);
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const confirmarAtendimento = async () => {
    if (!agendamento || !user) {
      Alert.alert("Erro", "Dados do agendamento ou usuário ausentes.");
      return;
    }
    Alert.alert(
      "Confirmar Atendimento",
      "Deseja realmente confirmar este atendimento e movê-lo para o histórico?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          onPress: async () => {
            setLoading(true);
            const { error: insertError } = await supabase
              .from('historico')
              .insert([{ 
                  ...agendamento,
                  user_id: user.id
              }]);

            if (insertError) {
              console.error("Erro ao inserir no histórico:", insertError.message);
              Alert.alert('Erro', `Não foi possível mover para o histórico: ${insertError.message}`);
              setLoading(false);
              return;
            }

            const { error: deleteError } = await supabase
              .from('agendamentos')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id);

            setLoading(false);

            if (!deleteError) {
              Alert.alert('Confirmado', 'Atendimento movido para o histórico com sucesso!');
              router.replace('/dashboard');
            } else {
              console.error("Erro ao deletar agendamento:", deleteError.message);
              Alert.alert('Erro', `Atendimento movido para o histórico, mas houve um erro ao remover dos agendamentos: ${deleteError.message}`);
              router.replace('/dashboard');
            }
          },
        },
      ]
    );
  };

  const cancelarAtendimento = async () => {
    if (!agendamento || !user) {
      Alert.alert("Erro", "Dados do agendamento ou usuário ausentes.");
      return;
    }
    Alert.alert('Cancelar Atendimento?', 'Essa ação não pode ser desfeita e o atendimento não será registrado no histórico.', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase
            .from('agendamentos')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          setLoading(false);

          if (!error) {
            Alert.alert('Cancelado', 'O atendimento foi cancelado com sucesso!');
            router.replace('/dashboard');
          } else {
            console.error("Erro ao cancelar agendamento:", error.message);
            Alert.alert('Erro', `Não foi possível cancelar o atendimento: ${error.message}`);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <BackgroundWrapperAgenda>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={styles.AppColors.primary} />
          <Text style={styles.loadingText}>Carregando atendimento...</Text>
        </View>
      </BackgroundWrapperAgenda>
    );
  }

  if (!agendamento) {
    return (
      <BackgroundWrapperAgenda>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color={styles.AppColors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalhes do Atendimento</Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Atendimento não encontrado ou inacessível.</Text>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: styles.AppColors.buttonCancel, marginTop: 20 }]} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BackgroundWrapperAgenda>
    );
  }

  return (
    <BackgroundWrapperAgenda>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color={styles.AppColors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Atendimento</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Cliente:</Text> {agendamento.nome}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Data:</Text> {agendamento.data}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Horário:</Text> {agendamento.horario}</Text>

            {agendamento.id_contato && contato && (
              <>
                <Text style={styles.detailItem}><Text style={styles.detailLabel}>Contato:</Text> {contato.nome}</Text>
                <Text style={styles.detailItem}><Text style={styles.detailLabel}>Telefone:</Text> {contato.telefone}</Text>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: styles.AppColors.buttonPrimary }]} onPress={confirmarAtendimento}>
            <Text style={styles.buttonText}>Confirmar Atendimento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: styles.AppColors.buttonInfo }]} onPress={() => router.push(`/editarAgendamento/${id}`)}>
            <Text style={styles.buttonText}>Editar Atendimento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: styles.AppColors.buttonDanger }]} onPress={cancelarAtendimento}>
            <Text style={styles.buttonText}>Cancelar Atendimento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: styles.AppColors.buttonCancel }]} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundWrapperAgenda>
  );
}

const styles = StyleSheet.create({
  AppColors: {
    primary: '#8C315D',
    secondary: '#FFD700',
    text: '#333',
    background: '#F8F8F8',
    buttonPrimary: '#28a745',
    buttonDanger: '#dc3545',
    buttonInfo: '#007bff',
    buttonCancel: '#6c757d',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
    paddingHorizontal: 15,
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
    left: 15,
    padding: 5,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8C315D',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 100 : 90,
    paddingBottom: 200,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    fontSize: 17,
    marginBottom: 8,
    color: '#333',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#333',
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
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});