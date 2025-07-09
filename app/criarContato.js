import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabaseClient';
import InputCampo from './components/InputCampo';
import Botao from './components/botao';
import BackgroundWrapperAgenda from './components/BackgroundWrapperAgenda';
import { ChevronLeft } from 'lucide-react-native';

export default function CriarContato() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const carregarUsuario = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (!error) {
                setUser(data.user);
                console.log("Usuário carregado para criar contato:", data.user.id);
            } else {
                console.error("Erro ao carregar usuário para criar contato:", error);
                Alert.alert('Erro', 'Não foi possível carregar as informações do usuário para criar contato.');
            }
        };
        carregarUsuario();
    }, []);

    const handleSalvar = async () => {
        if (!nome || !telefone) {
            Alert.alert('Atenção', 'Preencha todos os campos para salvar o contato.');
            return;
        }

        if (!user) {
            Alert.alert('Erro', 'Usuário não autenticado. Por favor, faça login novamente.');
            console.error("Tentativa de salvar contato sem usuário logado.");
            return;
        }

        const { error } = await supabase.from('contatos').insert([
            {
                nome,
                telefone,
                user_id: user.id,
            },
        ]);

        if (error) {
            console.error('Erro ao salvar contato no Supabase:', error.message);
            Alert.alert('Erro ao salvar', error.message);
        } else {
            Alert.alert('Sucesso', 'Contato salvo com sucesso!');
            router.replace('/verContatos');
        }
    };

    return (
        <BackgroundWrapperAgenda>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ChevronLeft size={28} color="#8C315D" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Novo Contato</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionTitle}>Dados do Contato</Text>
                    
                    <InputCampo 
                        label="Nome Completo" 
                        value={nome} 
                        onChangeText={setNome} 
                        placeholder="Ex: Maria da Silva" 
                        autoCapitalize="words" 
                    />
                    <InputCampo 
                        label="Telefone" 
                        value={telefone} 
                        onChangeText={setTelefone} 
                        keyboardType="phone-pad" 
                        placeholder="Ex: (XX) XXXXX-XXXX" 
                    />
                </ScrollView>

                <View style={styles.fixedButtonContainer}>
                    <Botao titulo="Salvar Contato" cor="#8dc9b5" onPress={handleSalvar} />
                    <Botao titulo="Voltar" cor="#f6f4c2" onPress={() => router.back()} />
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
});