import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { callApi } from '../api';

const KANTOR_LAT = 3.6096906;
const KANTOR_LNG = 125.5056118;
const RADIUS_MAX = 500000;

export default function AbsenScreen({ userData, onAbsenSuccess }) {
  const [sesiAktif, setSesiAktif] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Mengecek sesi waktu...');
  const [jarakMeter, setJarakMeter] = useState(null);
  const [isLokasiValid, setIsLokasiValid] = useState(false);

  useEffect(() => {
    cekSesiWaktu();
  }, []);

  const cekSesiWaktu = async () => {
    const res = await callApi('getSesi');
    if (res && res.sesi) {
      setSesiAktif(res.sesi);
      setGpsStatus(`Sesi aktif: ${res.sesi}. Silakan verifikasi posisi Anda.`);
    } else {
      setSesiAktif(null);
      setGpsStatus('⏰ Saat ini berada di luar jam absen.');
    }
  };

  const hitungJarak = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const cekLokasiGPS = async () => {
    setGpsStatus('⏳ Mendeteksi lokasi GPS...');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setGpsStatus('❌ Izin akses lokasi ditolak.');
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;
      const distance = hitungJarak(userLat, userLng, KANTOR_LAT, KANTOR_LNG);
      const roundedDist = Math.round(distance);

      setJarakMeter({ lat: userLat, lng: userLng, jarak: roundedDist });

      if (roundedDist <= RADIUS_MAX) {
        setIsLokasiValid(true);
        setGpsStatus(`✅ Lokasi Valid! Jarak: ${roundedDist} meter dari kantor.`);
      } else {
        setIsLokasiValid(false);
        setGpsStatus(`❌ Di luar area kantor! Jarak: ${roundedDist} meter (Maks 50m).`);
      }
    } catch (error) {
      setGpsStatus('❌ Gagal mengambil GPS. Pastikan GPS aktif.');
    }
  };

  const submitAbsenFinal = async () => {
    if (!jarakMeter || !sesiAktif) return;

    setGpsStatus('⏳ Menyimpan absensi...');
    const result = await callApi('simpanAbsensi', {
      nama: userData.nama,
      sesi: sesiAktif,
      lat: jarakMeter.lat,
      lng: jarakMeter.lng,
      jarak: jarakMeter.jarak,
    });

    // Periksa apakah status dari server adalah APPROVED
    if (result && result.status === 'APPROVED') {
      Alert.alert('Sukses', `Absen ${sesiAktif} Berhasil Disimpan!`);
      onAbsenSuccess(); 
    } else {
      // Ambil pesan spesifik dari server (result.message), gunakan fallback jika kosong
      const pesanError = result && result.message ? result.message : 'Absensi ditolak atau jarak melebihi batas.';
      Alert.alert('Gagal Ditolak', pesanError);
      setGpsStatus(`❌ ${pesanError}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Absensi GPS</Text>
        <Text style={styles.subtitle}>{userData?.nama}</Text>

        <View style={styles.boxInfo}>
          <Text style={styles.infoText}>{gpsStatus}</Text>
        </View>

        {sesiAktif && !isLokasiValid && (
          <TouchableOpacity style={styles.buttonBlue} onPress={cekLokasiGPS}>
            <Text style={styles.buttonText}>📍 Check In (Verifikasi GPS)</Text>
          </TouchableOpacity>
        )}

        {isLokasiValid && (
          <TouchableOpacity style={styles.buttonGreen} onPress={submitAbsenFinal}>
            <Text style={styles.buttonText}>✅ Kirim Absen Sekarang</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6', justifyContent: 'center' },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, elevation: 3 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  boxInfo: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  infoText: { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 20 },
  buttonBlue: { backgroundColor: '#2563eb', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonGreen: { backgroundColor: '#16a34a', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});