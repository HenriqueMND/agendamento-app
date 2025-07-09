import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabaseClient';
import BackgroundWrapper from './components/BackgroundWrapper';
import InputCampo from './components/InputCampo';
import Botao from './components/botao';
import { ChevronLeft } from 'lucide-react-native';

const AppColors = {
  primary: '#8C315D',
  secondary: '#FFD700',
  text: '#333',
  background: '#F8F8F8',
  buttonPrimary: '#8dc9b5',
  buttonCancel: '#ff695c',
};

export default function EsqueceuSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [generalMessage, setGeneralMessage] = useState('');

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleForgotPassword = async () => {
    if (loading) return;

    setEmailError('');
    setGeneralMessage('');

    if (!email.trim()) {
      setEmailError('Por favor, digite seu e-mail.');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        let errorMessage = 'Ocorreu um erro ao enviar o e-mail de recuperação.';
        if (error.message.includes('User not found')) {
            errorMessage = 'E-mail não encontrado. Verifique se o e-mail está correto.';
        } else {
            errorMessage = error.message;
        }
        setGeneralMessage(errorMessage);
      } else {
        setGeneralMessage('Um e-mail com instruções para redefinir sua senha foi enviado. Verifique sua caixa de entrada (e spam)!');
        setEmail('');
      }
    } catch (apiError) {
      setGeneralMessage('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      console.error("Erro ao solicitar redefinição de senha:", apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.overlayText}>Enviando e-mail...</Text>
        </View>
      )}
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={30} color={AppColors.primary} />
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.title}>Esqueceu a senha?</Text>
          <Text style={styles.subtitle}>
            Insira seu e-mail abaixo e enviaremos um link para redefinir sua senha.
          </Text>

          <InputCampo
            label="E-mail"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
              setGeneralMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {generalMessage ? (
            <Text style={[styles.infoMessage, generalMessage.includes('Erro') ? styles.errorText : styles.successText]}>
              {generalMessage}
            </Text>
          ) : null}

          <Botao
            titulo={loading ? "Enviando..." : "Redefinir Senha"}
            cor={AppColors.buttonPrimary}
            onPress={handleForgotPassword}
            disabled={loading}
          />
          <Botao
            titulo="Voltar ao Login"
            cor={AppColors.buttonCancel}
            onPress={() => router.replace('/')}
            disabled={loading}
          />
        </View>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 10,
    left: 10,
    zIndex: 1,
    padding: 10,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingLeft: 5,
    textAlign: 'left',
    width: '100%',
  },
  successText: {
    color: '#28a745',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'center',
    textAlign: 'center',
    width: '100%',
  },
  infoMessage: {
    marginTop: -10,
    marginBottom: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 18,
  },
});