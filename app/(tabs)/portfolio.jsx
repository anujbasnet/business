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
} from "react-native";
import { router } from "expo-router";
import axios from "axios";

import ClientCard from "@/components/ClientCard";
import EmptyState from "@/components/EmptyState";
import PortfolioCard from "@/components/PortfolioCard";
import ServiceCard from "@/components/ServiceCard";
import Colors from "@/constants/colors";
import { translations } from "@/constants/translations";
import { useClientsStore } from "@/hooks/useClientsStore";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { usePortfolioStore } from "@/hooks/usePortfolioStore";
import { useServicesStore } from "@/hooks/useServicesStore";

const BASE_URL = "http://192.168.1.3:5000/api/services"; // Replace with your backend URL

export default function PortfolioScreen() {
  const { language } = useLanguageStore();
  const t = translations[language];

  const { clients } = useClientsStore();
  const { services } = useServicesStore();
  const { portfolioItems } = usePortfolioStore();

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

  // Axios functions
// Add new item
const addItem = async (item) => {
  try {
    const response = await axios.post(BASE_URL, item); // Only BASE_URL
    return response.data;
  } catch (err) {
    console.error("Add Error:", err.response?.status, err.message);
  }
};
// Fetch services
const fetchServices = async () => {
  try {
    const response = await axios.get(BASE_URL);
    useServicesStore.getState().setServices(response.data); // ✅ update store
  } catch (err) {
    console.error("Fetch Error:", err.response?.status, err.message);
  }
};

// Edit item
const editItem = async (id, updatedItem) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, updatedItem);
    return response.data;
  } catch (err) {
    console.error("Edit Error:", err.response?.status, err.message);
  }
};

