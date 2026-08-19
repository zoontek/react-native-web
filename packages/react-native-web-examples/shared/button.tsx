import { StyleSheet, Text, Pressable } from 'react-native-web';

type Props = {
  // @ts-expect-error use exported ColorValue
  color?: ColorValue;
  title: string;
  onPress?: () => void;
};

export default function Button(props: Props) {
  const { title, ...other } = props;
  return (
    <Pressable {...other} style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'lightblue',
    borderRadius: 10,
    paddingBlock: 5,
    paddingInline: 10
  },
  buttonText: {
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
});
