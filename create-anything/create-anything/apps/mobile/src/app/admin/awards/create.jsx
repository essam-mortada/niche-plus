import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Save,
  Camera,
  X,
} from "lucide-react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function CreateAwardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    event_date: "",
    image: "",
    status: "upcoming",
  });

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Create award mutation
  const createAwardMutation = useMutation({
    mutationFn: async (awardData) => {
      const response = await fetch(`/api/awards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(awardData),
      });
      if (!response.ok) throw new Error("Failed to create award");
      return response.json();
    },
    onSuccess: (newAward) => {
      queryClient.invalidateQueries({ queryKey: ["admin-awards"] });
      Alert.alert(
        "Success",
        `Award "${newAward.title}" has been created successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create award. Please try again.");
      console.error("Create award error:", error);
    },
  });

  const handleSave = () => {
    if (!formData.title.trim() || !formData.location.trim() || !formData.event_date.trim()) {
      Alert.alert("Error", "Title, location and event date are required fields.");
      return;
    }

    createAwardMutation.mutate(formData);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#111214" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "#111214",
          borderBottomWidth: 1,
          borderBottomColor: "#2A2D34",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#2A2D34",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <ArrowLeft size={20} color="#F7F7F5" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
              }}
            >
              Create Award
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={createAwardMutation.isPending}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: createAwardMutation.isPending
                ? "#374151"
                : "#C6A15B",
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              opacity: createAwardMutation.isPending ? 0.6 : 1,
            }}
          >
            <Save size={16} color="#111214" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: "#111214",
                marginLeft: 4,
              }}
            >
              {createAwardMutation.isPending ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: "#9CA3AF",
            lineHeight: 22,
          }}
        >
          Create a new award
        </Text>
      </View>

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginTop: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 16,
              }}
            >
              Basic Information
            </Text>

            {/* Title */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                Title *
              </Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) => {
                  setFormData((prev) => ({
                    ...prev,
                    title: text,
                  }));
                }}
                placeholder="Enter award title..."
                placeholderTextColor="#6B7280"
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              />
            </View>

            {/* Location */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                Location *
              </Text>
              <TextInput
                value={formData.location}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, location: text }))
                }
                placeholder="Enter award location..."
                placeholderTextColor="#6B7280"
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              />
            </View>

            {/* Event Date */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                  marginBottom: 8,
                }}
              >
                Event Date *
              </Text>
              <TextInput
                value={formData.event_date}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, event_date: text }))
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#6B7280"
                style={{
                  backgroundColor: "#374151",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: "#F7F7F5",
                }}
              />
            </View>

            {/* Status */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color: "#F7F7F5",
                }}
              >
                Status
              </Text>
              <Switch
                value={formData.status === 'ongoing'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value ? 'ongoing' : 'upcoming' }))
                }
                trackColor={{ false: "#374151", true: "#22C55E" }}
                thumbColor="#F7F7F5"
              />
            </View>
          </View>

          {/* Image */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 16,
              }}
            >
              Image
            </Text>

            {formData.image ? (
              <View style={{ marginBottom: 16 }}>
                <Image
                  source={{ uri: formData.image }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                  contentFit="cover"
                  transition={200}
                />
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, image: "" }))
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#EF444420",
                    borderRadius: 8,
                    paddingVertical: 8,
                  }}
                >
                  <X size={16} color="#EF4444" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: "#EF4444",
                      marginLeft: 4,
                    }}
                  >
                    Remove Image
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  borderWidth: 2,
                  borderColor: "#374151",
                  borderStyle: "dashed",
                  borderRadius: 8,
                  paddingVertical: 40,
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Camera size={32} color="#6B7280" style={{ marginBottom: 8 }} />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_500Medium",
                    color: "#6B7280",
                  }}
                >
                  Tap to add image
                </Text>
              </TouchableOpacity>
            )}

            <TextInput
              value={formData.image}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, image: text }))
              }
              placeholder="Or enter image URL..."
              placeholderTextColor="#6B7280"
              style={{
                backgroundColor: "#374151",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
              }}
            />
          </View>

          {/* Content */}
          <View
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "PlayfairDisplay_700Bold",
                color: "#F7F7F5",
                marginBottom: 16,
              }}
            >
              Description
            </Text>

            <TextInput
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Write the award description here..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={10}
              style={{
                backgroundColor: "#374151",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#F7F7F5",
                textAlignVertical: "top",
                minHeight: 200,
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}
