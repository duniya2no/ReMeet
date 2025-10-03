import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  Timestamp,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getDoc } from "firebase/firestore"; // ✅ ensure this is imported
import { Dimensions } from "react-native";

 // ✅ correct usage
const { width, height } = Dimensions.get("window");

interface Appointment {
  id: string;
  clientName: string;
  phone: string;
  appointmentDateTime: Date;
}
const COLORS = {
  primary: "#4C8BF5",
  secondary: "#6FA7FF",
  background: "#F9F9F9",
};

export default function AppointmentScreen() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(new Date());
  const [pickerVisible, setPickerVisible] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const sendNotification = async (title: string, message: string) => {
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Failed to send notification", error);
    }
  };

  const deleteExpiredAppointments = async () => {
    const now = new Date();
    const snapshot = await getDocs(collection(db, "appointments"));
    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      const apptDate = data.appointmentDateTime.toDate();
      if (apptDate < now) {
        await deleteDoc(doc(db, "appointments", docSnap.id));
        await sendNotification("Appointment Finished", `Appointment with ${data.clientName} on ${apptDate.toLocaleString()} has finished.`);
        console.log(`Deleted expired appointment: ${docSnap.id}`);
      }
    });
  };

  useEffect(() => {
    deleteExpiredAppointments();

    const q = query(
      collection(db, "appointments"),
      orderBy("appointmentDateTime", "asc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetched: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          clientName: data.clientName,
          phone: data.phone,
          appointmentDateTime: data.appointmentDateTime.toDate(),
        });
      });
      setAppointments(fetched);
    });

    return () => unsubscribe();
  }, []);

  const handleAddOrEditAppointment = async () => {
    if (!name || !phone) {
      alert("Please enter name & phone");
      return;
    }

    if (!phone.startsWith("+92") || phone.length !== 13) {
      alert(
        "Phone number must start with +92 and be exactly 11 digit(e.g., +923XXXXXXXX)."
      );
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    if (date < now) {
      alert("Please select a valid date & time.");
      return;
    }

    const save = async () => {
      setLoading(true);
      try {
        if (editingId) {
          const ref = doc(db, "appointments", editingId);
          await updateDoc(ref, {
            clientName: name,
            phone,
            appointmentDateTime: Timestamp.fromDate(date),
          });
          await sendNotification("Appointment Updated", `${name}'s appointment updated to ${date.toLocaleString()}.`);
          showToast("Appointment updated!");
        } else {
          await addDoc(collection(db, "appointments"), {
            clientName: name,
            phone,
            appointmentDateTime: Timestamp.fromDate(date),
          });
          await sendNotification("New Appointment Created", `Appointment scheduled for ${name} on ${date.toLocaleString()}.`);
          showToast("Appointment created!");
        }
        closeModal();
      } catch (err) {
        console.error(err);
        alert("Failed to save appointment");
      }
      setLoading(false);
    };

    if (date >= tomorrow) {
      Alert.alert(
        "Confirm",
        "This appointment will appear in the Upcoming Screen. Do you want to continue?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes", onPress: save },
        ]
      );
      return;
    }

    await save();
  };

  const handleDeleteAppointment = (id: string) => {
    Alert.alert("Delete Appointment", "Are you sure you want to delete this appointment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
    
onPress: async () => {
  try {
    const ref = doc(db, "appointments", id);
    const snapshot = await getDoc(ref); // ✅ fix here
    const data = snapshot.data();

    await deleteDoc(ref);

    await sendNotification(
      "Appointment Deleted",
      `Appointment with ${data?.clientName || "unknown client"} has been removed.`
    );
    showToast("Appointment deleted");
  } catch (err) {
    console.error(err);
    alert("Failed to delete appointment");
  }
}
      },
    ]);
  };

  const openEditModal = (appt: Appointment) => {
    setName(appt.clientName);
    setPhone(appt.phone);
    setDate(appt.appointmentDateTime);
    setEditingId(appt.id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setName("");
    setPhone("");
    setDate(new Date());
    setEditingId(null);
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const isToday = (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const apptDate = new Date(item.appointmentDateTime);
      apptDate.setHours(0, 0, 0, 0);
      return apptDate.getTime() === today.getTime();
    })();

    return (
      <View
        style={[
          styles.appointmentItem,
          isToday && { backgroundColor: "#E6F0FF" },
        ]}
      >
        <Text style={styles.clientName}>{item.clientName}</Text>
        <Text style={styles.detail}>📞 {item.phone}</Text>
        <Text style={styles.detail}>🗓️ {item.appointmentDateTime.toLocaleString()}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Text style={{ color: "#4C8BF5" }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteAppointment(item.id)}>
            <Text style={{ color: "red", marginLeft: 12 }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today Appointments</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>
      <FlatList
        data={appointments.filter((appt) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return appt.appointmentDateTime >= today && appt.appointmentDateTime < tomorrow;
        })}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Appointment</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingId ? "Edit" : "New"} Appointment</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={{ fontSize: 20, color: "red" }}>❌</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Client Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="+92XXXXXXXXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TouchableOpacity onPress={() => setPickerVisible(true)}>
                <Text style={styles.datePickerText}>📅 {date.toLocaleString()}</Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={pickerVisible}
                mode="datetime"
                date={date}
                onConfirm={(selectedDate) => {
                  setDate(selectedDate);
                  setPickerVisible(false);
                }}
                onCancel={() => setPickerVisible(false)}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddOrEditAppointment}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Saving..." : editingId ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04, // 4% of screen width
    paddingVertical: height * 0.02, // 2% of screen height
    borderBottomLeftRadius: width * 0.03, // 3% of screen width
    borderBottomRightRadius: width * 0.03, // 3% of screen width
  },
  backButton: {
    padding: width * 0.02, // 2% of screen width
  },
  backArrow: {
    color: "#fff",
    fontSize: width * 0.07, // 7% of screen width
  },
  headerTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    color: "#fff",
  },
  
  appointmentItem: {
    backgroundColor: "#fff",
    padding: width * 0.05, // 5% of screen width
    borderRadius: width * 0.04, // 4% of screen width
    marginBottom: height * 0.02, // 2% of screen height
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: width * 0.01, // 1% of screen width
    elevation: 1,
    marginTop: height * 0.03, // 3% of screen height
  },
  clientName: {
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "600",
    marginBottom: height * 0.01, // 1% of screen height
  },
  detail: {
    fontSize: width * 0.035, // 3.5% of screen width
    color: "#555",
  },
  
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: height * 0.01, // 1% of screen height
  },
  
  addButton: {
    position: "absolute",
    bottom: height * 0.05, // 5% of screen height
    left: width * 0.05, // 5% of screen width
    right: width * 0.05, // 5% of screen width
    backgroundColor: "#4C8BF5",
    padding: width * 0.05, // 5% of screen width
    borderRadius: width * 0.08, // 8% of screen width
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "600",
  },
  
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: width * 0.05, // 5% of screen width
  },
  modalContent: {
    width: width * 0.8, // 80% of screen width
    minHeight: height * 0.3, // Minimum height 30% of screen height
    backgroundColor: "#fff",
    borderRadius: width * 0.04, // 4% of screen width
    padding: width * 0.05, // 5% of screen width
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "bold",
    marginBottom: height * 0.02, // 2% of screen height
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: width * 0.04, // 4% of screen width
    padding: width * 0.04, // 4% of screen width
    marginBottom: height * 0.02, // 2% of screen height
  },
  datePickerText: {
    fontSize: width * 0.04, // 4% of screen width
    color: "#4C8BF5",
    marginBottom: height * 0.02, // 2% of screen height
  },
  saveButton: {
    backgroundColor: "#4C8BF5",
    padding: width * 0.05, // 5% of screen width
    borderRadius: width * 0.04, // 4% of screen width
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "600",
  },
});