// Delete item
const deleteItem = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
    return true;
  } catch (err) {
    console.error("Delete Error:", err.response?.status, err.message);
    return false;
  }
};


  const getClientVisitFrequency = (client) =>
    (client.lastVisit ? 1 : 0) + (client.upcomingAppointment ? 1 : 0) + (client.notes ? 1 : 0);

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
        return sorted.sort((a, b) => getClientVisitFrequency(b) - getClientVisitFrequency(a));
      default:
        return sorted;
    }
  };

  useEffect(() => {
    let filtered = clients;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = clients.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
      );
    }
    setFilteredClients(sortClients(filtered, clientSortType));
  }, [searchQuery, clients, clientSortType]);

  useEffect(() => {
    let filtered = services;
    if (selectedCategory) filtered = filtered.filter((s) => s.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  useEffect(() => {
    let filtered = portfolioItems;
    if (selectedCategory) filtered = filtered.filter((i) => i.serviceCategory === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((i) => i.description.toLowerCase().includes(q));
    }
    setFilteredPortfolio(filtered);
  }, [searchQuery, selectedCategory, portfolioItems]);
  useEffect(() => {
  fetchServices();
}, []);

  // Handlers
  const handleClientPress = (c) => router.push(`/client/${c.id}`);
  const handleServicePress = (s) => router.push(`/service/${s.id}`);
  const handlePortfolioPress = (p) => router.push(`/portfolio/${p.id}`);

    const handleAddClient = () => {
    router.push("/client/new");
  };

  const handleAddService = () => {
    router.push("/service/new");
  };


  const handleAddPortfolio = () => {
    router.push("/portfolio/new");
  };



 const handleDeleteService = async (id) => {
  const success = await deleteItem(id);
  if (success) useServicesStore.getState().removeService(id);
};
  const handleCategoryPress = (cat) => setSelectedCategory(selectedCategory === cat ? null : cat);

  const getPlaceholder = () => {
    switch (activeTab) {
      case "services": return t.searchServices;
      case "clients": return t.searchClients;
      case "portfolio": return t.searchPortfolio;
      default: return "Search...";
    }
  };

  const getAddHandler = () => {
    switch (activeTab) {
      case "services": return handleAddService;
      case "clients": return handleAddClient;
      case "portfolio": return handleAddPortfolio;
      default: return handleAddService;
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
            style={[styles.sortOption, clientSortType === o.key && styles.selectedSortOption]}
            onPress={() => { setClientSortType(o.key); setShowSortOptions(false); }}
          >
            <Text style={[styles.sortOptionText, clientSortType === o.key && styles.selectedSortOptionText]}>
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
        return (
          <>
            <View style={styles.clientsHeader}>
              <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortOptions(!showSortOptions)}>
                <ArrowUpDown size={16} color={Colors.primary.main} />
                <Text style={styles.sortButtonText}>Sort</Text>
              </TouchableOpacity>
            </View>
            {renderClientSortOptions()}
            {filteredClients.length > 0 ? (
              <FlatList
                data={filteredClients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ClientCard client={item} onPress={handleClientPress} />}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyState icon={Users} title={t.noClientsFound} message={searchQuery.trim() ? `No clients match "${searchQuery}"` : "You haven't added any clients yet."} />
            )}
          </>
        );

      case "services":
        return (
          <>
            {serviceCategories.length > 0 && (
              <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                  {serviceCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {filteredServices.length > 0 ? (
              <FlatList
                data={filteredServices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ServiceCard service={item} onPress={handleServicePress} onDelete={() => handleDeleteService(item.id)} />}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyState icon={SettingsIcon} title={t.noServicesFound} message={searchQuery.trim() || selectedCategory ? "No services match your filters" : "You haven't added any services yet."} />
            )}
          </>
        );

      case "portfolio":
        return (
          <>
            <View style={styles.portfolioHeader}>
              <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortOptions(!showSortOptions)}>
                <ArrowUpDown size={16} color={Colors.primary.main} />
                <Text style={styles.sortButtonText}>Sort</Text>
              </TouchableOpacity>
            </View>
            {portfolioCategories.length > 0 && (
              <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                  {portfolioCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {filteredPortfolio.length > 0 ? (
              <FlatList
                data={filteredPortfolio}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PortfolioCard item={item} onPress={handlePortfolioPress} />}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyState icon={ImageIcon} title={t.noPortfolioFound} message={searchQuery.trim() || selectedCategory ? "No items match your filters" : "You haven't added any portfolio items yet."} />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity testID="tab-services" style={[styles.tab, activeTab === "services" && styles.activeTab]} onPress={() => { setActiveTab("services"); setSearchQuery(""); setSelectedCategory(null); }}>
          <SettingsIcon size={20} color={activeTab === "services" ? Colors.neutral.white : Colors.neutral.white + "80"} />
          <Text style={[styles.tabText, activeTab === "services" && styles.activeTabText]}>{t.services}</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="tab-clients" style={[styles.tab, activeTab === "clients" && styles.activeTab]} onPress={() => { setActiveTab("clients"); setSearchQuery(""); setSelectedCategory(null); }}>
          <Users size={20} color={activeTab === "clients" ? Colors.neutral.white : Colors.neutral.white + "80"} />
          <Text style={[styles.tabText, activeTab === "clients" && styles.activeTabText]}>{t.clients}</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="tab-portfolio" style={[styles.tab, activeTab === "portfolio" && styles.activeTab]} onPress={() => { setActiveTab("portfolio"); setSearchQuery(""); setSelectedCategory(null); }}>
          <ImageIcon size={20} color={activeTab === "portfolio" ? Colors.neutral.white : Colors.neutral.white + "80"} />
          <Text style={[styles.tabText, activeTab === "portfolio" && styles.activeTabText]}>{t.portfolio}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.neutral.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={getPlaceholder()}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.neutral.gray}
          />
        </View>
       <TouchableOpacity style={styles.addButton} onPress={() => getAddHandler()}>

          <Plus size={20} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.neutral.black,
  },
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
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.neutral.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral.white + "80",
  },
  activeTabText: {
    color: Colors.neutral.white,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    backgroundColor: Colors.neutral.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  categoriesContent: {
    paddingHorizontal: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.background,
    marginHorizontal: 4,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary.main,
  },
  categoryText: {
    color: Colors.neutral.darkGray,
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: Colors.neutral.white,
  },
  listContent: {
    padding: 16,
  },
  clientsHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  portfolioHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.neutral.background,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  sortButtonText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: "500",
  },
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
  selectedSortOption: {
    backgroundColor: Colors.primary.main + "10",
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: "500",
  },
  selectedSortOptionText: {
    color: Colors.primary.main,
    fontWeight: "600",
  },
});