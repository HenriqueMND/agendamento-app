import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars'; // Importar LocaleConfig
import { supabase } from '../services/supabaseClient';
import { useRouter } from 'expo-router';
import moment from 'moment/min/moment-with-locales';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';
import { Eye, ChevronLeft } from 'lucide-react-native';

moment.locale('pt-br');

// Configuração de localização para react-native-calendars
LocaleConfig.locales['pt'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt'; // Definir 'pt' como o locale padrão

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [agendamentos, setAgendamentos] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    carregarUsuario();
  }, []);

  useEffect(() => {
    if (user && selectedDate) {
      carregarAgendamentosDoDia(selectedDate);
    }
  }, [selectedDate, user]);

  const carregarUsuario = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      setUser(data.user);
    } else {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const carregarAgendamentosDoDia = async (date) => {
    if (!user) {
      console.warn("Usuário não carregado, não é possível carregar agendamentos.");
      return;
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('user_id', user.id)
      .eq('data', date);

    if (!error) {
      setAgendamentos(data);
    } else {
      console.error("Erro ao carregar agendamentos:", error);
      setAgendamentos([]);
    }
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

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

  return (
    <BackgroundWrapperAgenda>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={30} color="#8C315D" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Agenda Completa</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: { selected: true, marked: true, selectedColor: '#8C315D' }
          }}
          theme={{
            selectedDayBackgroundColor: '#8C315D',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#8C315D',
            arrowColor: '#8C315D',
            monthTextColor: '#8C315D',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />

        <Text style={styles.subTitulo}>Agendamentos para {moment(selectedDate).format('DD [de] MMMM [de] YYYY')}</Text>

        <View style={styles.agendamentosListContainer}>
          {agendamentos.length === 0 ? (
            <Text style={styles.semDados}>Nenhum atendimento para este dia.</Text>
          ) : (
            <FlatList
              data={agendamentos}
              renderItem={renderAgendamento}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>
      </ScrollView>
    </BackgroundWrapperAgenda>
  );
}

const styles = StyleSheet.create({
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
  subTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 10,
  },
  agendamentosListContainer: {
    marginTop: 10,
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
  semDados: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  flatListContent: {
    paddingBottom: 10,
  }
});