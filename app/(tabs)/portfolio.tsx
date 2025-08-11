import { Image as ImageIcon, Plus, Search, Settings as SettingsIcon, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import ClientCard from '@/components/ClientCard';
import EmptyState from '@/components/EmptyState';
import PortfolioCard from '@/components/PortfolioCard';
import ServiceCard from '@/components/ServiceCard';
import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useClientsStore } from '@/hooks/useClientsStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { usePortfolioStore } from '@/hooks/usePortfolioStore';
import { useServicesStore } from '@/hooks/useServicesStore';
import { Client, PortfolioItem, Service } from '@/types';

type TabType = 'clients' | 'services' | 'portfolio';

export default function PortfolioScreen() {
  const { language } = useLanguageStore();
  const t = translations[language];
  
  const { clients } = useClientsStore();
  const { services } = useServicesStore();
  const { portfolioItems } = usePortfolioStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [filteredPortfolio, setFilteredPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const serviceCategories = [...new Set(services.map((service) => service.category))];
  const portfolioCategories = [...new Set(portfolioItems.map((item) => item.serviceCategory))];

  useEffect(() => {
    // Filter clients
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.phone.includes(query)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  useEffect(() => {
    // Filter services
    let filtered = services;
    
    if (selectedCategory) {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  useEffect(() => {
    // Filter portfolio
    let filtered = portfolioItems;
    
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.serviceCategory === selectedCategory);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) => item.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredPortfolio(filtered);
  }, [searchQuery, selectedCategory, portfolioItems]);

  const handleClientPress = (client: Client) => {
    router.push(`/client/${client.id}`);
  };

  const handleServicePress = (service: Service) => {
    router.push(`/service/${service.id}`);
  };

  const handlePortfolioPress = (item: PortfolioItem) => {
    router.push(`/portfolio/${item.id}`);
  };

  const handleAddClient = () => {
    router.push('/client/new');
  };

  const handleAddService = () => {
    router.push('/service/new');
  };

  const handleAddPortfolio = () => {
    router.push('/portfolio/new');
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'services':
        return t.searchServices;
      case 'clients':
        return t.searchClients;
      case 'portfolio':
        return t.searchPortfolio;
      default:
        return 'Search...';
    }
  };

  const getAddHandler = () => {
    switch (activeTab) {
      case 'services':
        return handleAddService;
      case 'clients':
        return handleAddClient;
      case 'portfolio':
        return handleAddPortfolio;
      default:
        return handleAddService;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'clients':
        return filteredClients.length > 0 ? (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ClientCard client={item} onPress={handleClientPress} />
            )}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            icon={Users}
            title={t.noClientsFound}
            message={
              searchQuery.trim() !== ''
                ? `No clients match "${searchQuery}"`
                : "You haven't added any clients yet."
            }
          />
        );

      case 'services':
        return (
          <>
            {serviceCategories.length > 0 && (
              <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                  {serviceCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category && styles.selectedCategoryButton,
                      ]}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category && styles.selectedCategoryText,
                        ]}
                      >
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
                renderItem={({ item }) => (
                  <ServiceCard service={item} onPress={handleServicePress} />
                )}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyState
                icon={SettingsIcon}
                title={t.noServicesFound}
                message={
                  searchQuery.trim() !== '' || selectedCategory
                    ? "No services match your filters"
                    : "You haven't added any services yet."
                }
              />
            )}
          </>
        );

      case 'portfolio':
        return (
          <>
            {portfolioCategories.length > 0 && (
              <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                  {portfolioCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category && styles.selectedCategoryButton,
                      ]}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category && styles.selectedCategoryText,
                        ]}
                      >
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
                renderItem={({ item }) => (
                  <PortfolioCard item={item} onPress={handlePortfolioPress} />
                )}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <EmptyState
                icon={ImageIcon}
                title={t.noPortfolioFound}
                message={
                  searchQuery.trim() !== '' || selectedCategory
                    ? "No items match your filters"
                    : "You haven't added any portfolio items yet."
                }
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity 
          style={styles.addButton}
          onPress={getAddHandler()}
        >
          <Plus size={20} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          testID="tab-services"
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => {
            setActiveTab('services');
            setSearchQuery('');
            setSelectedCategory(null);
          }}
        >
          <SettingsIcon size={20} color={activeTab === 'services' ? Colors.primary.main : Colors.neutral.gray} />
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            {t.services}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          testID="tab-clients"
          style={[styles.tab, activeTab === 'clients' && styles.activeTab]}
          onPress={() => {
            setActiveTab('clients');
            setSearchQuery('');
            setSelectedCategory(null);
          }}
        >
          <Users size={20} color={activeTab === 'clients' ? Colors.primary.main : Colors.neutral.gray} />
          <Text style={[styles.tabText, activeTab === 'clients' && styles.activeTabText]}>
            {t.clients}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          testID="tab-portfolio"
          style={[styles.tab, activeTab === 'portfolio' && styles.activeTab]}
          onPress={() => {
            setActiveTab('portfolio');
            setSearchQuery('');
            setSelectedCategory(null);
          }}
        >
          <ImageIcon size={20} color={activeTab === 'portfolio' ? Colors.primary.main : Colors.neutral.gray} />
          <Text style={[styles.tabText, activeTab === 'portfolio' && styles.activeTabText]}>
            {t.portfolio}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.neutral.gray,
  },
  activeTabText: {
    color: Colors.primary.main,
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
    fontWeight: '500' as const,
  },
  selectedCategoryText: {
    color: Colors.neutral.white,
  },
  listContent: {
    padding: 16,
  },
});