import React, { useState, useEffect } from 'react';
import { Button, View } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

interface AdInterstitialProps {
  onAdClosed?: () => void;
  children: React.ReactNode;
}

const AdInterstitial: React.FC<AdInterstitialProps> = ({ onAdClosed, children }) => {
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Para desarrollo usa TestIds, para producción usa tu Ad Unit ID real
  const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-9831692105789559/8254663062';

  useEffect(() => {
    const interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribe = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      onAdClosed?.();
      // Precargar el siguiente anuncio
      interstitialAd.load();
    });

    setInterstitial(interstitialAd);
    interstitialAd.load();

    return () => {
      unsubscribe();
      unsubscribeClosed();
    };
  }, []);

  const showAd = () => {
    if (loaded && interstitial) {
      interstitial.show();
    }
  };

  return (
    <View>
      {children}
    </View>
  );
};

export default AdInterstitial;