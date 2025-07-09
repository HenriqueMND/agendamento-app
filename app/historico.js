import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Platform, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { supabase } from '../services/supabaseClient';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';
import { ChevronLeft, Search } from 'lucide-react-native';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Calendar } from 'react-native-calendars';

moment.locale('pt-br');

export default function Historico() {
  const [historico, setHistorico] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState(null);

  const { useRouter } = require('expo-router');
  const router = useRouter();

  const carregarUsuario = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      setUser(data.user);
    } else {
      console.error("Erro ao carregar usuário para histórico:", error);
    }
  };

  const carregarHistorico = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from('agendamentos')
      .select('*')
      .eq('user_id', user.id);

    const today = moment().startOf('day');
    const now = moment();

    query = query.lte('data', today.format('YYYY-MM-DD'));

    if (startDateFilter) {
      query = query.gte('data', moment(startDateFilter).format('YYYY-MM-DD'));
    }
    if (endDateFilter) {
      query = query.lte('data', moment(endDateFilter).format('YYYY-MM-DD'));
    }

    query = query.order('data', { ascending: false }).order('horario', { ascending: false });

    const { data, error } = await query;

    let finalFilteredData = data;

    if (finalFilteredData) {
        finalFilteredData = finalFilteredData.filter(item => {
            const itemDate = moment(item.data);
            if (itemDate.isSame(now, 'day')) {
                const itemDateTime = moment(`${item.data} ${item.horario}`);
                return itemDateTime.isBefore(now);
            }
            return true;
        });
    }

    if (!error) {
      setHistorico(finalFilteredData);
    } else {
      console.error("Erro ao carregar histórico:", error);
      Alert.alert("Erro", "Não foi possível carregar o histórico de atendimentos.");
    }
    setLoading(false);
  }, [user, startDateFilter, endDateFilter]);

  useEffect(() => {
    carregarUsuario();
  }, []);

  useEffect(() => {
    if (user) {
      carregarHistorico();
    }
  }, [user, carregarHistorico]);

  const onCalendarDayPress = (day) => {
    const selectedMoment = moment(day.dateString);
    if (calendarTarget === 'start') {
      setStartDateFilter(selectedMoment.toDate());
    } else if (calendarTarget === 'end') {
      setEndDateFilter(selectedMoment.toDate());
    }
    setShowCalendarModal(false);
  };

  const filteredHistorico = historico.filter(item => {
    const lowerSearchText = searchText.toLowerCase().trim();
    if (!lowerSearchText) {
      return true;
    }
    return item.nome.toLowerCase().includes(lowerSearchText);
  });

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.nome}>{item.nome}</Text>
      <Text style={styles.details}>{moment(item.data).format('DD/MM/YYYY')} - {item.horario}</Text>
    </View>
  );

  return (
    <BackgroundWrapperAgenda>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="#8C315D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Atendimentos</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome do cliente..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <Search size={20} color="#8C315D" style={styles.searchIcon} />
          </View>

          <View style={styles.dateFilterContainer}>
            <TouchableOpacity 
              style={styles.dateInputButton} 
              onPress={() => {
                setCalendarTarget('start');
                setShowCalendarModal(true);
              }}
            >
              <Text style={styles.dateInputText}>
                {startDateFilter ? moment(startDateFilter).format('DD/MM/YYYY') : 'Data Inicial'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateInputButton} 
              onPress={() => {
                setCalendarTarget('end');
                setShowCalendarModal(true);
              }}
            >
              <Text style={styles.dateInputText}>
                {endDateFilter ? moment(endDateFilter).format('DD/MM/YYYY') : 'Data Final'}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={showCalendarModal}
            onRequestClose={() => setShowCalendarModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPressOut={() => setShowCalendarModal(false)}
            >
              <View style={styles.calendarModalContent}>
                <Calendar
                  onDayPress={onCalendarDayPress}
                  markedDates={{
                    [moment(calendarTarget === 'start' ? startDateFilter : endDateFilter).format('YYYY-MM-DD')]: {
                      selected: true,
                      marked: true,
                      selectedColor: '#8C315D',
                    },
                  }}
                  style={styles.calendar}
                  theme={{
                    selectedDayBackgroundColor: '#8C315D',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#8C315D',
                    arrowColor: '#8C315D',
                    textSectionTitleColor: '#8C315D',
                    textDayHeaderFontWeight: 'bold',
                    calendarBackground: '#fff',
                  }}
                />
                <TouchableOpacity 
                  onPress={() => setShowCalendarModal(false)} 
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8C315D" />
              <Text style={styles.loadingText}>Carregando histórico...</Text>
            </View>
          ) : filteredHistorico.length > 0 ? (
            <FlatList
              data={filteredHistorico}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum atendimento encontrado para o período ou busca selecionada.</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </BackgroundWrapperAgenda>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
  contentContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 100 : 90,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  searchIcon: {
    marginLeft: 10,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateInputButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
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
  listContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  details: {
    fontSize: 15,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#8C315D',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});