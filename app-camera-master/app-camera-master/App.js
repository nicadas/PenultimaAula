import { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Modal, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const camRef = useRef(null);
  const [tipoCamera, setTipoCamera] = useState(Camera.Constants.Type.back);
  const [hasPermission, setHasPermission] = useState(null);
  const [foto, setFoto] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Pede uma vez permissão para usar a câmera
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();      
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Pede uma vez permissão para salvar a foto no dispositivo
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY); //CAMERA_ROLL)
      setHasPermission(status === 'granted');
    })();
  }, []);

  async function tiraFoto() {
    if (camRef) {
      const data = await camRef.current.takePictureAsync();
      setFoto(data.uri);
      setModalOpen(true);
    }
  }

  function savePicture() {
    MediaLibrary.createAssetAsync(foto)
      .then(() => {
        alert('Foto salva com sucesso')
      })
      .catch(error => {
        console.log('err', error)
      })
  }

  if (hasPermission === null) {
    return <View />
  }

  if (!hasPermission) {
    return <Text>Acesso negado!</Text>
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={{ flex: 1 }}
        type={tipoCamera}        
        ref={camRef}
      >
        <View style={{flex:1, backgroundColor: 'transparent'}}>
          <TouchableOpacity 
            style={{position: 'absolute', bottom: 20, left: 20}}
            onPress={() => {
              setTipoCamera(
                tipoCamera === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              )
            }}
          >
            <Text style={{fontSize: 20, marginBottom: 12, color: '#FFF'}}>Trocar</Text>
          </TouchableOpacity>
        </View>
      </Camera>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => tiraFoto()}
      >
        <FontAwesome name="camera" size={24} color="#FFF" />
      </TouchableOpacity>

      { foto &&
        <Modal
          animationType='slide'
          transparent={false}
          visible={modalOpen}
        >
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20}}>
            <View style={{margin: 10, flexDirection: 'row'}}>
              <TouchableOpacity style={{margin: 10}} onPress={() => setModalOpen(false)}>
                <FontAwesome name="window-close" size={50} color="red" />
              </TouchableOpacity>
              <TouchableOpacity style={{margin: 10}} onPress={savePicture}>
                <FontAwesome name="upload" size={50} color="#121212" />
              </TouchableOpacity>
            </View>
            <Image
              style={{width: '100%', height: 450, borderRadius: 20}}
              source={{ uri: foto }}
            />
          </View>
        </Modal>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    margin: 20,
    borderRadius: 8,
    height: 50
  }
});
