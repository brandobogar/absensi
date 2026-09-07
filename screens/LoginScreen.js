import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { callApi } from '../api';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Username dan password wajib diisi!');
      return;
    }

    setLoading(true);

    try {
      // Cek apakah yang mencoba login adalah admin
      if (username.toLowerCase() === 'admin') {
        const result = await callApi('loginAdmin', { username, password });
        setLoading(false);

        // Sesuaikan dengan respon dari loginAdmin (misal: { status: true })
        if (result && result.status === true) {
          // Kirim data khusus admin ke komponen utama
          onLoginSuccess({ nama: 'Administrator', role: 'admin' }); 
        } else {
          Alert.alert('Gagal', 'Username atau password admin salah!');
        }
      } else {
        // Jika bukan admin, jalankan login pegawai biasa
        const result = await callApi('loginPegawai', { username, password });
        setLoading(false);

        if (result && result.nama) {
          onLoginSuccess(result); // Kirim data pegawai ke komponen utama
        } else {
          Alert.alert('Gagal', 'Username atau password salah!');
        }
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Terjadi kesalahan koneksi ke server.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Absensi PPPK</Text>
        <Text style={styles.subtitle}>Inspektorat Kabupaten Sangihe</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{loading ? 'Memverifikasi...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, elevation: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});