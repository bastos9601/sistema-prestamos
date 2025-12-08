// Componente de firma digital
import React, { useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import SignatureCanvas from 'react-native-signature-canvas';

const FirmaDigital = ({ onFirmaGuardada, onCancelar }) => {
  const signatureRef = useRef(null);
  const [firmando, setFirmando] = useState(false);

  const handleOK = (signature) => {
    onFirmaGuardada(signature);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const webStyle = `.m-signature-pad {
    box-shadow: none;
    border: 2px solid #6200ee;
    border-radius: 8px;
  }
  .m-signature-pad--body {
    border: none;
  }
  .m-signature-pad--footer {
    display: none;
  }`;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Firme en el recuadro</Text>
      <View style={styles.canvasContainer}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={handleOK}
          descriptionText=""
          clearText="Limpiar"
          confirmText="Confirmar"
          webStyle={webStyle}
          autoClear={false}
          imageType="image/png"
        />
      </View>
      <View style={styles.botones}>
        <Button
          mode="outlined"
          onPress={handleClear}
          style={styles.boton}
        >
          Limpiar
        </Button>
        <Button
          mode="contained"
          onPress={handleConfirm}
          style={styles.boton}
        >
          Confirmar Firma
        </Button>
      </View>
      <Button
        mode="text"
        onPress={onCancelar}
        style={{ marginTop: 8 }}
      >
        Cancelar
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#212529',
  },
  canvasContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  boton: {
    flex: 1,
  },
});

export default FirmaDigital;
