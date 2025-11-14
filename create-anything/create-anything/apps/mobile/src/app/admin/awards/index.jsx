import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function AdminAwardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Fetch awards
  const { data: awardsData, refetch } = useQuery({
    queryKey: ["admin-awards", currentPage, searchQuery, selectedFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
        ...(selectedFilter && {
          [selectedFilter.split(":")[0]]: selectedFilter.split(":")[1],
        }),
      });

      const response = await fetch(`/api/awards?${params}`);
      if (!response.ok) throw new Error("Failed to fetch awards");
      return response.json();
    },
  });

  // Delete award mutation
  const deleteAwardMutation = useMutation({
    mutationFn: async (awardId) => {
      const response = await fetch(`/api/awards/${awardId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete award");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-awards"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDeleteAward = (award) => {
    Alert.alert(
      "Delete Award",
      `Are you sure you want to delete "${award.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteAwardMutation.mutate(award.id),
        },
      ],
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const filterOptions = [
    { value: "", label: "All Awards" },
    { value: "status:upcoming", label: "Upcoming" },
    { value: "status:ongoing", label: "Ongoing" },
    { value: "status:past", label: "Past" },
  ];

  const awards = awardsData?.awards || [];
  const pagination = awardsData?.pagination || {};

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
              Award Management
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/admin/awards/create")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#C6A15B",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plus size={20} color="#111214" />
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
          Create and manage awards
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <Search size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search awards..."
            placeholderTextColor="#6B7280"
            style={{
              flex: 1,
              marginLeft: 12,
              paddingVertical: 12,
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: "#F7F7F5",
            }}
          />
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelectedFilter(option.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor:
                  selectedFilter === option.value ? "#C6A15B" : "#2A2D34",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_500Medium",
                  color:
                    selectedFilter === option.value ? "#111214" : "#F7F7F5",
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#2A2D34",
            borderRadius: 12,
            padding: 16,
            marginRight: 8,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: "#F7F7F5",
            }}
          >
            {pagination.total || 0}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: "#9CA3AF",
            }}
          >
            Total Awards
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C6A15B"
            colors={["#C6A15B"]}
          />
        }
      >
        {/* Award List */}
        {awards.map((award) => (
          <View
            key={award.id}
            style={{
              backgroundColor: "#2A2D34",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              {/* Image */}
              {award.image && (
                <Image
                  source={{ uri: award.image }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                  contentFit="cover"
                  transition={200}
                />
              )}

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: "#F7F7F5",
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {award.title}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <MapPin size={12} color="#6B7280" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#6B7280",
                      marginLeft: 4,
                    }}
                  >
                    {award.location}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Calendar size={12} color="#6B7280" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#6B7280",
                      marginLeft: 4,
                    }}
                  >
                    {formatDate(award.event_date)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#374151",
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push(`/admin/awards/edit/${award.id}`)
                }
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "#C6A15B20",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Edit size={14} color="#C6A15B" />
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_600SemiBold",
                    color: "#C6A15B",
                    marginLeft: 4,
                  }}
                >
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteAward(award)}
                disabled={deleteAwardMutation.isPending}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: "#EF444420",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: deleteAwardMutation.isPending ? 0.6 : 1,
                }}
              >
                <Trash2 size={14} color="#EF4444" />
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_600SemiBold",
                    color: "#EF4444",
                    marginLeft: 4,
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: currentPage === 1 ? "#374151" : "#C6A15B",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color: currentPage === 1 ? "#6B7280" : "#111214",
                }}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_500Medium",
                color: "#F7F7F5",
              }}
            >
              Page {currentPage} of {pagination.pages}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setCurrentPage((prev) => Math.min(pagination.pages, prev + 1))
              }
              disabled={currentPage === pagination.pages}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor:
                  currentPage === pagination.pages ? "#374151" : "#C6A15B",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_600SemiBold",
                  color:
                    currentPage === pagination.pages ? "#6B7280" : "#111214",
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
