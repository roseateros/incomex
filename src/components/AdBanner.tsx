import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

interface AdBannerProps {
  size?: BannerAdSize;
  style?: any;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.BANNER,
  style 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Para desarrollo usa TestIds, para producción usa tu Ad Unit ID real
  const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-9831692105789559/xxxxxxxx';

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => setIsLoaded(true)}
        onAdFailedToLoad={(error) => {
          console.log('Ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
});

export default AdBanner;