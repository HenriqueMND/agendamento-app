import { useState } from 'react';
import { Alert, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabaseClient';

import InputCampo from './components/InputCampo';
import Botao from './components/botao';
import BackgroundWrapper from './components/BackgroundWrapper';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const login = async () => {
    if (loading) return;

    setEmailError('');
    setSenhaError('');
    setGeneralError('');

    let hasError = false;

    if (!email.trim()) {
      setEmailError('O campo E-mail é obrigatório.');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Por favor, insira um endereço de e-mail válido.');
      hasError = true;
    }

    if (!senha.trim()) {
      setSenhaError('O campo Senha é obrigatório.');
      hasError = true;
    } else if (senha.length < 6) {
      setSenhaError('A senha deve conter no mínimo 6 caracteres.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        let errorMessage = 'Ocorreu um erro ao tentar fazer login.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-mail ou senha incorretos.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Usuário não cadastrado. Por favor, verifique seu e-mail ou cadastre-se.';
        } else {
          errorMessage = error.message;
        }
        setGeneralError(errorMessage);
      } else {
        router.replace('/dashboard');
      }
    } catch (apiError) {
      setGeneralError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      console.error("Erro na API de login:", apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.overlayText}>Entrando...</Text>
        </View>
      )}
      <View style={styles.contentContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        
        <InputCampo
          label="E-mail"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
            setGeneralError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <InputCampo
          label="Senha"
          value={senha}
          onChangeText={(text) => {
            setSenha(text);
            setSenhaError('');
            setGeneralError('');
          }}
          secureTextEntry
        />
        {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}

        {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

        <Botao
          titulo={loading ? "Carregando..." : "Entrar"}
          cor="#8dc9b5"
          onPress={login}
          disabled={loading}
        />
        <Botao
          titulo="Cadastre-se"
          cor="#8c315d"
          onPress={() => router.push('/cadastro')}
          disabled={loading}
        />
        
        {/* AQUI ESTÁ A MUDANÇA */}
        <TouchableOpacity
          onPress={() => router.push('/esqueceuSenha')} // Leva para a nova tela de "Esqueceu a Senha?"
          disabled={loading}
        >
          <Text style={styles.esqueceu}>Esqueceu a senha?</Text>
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  titulo: {
    fontSize: 32,
    color: '#72284B',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  esqueceu: {
    color: '#72284B',
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  logo: {
    width: 500,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
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
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    paddingLeft: 5,
  },
});

export default LoginPage;