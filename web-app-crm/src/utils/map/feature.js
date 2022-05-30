import tCirlce from "@turf/circle";

export const generateFeatures = locations => {
  return locations.map(getFeature);
};

const getFeature = location => {
  return {
    ...tCirlce([location.lon, location.lat], location.radiusInKm),
    id: `${location.lon}${location.lat}`,
    properties: {
      isCircle: true,
      center: [location.lon, location.lat],
      radiusInKm: location.radiusInKm
    }
  };
};
