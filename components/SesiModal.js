import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const menitKeJam = (totalMenit) => {
  const j = Math.floor(totalMenit / 60);
  const m = totalMenit % 60;
  return { jam: String(j).padStart(2, '0'), menit: String(m).padStart(2, '0') };
};

export default function SesiModal({ visible, sesi, onSimpan, onBatal }) {
  const [mulaiJam, setMulaiJam] = useState('07');
  const [mulaiMenit, setMulaiMenit] = useState('00');
  const [selesaiJam, setSelesaiJam] = useState('09');
  const [selesaiMenit, setSelesaiMenit] = useState('00');

  useEffect(() => {
    if (visible && sesi) {
      const m = menitKeJam(sesi.mulai || 0);
      const s = menitKeJam(sesi.selesai || 0);
      setMulaiJam(m.jam);
      setMulaiMenit(m.menit);
      setSelesaiJam(s.jam);
      setSelesaiMenit(s.menit);
    }
  }, [visible, sesi]);

  const handleSimpan = () => {
    const totalMulai = parseInt(mulaiJam) * 60 + parseInt(mulaiMenit);
    const totalSelesai = parseInt(selesaiJam) * 60 + parseInt(selesaiMenit);

    if (isNaN(totalMulai) || isNaN(totalSelesai)) {
      Alert.alert('Error', 'Jam atau menit tidak valid!');
      return;
    }

    if (totalMulai >= totalSelesai) {
      Alert.alert('Error', 'Jam mulai harus lebih awal dari jam selesai!');
      return;
    }

    onSimpan({ mulai: totalMulai, selesai: totalSelesai });
  };

  const InputWaktu = ({ labelJam, jam, setJam, menit, setMenit }) => (
    <View>
      <Text style={styles.label}>{labelJam}</Text>
      <View style={styles.waktuRow}>
        <TextInput
          style={styles.inputWaktu}
          value={jam}
          onChangeText={(t) => setJam(t.replace(/\D/g, '').substring(0, 2))}
          keyboardType="numeric"
          maxLength={2}
          placeholder="00"
          textAlign="center"
        />
        <Text style={styles.separator}>:</Text>
        <TextInput
          style={styles.inputWaktu}
          value={menit}
          onChangeText={(t) => setMenit(t.replace(/\D/g, '').substring(0, 2))}
          keyboardType="numeric"
          maxLength={2}
          placeholder="00"
          textAlign="center"
        />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onBatal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Ubah Jam {sesi?.label}</Text>
          <Text style={styles.subtitle}>{sesi?.hari}</Text>

          <InputWaktu
            labelJam="Jam Mulai"
            jam={mulaiJam}
            setJam={setMulaiJam}
            menit={mulaiMenit}
            setMenit={setMulaiMenit}
          />

          <View style={{ height: 16 }} />

          <InputWaktu
            labelJam="Jam Selesai"
            jam={selesaiJam}
            setJam={setSelesaiJam}
            menit={selesaiMenit}
            setMenit={setSelesaiMenit}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.batalButton} onPress={onBatal}>
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
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  waktuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  inputWaktu: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    width: 80,
    textAlign: 'center',
  },
  separator: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
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
});