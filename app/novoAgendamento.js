import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
import { supabase } from '../services/supabaseClient';
import Botao from './components/botao';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import 'moment/locale/pt-br';
import { ChevronLeft } from 'lucide-react-native';

moment.locale('pt-br');

export default function NovoAgendamento() {
  const [nome, setNome] = useState('');
  const [dataExibicao, setDataExibicao] = useState(moment().format('DD/MM/YYYY'));
  const [horarioExibicao, setHorarioExibicao] = useState(moment().format('HH:mm'));
  
  const [dataParaDB, setDataParaDB] = useState(moment().format('YYYY-MM-DD')); 
  const [horarioParaDB, setHorarioParaDB] = useState(moment().toDate()); 

  const [showDatePickerCalendar, setShowDatePickerCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const carregarUsuario = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert('Erro', 'Não foi possível carregar as informações do usuário.');
        return;
      }
      setUser(user);
    };
    carregarUsuario();
  }, []);

  const onDayPress = (day) => {
    const selectedMoment = moment(day.dateString);
    setDataParaDB(selectedMoment.format('YYYY-MM-DD'));
    setDataExibicao(selectedMoment.format('DD/MM/YYYY'));
    setShowDatePickerCalendar(false);
  };

  const onTimeChangeMobile = (event, newTime) => {
    setShowTimePicker(false); 
    if (newTime) {
      setHorarioParaDB(newTime);
      setHorarioExibicao(moment(newTime).format('HH:mm'));
    }
  };

  const salvar = async () => {
    if (!nome || !dataParaDB || !horarioExibicao) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }

    const horarioFinalParaDB = horarioExibicao;

    const { error } = await supabase.from('agendamentos').insert({
      nome,
      data: dataParaDB,
      horario: horarioFinalParaDB,
      user_id: user.id,
    });

    if (error) {
      console.error("Erro ao salvar agendamento no Supabase:", error);
      Alert.alert('Erro ao salvar agendamento', error.message);
    } else {
      Alert.alert('Sucesso', 'Agendamento salvo com sucesso!');
      setNome('');
      setDataExibicao(moment().format('DD/MM/YYYY'));
      setHorarioExibicao(moment().format('HH:mm'));
      setDataParaDB(moment().format('YYYY-MM-DD'));
      setHorarioParaDB(moment().toDate());
      router.replace('/dashboard');
    }
  };

  return (
    <BackgroundWrapperAgenda>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="#8C315D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Agendamento</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Detalhes do Agendamento</Text>
          
          <Text style={styles.label}>Nome da cliente</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome da cliente"
            onChangeText={setNome}
            value={nome}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Data do Agendamento</Text>
          <TouchableOpacity onPress={() => setShowDatePickerCalendar(true)} style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>{dataExibicao}</Text>
          </TouchableOpacity>
          
          <Modal
            animationType="fade"
            transparent={true}
            visible={showDatePickerCalendar}
            onRequestClose={() => setShowDatePickerCalendar(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPressOut={() => setShowDatePickerCalendar(false)}
            >
              <View style={styles.calendarModalContent}>
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={{
                    [dataParaDB]: { selected: true, marked: true, selectedColor: '#8C315D' },
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
                  onPress={() => setShowDatePickerCalendar(false)} 
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <Text style={styles.label}>Horário do Agendamento</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={styles.input}
              placeholder="HH:mm"
              value={horarioExibicao}
              onChangeText={setHorarioExibicao}
              keyboardType="numeric" 
            />
          ) : (
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>{horarioExibicao}</Text>
            </TouchableOpacity>
          )}

          {Platform.OS !== 'web' && showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={horarioParaDB}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
              onChange={onTimeChangeMobile}
            />
          )}
        </ScrollView>

        <View style={styles.fixedButtonContainer}>
          <Botao titulo="Salvar Agendamento" cor="#8DC9B5" onPress={salvar} />
          <Botao titulo="Cancelar" cor="#FFC391" onPress={() => router.back()} />
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 100 : 90,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8C315D',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontWeight: '600',
    marginTop: 15,
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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