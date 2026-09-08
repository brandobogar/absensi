import React, { useEffect, useState } from "react";

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";

import { callApi } from "../../api";

export default function EditProfileModal({
  visible,
  onClose,
  userData,
  onProfileUpdated,
}) {
  const [username, setUsername] = useState("");

  // PASSWORD
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setUsername(userData?.username || "");

      setShowPasswordForm(false);
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
    }
  }, [visible, userData]);

  // =========================
  // SIMPAN USERNAME
  // =========================
  const handleSimpan = async () => {
    const usernameBaru = username.trim();
    const usernameLama = String(userData?.username || "").trim();

    if (!usernameBaru) {
      Alert.alert("Perhatian", "Username wajib diisi.");
      return;
    }

    if (usernameBaru === usernameLama) {
      Alert.alert("Tidak Ada Perubahan", "Username belum diubah.");
      return;
    }

    setLoading(true);

    const result = await callApi("updateUsernamePegawai", {
      usernameLama,
      usernameBaru,
    });

    setLoading(false);

    if (result?.status === "berhasil") {
      Alert.alert(
        "Berhasil",
        "Username berhasil diperbarui.",
        [
          {
            text: "OK",
            onPress: () => {
              onProfileUpdated({
                ...userData,
                username: usernameBaru,
              });

              onClose();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Gagal",
        result?.message || "Username gagal diperbarui."
      );
    }
  };

  // =========================
  // SIMPAN PASSWORD
  // =========================
  const handleSimpanPassword = async () => {
    if (!passwordLama) {
      Alert.alert("Perhatian", "Password lama wajib diisi.");
      return;
    }

    if (!passwordBaru) {
      Alert.alert("Perhatian", "Password baru wajib diisi.");
      return;
    }

    if (passwordBaru.length < 6) {
      Alert.alert(
        "Perhatian",
        "Password baru minimal 6 karakter."
      );
      return;
    }

    if (!konfirmasiPassword) {
      Alert.alert(
        "Perhatian",
        "Konfirmasi password baru wajib diisi."
      );
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      Alert.alert(
        "Perhatian",
        "Konfirmasi password tidak sama dengan password baru."
      );
      return;
    }

    setLoading(true);

    const result = await callApi("updatePasswordPegawai", {
      username: userData?.username,
      passwordLama,
      passwordBaru,
    });

    console.log("HASIL UPDATE PASSWORD:", result);

    setLoading(false);

    if (result?.status === "berhasil") {
      Alert.alert(
        "Berhasil",
        "Password berhasil diperbarui.",
        [
          {
            text: "OK",
            onPress: () => {
              setPasswordLama("");
              setPasswordBaru("");
              setKonfirmasiPassword("");
              setShowPasswordForm(false);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Gagal",
        result?.message || "Password gagal diperbarui."
      );
    }
  };

  // =========================
  // KEMBALI DARI FORM PASSWORD
  // =========================
  const handleBatalPassword = () => {
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");
    setShowPasswordForm(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalBox}>

            {!showPasswordForm ? (
              <>
                {/* =========================
                    EDIT PROFILE
                ========================== */}

                <Text style={styles.title}>Edit Profile</Text>

                <Text style={styles.subtitle}>
                  Ubah informasi akun Anda
                </Text>

                {/* NAMA */}
                <Text style={styles.label}>Nama Lengkap</Text>

                <View style={styles.readOnlyBox}>
                  <Text style={styles.readOnlyText}>
                    {userData?.nama || "-"}
                  </Text>
                </View>

                <Text style={styles.infoText}>
                  🔒 Nama lengkap tidak dapat diubah
                </Text>

                {/* NIP */}
                <Text style={styles.label}>NIP</Text>

                <View style={styles.readOnlyBox}>
                  <Text style={styles.readOnlyText}>
                    {userData?.nip || "-"}
                  </Text>
                </View>

                <Text style={styles.infoText}>
                  🔒 NIP tidak dapat diubah
                </Text>

                {/* USERNAME */}
                <Text style={styles.label}>Username</Text>

                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Masukkan username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="done"
                />

                {/* PASSWORD */}
                <TouchableOpacity
                  style={styles.passwordButton}
                  onPress={() => setShowPasswordForm(true)}
                  disabled={loading}
                >
                  <Text style={styles.passwordButtonText}>
                    🔑 Ganti Password
                  </Text>
                </TouchableOpacity>

                {/* BUTTON */}
                <View style={styles.buttonRow}>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>
                      Batal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleSimpan}
                    disabled={loading}
                  >
                    <Text style={styles.saveButtonText}>
                      {loading ? "Menyimpan..." : "Simpan"}
                    </Text>
                  </TouchableOpacity>

                </View>
              </>
            ) : (
              <>
                {/* =========================
                    GANTI PASSWORD
                ========================== */}

                <Text style={styles.title}>
                  Ganti Password
                </Text>

                <Text style={styles.subtitle}>
                  Masukkan password lama dan password baru
                </Text>

                {/* PASSWORD LAMA */}
                <Text style={styles.label}>
                  Password Lama
                </Text>

                <TextInput
                  style={styles.input}
                  value={passwordLama}
                  onChangeText={setPasswordLama}
                  placeholder="Masukkan password lama"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />

                {/* PASSWORD BARU */}
                <Text style={styles.label}>
                  Password Baru
                </Text>

                <TextInput
                  style={styles.input}
                  value={passwordBaru}
                  onChangeText={setPasswordBaru}
                  placeholder="Masukkan password baru"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />

                <Text style={styles.infoText}>
                  Password minimal 6 karakter
                </Text>

                {/* KONFIRMASI */}
                <Text style={styles.label}>
                  Konfirmasi Password Baru
                </Text>

                <TextInput
                  style={styles.input}
                  value={konfirmasiPassword}
                  onChangeText={setKonfirmasiPassword}
                  placeholder="Ulangi password baru"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="done"
                />

                {/* BUTTON PASSWORD */}
                <View style={styles.buttonRow}>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleBatalPassword}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>
                      Batal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={handleSimpanPassword}
                    disabled={loading}
                  >
                    <Text style={styles.saveButtonText}>
                      {loading
                        ? "Menyimpan..."
                        : "Simpan Password"}
                    </Text>
                  </TouchableOpacity>

                </View>
              </>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    elevation: 5,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
  },

  readOnlyBox: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  readOnlyText: {
    fontSize: 14,
    color: "#6b7280",
  },

  infoText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },

  passwordButton: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    alignItems: "center",
  },

  passwordButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  disabledButton: {
    opacity: 0.6,
  },
});
