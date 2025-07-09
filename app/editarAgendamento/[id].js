import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../services/supabaseClient';
import BackgroundWrapperAgenda from '../components/BackgroundWrapperAgenda';
import { ChevronLeft } from 'lucide-react-native';

export default function EditarAgendamento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nomeCliente, setNomeCliente] = useState('');
  const [dataAtendimento, setDataAtendimento] = useState('');
  const [horarioAtendimento, setHorarioAtendimento] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [agendamentoOriginal, setAgendamentoOriginal] = useState(null);

  const carregarAgendamento = useCallback(async () => {
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
      Alert.alert("Acesso Negado", "Você precisa estar logado para editar atendimentos.");
      router.replace('/login');
      setLoading(false);
      return;
    }

    // AQUI: Adicionado .eq('user_id', user.id) para o SELECT
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // ESSENCIAL para RLS no SELECT
      .single();

    if (error) {
      console.error("Erro ao carregar agendamento para edição:", error.message);
      Alert.alert('Erro', 'Não foi possível carregar o agendamento para edição ou você não tem permissão para editá-lo.');
      setLoading(false);
      return;
    }

    setAgendamentoOriginal(data);
    setNomeCliente(data.nome || '');
    setDataAtendimento(data.data || '');
    setHorarioAtendimento(data.horario || '');
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    carregarAgendamento();
  }, [carregarAgendamento]);

  const handleSalvarAlteracoes = async () => {
    if (!user || !user.id || !agendamentoOriginal) {
      Alert.alert("Erro", "Dados do usuário ou agendamento original ausentes.");
      return;
    }

    if (!nomeCliente || !dataAtendimento || !horarioAtendimento) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    // AQUI: Adicionado .eq('user_id', user.id) para o UPDATE
    const { error } = await supabase
      .from('agendamentos')
      .update({
        nome: nomeCliente,
        data: dataAtendimento,
        horario: horarioAtendimento,
        id_contato: agendamentoOriginal.id_contato || null,
      })
      .eq('id', id)
      .eq('user_id', user.id); // ESSENCIAL para RLS no UPDATE

    setLoading(false);

    if (!error) {
      Alert.alert('Sucesso', 'Atendimento atualizado com sucesso!');
      router.replace(`/verAtendimento/${id}`);
    } else {
      console.error("Erro ao atualizar atendimento:", error.message);
      Alert.alert('Erro', `Não foi possível atualizar o atendimento: ${error.message}. Verifique suas permissões (RLS) no Supabase.`);
    }
  };

  if (loading) {
    return (
      <BackgroundWrapperAgenda>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8C315D" />
          <Text style={styles.loadingText}>Carregando dados do atendimento...</Text>
        </View>
      </BackgroundWrapperAgenda>
    );
  }

  if (!agendamentoOriginal) {
    return (
      <BackgroundWrapperAgenda>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color="#8C315D" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editar Atendimento</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Atendimento não encontrado ou inacessível para edição.</Text>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#6c757d', marginTop: 20 }]} onPress={() => router.back()}>
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
            <ChevronLeft size={28} color="#8C315D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Atendimento</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Nome do Cliente:</Text>
            <TextInput
              style={styles.input}
              value={nomeCliente}
              onChangeText={setNomeCliente}
              placeholder="Nome do cliente"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Data do Atendimento (AAAA-MM-DD):</Text>
            <TextInput
              style={styles.input}
              value={dataAtendimento}
              onChangeText={setDataAtendimento}
              placeholder="Ex: 2025-07-09"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Horário do Atendimento (HH:MM):</Text>
            <TextInput
              style={styles.input}
              value={horarioAtendimento}
              onChangeText={setHorarioAtendimento}
              placeholder="Ex: 14:30"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#28a745', marginTop: 20 }]}
              onPress={handleSalvarAlteracoes}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#6c757d' }]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapperAgenda>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 100,
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
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