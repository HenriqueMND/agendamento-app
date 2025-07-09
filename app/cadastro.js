import { useState } from 'react';
import { Alert, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabaseClient';

import InputCampo from './components/InputCampo';
import Botao from './components/botao';
import BackgroundWrapper from './components/BackgroundWrapper';

const CadastroPage = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const cadastrarUsuario = async () => {
    if (loading) return;

    setNomeError('');
    setEmailError('');
    setSenhaError('');
    setGeneralError('');

    let hasError = false;

    if (!nome.trim()) {
      setNomeError('O campo Nome é obrigatório.');
      hasError = true;
    }

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
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome,
          },
        },
      });

      if (error) {
        let errorMessage = 'Ocorreu um erro ao tentar criar a conta.';
        if (error.message.includes('User already registered')) {
            errorMessage = 'Este e-mail já está cadastrado. Tente fazer login ou redefinir a senha.';
        } else if (error.message.includes('duplicate key value violates unique constraint "users_email_key"')) {
            errorMessage = 'Este e-mail já está em uso. Por favor, utilize outro e-mail.';
        } else {
            errorMessage = error.message;
        }
        setGeneralError(errorMessage);
      } else {
        Alert.alert('Sucesso!', 'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
        router.replace('/');
      }
    } catch (apiError) {
      setGeneralError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      console.error("Erro na API de cadastro:", apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.overlayText}>Cadastrando...</Text>
        </View>
      )}
      <View style={styles.contentContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        
        <Text style={styles.subTitulo}>Crie sua conta</Text> 

        <InputCampo
          label="Nome"
          value={nome}
          onChangeText={(text) => {
            setNome(text);
            setNomeError('');
            setGeneralError('');
          }}
        />
        {nomeError ? <Text style={styles.errorText}>{nomeError}</Text> : null}

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
          titulo={loading ? "Cadastrando..." : "Cadastrar"}
          cor="#8DC9B5"
          onPress={cadastrarUsuario}
          disabled={loading}
        /> 
        <Botao
          titulo="Voltar"
          cor="#ff695c"
          onPress={() => router.back()}
          disabled={loading}
        /> 
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  titulo: {
    fontSize: 32,
    color: '#8C315D', 
    textAlign: 'center',
    marginBottom: 5, 
    fontWeight: 'bold',
  },
  subTitulo: {
    fontSize: 30,
    color: '#8C315D', 
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
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

export default CadastroPage;