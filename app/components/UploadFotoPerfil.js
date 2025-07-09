import React, { useState } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabaseClient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Camera } from 'lucide-react-native';

export default function UploadFotoPerfil({ userId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);

  const escolherImagem = async () => {
    if (!userId) {
      Alert.alert('Erro', 'ID do usuário não disponível para upload.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Você precisa permitir o acesso às imagens.');
      return;
    }

    let mediaTypesOption = null;
    if (ImagePicker.MediaType && ImagePicker.MediaType.Images) {
      mediaTypesOption = ImagePicker.MediaType.Images;
    } else if (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images) {
      mediaTypesOption = ImagePicker.MediaTypeOptions.Images;
    }

    if (!mediaTypesOption) {
      Alert.alert(
        'Erro',
        'Tipo de mídia para seleção de imagem não encontrado. Por favor, atualize seu Expo e bibliotecas.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaTypesOption,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const imagemUri = result.assets[0].uri;
      await fazerUpload(imagemUri);
    }
  };

  const fazerUpload = async (uri) => {
    try {
      setUploading(true);

      const response = await fetch(uri);
      const blob = await response.blob();
      
      if (!blob) {
        throw new Error('Não foi possível criar o Blob da imagem.');
      }

      const extensao = blob.type.split('/')[1] || 'jpeg'; 
      const nomeArquivo = `${userId}/${uuidv4()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(nomeArquivo, blob, {
          contentType: blob.type,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(nomeArquivo);

      const fotoUrl = data?.publicUrl;

      if (!fotoUrl) {
        throw new Error('URL pública da imagem não obtida.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { fotoPerfil: fotoUrl },
      });

      if (updateError) {
        throw updateError;
      }

      onUploadSuccess(fotoUrl);
      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
    } catch (error) {
      Alert.alert('Erro ao enviar imagem', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {uploading ? (
        <ActivityIndicator size="small" color="#8C315D" />
      ) : (
        <TouchableOpacity onPress={escolherImagem} style={styles.uploadButton}>
          <View style={styles.iconContainer}>
            <Camera size={24} color="#8C315D" />
            <Text style={styles.uploadButtonText}>Alterar Foto de Perfil</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#8C315D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});