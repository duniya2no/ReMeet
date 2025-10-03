import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");


const COLORS = {
  primary: "#4C8BF5",
  secondary: "#6FA7FF",
  background: "#F8FAFC",
  text: "#1E293B",
  muted: "#64748B",
  card: "#fff",
  border: "#E2E8F0",
};

export default function PurchaseScreen() {
  const router = useRouter();

  const plans = [
    {
      name: "🎁 First twenty Client Free",
      price: "Free",
      description: "Your first Twenty client comes at no cost Free!",
      features: ["20 free user", "limited sending"],
    },
    {
      name: "Monthly Unlimited",
      price: "₨499",
      description: "Unlimited users & features per month",
      features: ["Unlimited sending", "Unlimited clients"],
    },
    {
      name: "Yearly Unlimited",
      price: "₨4499",
      description: "Unlimited users & features per year",
      features: ["Unlimited sending", "Unlimited clients"],
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"method" | "details">("method");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handlePay = async (plan: any) => {
    if (plan.price === "Free") {
      try {
        await addDoc(collection(db, "purchases"), {
          planName: plan.name,
          price: plan.price,
          description: plan.description,
          paymentMethod: "Free",
          purchasedAt: serverTimestamp(),
          userId: "some-user-id",
        });
        Alert.alert("Success", `${plan.name} activated!`);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Something went wrong.");
      }
    } else {
      setSelectedPlan(plan);
      setModalVisible(true);
    }
  };

  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setScreenshot(result.assets[0].uri);
    }
  };

  const confirmPayment = async () => {
    try {
      if (!selectedPlan || !selectedMethod || !accountName || !accountNumber) return;

      await addDoc(collection(db, "purchases"), {
        planName: selectedPlan.name,
        price: selectedPlan.price,
        description: selectedPlan.description,
        paymentMethod: selectedMethod,
        accountName,
        accountNumber,
        screenshotUri: screenshot,
        purchasedAt: serverTimestamp(),
        userId: "some-user-id",
      });

      Alert.alert("Success", `${selectedPlan.name} activated via ${selectedMethod}`);
      setModalVisible(false);
      setSelectedPlan(null);
      setSelectedMethod("");
      setAccountName("");
      setAccountNumber("");
      setScreenshot(null);
      setPaymentStep("method");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Purchase plan</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {plans.map((plan, idx) => (
          <Animated.View key={idx} entering={FadeInUp.delay(idx * 100).duration(500)}>
            <View style={styles.card}>
              <View style={styles.innerCard}>
                <PlanContent plan={plan} onPay={() => handlePay(plan)} />
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              {paymentStep === "method" ? (
                <>
                  <Text style={styles.modalTitle}>Select Payment Method</Text>
                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={() => {
                      setSelectedMethod("EasyPaisa");
                      setPaymentStep("details");
                    }}
                  >
                    <Text style={styles.paymentButtonText}>EasyPaisa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={() => {
                      setSelectedMethod("JazzCash");
                      setPaymentStep("details");
                    }}
                  >
                    <Text style={styles.paymentButtonText}>JazzCash</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedPlan(null);
                      setPaymentStep("method");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>
                    Enter {selectedMethod} Account Details
                  </Text>
                  <Text style={{ fontSize: 14, marginBottom: 4 }}>Account Holder Name</Text>
                  <TouchableOpacity style={styles.inputBox}>
                    <TextInput
                      placeholder="Enter Name"
                      value={accountName}
                      onChangeText={setAccountName}
                      style={{ padding: 10 }}
                    />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, marginBottom: 4, marginTop: 10 }}>
                    Account Number
                  </Text>
                  <TouchableOpacity style={styles.inputBox}>
                    <TextInput
                      placeholder="Enter Account Number"
                      value={accountNumber}
                      onChangeText={setAccountNumber}
                      style={{ padding: 10 }}
                      keyboardType="numeric"
                    />
                  </TouchableOpacity>

                  <Text style={{ fontSize: 14, marginBottom: 6, marginTop: 10 }}>
                    Upload Payment Screenshot
                  </Text>
                  <TouchableOpacity onPress={pickScreenshot} style={styles.uploadBox}>
                    <Text style={{ color: "#4C8BF5", textAlign: "center" }}>
                      {screenshot ? "Change Screenshot" : "Choose Screenshot"}
                    </Text>
                  </TouchableOpacity>

                  {screenshot && (
                    <View style={{ marginTop: 10, alignItems: "center" }}>
                      <Image
                        source={{ uri: screenshot }}
                        style={{
                          width: "100%",
                          height: 150,
                          borderRadius: 8,
                        }}
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        onPress={() => setScreenshot(null)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Remove Image</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.paymentButton, { marginTop: 16 }]}
                    onPress={confirmPayment}
                  >
                    <Text style={styles.paymentButtonText}>Confirm Payment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setPaymentStep("method");
                      setSelectedMethod("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Back</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function PlanContent({
  plan,
  onPay,
}: {
  plan: any;
  onPay: () => void;
}) {
  const isFree = plan.price === "Free";
  return (
    <View>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.price}>
        {plan.price}{" "}
        <Text style={{ fontSize: 12 }}>
          {plan.price === "Free" ? "" : plan.name.includes("Yearly") ? "/ year" : "/ month"}
        </Text>
      </Text>
      <Text style={styles.description}>{plan.description}</Text>
      <View style={styles.features}>
        {plan.features.map((feature: string, i: number) => (
          <Text key={i} style={styles.featureText}>• {feature}</Text>
        ))}
      </View>
      <TouchableOpacity style={styles.payBtn} onPress={onPay}>
        <Text style={{ color: "#5A4FCF", fontWeight: "600", fontSize: 14 }}>
          {isFree ? "Activate Now" : "Pay Now"}
        </Text>
      </TouchableOpacity>
    </View>
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

  headerTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    color: "#fff",
  },

  cardsContainer: { paddingBottom: height * 0.02 }, // 2% of screen height

  card: {
    width: "90%",
    marginBottom: height * 0.02, // 2% of screen height
    borderRadius: width * 0.03, // 3% of screen width
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: width * 0.01, // 1% of screen width
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    justifyContent: "center",
    marginLeft: width * 0.05, // 5% of screen width
    marginTop: height * 0.03, // 3% of screen height
  },

  innerCard: { flex: 1, padding: width * 0.05 }, // 5% of screen width

  planName: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "700",
    marginBottom: height * 0.01, // 1% of screen height
  },

  price: {
    fontSize: width * 0.06, // 6% of screen width
    fontWeight: "700",
    marginBottom: height * 0.01, // 1% of screen height
  },

  description: {
    fontSize: width * 0.035, // 3.5% of screen width
    textAlign: "center",
    marginBottom: height * 0.02, // 2% of screen height
    color: "#555",
  },

  features: { marginBottom: height * 0.02 }, // 2% of screen height

  featureText: {
    fontSize: width * 0.035, // 3.5% of screen width
    color: "#555",
    marginVertical: height * 0.005, // 0.5% of screen height
  },

  payBtn: {
    marginTop: height * 0.02, // 2% of screen height
    alignItems: "center",
    paddingVertical: height * 0.02, // 2% of screen height
    borderRadius: width * 0.05, // 5% of screen width
    borderWidth: 1,
    borderColor: "#5A4FCF",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: width * 0.05, // 5% of screen width
    borderTopLeftRadius: width * 0.05, // 5% of screen width
    borderTopRightRadius: width * 0.05, // 5% of screen width
  },

  modalTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    marginBottom: height * 0.02, // 2% of screen height
    textAlign: "center",
  },

  paymentButton: {
    padding: width * 0.04, // 4% of screen width
    backgroundColor: "#4C8BF5",
    borderRadius: width * 0.03, // 3% of screen width
    marginVertical: height * 0.02, // 2% of screen height
    alignItems: "center",
  },

  paymentButtonText: {
    color: "#fff",
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "600",
  },

  cancelButton: {
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.03, // 3% of screen width
    marginTop: height * 0.02, // 2% of screen height
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#333",
    fontSize: width * 0.04, // 4% of screen width
  },

  inputBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: width * 0.03, // 3% of screen width
    marginBottom: height * 0.02, // 2% of screen height
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: "#4C8BF5",
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.03, // 3% of screen width
    alignItems: "center",
  },

  removeButton: {
    marginTop: height * 0.02, // 2% of screen height
    paddingVertical: height * 0.02, // 2% of screen height
    paddingHorizontal: width * 0.05, // 5% of screen width
    borderRadius: width * 0.03, // 3% of screen width
    backgroundColor: "#ff4d4f",
  },

  removeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: width * 0.04, // 4% of screen width
  },
});
