import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";

import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
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

export default function MyProfileScreen() {
  const router = useRouter();

  const user = auth.currentUser;

  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUri, setAvatarUri] = useState("https://via.placeholder.com/150");

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setName(user.displayName || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setBusiness(data.business || "");
        setShopName(data.shopName || "");
        setAddress(data.address || "");
        if (data.avatarUri) setAvatarUri(data.avatarUri);
      }
    };

    loadProfile();
  }, []);

  const handleChangeImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled) setAvatarUri(res.assets[0].uri);
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        business,
        shopName,
        address,
        avatarUri,
      });

      await updateProfile(user, { displayName: name });

      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const editableFields = [
    { label: "Phone", value: phone, setter: setPhone },
    { label: "Business", value: business, setter: setBusiness },
    { label: "Shop Name", value: shopName, setter: setShopName },
    { label: "Address", value: address, setter: setAddress },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleChangeImage}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <Ionicons
              name="camera-outline"
              size={20}
              color="#fff"
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
          {editMode ? (
            <TextInput
              style={styles.inputName}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor={COLORS.muted}
            />
          ) : (
            <Text style={styles.name}>{name}</Text>
          )}
          <Text style={styles.email}>{email}</Text>
        </Animated.View>

        {editableFields.map((item, idx) => (
          <Animated.View
            entering={FadeInUp.duration(500).delay(idx * 100)}
            exiting={FadeOut.duration(300)}
            style={styles.infoCard}
            key={item.label}
          >
            <Text style={styles.label}>{item.label}</Text>
            {editMode ? (
              <TextInput
                style={styles.inputField}
                value={item.value}
                onChangeText={item.setter}
                placeholder={`Enter ${item.label}`}
                placeholderTextColor={COLORS.muted}
              />
            ) : (
              <Text style={styles.value}>{item.value || "-"}</Text>
            )}
          </Animated.View>
        ))}

        <TouchableOpacity
          style={styles.editButton}
          onPress={editMode ? saveProfile : () => setEditMode(true)}
        >
          <Text style={styles.editButtonText}>
            {editMode ? "Save Changes" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  
  headerTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    color: "#fff",
  },
  
  container: { padding: width * 0.04, paddingTop: height * 0.03 }, // 4% of screen width, 3% of screen height
  
  avatarContainer: { alignItems: "center", marginBottom: height * 0.03 }, // 3% of screen height
  
  avatar: {
    width: width * 0.25, // 25% of screen width
    height: width * 0.25, // 25% of screen width
    borderRadius: width * 0.125, // 12.5% of screen width
    borderWidth: width * 0.008, // 0.8% of screen width
    borderColor: "#fff",
    marginBottom: height * 0.01, // 1% of screen height
  },
  
  cameraIcon: {
    position: "absolute",
    bottom: height * 0.02, // 2% of screen height
    right: width * 0.02, // 2% of screen width
    backgroundColor: COLORS.primary,
    borderRadius: width * 0.03, // 3% of screen width
    padding: width * 0.03, // 3% of screen width
  },
  
  name: {
    fontSize: width * 0.045, // 4.5% of screen width
    fontWeight: "600",
    color: COLORS.text,
  },
  
  email: {
    fontSize: width * 0.035, // 3.5% of screen width
    color: COLORS.muted,
    marginBottom: height * 0.01, // 1% of screen height
  },
  
  infoCard: {
    backgroundColor: COLORS.card,
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.025, // 2.5% of screen width
    marginBottom: height * 0.02, // 2% of screen height
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  label: {
    fontSize: width * 0.03, // 3% of screen width
    fontWeight: "500",
    color: COLORS.muted,
    marginBottom: height * 0.005, // 0.5% of screen height
  },
  
  value: {
    fontSize: width * 0.035, // 3.5% of screen width
    fontWeight: "500",
    color: COLORS.text,
  },
  
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: height * 0.025, // 2.5% of screen height
    alignItems: "center",
    borderRadius: width * 0.03, // 3% of screen width
    marginTop: height * 0.03, // 3% of screen height
  },
  
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: width * 0.04, // 4% of screen width
  },
  
  inputName: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    color: COLORS.text,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    width: "75%",
    textAlign: "center",
    marginBottom: height * 0.02, // 2% of screen height
    paddingVertical: height * 0.01, // 1% of screen height
  },
  
  inputField: {
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: width * 0.03, // 3% of screen width
    padding: width * 0.04, // 4% of screen width
    marginTop: height * 0.015, // 1.5% of screen height
  },
});