import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';

// MODAL TAMBAH PEGAWAI
const TambahPegawaiModal = ({ visible, onSimpan, onBatal }) => {
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [nip, setNip] = useState('');

  const handleSimpan = () => {
    if (!nama || !username) {
      Alert.alert('Error', 'Nama dan username wajib diisi!');
      return;
    }
    onSimpan({ nama, username, nip });
    setNama('');
    setUsername('');
    setNip('');
  };

  const handleBatal = () => {
    setNama('');
    setUsername('');
    setNip('');
    onBatal();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleBatal}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Tambah Pegawai Baru</Text>

          <Text style={styles.inputLabel}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            value={nama}
            onChangeText={setNama}
            placeholder="contoh: Brando Bogar"
          />

          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="contoh: brandobogar"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>NIP (opsional)</Text>
          <TextInput
            style={styles.input}
            value={nip}
            onChangeText={setNip}
            placeholder="contoh: 199001012020121001"
            keyboardType="numeric"
          />

          <Text style={styles.infoText}>
            🔑 Password default: <Text style={{ fontWeight: 'bold' }}>user1234</Text>
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.batalButton} onPress={handleBatal}>
              <Text style={styles.batalText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.simpanButton} onPress={handleSimpan}>
              <Text style={styles.simpanText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function ManajemenPegawaiScreen({ callApi, onKembali }) {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [showTambah, setShowTambah] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPegawai = async () => {
    setLoading(true);
    const result = await callApi('getPegawai', {});
    setLoading(false);
    if (Array.isArray(result)) {
      setPegawaiList(result);
    } else {
      Alert.alert('Error', 'Gagal memuat data pegawai.');
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  const handleToggle = async (username, field, nilaiSekarang) => {
    const nilaiBaru = !nilaiSekarang;
    const labelField = {
      status_aktif: 'Status Aktif',
      bypass_radius: 'Bypass Radius',
      bypass_sesi: 'Bypass Sesi',
    };

    Alert.alert(
      'Konfirmasi',
      `Ubah ${labelField[field]} untuk ${username} menjadi ${nilaiBaru ? 'Aktif' : 'Nonaktif'}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            setUpdating(username + field);
            const result = await callApi('updateStatusPegawai', {
              username,
              field,
              value: nilaiBaru,
            });
            setUpdating(null);

            if (result?.status === 'berhasil') {
              setPegawaiList(prev =>
                prev.map(p =>
                  p.username === username ? { ...p, [field]: nilaiBaru } : p
                )
              );
            } else {
              Alert.alert('Gagal', 'Gagal mengubah status pegawai.');
            }
          },
        },
      ]
    );
  };

  const handleTambahPegawai = async ({ nama, username, nip }) => {
    setSaving(true);
    const result = await callApi('tambahPegawai', { nama, username, nip });
    setSaving(false);

    if (result?.status === 'berhasil') {
      setShowTambah(false);
      Alert.alert('Sukses', `Pegawai ${username} berhasil ditambahkan!\nPassword default: user1234`);
      fetchPegawai();
    } else {
      Alert.alert('Gagal', result?.message || 'Gagal menambahkan pegawai.');
    }
  };

  const handleResetPassword = (username) => {
    Alert.alert(
      'Reset Password',
      `Reset password ${username} ke "user1234"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setUpdating(username + 'reset');
            const result = await callApi('resetPassword', { username });
            setUpdating(null);

            if (result?.status === 'berhasil') {
              Alert.alert('Sukses', `Password ${username} berhasil direset ke "user1234"!`);
            } else {
              Alert.alert('Gagal', 'Gagal mereset password.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onKembali}>
          <Text style={styles.kembaliText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Pegawai</Text>
        <TouchableOpacity onPress={() => setShowTambah(true)}>
          <Text style={styles.tambahText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPegawai} />
        }
      >
        {loading && pegawaiList.length === 0 ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : pegawaiList.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada data pegawai.</Text>
        ) : (
          pegawaiList.map((pegawai, index) => (
            <View key={index} style={styles.card}>
              {/* HEADER CARD */}
              <View style={styles.cardHeader}>
                <Text style={styles.usernameText}>{pegawai.username}</Text>
                <View style={[
                  styles.badgeStatus,
                  { backgroundColor: pegawai.status_aktif ? '#dcfce7' : '#fee2e2' }
                ]}>
                  <Text style={[
                    styles.badgeText,
                    { color: pegawai.status_aktif ? '#16a34a' : '#dc2626' }
                  ]}>
                    {pegawai.status_aktif ? 'Aktif' : 'Nonaktif'}
                  </Text>
                </View>
              </View>

              {/* TOGGLE STATUS AKTIF */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Status Aktif</Text>
                  <Text style={styles.toggleDesc}>Izinkan pegawai untuk login</Text>
                </View>
                {updating === pegawai.username + 'status_aktif' ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Switch
                    value={pegawai.status_aktif === true}
                    onValueChange={() => handleToggle(pegawai.username, 'status_aktif', pegawai.status_aktif)}
                    trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                    thumbColor={pegawai.status_aktif ? '#2563eb' : '#9ca3af'}
                  />
                )}
              </View>

              {/* TOGGLE BYPASS RADIUS */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Bypass Radius</Text>
                  <Text style={styles.toggleDesc}>Absen dari mana saja</Text>
                </View>
                {updating === pegawai.username + 'bypass_radius' ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Switch
                    value={pegawai.bypass_radius === true}
                    onValueChange={() => handleToggle(pegawai.username, 'bypass_radius', pegawai.bypass_radius)}
                    trackColor={{ false: '#d1d5db', true: '#fcd34d' }}
                    thumbColor={pegawai.bypass_radius ? '#f59e0b' : '#9ca3af'}
                  />
                )}
              </View>

              {/* TOGGLE BYPASS SESI */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Bypass Sesi</Text>
                  <Text style={styles.toggleDesc}>Absen di luar jam sesi</Text>
                </View>
                {updating === pegawai.username + 'bypass_sesi' ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Switch
                    value={pegawai.bypass_sesi === true}
                    onValueChange={() => handleToggle(pegawai.username, 'bypass_sesi', pegawai.bypass_sesi)}
                    trackColor={{ false: '#d1d5db', true: '#fcd34d' }}
                    thumbColor={pegawai.bypass_sesi ? '#f59e0b' : '#9ca3af'}
                  />
                )}
              </View>

              {/* RESET PASSWORD */}
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => handleResetPassword(pegawai.username)}
                disabled={updating === pegawai.username + 'reset'}
              >
                {updating === pegawai.username + 'reset' ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <Text style={styles.resetButtonText}>🔑 Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL TAMBAH PEGAWAI */}
      <TambahPegawaiModal
        visible={showTambah}
        onSimpan={handleTambahPegawai}
        onBatal={() => setShowTambah(false)}
      />

      {/* LOADING OVERLAY SAAT SAVING */}
      {saving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Menyimpan...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 3,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  kembaliText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  tambahText: { fontSize: 14, color: '#16a34a', fontWeight: '600' },
  scroll: { flex: 1, padding: 16 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  usernameText: { fontSize: 15, fontWeight: 'bold', color: '#1f2937' },
  badgeStatus: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  toggleDesc: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  resetButton: {
    marginTop: 12,
    backgroundColor: '#fff1f2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  resetButtonText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: '#f9fafb',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  batalButton: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  batalText: { color: '#6b7280', fontWeight: 'bold', fontSize: 14 },
  simpanButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  simpanText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#ffffff', marginTop: 12, fontSize: 14 },
});