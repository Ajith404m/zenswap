import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function ListingCard({ listing, onPress }) {
  const getBadgeColor = (type) => {
    const colors = {
      sell: '#fff',
      buy: '#3a77ff',
      exchange: '#8b5cf6',
      rent: '#f59e0b',
    };
    return colors[type] || '#fff';
  };

  const getBadgeTextColor = (type) => {
    return type === 'sell' ? theme.colors.text : '#fff';
  };

  const formatPrice = () => {
    if (listing.price != null) {
      return `${listing.currency || 'USD'} ${listing.price}`;
    }
    return listing.type === 'exchange' ? 'Exchange' : 'Contact';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Image */}
      {listing.images && listing.images.length > 0 ? (
        <Image source={{ uri: listing.images[0] }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={40} color={theme.colors.muted} />
        </View>
      )}

      {/* Badge */}
      <View
        style={[
          styles.badge,
          { backgroundColor: getBadgeColor(listing.type) },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: getBadgeTextColor(listing.type) },
          ]}
        >
          {listing.type.toUpperCase()}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.price}>{formatPrice()}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={theme.colors.muted} />
          <Text style={styles.location} numberOfLines={1}>
            {listing.location || 'Location not specified'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f3f4',
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: theme.colors.muted,
    flex: 1,
  },
});
