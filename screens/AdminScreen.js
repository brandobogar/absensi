import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminScreen({ onLogout, callApi }) {
  const [absensiList, setAbsensiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchAbsensiAdmin = async () => {
    setLoading(true);
    try {
      const data = await callApi('getAbsensiAdmin', {});
      if (Array.isArray(data)) {
        setAbsensiList(data);
      } else {
        setAbsensiList([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal memuat data absensi admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensiAdmin();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const sekarang = new Date();
      const bulan = sekarang.getMonth() + 1;
      const tahun = sekarang.getFullYear();

      const result = await callApi('exportRekap', { bulan: bulan, tahun: tahun });
      if (result && result.status === 'berhasil') {
        Alert.alert('Sukses', `File rekap berhasil dibuat:\n${result.namaFile}`);
      } else {
        Alert.alert('Gagal', 'Gagal mengeksport rekap bulanan.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Terjadi kesalahan saat mengeksport data.');
    } finally {
      setExporting(false);
    }
  };

  // Hitung Statistik Ringkasan
  const totalAbsen = absensiList.length;
  const totalApproved = absensiList.filter(item => item[6] === 'APPROVED').length;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchAbsensiAdmin} />
      }
    >
      {/* HEADER DASHBOARD */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerTitle}>Dashboard Admin</Text>
          <Text style={styles.headerSubtitle}>Sistem Absensi PPPK Inspektorat</Text>
        </View>
        
      </View>

      {/* KARTU STATISTIK */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalAbsen}</Text>
          <Text style={styles.statLabel}>Absen Hari Ini</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#2ecc71' }]}>{totalApproved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
      </View>

      {/* DAFTAR ABSENSI HARI INI */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Absensi Hari Ini</Text>
          <TouchableOpacity onPress={fetchAbsensiAdmin} style={styles.refreshButton}>
            <Ionicons name="refresh" size={14} color="#007AFF" />
            <Text style={styles.refreshText}> Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading && absensiList.length === 0 ? (
          <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 20 }} />
        ) : absensiList.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
        ) : (
          absensiList.map((item, index) => {
            const tgl = new Date(item[0]);
            const jamStr = tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const tglStr = tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            const isApproved = item[6] === 'APPROVED';

            return (
              <View key={index} style={styles.absenItem}>
                <View>
                  <Text style={styles.absenNama}>{item[1]}</Text>
                  <Text style={styles.absenDetail}>{tglStr}, {jamStr} • Sesi: {item[2]}</Text>
                </View>
                <Text style={[styles.absenStatus, { color: isApproved ? '#2ecc71' : '#e74c3c' }]}>
                  {item[6]}
                </Text>
              </View>
            );
          })
        )}
      </View>

      {/* MENU AKSI */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Aksi</Text>
        
        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="file-excel" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.exportButtonText}>Export Rekap Bulan Ini</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButtonBottom} onPress={onLogout}>
          <Text style={styles.logoutButtonBottomText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { ios: 0.05, android: 0.1 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  logoutButtonTop: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logoutTextTop: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { ios: 0.05, android: 0.1 },
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { ios: 0.05, android: 0.1 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginVertical: 20,
    fontSize: 13,
  },
  absenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  absenNama: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  absenDetail: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 2,
  },
  absenStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButtonBottom: {
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonBottomText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: 'bold',
  },
});