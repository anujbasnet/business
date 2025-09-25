import {
  ArrowUpDown,
  Image as ImageIcon,
  Plus,
  Search,
  Settings as SettingsIcon,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import axios from "axios";

import ClientCard from "@/components/ClientCard";
import EmptyState from "@/components/EmptyState";
import PortfolioCard from "@/components/PortfolioCard";
import ServiceCard from "@/components/ServiceCard";
import Colors from "@/constants/colors";
import { translations } from "@/constants/translations";

const BASE_URL = "http://192.168.1.4:5000/api";

export default function PortfolioScreen() {
  const language = "en";
  const t = translations[language];

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredPortfolio, setFilteredPortfolio] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [clientSortType, setClientSortType] = useState("name");
  const [showSortOptions, setShowSortOptions] = useState(false);

  const serviceCategories = [...new Set(services.map((s) => s.category))];
  const portfolioCategories = [
    ...new Set(portfolioItems.map((i) => i.serviceCategory)),
  ];

  // ---------------- API FUNCTIONS ----------------
  const fetchServices = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/services`);
      setServices(response.data);
    } catch (err) {
      console.error("Fetch Services Error:", err.message);
    }
  };

  const deleteService = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete Service Error:", err.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchServices();
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  };

  // ---------------- CLIENT SORTING ----------------
  const getClientVisitFrequency = (client) =>
    (client.lastVisit ? 1 : 0) +
    (client.upcomingAppointment ? 1 : 0) +
    (client.notes ? 1 : 0);

  const sortClients = (clientsToSort, sortType) => {
    const sorted = [...clientsToSort];
    switch (sortType) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "lastVisit":
        return sorted.sort((a, b) => {
          if (!a.lastVisit && !b.lastVisit) return 0;
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit) - new Date(a.lastVisit);
        });
      case "frequency":
        return sorted.sort(
          (a, b) => getClientVisitFrequency(b) - getClientVisitFrequency(a)
        );
      default:
        return sorted;
    }
  };

  // ---------------- FILTERING ----------------
  useEffect(() => {
    let filtered = clients;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    setFilteredClients(sortClients(filtered, clientSortType));
  }, [searchQuery, clients, clientSortType]);

  useEffect(() => {
    let filtered = services;
    if (selectedCategory)
      filtered = filtered.filter((s) => s.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  useEffect(() => {
    let filtered = portfolioItems;
    if (selectedCategory)
      filtered = filtered.filter((i) => i.serviceCategory === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((i) =>
        i.description.toLowerCase().includes(q)
      );
    }
    setFilteredPortfolio(filtered);
  }, [searchQuery, selectedCategory, portfolioItems]);

  useEffect(() => {
    fetchServices();
  }, []);

  // ---------------- HANDLERS ----------------
  const handleClientPress = (c) => router.push(`/client/edit/${c.id}`);
  const handleServicePress = (s) => router.push(`/service/${s.id}`);
  const handlePortfolioPress = (p) => router.push(`/portfolio/edit/${p.id}`);

  const handleAddClient = () => router.push("/client/new");
  const handleAddServicePress = () => router.push("/service/new");
  const handleAddPortfolio = () => router.push("/portfolio/new");

  const handleCategoryPress = (cat) =>
    setSelectedCategory(selectedCategory === cat ? null : cat);

  const getPlaceholder = () => {
    switch (activeTab) {
      case "services":
        return t.searchServices;
      case "clients":
        return t.searchClients;
      case "portfolio":
        return t.searchPortfolio;
      default:
        return "Search...";
    }
  };

  const getAddHandler = () => {
    switch (activeTab) {
      case "services":
        return handleAddServicePress;
      case "clients":
        return handleAddClient;
      case "portfolio":
        return handleAddPortfolio;
      default:
        return handleAddServicePress;
    }
  };

  const renderClientSortOptions = () => {
    if (!showSortOptions) return null;
    const options = [
      { key: "name", label: "Name (A-Z)" },
      { key: "lastVisit", label: "Last Visit (Recent)" },
      { key: "frequency", label: "Visit Frequency" },
    ];
    return (
      <View style={styles.sortOptionsContainer}>
        {options.map((o) => (
          <TouchableOpacity
            key={o.key}
            style={[
              styles.sortOption,
              clientSortType === o.key && styles.selectedSortOption,
            ]}
            onPress={() => {
              setClientSortType(o.key);
              setShowSortOptions(false);
            }}
          >
            <Text
              style={[
                styles.sortOptionText,
                clientSortType === o.key && styles.selectedSortOptionText,
              ]}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "clients":
        return filteredClients.length > 0 ? (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ClientCard client={item} onPress={() => handleClientPress(item)} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <EmptyState
              icon={Users}
              title={t.noClientsFound}
              message={
                searchQuery.trim()
                  ? `No clients match "${searchQuery}"`
                  : "You haven't added any clients yet."
              }
            />
          </ScrollView>
        );

      case "services":
        return filteredServices.length > 0 ? (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ServiceCard
                service={item}
                onPress={() => handleServicePress(item)}
                onDelete={() => deleteService(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <EmptyState
              icon={SettingsIcon}
              title={t.noServicesFound}
              message={
                searchQuery.trim() || selectedCategory
                  ? "No services match your filters"
                  : "You haven't added any services yet."
              }
            />
          </ScrollView>
        );

      case "portfolio":
        return filteredPortfolio.length > 0 ? (
          <FlatList
            data={filteredPortfolio}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PortfolioCard item={item} onPress={() => handlePortfolioPress(item)} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <EmptyState
              icon={ImageIcon}
              title={t.noPortfolioFound}
              message="No services available to show in portfolio."
            />
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "services" && styles.activeTab]}
          onPress={() => {
            setActiveTab("services");
            setSearchQuery("");
            setSelectedCategory(null);
          }}
        >
          <SettingsIcon
            size={20}
            color={
              activeTab === "services"
                ? Colors.neutral.white
                : Colors.neutral.white + "80"
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "services" && styles.activeTabText,
            ]}
          >
            {t.services}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "clients" && styles.activeTab]}
          onPress={() => {
            setActiveTab("clients");
            setSearchQuery("");
            setSelectedCategory(null);
          }}
        >
          <Users
            size={20}
            color={
              activeTab === "clients"
                ? Colors.neutral.white
                : Colors.neutral.white + "80"
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "clients" && styles.activeTabText,
            ]}
          >
            {t.clients}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "portfolio" && styles.activeTab]}
          onPress={() => {
            setActiveTab("portfolio");
            setSearchQuery("");
            setSelectedCategory(null);
          }}
        >
          <ImageIcon
            size={20}
            color={
              activeTab === "portfolio"
                ? Colors.neutral.white
                : Colors.neutral.white + "80"
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "portfolio" && styles.activeTabText,
            ]}
          >
            {t.portfolio}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search + Add */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search
            size={20}
            color={Colors.neutral.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={getPlaceholder()}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.neutral.gray}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => getAddHandler()()}
        >
          <Plus size={20} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.background },
  header: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, color: Colors.neutral.black },
  addButton: {
    backgroundColor: Colors.secondary.main,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.primary.main,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: { borderBottomWidth: 2, borderBottomColor: Colors.neutral.white },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral.white + "80",
  },
  activeTabText: { color: Colors.neutral.white },
  content: { flex: 1 },
  listContent: { padding: 16 },
  sortOptionsContainer: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedSortOption: { backgroundColor: Colors.primary.main + "10" },
  sortOptionText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: "500",
  },
  selectedSortOptionText: { color: Colors.primary.main, fontWeight: "600" },
});
