import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Image, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabaseClient';
import { MoreVertical } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardNavbar({ userName, userPhotoUrl }) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const logout = async () => {
    setModalVisible(false);
    await supabase.auth.signOut();
    router.replace('/');
  };

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.navbarContainer}>
      <View style={styles.userInfo}>
        {userPhotoUrl ? (
          <Image source={{ uri: userPhotoUrl }} style={styles.userPhoto} />
        ) : (
          <View style={styles.avatarDefault}>
            <Text style={styles.avatarText}>{getInitial(userName)}</Text>
          </View>
        )}
        <Text style={styles.welcomeText}>Olá, {userName ? userName.split(' ')[0] : 'Usuário'}</Text>
      </View>

      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.menuIcon}>
        <MoreVertical size={28} color="#8C315D" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <SafeAreaView style={[styles.modalContent, { marginTop: insets.top + 50, marginRight: 20 }]}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setModalVisible(false);
              router.push('/perfil');
            }}>
              <Text style={styles.modalButtonText}>Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={logout}>
              <Text style={styles.modalButtonText}>Sair</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarDefault: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8C315D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  welcomeText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuIcon: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 5,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  modalButton: {
    padding: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
});