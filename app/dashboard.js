import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ScrollView, Alert, RefreshControl, Platform } from 'react-native';
import { supabase } from '../services/supabaseClient';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';
import DashboardNavbar from './components/DashboardNavbar';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import moment from 'moment/min/moment-with-locales';
import { Eye } from 'lucide-react-native';

moment.locale('pt-br');

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosSemana, setAgendamentosSemana] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(moment());
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  const diasDaSemana = [...Array(6)].map((_, i) =>
    moment().startOf('week').add(i + 1, 'days')
  );

  const carregarUsuario = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error) {
      setUser(user);
    } else {
      console.error("Erro ao carregar usuário:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do usuário. Por favor, tente novamente.");
    }
  };

  const carregarAgendamentos = async () => {
    if (!user) {
      setAgendamentos([]);
      return;
    }

    const dataFormatada = dataSelecionada.format('YYYY-MM-DD');
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('user_id', user.id)
      .eq('data', dataFormatada)
      .order('horario', { ascending: true });

    if (!error) {
      setAgendamentos(data);
    } else {
      console.error("Erro ao carregar agendamentos:", error);
      Alert.alert("Erro", "Não foi possível carregar os agendamentos. Por favor, tente novamente.");
      setAgendamentos([]);
    }
  };

  const carregarAgendamentosDaSemana = async () => {
    if (!user) return;

    const inicioSemana = moment().startOf('week').format('YYYY-MM-DD');
    const fimSemana = moment().endOf('week').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('user_id', user.id)
      .gte('data', inicioSemana)
      .lte('data', fimSemana)
      .order('data', { ascending: true })
      .order('horario', { ascending: true });

    if (!error) {
      setAgendamentosSemana(data);
    } else {
      console.error("Erro ao carregar agendamentos da semana:", error);
      setAgendamentosSemana([]);
    }
  };

  const filtrarAgendamentosDoDia = useCallback(() => {
    const filtered = agendamentosSemana.filter(agendamento =>
      moment(agendamento.data).format('YYYY-MM-DD') === dataSelecionada.format('YYYY-MM-DD')
    );
    setAgendamentos(filtered);
  }, [agendamentosSemana, dataSelecionada]);

  useFocusEffect(
    useCallback(() => {
      carregarUsuario();
      carregarAgendamentosDaSemana();
    }, [])
  );

  useEffect(() => {
    if (user) {
      carregarAgendamentosDaSemana();
    }
  }, [user]);

  useEffect(() => {
    filtrarAgendamentosDoDia();
  }, [dataSelecionada, agendamentosSemana, filtrarAgendamentosDoDia]);

  useEffect(() => {
    if (params?.updatedUserName || params?.updatedUserPhotoUrl) {
      setUser(prevUser => {
        if (!prevUser) return null;
        const newUserMetadata = { ...prevUser.user_metadata };
        if (params.updatedUserName) {
          newUserMetadata.nome = params.updatedUserName;
        }
        if (params.updatedUserPhotoUrl) {
          newUserMetadata.fotoPerfil = params.updatedUserPhotoUrl;
        }
        return {
          ...prevUser,
          user_metadata: newUserMetadata,
        };
      });
      router.setParams({ updatedUserName: undefined, updatedUserPhotoUrl: undefined });
    }
  }, [params, router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarUsuario();
    await carregarAgendamentosDaSemana();
    setRefreshing(false);
  }, []);

  const renderAgendamento = ({ item }) => (
    <TouchableOpacity
      style={styles.agendamentoCard}
      onPress={() => router.push(`/verAtendimento/${item.id}`)}
    >
      <View style={styles.agendamentoTexto}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.hora}>{item.horario}</Text>
      </View>
      <Eye size={22} color="#555" />
    </TouchableOpacity>
  );

  const FIXED_BUTTONS_HEIGHT = 270;

  return (
    <BackgroundWrapperAgenda>
      <View style={styles.safeArea}>
        <DashboardNavbar
          userName={user?.user_metadata?.nome || user?.email}
          userPhotoUrl={user?.user_metadata?.fotoPerfil}
        />

        <View style={styles.fixedContentTop}>
          <Text style={styles.titulo}>Agendamentos da Semana</Text>
          <View style={styles.diasContainer}>
            {diasDaSemana.map((dia, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dia,
                  dia.isSame(dataSelecionada, 'day') && styles.diaSelecionado,
                ]}
                onPress={() => setDataSelecionada(dia)}
              >
                <Text style={[styles.diaTexto, dia.isSame(dataSelecionada, 'day') && styles.diaTextoSelecionado]}>
                  {dia.format('ddd')}
                </Text>
                <Text style={[styles.diaData, dia.isSame(dataSelecionada, 'day') && styles.diaTextoSelecionado]}>
                  {dia.format('DD/MM')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.agendamentosListWrapper}>
          {agendamentos.length === 0 ? (
            <ScrollView
              contentContainerStyle={styles.semDadosContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8C315D']} />
              }
            >
              <Text style={styles.semDados}>Nenhum atendimento para este dia.</Text>
            </ScrollView>
          ) : (
            <FlatList
              data={agendamentos}
              renderItem={renderAgendamento}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={[
                styles.flatListContent,
                { paddingBottom: FIXED_BUTTONS_HEIGHT + 20 }
              ]}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8C315D']} />
              }
            />
          )}
        </View>

        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={styles.botaoNovo}
            onPress={() => router.push('/novoAgendamento')}
          >
            <Text style={styles.botaoTexto}>+ Novo Atendimento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoPadrao}
            onPress={() => router.push('/verContatos')}
          >
            <Text style={styles.botaoTexto}>Ver Contatos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoPadrao, { backgroundColor: '#8e44ad' }]}
            onPress={() => router.push('/historico')}
          >
            <Text style={styles.botaoTexto}>Histórico</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoPadrao, { backgroundColor: '#3498db' }]}
            onPress={() => router.push('/agenda')}
          >
            <Text style={styles.botaoTexto}>Agenda Completa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundWrapperAgenda>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8F8F8',
  },
  fixedContentTop: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#F8F8F8',
    zIndex: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8C315D',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  diasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dia: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 15,
    alignItems: 'center',
    width: Dimensions.get('window').width / 7 - 10,
    marginHorizontal: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  diaSelecionado: {
    backgroundColor: '#8C315D',
  },
  diaTexto: {
    fontWeight: 'bold',
    color: '#333',
  },
  diaData: {
    color: '#666',
    fontSize: 12,
  },
  diaTextoSelecionado: {
    color: '#fff',
  },
  agendamentosListWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  flatListContent: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  agendamentoCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  agendamentoTexto: {
    flex: 1,
  },
  nome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  hora: {
    fontSize: 15,
    color: '#666',
  },
  semDadosContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  semDados: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    gap: 8,
    height: 270,
    justifyContent: 'center',
  },
  botaoNovo: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  botaoPadrao: {
    backgroundColor: '#5e87cc',
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  botaoTexto: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});