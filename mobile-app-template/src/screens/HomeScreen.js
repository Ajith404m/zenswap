import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchListings } from '../services/api';
import ListingCard from '../components/ListingCard';
import CategoryChip from '../components/CategoryChip';
import { theme } from '../styles/theme';

const categories = [
  { id: 'all', name: 'All', icon: '🏠' },
  { id: 'Electronics', name: 'Electronics', icon: '📱' },
  { id: 'Furniture', name: 'Furniture', icon: '🛋️' },
  { id: 'Fashion', name: 'Fashion', icon: '👕' },
  { id: 'Sports', name: 'Sports', icon: '⚽' },
  { id: 'Gaming', name: 'Gaming', icon: '🎮' },
];

export default function HomeScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedCategory, selectedType]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await fetchListings();
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    setFilteredListings(filtered);
  };

  const handleListingPress = (listing) => {
    navigation.navigate('ListingDetail', { listing });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>ZenSwap</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.muted}
        />
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={`${category.icon} ${category.name}`}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
          />
        ))}
      </ScrollView>

      {/* Type Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeScroll}
        contentContainerStyle={styles.typeContainer}
      >
        {['all', 'sell', 'buy', 'exchange', 'rent'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeTab,
              selectedType === type && styles.typeTabActive,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.typeTabText,
                selectedType === type && styles.typeTabTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Listings Grid */}
      <FlatList
        data={filteredListings}
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => handleListingPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No listings found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: theme.colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  notificationBtn: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typeScroll: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  typeContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typeTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.bg,
  },
  typeTabActive: {
    backgroundColor: theme.colors.secondary,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  typeTabTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.muted,
  },
});
