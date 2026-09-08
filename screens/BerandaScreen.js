import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { callApi } from "../api.js";
import EditProfileModal from "../components/user/EditProfileModal";

export default function BerandaScreen({
  userData,
  onLogout,
  onProfileUpdated,
}) {
  console.log("USER DATA BERANDA:", userData);

  const [statusAbsen, setStatusAbsen] = useState({
    Masuk: "-",
    Istirahat: "-",
    Pulang: "-",
  });

  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    loadStatusHariIni();
  }, []);

  const loadStatusHariIni = async () => {
    const res = await callApi("getStatusAbsen", {
      nama: userData.nama,
    });

    if (res) {
      setStatusAbsen(res);
    }
  };

  const getTanggalHariIni = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Date().toLocaleDateString("id-ID", options);
  };

  return (
    <View style={styles.container}>
      {/* PROFILE */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBox}>
          <Text style={{ fontSize: 28 }}>👤</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>{userData?.nama}</Text>

          <Text style={styles.usernameText}>@{userData?.username || "-"}</Text>

          <Text style={styles.nipText}>NIP: {userData?.nip || "-"}</Text>

          <Text style={styles.dateText}>{getTanggalHariIni()}</Text>
        </View>

        {/* TOMBOL EDIT */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowEditProfile(true)}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* STATUS ABSEN */}
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>Status Absen Hari Ini</Text>

        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Masuk</Text>

            <Text
              style={[
                styles.gridValue,
                statusAbsen.Masuk !== "-" && styles.successText,
              ]}
            >
              {statusAbsen.Masuk}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Istirahat</Text>

            <Text
              style={[
                styles.gridValue,
                statusAbsen.Istirahat !== "-" && styles.successText,
              ]}
            >
              {statusAbsen.Istirahat}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Pulang</Text>

            <Text
              style={[
                styles.gridValue,
                statusAbsen.Pulang !== "-" && styles.successText,
              ]}
            >
              {statusAbsen.Pulang}
            </Text>
          </View>
        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>🚪 Keluar Akun (Logout)</Text>
      </TouchableOpacity>

      {/* MODAL EDIT PROFILE */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        userData={userData}
        onProfileUpdated={onProfileUpdated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
  },

  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },

  avatarBox: {
    width: 56,
    height: 56,
    backgroundColor: "#dbeafe",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },

  usernameText: {
    fontSize: 13,
    color: "#2563eb",
    marginTop: 2,
  },

  nipText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  dateText: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "500",
    marginTop: 4,
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  editIcon: {
    fontSize: 18,
  },

  statusContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },

  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  gridItem: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  gridLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 6,
  },

  gridValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#9ca3af",
  },

  successText: {
    color: "#16a34a",
  },

  logoutButton: {
    backgroundColor: "#fee2e2",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fca5a5",
  },

  logoutButtonText: {
    color: "#dc2626",
    fontWeight: "bold",
    fontSize: 14,
  },
});