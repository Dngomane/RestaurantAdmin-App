import React, { useState,  useEffect } from 'react';
import { Text, View, useWindowDimensions, StyleSheet, TouchableOpacity,ScrollView, 
  SafeAreaView, Image, Modal, Pressable,FlatList, TextInput,  Picker, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import constant from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storageRef, fb } from '../data/firebase'
import Drinks from './Drinks'
import MealsPage from './Meals';
import { TabView, SceneMap } from 'react-native-tab-view';
import moment from 'moment';

const image1 = {uri: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MzF8fHJlc3RhdXJhbnR8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"};

const AllRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#2e8b57', }}>
    <Text style={{color: "#fff", fontSize: 20}}>Meals</Text>
    <MealsPage/>
    <Text style={{color: "#fff", fontSize: 20}}>Drinks</Text>
    <Drinks/>
  </View>
);

const MealsRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#ff4081', height: 100}}>
    <MealsPage/>
  </View>
);

const DrinksRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#673ab7',  height: 100}}>
    <Drinks/>
  </View>
);

const renderScene = SceneMap({
  all: AllRoute,
  meals: MealsRoute,
  drinks: DrinksRoute,
});

const HomePage = ({navigation, route}) => {
  
const layout = useWindowDimensions();

const[users, setUsers] = useState(null);

const [modalVisible, setModalVisible] = useState(false);
  
const [image, setImage] = useState('');
const [name, setName] = useState('');
const [price, setPrice] = useState('');
const [selectedValue, setSelectedValue] = useState("");

const [key, setKey] = useState('');
const [status, setStatus] = useState("");
const uid = auth.currentUser.uid;

const Bookings = async () => {
  const querySanp = await db.collection('Bookings').where('adminuid', '==', uid).onSnapshot((querySanp) => {
    const allusers = querySanp.docs.map(docSnap=>docSnap.data())
    console.log(allusers)
    setUsers(allusers)})
  
}

useEffect(() => {
  Bookings()
}, [])



const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  console.log(result.uri);

  if (!result.cancelled) {
    setImage(result.uri);
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed!"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", result.uri, true);
      xhr.send(null);
    });

    const ref = storageRef.child(new Date().toISOString());
    const snapshot = (await ref.put(blob)).ref
      .getDownloadURL()
      .then((imageUrl) => {
        setImage(imageUrl);
        console.log(
          imageUrl,
          "this is setting the image too storage before 3"
        );

        blob.close();
      });
  }
};

  const booking = () => {
    const admin = auth.currentUser;
      navigation.navigate("Home", {
       image: image,
       category: selectedValue,
       name: name,
       price: price,
      });
          return db.collection( selectedValue ).add({
          uid: admin.uid,
          image:image,
          category: selectedValue,
          name: name,
          price: price,
      }).then(() => { 
            setModalVisible(!modalVisible);
      })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage)
    });
  }

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'all', title: 'All' },
    { key: 'meals', title: 'Meals' },
    { key: 'drinks', title: 'Drinks' },
  ])

 

  const RenderCard = ({item}) => {
    return (
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('BookingDetails', {key: item.key,
            restaurant: item.restaurant,
            numberOfPeople: item.numberOfPeople,
            status: item.status,
            approval: item.approval,
            })}>
               <View style={{margin: 10}}>
                <Text>
                <Text style={{fontWeight: 'bold'}}>
                   Restaurant:
                </Text> {item.restaurant}
                </Text>
               <Text>
               <Text style={{fontWeight: 'bold'}}>
                  Guests:
                </Text> {item.numberOfPeople}
                </Text>        
                  <Text>
                    <Text style={{fontWeight: 'bold'}}>
                      Date: 
                      </Text>
                    {moment(item.date.toDate()).format('MM/DD/YYYY')}
                </Text> 
                <Text>
                    <Text style={{fontWeight: 'bold'}}>
                      Time: 
                      </Text>
                    {moment(item.date.toDate()).format('HH:mm a')}
                </Text> 

                <Text>
                <Text style={{fontWeight: 'bold'}}>
                   Status:
                </Text> {item.status}
                </Text>

              </View>
            </TouchableOpacity>
    )
  }

  return (
    <View  style={styles.container}>

        <Text style={{fontSize: 20, color: "#5f9ea0", textDecorationLine: "underline", 
        paddingLeft: 15, paddingTop: 7, marginTop: 15, textAlign: "center" }}>
          Bookings
        </Text>

        <View style={{paddingLeft: 15, paddingTop: 10, flexDirection: "row"}}>
          <View>
          <FlatList
          horizontal={true} showsHorizontalScrollIndicator={false}
                    data={users}
                    renderItem={({item})=> {return <RenderCard item={item} />}}
                    keyExtractor={(item) => item.uid}             
              />
          </View>
          </View>

      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>

          <View style={{marginRight: 190}}>
              <FontAwesome name="window-close" size={24} color="#5f9ea0" onPress={() => setModalVisible(!modalVisible)}/>
          </View>

          <Text style={{textAlign: "center", color: "#5f9ea0", fontSize: 25, marginBottom: 10, marginTop: 10}}>update Menu</Text>
          
          <View>
              <TouchableOpacity  onPress={pickImage}>
              <Image style={styles.image} source={{uri: image}} value={image}/>
              
              <FontAwesome name="camera" size={24} color="black" style={{marginLeft: 80, marginTop: -25}}/>
              </TouchableOpacity>
          </View>

          <View style={styles.TextField}>
            <View style={{flex: 1, flexDirection: "row", marginHorizontal: 3}}>
              <Text style={{flex: 1, flexDirection: "row", color: "#5f9ea0", 
              marginHorizontal: 10,fontWeight: "bold"}}>
                Select Category:</Text>
            </View>

            <Picker
              selectedValue={selectedValue}
              style={{ height: 50, width: 150 }}
              onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
            >
              <Picker.Item label="" />
              <Picker.Item label="Meals" value="meals" />
              <Picker.Item label="Drinks" value="drinks" />
            </Picker>
          </View>

          <View style={styles.TextField}>
            <View style={{flex: 1, flexDirection: "row", marginHorizontal: 3}}>
              <Text style={{flex: 1, flexDirection: "row",color: "#5f9ea0", 
              marginHorizontal: 10,fontWeight: "bold"}}>Name of Item:</Text>
            </View>
              <TextInput 
                style={styles.input}
                onChangeText={name => setName(name)}
                //value={name}
                placeholder="Enter your name of itme"
              />
          </View>

          <View style={styles.TextField}>
            <View style={{flex: 1, flexDirection: "row", marginHorizontal: 3}}>
              <Text style={{flex: 1, flexDirection: "row",color: "#5f9ea0", 
              marginHorizontal: 10,fontWeight: "bold"}}>
                Price:</Text>
            </View>
              <TextInput 
                style={styles.input}
                onChangeText={price => setPrice(price)}
                //value={price}
                placeholder="Enter price of item"
              />
          </View>

            <TouchableOpacity
              style={styles.button}
              onPress={booking}
            >
              <Text style={styles.textStyle}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

        <View style={{paddingLeft: 15, paddingTop: 1, flexDirection: "row"}}>
          
        <TouchableOpacity onPress = {() => navigation.navigate("MenuPage")}>
          <Text style={{fontSize: 20, color: "#5f9ea0", textDecorationLine: "underline", 
              paddingLeft: 15, paddingTop: 10}}>
            Menu
          </Text>
          </TouchableOpacity>

          <TouchableOpacity  onPress={() => setModalVisible(true)} style={{backgroundColor: "#5f9ea0", 
              marginHorizontal: 120, borderRadius: 20, width: 100, height: 20,justifyContent: "center",
              alignSelf: "center"}}>
            <Text style={{textAlign: "center", color: "#fff"}}> Add </Text>
          </TouchableOpacity>

        </View>

         <TabView 
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
         />  
      <View style={styles.Tab}>
          <FontAwesome name="home" size={24} color="white" style={{marginLeft: 60}} onPress = {() => navigation.navigate("Home")}/>
          <FontAwesome name="user-circle-o" size={24} color="white" style={{marginLeft: 130}} onPress = {() => navigation.navigate("Profile")}/>
        </View>
    </View>
    
  )
}
export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%"
},
  Tab: {
    flexDirection: "row",
    height: 70,
    width: 360,
    backgroundColor: "#5f9ea0",
    padding: 15,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    alignSelf: "center",
    position: 'absolute',
    bottom: 0, 
  },
  FlatListText:{
    color: "#5f9ea0"
  },
  text: {
    marginTop: 300,
    fontSize: 20,
    justifyContent: "center",
    textAlign: "center",
    color: "black",
    fontWeight: "bold"
},
Top:{
  marginTop: constant.statusBarHeight,
  height: 150,
  borderBottomRightRadius: 20,
  borderBottomLeftRadius: 20,
},
image1: {
  flex: 1, 
  justifyContent: "center", 
  borderBottomRightRadius: 20, 
  borderBottomLeftRadius: 20
},
HeadText:{
  marginTop: -60,
  justifyContent: "center",
  textAlign: "center",
  alignSelf: "center",
  height: 80,
},
TextRestaurant:{
  fontSize: 40,
  color: "white",
  height: 150,
},
RestaurantList: {
  fontSize: 30, 
  color: "#2e8b57", 
  fontWeight: "bold"
},
flatListItem: {
  color: "#d3d3d3",
  padding: 10,
  fontSize: 16,
},
listItem: {
  paddingLeft: 3,
  paddingTop: 3,
  paddingBottom: 3,
  margin: 3,
  flex: 1,
  flexDirection: "row",
  borderRadius: 10,
  backgroundColor: "white",
  borderWidth: 1
},
listItem2: {
  paddingLeft: 20,
  paddingTop: 5,
  flex: 1,
  flexDirection: "column",
  borderRadius: 10,
},
img: {
  height: 80,
  width: 80,
  borderRadius: 10
},
centeredView: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 22
},
modalView: {
  margin: 20,
  backgroundColor: "white",
  borderRadius: 20,
  padding: 35,
  width: "90%",
  height: 600,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5
},
button: {
  backgroundColor: "#5f9ea0", 
  marginHorizontal: 120, 
  borderRadius: 20, 
  width: 100, 
  height: 40,
  justifyContent: "center"
},
buttonOpen: {
  backgroundColor: "#F194FF",
},
buttonClose: {
  backgroundColor: "#5f9ea0", 
  marginHorizontal: 120, 
  borderRadius: 20, 
  width: 100, 
  height: 40,
  justifyContent: "center"
},
textStyle: {
  color: "white",
  fontWeight: "bold",
  textAlign: "center"
},
modalText: {
  marginBottom: 15,
  textAlign: "center"
},
TextField: {
  justifyContent: "center",
  alignSelf: "center",
  borderRadius: 20,
  height: 95,
  width: 250,
  backgroundColor: "#ffffff",
  padding: 10,
  paddingTop: 3,
  marginTop: 10
},
input: {
  height: 40,
  margin: 12,
  padding: 10,
},
image: {
  width: 120,
  height: 120,
  borderRadius: 200,
  borderWidth: 2,
  backgroundColor: "gray"
},
});