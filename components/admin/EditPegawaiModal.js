import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from "react-native";

export default function EditPegawaiModal({
  visible,
  pegawai,
  onSimpan,
  onBatal,
  saving,
}) {
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");

  // Isi form setiap kali pegawai yang diedit berubah
  useEffect(() => {
    if (pegawai) {
      setNama(String(pegawai.nama || ""));
      setNip(String(pegawai.nip || ""));
    }
  }, [pegawai]);

  const handleSimpan = () => {
    const namaBersih = String(nama || "").trim();
    const nipBersih = String(nip || "").trim();

    if (!namaBersih) {
      Alert.alert("Error", "Nama lengkap wajib diisi!");
      return;
    }

    onSimpan({
      username: pegawai.username,
      nama: namaBersih,
      nip: nipBersih,
    });
  };

  const handleBatal = () => {
    setNama("");
    setNip("");
    onBatal();
  };

  if (!pegawai) {
    return null;
  }
  return (
   <Modal
  visible={visible}
  transparent
  animationType="fade"
  onRequestClose={onBatal}
>
  <KeyboardAvoidingView
    style={styles.modalOverlay}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <ScrollView
      contentContainerStyle={styles.modalScroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.modalContainer}>

        <Text style={styles.modalTitle}>
          Edit Data Pegawai
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          value={nama}
          onChangeText={setNama}
        />

        <TextInput
          style={styles.input}
          placeholder="NIP"
          value={nip}
          onChangeText={setNip}
          keyboardType="number-pad"
        />

        <Text style={styles.disabledInfo}>
          🔒 Username tidak dapat diubah
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onBatal}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>
              Batal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSimpan}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                Simpan
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</Modal>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 3,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },

  kembaliText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },

  tambahText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },

  // SCROLL
  scroll: {
    flex: 1,
    padding: 16,
  },

  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    fontSize: 14,
  },

  // CARD
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },

  identityContainer: {
    flex: 1,
    marginRight: 12,
  },

  namaText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },

  usernameText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
  },

  nipText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 3,
  },

  nipEmptyText: {
    fontSize: 11,
    color: "#d1d5db",
    marginTop: 3,
    fontStyle: "italic",
  },

  badgeStatus: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },

  // EDIT BUTTON

  editButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 13,
  },

  // TOGGLE
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },

  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },

  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  toggleDesc: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },

  // RESET PASSWORD

  resetButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 13,
  },

  // MODAL
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: "#f9fafb",
  },

  disabledInput: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },

  disabledInfo: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: -8,
    marginBottom: 14,
  },

  infoText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 8,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  batalButton: {
    flex: 1,
    backgroundColor: "#f1f2f6",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },

  batalText: {
    color: "#6b7280",
    fontWeight: "bold",
    fontSize: 14,
  },

  simpanButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.7,
  },

  simpanText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // LOADING
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#ffffff",
    marginTop: 12,
    fontSize: 14,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  editButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 13,
  },

  resetButton: {
    flex: 1,
    backgroundColor: "#fff1f2",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  resetButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 13,
  },
});
