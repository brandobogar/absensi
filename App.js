import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/LoginScreen";
import BerandaScreen from "./screens/BerandaScreen";
import AbsenScreen from "./screens/AbsenScreen";
import RiwayatScreen from "./screens/RiwayatScreen";
import AdminScreen from "./screens/AdminScreen";
import { API_URL } from "./config";

export default function App() {
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("beranda");
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("@user_session");
        const savedIsAdmin = await AsyncStorage.getItem("@is_admin");
        if (savedUser) {
          setUserData(JSON.parse(savedUser));
          setIsAdmin(savedIsAdmin === "true");
        }
      } catch (error) {
        console.error("Gagal memuat sesi:", error);
      } finally {
        setInitializing(false);
      }
    };
    loadSession();
  }, []);

  const callApi = async (action, data = {}) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, ...data }),
      });
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(error);
      Alert.alert("Koneksi Gagal", "Terjadi kesalahan saat menghubungi server.");
      return null;
    }
  };

  const handleLoginSuccess = async (data) => {
    const adminStatus = data && data.role === "admin";
    setIsAdmin(adminStatus);
    setUserData(data);
    try {
      await AsyncStorage.setItem("@user_session", JSON.stringify(data));
      await AsyncStorage.setItem("@is_admin", adminStatus ? "true" : "false");
    } catch (error) {
      console.error("Gagal menyimpan sesi:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@user_session");
      await AsyncStorage.removeItem("@is_admin");
    } catch (error) {
      console.error("Gagal menghapus sesi:", error);
    }
    setUserData(null);
    setIsAdmin(false);
    setActiveTab("beranda");
  };

  // Loading awal
  if (initializing) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, styles.centerLoading]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaProvider>
    );
  }

  // Halaman Login
  if (!userData) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLoginSuccess={handleLoginSuccess} callApi={callApi} />
      </SafeAreaProvider>
    );
  }

  // Halaman Admin
  if (isAdmin) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <AdminScreen onLogout={handleLogout} callApi={callApi} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Halaman Pegawai
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {activeTab === "beranda" && (
            <BerandaScreen
              userData={userData}
              onLogout={handleLogout}
              callApi={callApi}
            />
          )}
          {activeTab === "absen" && (
            <AbsenScreen
              userData={userData}
              onAbsenSuccess={() => setActiveTab("beranda")}
              callApi={callApi}
            />
          )}
          {activeTab === "riwayat" && (
            <RiwayatScreen userData={userData} callApi={callApi} />
          )}
        </View>

        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab("beranda")}
          >
            <Text style={{ fontSize: 18 }}>🏠</Text>
            <Text style={[styles.navText, activeTab === "beranda" && styles.activeNavText]}>
              Beranda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab("absen")}
          >
            <Text style={{ fontSize: 18 }}>📍</Text>
            <Text style={[styles.navText, activeTab === "absen" && styles.activeNavText]}>
              Absen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab("riwayat")}
          >
            <Text style={{ fontSize: 18 }}>📅</Text>
            <Text style={[styles.navText, activeTab === "riwayat" && styles.activeNavText]}>
              Riwayat
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  centerLoading: { justifyContent: "center", alignItems: "center" },
  content: { flex: 1 },
  navbar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 10,
    justifyContent: "space-around",
    elevation: 8,
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  navText: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  activeNavText: { color: "#2563eb", fontWeight: "bold" },
});