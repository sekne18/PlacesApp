import { Alert, Image, Text, StyleSheet, View } from "react-native";
import OutlinedButton from "../UI/OutlinedButton";
import { getCurrentPositionAsync, useForegroundPermissions, PermissionStatus } from 'expo-location';
import { Colors } from "../../constants/colors";
import { useEffect, useState } from "react";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { getAddress } from "../../util/location";


function LocationPicker({onPickLocation}) {
   const [pickedLocation, setPickedLocation] = useState();
   const isFocused = useIsFocused();
   const navigation = useNavigation();
   const route = useRoute();
   const [locationPermissionInfo, requestPermission] = useForegroundPermissions();

   useEffect(() => {
      if (isFocused && route.params) {
         const mapPickedLocation = route.params && {lat: route.params.pickedLat, lng: route.params.pickedLng};
         setPickedLocation(mapPickedLocation);
      }
   }, [route, isFocused]);

   useEffect(() => {
      async function handleLocation () {
         if (pickedLocation) {
            const address = await getAddress(pickedLocation.lat, pickedLocation.lng);
            onPickLocation({...pickedLocation, address: address });
         }
      }
      
   }, [pickedLocation, onPickLocation]);

   async function verifyPermissions() {
      if (locationPermissionInfo.status === PermissionStatus.UNDETERMINED) {
         const permissionResponse = await requestPresmission();

         return permissionResponse.granted;
      }

      if (locationPermissionInfo.status === PermissionStatus.DENIED) {
         Alert.alert("Insufficient Permissions!","You need to grant location persmissions to use this app.");
         return false;
      }

      return true;
   }

   async function getLocationHandler() {
      const hasPermission = await verifyPermissions();

      if (!hasPermission) {
         return;
      }

      const location = await getCurrentPositionAsync();
      setPickedLocation({lat: location.coords.latitude, lng: location.coords.longitude});
   }

   function pickOnMapHandler() {
      navigation.navigate('Map');
   }

   let locationPreview = <Text>No location picked yet.</Text>;

   if (pickedLocation) {
      locationPreview = (
         <Image style={styles.image} source={{uri: getMapPreview(pickedLocation.lat, pickedLocation.lng),}}/>
      );
   }

   return (
      <View>
         <View style={styles.mapPreview}>
            {locationPreview}
         </View>
         <View style={styles.actions}>
            <OutlinedButton location="location" onPress={getLocationHandler}>Locate User</OutlinedButton>
            <OutlinedButton icon="map" onPress={pickOnMapHandler}>Pick on Map</OutlinedButton>
         </View>
      </View>
   );
}

export default LocationPicker;

const styles = StyleSheet.create({
   mapPreview: {
      width: '100%',
      height: 200,
      marginVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.primary100,
      borderRadius: 4,
      overflow: "hidden",
   },
   actions: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
   },
   image: {
      width: '100%',
      height: '100%',
   }
});